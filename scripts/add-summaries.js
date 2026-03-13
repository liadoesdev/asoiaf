/**
 * Adds summaries: { combined, books, tv } to each node in graphNodes.
 * Reads src/App.jsx, mutates node lines, writes back.
 * Option A: derive only from existing bio/bookNote; no invention.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.join(__dirname, "..", "src", "App.jsx");
const outPath = path.join(__dirname, "..", "src", "App.jsx");
let content = fs.readFileSync(appPath, "utf8");
// Normalize line endings so trimEnd and $ match correctly
content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

// Forbidden in books summary (TV refs)
const BOOKS_FORBIDDEN = /\b(in the show|on the show|the show|the series|adaptation|HBO|TV)\b/i;
// Forbidden in tv summary (book refs)
const TV_FORBIDDEN = /\b(in the books|the books|in the novels|GRRM|published|ADWD|AFFC|A Dance|A Feast|Fire & Blood)\b/i;

function escapeJsString(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function cleanForBooks(bio) {
  if (!bio) return "";
  let t = bio
    .replace(/\s*In the show[^.]*\.?\s*/gi, " ")
    .replace(/\s*The show[^.]*\.?\s*/gi, " ")
    .replace(/\s*;?\s*the show[^.]*\.?\s*/gi, " ")
    .replace(/\s*\([^)]*show[^)]*\)\s*/gi, " ")
    .replace(/\s*— one of the series'[^.]*\.?\s*/gi, " ")
    .replace(/\s*The series'[^.]*\.?\s*/gi, " ")
    .trim();
  return t.replace(/\s{2,}/g, " ");
}

function cleanForTv(bio) {
  if (!bio) return "";
  let t = bio
    .replace(/\s*In the books[^.]*\.?\s*/gi, " ")
    .replace(/\s*The books[^.]*\.?\s*/gi, " ")
    .replace(/\s*;?\s*in the books[^.]*\.?\s*/gi, " ")
    .replace(/\s*\([^)]*books[^)]*\)\s*/gi, " ")
    .replace(/\s*[;.]\s*The books[^.]*\.?\s*/gi, " ")
    .trim();
  return t.replace(/\s{2,}/g, " ");
}

function getSummaries(node) {
  const { id, canon, bio = "", bookNote = "", bioBooks = "", bioTv = "" } = node;
  const combined = bio;

  if (canon === "book") {
    const books = bio
      .replace(/\s*CUT from the show[^.]*\.?\s*/gi, " ")
      .replace(/\s*Entirely absent from the show\.?\s*/gi, " ")
      .replace(/\s*Absent from the show\.?\s*/gi, " ")
      .replace(/\s*Cut from the show\.?\s*/gi, " ")
      .replace(/\s*Her storyline is given to Sansa in the show[^.]*\.?\s*/gi, " ")
      .replace(/\s*— one of the most controversial[^.]*\.?\s*/gi, " ")
      .trim()
      .replace(/\s{2,}/g, " ");
    return { combined, books: books || "No book-only summary available yet.", tv: "" };
  }

  if (bioBooks || bioTv) {
    const books = (bioBooks || cleanForBooks(bio)).trim();
    const tv = (bioTv || cleanForTv(bio)).trim();
    return {
      combined,
      books: books && !BOOKS_FORBIDDEN.test(books) ? books : (books || "No book-only summary available yet."),
      tv: tv && !TV_FORBIDDEN.test(tv) ? tv : (tv || "No TV-only summary available yet."),
    };
  }

  if (bookNote) {
    let books = cleanForBooks(bio).trim().replace(/\s{2,}/g, " ") || "";
    let tv = cleanForTv(bio).trim().replace(/\s{2,}/g, " ") || "";
    if (BOOKS_FORBIDDEN.test(books)) books = "";
    if (TV_FORBIDDEN.test(tv)) tv = "";
    if (!books) books = "No book-only summary available yet.";
    if (!tv) tv = "No TV-only summary available yet.";
    return { combined, books, tv };
  }

  const hasMixed = /in the show|the show|in the books|the books|adaptation|GRRM|the series'/i.test(bio);
  if (hasMixed) {
    const books = cleanForBooks(bio).trim() || "No book-only summary available yet.";
    const tv = cleanForTv(bio).trim() || "No TV-only summary available yet.";
    return {
      combined,
      books: BOOKS_FORBIDDEN.test(books) ? "No book-only summary available yet." : (books || "No book-only summary available yet."),
      tv: TV_FORBIDDEN.test(tv) ? "No TV-only summary available yet." : (tv || "No TV-only summary available yet."),
    };
  }

  return { combined, books: bio, tv: bio };
}

const nodeLineRe = /^(\s*\{\s*id:\s*"([^"]+)"[^}]*?)(\s*\},?\s*)$/gm;
const lines = content.split("\n");
const result = [];
let inGraphNodes = false;
let graphNodesStart = -1;
let nodesProcessed = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("const graphNodes = [")) {
    inGraphNodes = true;
    graphNodesStart = i;
    result.push(line);
    continue;
  }
  if (inGraphNodes && line.trim() === "];") {
    inGraphNodes = false;
    result.push(line);
    continue;
  }
  if (!inGraphNodes) {
    result.push(line);
    continue;
  }
  if (line.includes("summaries:")) {
    result.push(line);
    continue;
  }
  if (line.match(/^\s*\{\s*id:\s*"[^"]+".*bio:\s*"/)) {
    const idMatch = line.match(/id:\s*"([^"]+)"/);
    const canonMatch = line.match(/canon:\s*"([^"]+)"/);
    const bioMatch = line.match(/bio:\s*"((?:[^"\\]|\\.)*)"/);
    const bookNoteMatch = line.match(/bookNote:\s*"((?:[^"\\]|\\.)*)"/);
    const bioBooksMatch = line.match(/bioBooks:\s*"((?:[^"\\]|\\.)*)"/);
    const bioTvMatch = line.match(/bioTv:\s*"((?:[^"\\]|\\.)*)"/);
    const id = idMatch?.[1] ?? "";
    const canon = canonMatch?.[1] ?? "both";
    const bio = (bioMatch?.[1] ?? "").replace(/\\"/g, '"');
    const bookNote = (bookNoteMatch?.[1] ?? "").replace(/\\"/g, '"');
    const bioBooks = (bioBooksMatch?.[1] ?? "").replace(/\\"/g, '"');
    const bioTv = (bioTvMatch?.[1] ?? "").replace(/\\"/g, '"');

    const node = { id, canon, bio, bookNote, bioBooks, bioTv };
    const summaries = getSummaries(node);
    const sumStr = `summaries: { combined: "${escapeJsString(summaries.combined)}", books: "${escapeJsString(summaries.books)}", tv: "${escapeJsString(summaries.tv)}" }`;
    const newLine = line.replace(/,?\s*\}\s*,?\s*$/, ", " + sumStr + " }, ");
    result.push(newLine);
    nodesProcessed++;
    continue;
  }

  result.push(line);
}

fs.writeFileSync(outPath, result.join("\n"), "utf8");
console.log("Summaries added. Nodes processed:", nodesProcessed);
