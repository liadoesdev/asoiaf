import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";


// DESIGN TOKENS — Premium ASOIAF aesthetic
const theme = {
  // Base
  bgNearBlack: "#080706",
  bgCharcoal: "#0e0c0b",
  bgCard: "rgba(14, 12, 11, 0.92)",
  bgCardSolid: "#121018",
  // Glass
  glass: "rgba(14, 12, 11, 0.85)",
  glassBorder: "rgba(255, 255, 255, 0.06)",
  glassBorderHover: "rgba(255, 255, 255, 0.12)",
  // Accents
  goldMuted: "#b8a078",
  goldWarm: "#c9a855",
  ember: "#a85c38",
  crimson: "#8b3a2a",
  crimsonGlow: "rgba(139, 58, 42, 0.25)",
  // Text
  textPrimary: "#e5d9c8",
  textSecondary: "#a8987e",
  textMuted: "#6b5d4a",
  textFaded: "#4a4035",
  // Serif for headings
  fontDisplay: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
  fontBody: "'Source Serif 4', 'Palatino Linotype', Georgia, serif",
};

// COLOR PALETTE (character/house colors)
const C = {
  stark: "#6BAACC",
  lannister: "#C9A83E",
  targaryen: "#C44040",
  baratheon: "#D4A030",
  tyrell: "#5A9E5A",
  martell: "#D48040",
  greyjoy: "#4A8A8A",
  tully: "#5080C0",
  arryn: "#88BBD8",
  bolton: "#8B3040",
  frey: "#7A7A6A",
  watch: "#7090A8",
  wildling: "#8A9060",
  free_cities: "#B080A0",
  dothraki: "#A08040",
  slaver: "#906848",
  bwb: "#C0A040",
  faith: "#A0A0A0",
  ancient: "#607060",
  other: "#888888",
  kingsguard: "#C0C0C0",
};

// ═══════════════════════════════════════════════════════
// GRAPH NODES — Every character with faction color
// ═══════════════════════════════════════════════════════
const graphNodes = [
  // ── STARK ──
  { id: "ned", name: "Eddard Stark", color: C.stark, house: "Stark", canon: "both", title: "Lord of Winterfell, Hand of the King", bio: "Lord of Winterfell who accepted the Handship to investigate Jon Arryn's death. Discovered Joffrey's illegitimacy, confronted Cersei, was betrayed by Littlefinger, and executed by Joffrey. His death ignited the War of the Five Kings. Kept a lifelong promise to his sister Lyanna that shaped the fate of Jon Snow.", summaries: { combined: "Lord of Winterfell who accepted the Handship to investigate Jon Arryn's death. Discovered Joffrey's illegitimacy, confronted Cersei, was betrayed by Littlefinger, and executed by Joffrey. His death ignited the War of the Five Kings. Kept a lifelong promise to his sister Lyanna that shaped the fate of Jon Snow.", books: "Lord of Winterfell who accepted the Handship to investigate Jon Arryn's death. Discovered Joffrey's illegitimacy, confronted Cersei, was betrayed by Littlefinger, and executed by Joffrey. His death ignited the War of the Five Kings. Kept a lifelong promise to his dying sister Lyanna.", tv: "Lord of Winterfell who accepted the Handship to investigate Jon Arryn's death. Discovered Joffrey's illegitimacy, confronted Cersei, was betrayed by Littlefinger, and executed by Joffrey. His death ignited the War of the Five Kings. Kept a lifelong promise to his sister Lyanna to protect her son Jon." } },
  { id: "cat", name: "Catelyn Stark", color: C.stark, house: "Stark", canon: "both", title: "Lady of Winterfell / Lady Stoneheart", bio: "Born Tully, married Ned for duty and grew to love him. Captured Tyrion, sparking war. Released Jaime to trade for her daughters. Murdered at the Red Wedding, resurrected as Lady Stoneheart — a mute, merciless revenant who hangs Freys and Lannisters across the Riverlands.", summaries: { combined: "Born Tully, married Ned for duty and grew to love him. Captured Tyrion, sparking war. Released Jaime to trade for her daughters. Murdered at the Red Wedding, resurrected as Lady Stoneheart — a mute, merciless revenant who hangs Freys and Lannisters across the Riverlands.", books: "Born Tully, married Ned for duty and grew to love him. Captured Tyrion, sparking war. Released Jaime to trade for her daughters. Murdered at the Red Wedding, then resurrected as Lady Stoneheart — a mute, merciless revenant who hangs Freys and Lannisters across the Riverlands.", tv: "Born Tully, married Ned for duty and grew to love him. Captured Tyrion, sparking war. Released Jaime to trade for her daughters. Murdered at the Red Wedding alongside her son Robb. Her death remains one of the most devastating moments of the series." } },
  { id: "robb", name: "Robb Stark", color: C.stark, house: "Stark", canon: "both", title: "King in the North", bio: "Won every battle but lost the war. Married Jeyne Westerling, breaking his Frey betrothal. Betrayed and murdered at the Red Wedding by the Freys and Boltons. The Young Wolf whose honor — inherited from Ned — was his undoing.", bookNote: "In the books, Robb married Jeyne Westerling. The show replaced her with Talisa, a Volantene nurse.", summaries: { combined: "Won every battle but lost the war. Married Jeyne Westerling, breaking his Frey betrothal. Betrayed and murdered at the Red Wedding by the Freys and Boltons. The Young Wolf whose honor — inherited from Ned — was his undoing.", books: "Won every battle but lost the war. Married Jeyne Westerling, breaking his Frey betrothal. Betrayed and murdered at the Red Wedding by the Freys and Boltons. The Young Wolf whose honor — inherited from Ned — was his undoing.", tv: "Won every battle but lost the war. Married Talisa, breaking his Frey betrothal. Betrayed and murdered at the Red Wedding by the Freys and Boltons. The Young Wolf whose honor — inherited from Ned — was his undoing." } },
  { id: "sansa", name: "Sansa Stark", color: C.stark, house: "Stark", canon: "both", title: "Lady of Winterfell / Alayne Stone", bio: "From naive girl dreaming of princes to political survivor. Hostage in King's Landing, married to Tyrion, escaped via Littlefinger. Hides in the Vale as Alayne Stone, learning the game from Petyr Baelish. In the books she remains in the Vale; the show sends her to Winterfell.", bookNote: "In the books, Sansa remains in the Vale as Alayne Stone learning from Littlefinger. The show sends her to Winterfell and gives her Jeyne Poole's storyline with Ramsay Bolton.", summaries: { combined: "From naive girl dreaming of princes to political survivor. Hostage in King's Landing, married to Tyrion, escaped via Littlefinger. Hides in the Vale as Alayne Stone, learning the game from Petyr Baelish. In the books she remains in the Vale; the show sends her to Winterfell.", books: "From naive girl dreaming of princes to political survivor. Hostage in King's Landing, married to Tyrion, escaped via Littlefinger. Remains in the Vale as Alayne Stone, learning the game of power from Petyr Baelish.", tv: "From naive girl dreaming of princes to political survivor. Hostage in King's Landing, married to Tyrion, escaped via Littlefinger. Sent to Winterfell and married to Ramsay Bolton. Escapes and reclaims Winterfell, eventually becoming Queen in the North." } },
  { id: "arya", name: "Arya Stark", color: C.stark, house: "Stark", canon: "both", title: "No One / Cat of the Canals", bio: "Escaped King's Landing after Ned's death. Traveled with Yoren, was captured at Harrenhal, used Jaqen H'ghar's three deaths. Wandered with the Hound. Sailed to Braavos to train as a Faceless Man. Keeps her kill list and hides Needle — she cannot truly become no one.", summaries: { combined: "Escaped King's Landing after Ned's death. Traveled with Yoren, was captured at Harrenhal, used Jaqen H'ghar's three deaths. Wandered with the Hound. Sailed to Braavos to train as a Faceless Man. Keeps her kill list and hides Needle — she cannot truly become no one.", books: "Escaped King's Landing after Ned's death. Traveled with Yoren, was captured at Harrenhal, used Jaqen H'ghar's three deaths. Wandered with the Hound. Sailed to Braavos to train with the Faceless Men. Keeps her kill list and hides Needle — she cannot truly become no one.", tv: "Escaped King's Landing after Ned's death. Traveled with Yoren, was captured at Harrenhal, used Jaqen H'ghar's three deaths. Wandered with the Hound. Sailed to Braavos to train with the Faceless Men. Returns to Westeros, kills Walder Frey, and slays the Night King at Winterfell." } },
  { id: "bran", name: "Bran Stark", color: C.stark, house: "Stark", canon: "both", title: "The Winged Wolf / Greenseer", bio: "Pushed from a tower by Jaime, lost his legs, gained greensight. Journeyed beyond the Wall to the cave of the Three-Eyed Crow (Bloodraven). Can see through weirwoods across time and space. His power may be the key to everything — or the most dangerous force in the story.", summaries: { combined: "Pushed from a tower by Jaime, lost his legs, gained greensight. Journeyed beyond the Wall to the cave of the Three-Eyed Crow (Bloodraven). Can see through weirwoods across time and space. His power may be the key to everything — or the most dangerous force in the story.", books: "Pushed from a tower by Jaime, lost his legs, gained greensight. Journeyed beyond the Wall to the cave of the Three-Eyed Crow (Bloodraven). Can see through weirwoods across time and space. Remains in the cave, training his powers.", tv: "Pushed from a tower by Jaime, lost his legs, gained greensight. Journeyed beyond the Wall to the cave of the Three-Eyed Raven. Becomes the Three-Eyed Raven after the cave is destroyed. Returns to Winterfell and is chosen as King of the Six Kingdoms." } }, 
  { id: "rickon", name: "Rickon Stark", color: C.stark, house: "Stark", canon: "both", title: "Youngest Stark", bio: "The wild youngest Stark, just three when the story begins. Fled with Osha to Skagos, an island of cannibals and unicorns. Davos Seaworth is sent to retrieve him. His direwolf Shaggydog is the most savage of the litter.", bookNote: "In the books, Rickon is alive on Skagos and Davos is sent to retrieve him. The show kills him in the Battle of the Bastards.", summaries: { combined: "The wild youngest Stark, just three when the story begins. Fled with Osha to Skagos, an island of cannibals and unicorns. Davos Seaworth is sent to retrieve him. His direwolf Shaggydog is the most savage of the litter.", books: "The wild youngest Stark, just three when the story begins. Fled with Osha to Skagos, an island of cannibals and unicorns. Davos Seaworth is sent to retrieve him. His direwolf Shaggydog is the most savage of the litter. His fate remains unresolved.", tv: "The wild youngest Stark, just three when the story begins. Fled with Osha after Winterfell fell. Captured by Ramsay Bolton and killed during the Battle of the Bastards, shot with an arrow while running to Jon." } }, 
  { id: "jon", name: "Jon Snow", color: C.stark, house: "Stark / Night's Watch", canon: "both", title: "Lord Commander of the Night's Watch", bio: "Ned's 'bastard'; in the show he is confirmed as the son of Rhaegar and Lyanna; in the books this is strongly implied but not stated on the page. Joined the Watch, became Lord Commander. Let the wildlings through the Wall. Stabbed by mutineers — 'For the Watch.' His fate beyond that is the series' greatest cliffhanger.", summaries: { combined: "Ned's 'bastard'; in the show he is confirmed as the son of Rhaegar and Lyanna; in the books this is strongly implied but not stated on the page. Joined the Watch, became Lord Commander. Let the wildlings through the Wall. Stabbed by mutineers — 'For the Watch.' His fate beyond that is the series' greatest cliffhanger.", books: "Ned's 'bastard'; his parentage is strongly implied but not confirmed on the page. Joined the Watch, became Lord Commander. Let the wildlings through the Wall. Stabbed by mutineers — 'For the Watch.' His fate beyond that remains unresolved.", tv: "Confirmed as the son of Rhaegar Targaryen and Lyanna Stark. Joined the Watch, became Lord Commander. Let the wildlings through the Wall. Stabbed by mutineers, resurrected by Melisandre. Led the fight against the Night King. Killed Daenerys after she destroyed King's Landing. Exiled beyond the Wall." } }, 
  { id: "benjen", name: "Benjen Stark", color: C.stark, house: "Stark / Night's Watch", canon: "both", title: "First Ranger", bio: "Ned's younger brother, First Ranger of the Night's Watch. Vanished beyond the Wall in Book 1. His fate remains one of the series' enduring mysteries. The show identifies him as Coldhands; the books explicitly deny this.", bookNote: "In the books, Benjen's fate remains a complete mystery. The show reveals him as Coldhands, which GRRM has denied.", summaries: { combined: "Ned's younger brother, First Ranger of the Night's Watch. Vanished beyond the Wall in Book 1. His fate remains one of the series' enduring mysteries. The show identifies him as Coldhands; the books explicitly deny this.", books: "Ned's younger brother, First Ranger of the Night's Watch. Vanished beyond the Wall early in the story. His fate remains a complete mystery.", tv: "Ned's younger brother, First Ranger of the Night's Watch. Vanished beyond the Wall. Returns as a half-dead figure who saves Bran and Meera, and later sacrifices himself to save Jon beyond the Wall." } }, 
  { id: "theon", name: "Theon Greyjoy", color: C.greyjoy, house: "Greyjoy", canon: "both", title: "Prince of Winterfell / Reek", bio: "Raised as Ned's ward/hostage. Betrayed Robb by seizing Winterfell. Captured by Ramsay Bolton and tortured into 'Reek.' The most psychologically complex arc in the series — his redemption comes when he helps Jeyne Poole escape Winterfell, reclaiming his identity through saving a near-stranger.", summaries: { combined: "Raised as Ned's ward/hostage. Betrayed Robb by seizing Winterfell. Captured by Ramsay Bolton and tortured into 'Reek.' The most psychologically complex arc in the series — his redemption comes when he helps Jeyne Poole escape Winterfell, reclaiming his identity through saving a near-stranger.", books: "Ned's ward and hostage after the Greyjoy Rebellion. Betrayed Robb by taking Winterfell; lost it to Ramsay Bolton and was broken into 'Reek.' His redemption centers on helping Jeyne Poole (passed off as Arya) escape Winterfell, reclaiming his identity in the process. Fate unresolved in published material.", tv: "Raised at Winterfell as Ned's ward. Turned on Robb and took Winterfell; tortured by Ramsay into 'Reek.' He helps Sansa escape Winterfell and fights in the Long Night. Dies defending Bran from the Night King." } },
  { id: "hodor", name: "Hodor", color: C.stark, house: "Stark", canon: "both", title: "Winterfell stableboy", bio: "Gentle stableboy known as Hodor, whose given name is Walder. In the books he is only able to say 'Hodor.' Bran repeatedly wargs into him, which is portrayed as disturbing and invasive. The 'Hold the door' origin of his name is a reveal from the TV adaptation, not a confirmed event in the published books.", summaries: { combined: "Gentle stableboy known as Hodor, whose given name is Walder. In the books he is only able to say 'Hodor.' Bran repeatedly wargs into him, which is portrayed as disturbing and invasive. The 'Hold the door' origin of his name is a reveal from the TV adaptation, not a confirmed event in the published books.", books: "Gentle stableboy known as Hodor, whose given name is Walder. He can only say 'Hodor' and serves Bran Stark loyally on the journey north. Bran repeatedly wargs into him, an act portrayed as invasive and unsettling.", tv: "Hodor is the loyal companion who helps carry Bran Stark beyond the Wall. His inability to say more than 'Hodor' is revealed to be caused by a time-linked vision in which Bran wargs into his past self, resulting in the command 'Hold the door.' His sacrificial death is one of the most tragic moments of the series." } }, 
  { id: "osha", name: "Osha", color: C.wildling, house: "Wildling", canon: "both", title: "Spearwife turned protector", bio: "Wildling captured near Winterfell who becomes Rickon's protector. Flees with him to Skagos after Winterfell falls. Practical, fierce, and loyal to the Stark children despite having no obligation to them.", bookNote: "In the books, Osha is still alive protecting Rickon on Skagos. The show kills her.", summaries: { combined: "Wildling captured near Winterfell who becomes Rickon's protector. Flees with him to Skagos after Winterfell falls. Practical, fierce, and loyal to the Stark children despite having no obligation to them.", books: "Wildling captured near Winterfell who becomes Rickon's protector. Flees with him to Skagos after Winterfell falls. Practical, fierce, and loyal to the Stark children despite having no obligation to them.", tv: "Wildling captured near Winterfell who becomes Rickon's protector. Flees south with him after Winterfell falls. Killed by Ramsay Bolton when she attempts to free Rickon." } }, 
  { id: "jojen", name: "Jojen Reed", color: C.stark, house: "Reed", canon: "both", title: "Greenseer", bio: "Son of Howland Reed with the greendream. Guided Bran north to the Three-Eyed Crow, recognizing his powers. Knows the day of his own death. His fate in the cave is uncertain — the show kills him; the books may have darker implications involving the weirwood paste.", bookNote: "The show kills Jojen at the cave entrance. In the books his fate is ambiguous — the weirwood paste Bran eats may contain his blood.", summaries: { combined: "Son of Howland Reed with the greendream. Guided Bran north to the Three-Eyed Crow, recognizing his powers. Knows the day of his own death. His fate in the cave is uncertain — the show kills him; the books may have darker implications involving the weirwood paste.", books: "Son of Howland Reed with the greendream. Guided Bran north to the Three-Eyed Crow, recognizing his powers. Knows the day of his own death. His fate in the cave is ambiguous; the weirwood paste Bran eats may contain his blood.", tv: "Son of Howland Reed with the greendream. Guided Bran north to the Three-Eyed Raven, recognizing his powers. Knew the day of his own death. Killed by wights at the cave entrance." } }, 
  { id: "meera", name: "Meera Reed", color: C.stark, house: "Reed", canon: "both", title: "Bran's protector", bio: "Jojen's sister, fierce fighter and Bran's guardian on the journey north. Loyal and resourceful. Her father Howland Reed is the only other survivor of the Tower of Joy besides Ned; he has not yet appeared on page.", summaries: { combined: "Jojen's sister, fierce fighter and Bran's guardian on the journey north. Loyal and resourceful. Her father Howland Reed is the only other survivor of the Tower of Joy besides Ned; he has not yet appeared on page.", books: "Jojen's sister, fierce fighter and Bran's guardian on the journey north. Loyal and resourceful. Remains with Bran in Bloodraven's cave beyond the Wall.", tv: "Jojen's sister, fierce fighter and Bran's guardian on the journey north. Drags Bran through the snow after Hodor's death. Returns him to Winterfell and departs heartbroken when the emotionless Three-Eyed Raven no longer recognizes the boy she protected." } }, 
  // ── LANNISTER ──
  { id: "tywin", name: "Tywin Lannister", color: C.lannister, house: "Lannister", canon: "both", title: "Lord of Casterly Rock, Hand of the King", bio: "The most powerful man in Westeros. Orchestrated the Red Wedding, ordered the murders of Elia and her children, destroyed every rival house that crossed him. Murdered by Tyrion on the privy with a crossbow. His corpse stank so badly at his funeral that the septons could barely stand. The great lion, brought low by the son he despised.", summaries: { combined: "The most powerful man in Westeros. Orchestrated the Red Wedding, ordered the murders of Elia and her children, destroyed every rival house that crossed him. Murdered by Tyrion on the privy with a crossbow. His corpse stank so badly at his funeral that the septons could barely stand. The great lion, brought low by the son he despised.", books: "The most powerful man in Westeros. Orchestrated the Red Wedding, ordered the murders of Elia and her children, destroyed every rival house that crossed him. Murdered by Tyrion on the privy with a crossbow. His corpse stank so badly at his funeral the septons could barely stand.", tv: "The most powerful man in Westeros. Orchestrated the Red Wedding, ordered the murders of Elia and her children, destroyed every rival house that crossed him. Murdered by Tyrion on the privy with a crossbow after Tyrion discovers Shae in his bed." } }, 
  { id: "cersei", name: "Cersei Lannister", color: C.lannister, house: "Lannister", canon: "both", title: "Queen Regent", bio: "Twin of Jaime, mother of three children by incest. Her paranoia and incompetence as Queen Regent arm the Faith Militant, alienate the Tyrells, and bankrupt the crown. Arrested, shorn, and forced to walk naked through King's Landing. Every move she makes to consolidate power accelerates her destruction.", summaries: { combined: "Twin of Jaime, mother of three children by incest. Her paranoia and incompetence as Queen Regent arm the Faith Militant, alienate the Tyrells, and bankrupt the crown. Arrested, shorn, and forced to walk naked through King's Landing. Every move she makes to consolidate power accelerates her destruction.", books: "Twin of Jaime, mother of three children by incest. Her paranoia and incompetence as Queen Regent arm the Faith Militant, alienate the Tyrells, and bankrupt the crown. Arrested, shorn, and forced to walk naked through King's Landing. Awaiting trial as the published story ends.", tv: "Twin of Jaime, mother of three children by incest. Her paranoia as Queen Regent arms the Faith Militant and turns the Tyrells against her. After her Walk of Shame, she destroys the Sept of Baelor with wildfire, killing the High Sparrow, Margaery, and others. Rules as Queen until she dies alongside Jaime in the collapse of the Red Keep." } }, 
  { id: "jaime", name: "Jaime Lannister", color: C.lannister, house: "Lannister", canon: "both", title: "Kingslayer / Lord Commander of the Kingsguard", bio: "Killed the Mad King to save King's Landing, despised for it ever since. Lost his sword hand, gained his soul. His journey with Brienne transformed him. Gave her Oathkeeper, burned Cersei's letter. Last seen following Brienne to Lady Stoneheart — walking knowingly into a trap.", bookNote: "In the books, Jaime is last seen following Brienne into Lady Stoneheart's trap. His arc diverges dramatically from the show's ending.", summaries: { combined: "Killed the Mad King to save King's Landing, despised for it ever since. Lost his sword hand, gained his soul. His journey with Brienne transformed him. Gave her Oathkeeper, burned Cersei's letter. Last seen following Brienne to Lady Stoneheart — walking knowingly into a trap.", books: "Killed the Mad King to save King's Landing, despised for it ever since. Lost his sword hand, gained his soul. His journey with Brienne transformed him. Gave her Oathkeeper, burned Cersei's letter. Last seen following Brienne into Lady Stoneheart's trap.", tv: "Killed the Mad King to save King's Landing, despised for it ever since. Lost his sword hand, gained his soul. His journey with Brienne transformed him. Gave her Oathkeeper. Fights in the Long Night at Winterfell, then returns to Cersei. Dies alongside her in the collapse of the Red Keep." } }, 
  { id: "tyrion", name: "Tyrion Lannister", color: C.lannister, house: "Lannister", canon: "both", title: "The Imp / Hand of the King", bio: "Brilliant, witty, despised by his family for being a dwarf. Served as Hand, saved King's Landing at the Blackwater. Framed for Joffrey's murder. Killed Shae and Tywin. Fled east, spiraling into darkness. Manipulated Aegon into invading Westeros. Darker and more morally compromised in the books than the show.", bookNote: "Much darker in the books — he hasn't met Dany yet by the end of ADWD, and is morally compromised, bitter, and dangerous.", summaries: { combined: "Brilliant, witty, despised by his family for being a dwarf. Served as Hand, saved King's Landing at the Blackwater. Framed for Joffrey's murder. Killed Shae and Tywin. Fled east, spiraling into darkness. Manipulated Aegon into invading Westeros. Darker and more morally compromised in the books than the show.", books: "Brilliant, witty, despised by his family for being a dwarf. Served as Hand, saved King's Landing at the Blackwater. Framed for Joffrey's murder. Killed Shae and Tywin. Fled east, spiraling into darkness and self-destruction. Manipulated Aegon into invading Westeros. Has not yet met Daenerys.", tv: "Brilliant, witty, despised by his family for being a dwarf. Served as Hand, saved King's Landing at the Blackwater. Framed for Joffrey's murder. Killed Shae and Tywin. Fled east and became Daenerys's advisor and Hand. Serves as Hand of the King to Bran Stark after Daenerys's death." } }, 
  { id: "joffrey", name: "Joffrey Baratheon", color: C.lannister, house: "Baratheon (Lannister)", canon: "both", title: "King of the Seven Kingdoms", bio: "Product of Jaime and Cersei's incest, crowned after Robert's death. Sadistic, stupid, and cruel — ordered Ned's execution, tormented Sansa. Poisoned at his own wedding by Olenna Tyrell and Littlefinger. Died purple-faced in his mother's arms.", summaries: { combined: "Product of Jaime and Cersei's incest, crowned after Robert's death. Sadistic, stupid, and cruel — ordered Ned's execution, tormented Sansa. Poisoned at his own wedding by Olenna Tyrell and Littlefinger. Died purple-faced in his mother's arms.", books: "Product of Jaime and Cersei's incest, crowned after Robert's death. Sadistic, stupid, and cruel — ordered Ned's execution, tormented Sansa. Poisoned at his own wedding by Olenna Tyrell and Littlefinger. Died purple-faced in his mother's arms.", tv: "Product of Jaime and Cersei's incest, crowned after Robert's death. Sadistic, stupid, and cruel — ordered Ned's execution, tormented Sansa. Poisoned at his own wedding by Olenna Tyrell and Littlefinger. Died purple-faced in his mother's arms." } }, 
  { id: "tommen", name: "Tommen Baratheon", color: C.lannister, house: "Baratheon (Lannister)", canon: "both", title: "King of the Seven Kingdoms", bio: "Sweet, gentle boy-king who loves his kittens. Everything Joffrey wasn't. A puppet controlled by Cersei, the Tyrells, and the Faith. His very kindness makes him vulnerable. Betrothed to Margaery.", summaries: { combined: "Sweet, gentle boy-king who loves his kittens. Everything Joffrey wasn't. A puppet controlled by Cersei, the Tyrells, and the Faith. His very kindness makes him vulnerable. Betrothed to Margaery.", books: "Sweet, gentle boy-king who loves his kittens. A puppet controlled by Cersei, the Tyrells, and the Faith. His very kindness makes him vulnerable. Betrothed to Margaery. Still alive and reigning as the published story ends.", tv: "Sweet, gentle boy-king married to Margaery. A puppet influenced by Cersei, the Tyrells, and the High Sparrow. After Cersei destroys the Sept of Baelor, killing Margaery, he throws himself from a window." } }, 
  { id: "myrcella", name: "Myrcella Baratheon", color: C.lannister, house: "Baratheon (Lannister)", canon: "both", title: "Princess", bio: "Sent to Dorne as part of Tyrion's alliance. Arianne Martell's failed Queenmaker plot left her scarred (ear cut off). In the books, she remains in Dorne as a political piece. The show kills her; the books have not.", bookNote: "In the books, Myrcella is alive but scarred (ear cut off) in Dorne. The show kills her.", summaries: { combined: "Sent to Dorne as part of Tyrion's alliance. Arianne Martell's failed Queenmaker plot left her scarred (ear cut off). In the books, she remains in Dorne as a political piece. The show kills her; the books have not.", books: "Sent to Dorne as part of Tyrion's political alliance. Arianne Martell's failed Queenmaker plot left her scarred, losing an ear. Remains in Dorne as a political piece, still alive.", tv: "Sent to Dorne as part of Tyrion's political alliance. Poisoned by Ellaria Sand with a kiss as she sails home to King's Landing. Dies in Jaime's arms on the ship." } }, 
  { id: "kevan", name: "Kevan Lannister", color: C.lannister, house: "Lannister", canon: "both", title: "Regent", bio: "Tywin's capable brother who tried to stabilize the realm after Cersei's arrest. Murdered by Varys in the epilogue of Dance — precisely because he was competent enough to undo the chaos Varys needed for Aegon's invasion.", bookNote: "In the books, Kevan is murdered by Varys with a crossbow in the ADWD epilogue. The show kills him in the Sept of Baelor explosion.", summaries: { combined: "Tywin's capable brother who tried to stabilize the realm after Cersei's arrest. Murdered by Varys in the epilogue of Dance — precisely because he was competent enough to undo the chaos Varys needed for Aegon's invasion.", books: "Tywin's capable brother who tried to stabilize the realm after Cersei's arrest. Murdered by Varys with a crossbow in the epilogue of A Dance with Dragons — precisely because his competence threatened the chaos Varys needed for Aegon's invasion.", tv: "Tywin's capable brother who tried to stabilize the realm after Cersei's arrest. Killed in the destruction of the Sept of Baelor when Cersei ignites the wildfire caches beneath it." } }, 
  { id: "lancel", name: "Lancel Lannister", color: C.lannister, house: "Lannister / Faith", canon: "both", title: "Knight / Sparrow", bio: "Robert's squire who plied him with strongwine on his fatal hunt at Cersei's command. Became Cersei's lover. Wounded at the Blackwater. Overcome with guilt, joined the Faith Militant, becoming one of its most fervent members.", summaries: { combined: "Robert's squire who plied him with strongwine on his fatal hunt at Cersei's command. Became Cersei's lover. Wounded at the Blackwater. Overcome with guilt, joined the Faith Militant, becoming one of its most fervent members.", books: "Robert's squire who plied him with strongwine on his fatal hunt at Cersei's command. Became Cersei's lover. Wounded at the Blackwater. Overcome with guilt, joined the Faith Militant and confessed his sins to the High Sparrow, providing key evidence against Cersei.", tv: "Robert's squire who plied him with strongwine on his fatal hunt at Cersei's command. Became Cersei's lover. Wounded at the Blackwater. Joined the Faith Militant. Killed in the destruction of the Sept of Baelor, crawling toward the wildfire candles too late to stop the explosion." } }, 
  // ── BARATHEON ──
  { id: "robert", name: "Robert Baratheon", color: C.baratheon, house: "Baratheon", canon: "both", title: "King of the Seven Kingdoms", bio: "Great warrior, terrible king. Won the throne by killing Rhaegar at the Trident. Grew fat and drunk ruling a kingdom he never wanted. Mortally wounded on a boar hunt engineered by Cersei. His death — and the secret that his children aren't his — set everything in motion.", summaries: { combined: "Great warrior, terrible king. Won the throne by killing Rhaegar at the Trident. Grew fat and drunk ruling a kingdom he never wanted. Mortally wounded on a boar hunt engineered by Cersei. His death — and the secret that his children aren't his — set everything in motion.", books: "Great warrior, terrible king. Won the throne by killing Rhaegar at the Trident. Grew fat and drunk ruling a kingdom he never wanted. Mortally wounded on a boar hunt engineered by Cersei. His death — and the secret that his children are not his — set everything in motion.", tv: "Great warrior, terrible king. Won the throne by killing Rhaegar at the Trident. Grew fat and drunk ruling a kingdom he never wanted. Mortally wounded on a boar hunt engineered by Cersei. His death — and the secret that his children are not his — set everything in motion." } }, 
  { id: "stannis", name: "Stannis Baratheon", color: C.baratheon, house: "Baratheon", canon: "both", title: "King / Azor Ahai(?)", bio: "Robert's elder brother with the strongest legal claim. Embraced Melisandre's Lord of Light. Used shadow magic to kill Renly. Lost the Blackwater. Came north to save the Wall from the wildlings — the only king who answered the Watch's call. Marches on Winterfell in a blizzard. His fate in the books remains unresolved.", summaries: { combined: "Robert's elder brother with the strongest legal claim. Embraced Melisandre's Lord of Light. Used shadow magic to kill Renly. Lost the Blackwater. Came north to save the Wall from the wildlings — the only king who answered the Watch's call. Marches on Winterfell in a blizzard. His fate in the books remains unresolved.", books: "Robert's elder brother with the strongest legal claim. Embraced Melisandre's Lord of Light. Used shadow magic to kill Renly. Lost the Blackwater. Came north to save the Wall — the only king who answered the Watch's call. Marches on Winterfell in a blizzard. His fate remains unresolved.", tv: "Robert's elder brother with the strongest legal claim. Embraced Melisandre's Lord of Light. Used shadow magic to kill Renly. Lost the Blackwater. Came north to save the Wall — the only king who answered the Watch's call. Burns his daughter Shireen alive before his assault on Winterfell. Defeated by the Boltons and killed by Brienne." } }, 
  { id: "renly", name: "Renly Baratheon", color: C.baratheon, house: "Baratheon", canon: "both", title: "King", bio: "Charismatic youngest brother who claimed the throne despite having no legal right over Stannis. Backed by the Tyrells through marriage to Margaery. Had the largest army. Assassinated by Stannis's shadow before the brothers could battle. His death reshuffled every alliance in the war.", summaries: { combined: "Charismatic youngest brother who claimed the throne despite having no legal right over Stannis. Backed by the Tyrells through marriage to Margaery. Had the largest army. Assassinated by Stannis's shadow before the brothers could battle. His death reshuffled every alliance in the war.", books: "Charismatic youngest brother who claimed the throne despite having no legal right over Stannis. Backed by the Tyrells through marriage to Margaery. Had the largest army. Assassinated by Stannis's shadow before the brothers could battle. His death reshuffled every alliance in the war.", tv: "Charismatic youngest brother who claimed the throne despite having no legal right over Stannis. Backed by the Tyrells through marriage to Margaery. Had the largest army. Assassinated by Stannis's shadow before the brothers could battle. His death reshuffled every alliance in the war." } }, 
  { id: "gendry", name: "Gendry", color: C.baratheon, house: "Baratheon (bastard)", canon: "both", title: "Robert's bastard", bio: "Robert's unacknowledged bastard, a blacksmith's apprentice. Traveled north with Arya and the Night's Watch recruits. Captured at Harrenhal, freed by Arya. Joined the Brotherhood Without Banners. Sold to Melisandre for his king's blood. In the books, he remains with the Brotherhood.", bookNote: "In the books, Gendry remains with the Brotherhood Without Banners in the Riverlands. The show brings him back for the final seasons.", summaries: { combined: "Robert's unacknowledged bastard, a blacksmith's apprentice. Traveled north with Arya and the Night's Watch recruits. Captured at Harrenhal, freed by Arya. Joined the Brotherhood Without Banners. Sold to Melisandre for his king's blood. In the books, he remains with the Brotherhood.", books: "Robert's unacknowledged bastard, a blacksmith's apprentice. Traveled north with Arya and the Night's Watch recruits. Captured at Harrenhal, freed by Arya. Joined the Brotherhood Without Banners, where he remains.", tv: "Robert's unacknowledged bastard, a blacksmith's apprentice. Traveled north with Arya and the Night's Watch recruits. Captured at Harrenhal, freed by Arya. Sold to Melisandre for his king's blood, rescued by Davos. Returns to forge dragonglass weapons for the Long Night. Legitimized as Lord of Storm's End." } }, 
  { id: "davos", name: "Davos Seaworth", color: C.baratheon, house: "Seaworth", canon: "both", title: "The Onion Knight / Hand of the King", bio: "Former smuggler who saved Storm's End during Robert's Rebellion. Stannis's moral compass. Lost sons at the Blackwater. Repeatedly saved from execution by being too useful. Sent to White Harbor, then to Skagos to find Rickon Stark. The most decent man serving the most rigid king.", summaries: { combined: "Former smuggler who saved Storm's End during Robert's Rebellion. Stannis's moral compass. Lost sons at the Blackwater. Repeatedly saved from execution by being too useful. Sent to White Harbor, then to Skagos to find Rickon Stark. The most decent man serving the most rigid king.", books: "Former smuggler who saved Storm's End during Robert's Rebellion by running the blockade with onions. Stannis's moral compass. Lost sons at the Blackwater. Sent to White Harbor, where Manderly reveals the North's secret loyalty to the Starks, then to Skagos to find Rickon.", tv: "Former smuggler who saved Storm's End during Robert's Rebellion. Stannis's moral compass. Lost his son at the Blackwater. Convinces Melisandre to resurrect Jon Snow. Becomes Jon's most trusted advisor. Serves on Bran's Small Council." } }, 
  { id: "melisandre", name: "Melisandre", color: C.targaryen, house: "R'hllor", canon: "both", title: "The Red Woman", bio: "Red priestess who believes Stannis is Azor Ahai reborn. Births shadow assassins, sees visions in flames she often misinterprets. Her POV reveals she is far less certain of her powers than she appears. Searches for the Prince That Was Promised — possibly looking at the wrong person.", summaries: { combined: "Red priestess who believes Stannis is Azor Ahai reborn. Births shadow assassins, sees visions in flames she often misinterprets. Her POV reveals she is far less certain of her powers than she appears. Searches for the Prince That Was Promised — possibly looking at the wrong person.", books: "Red priestess who believes Stannis is Azor Ahai reborn. Births shadow assassins, sees visions in flames she often misinterprets. Her POV chapter reveals she is far less certain of her powers than she appears. Remains at the Wall after Jon's assassination.", tv: "Red priestess who believes Stannis is Azor Ahai reborn. Births shadow assassins, sees visions in flames. Resurrects Jon Snow after his assassination. Helps rally forces against the Night King. Removes her enchanted necklace and dies of old age after the Long Night." } }, 
  { id: "shireen", name: "Shireen Baratheon", color: C.baratheon, house: "Baratheon", canon: "both", title: "Princess", bio: "Stannis's only child, scarred by greyscale that turned part of her face to stone. Sweet, intelligent, teaches the illiterate to read. GRRM confirmed the show's devastating scene — her burning — will happen in the books, though the circumstances will differ.", summaries: { combined: "Stannis's only child, scarred by greyscale that turned part of her face to stone. Sweet, intelligent, teaches the illiterate to read. GRRM confirmed the show's devastating scene — her burning — will happen in the books, though the circumstances will differ.", books: "Stannis's only child, scarred by greyscale that turned part of her face to stone. Sweet, intelligent, and kind — she teaches the illiterate to read. Remains at the Wall while Stannis marches on Winterfell.", tv: "Stannis's only child, scarred by greyscale that turned part of her face to stone. Sweet, intelligent, and kind — she teaches Davos to read. Burned alive at the stake by her father Stannis on Melisandre's counsel before his march on Winterfell. One of the series' most devastating scenes." } }, 
  // ── TARGARYEN ──
  { id: "dany", name: "Daenerys Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "Mother of Dragons / Breaker of Chains", bio: "Last known Targaryen heir (until Aegon appears). Sold to Drogo, became khaleesi, hatched three dragons from stone. Conquered Slaver's Bay, struggled to rule Meereen. Flew away on Drogon, stranded in the Dothraki sea. Her vision tells her to embrace fire and blood. 'Dragons plant no trees.'", summaries: { combined: "Last known Targaryen heir (until Aegon appears). Sold to Drogo, became khaleesi, hatched three dragons from stone. Conquered Slaver's Bay, struggled to rule Meereen. Flew away on Drogon, stranded in the Dothraki sea. Her vision tells her to embrace fire and blood. 'Dragons plant no trees.'", books: "Last known Targaryen heir (until Aegon appears). Sold to Drogo, became khaleesi, hatched three dragons from stone. Conquered Slaver's Bay, struggled to rule Meereen. Flew away on Drogon, stranded among the Dothraki. Her visions urge her to embrace fire and blood.", tv: "Last known Targaryen heir. Sold to Drogo, became khaleesi, hatched three dragons from stone. Conquered Slaver's Bay, struggled to rule Meereen. Sailed to Westeros, fought the Night King, then burned King's Landing, killing thousands. Killed by Jon Snow. Her dragon Drogon melted the Iron Throne." } }, 
  { id: "viserys", name: "Viserys Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "The Beggar King", bio: "Dany's abusive brother who sold her to Drogo for an army. The last male Targaryen heir (seemingly). Received his golden crown — molten gold poured over his head by Drogo. 'He was no dragon. Fire cannot kill a dragon.'", summaries: { combined: "Dany's abusive brother who sold her to Drogo for an army. The last male Targaryen heir (seemingly). Received his golden crown — molten gold poured over his head by Drogo. 'He was no dragon. Fire cannot kill a dragon.'", books: "Dany's abusive brother who sold her to Drogo for an army. Received his golden crown — molten gold poured over his head by Drogo. 'He was no dragon. Fire cannot kill a dragon.'", tv: "Dany's abusive brother who sold her to Drogo for an army. Received his golden crown — molten gold poured over his head by Drogo. 'He was no dragon. Fire cannot kill a dragon.'" } }, 
  { id: "rhaegar", name: "Rhaegar Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "Crown Prince", bio: "The prince who triggered the war. Obsessed with prophecy — believed his children were 'the three heads of the dragon.' Abducted (or eloped with) Lyanna Stark. Killed by Robert at the Trident. Whether his actions were love, prophecy, or madness is the series' central ambiguity.", summaries: { combined: "The prince who triggered the war. Obsessed with prophecy — believed his children were 'the three heads of the dragon.' Abducted (or eloped with) Lyanna Stark. Killed by Robert at the Trident. Whether his actions were love, prophecy, or madness is the series' central ambiguity.", books: "The prince who triggered the war. Obsessed with prophecy — believed his children were 'the three heads of the dragon.' Abducted (or eloped with) Lyanna Stark. Killed by Robert at the Trident. Whether his actions were love, prophecy, or madness remains the central ambiguity.", tv: "The prince who triggered the war. Secretly married Lyanna Stark after annulling his marriage to Elia Martell. Killed by Robert at the Trident. Father of Jon Snow, whose true name is Aegon Targaryen." } }, 
  { id: "aerys", name: "Aerys II (Mad King)", color: C.targaryen, house: "Targaryen", canon: "both", title: "King of the Seven Kingdoms", bio: "The last Targaryen king, descended into paranoid madness. Burned men alive with wildfire. Planned to destroy King's Landing rather than lose it — 'Burn them all.' Killed by Jaime Lannister, his own Kingsguard, moments before the order could be carried out.", summaries: { combined: "The last Targaryen king, descended into paranoid madness. Burned men alive with wildfire. Planned to destroy King's Landing rather than lose it — 'Burn them all.' Killed by Jaime Lannister, his own Kingsguard, moments before the order could be carried out.", books: "The last Targaryen king, descended into paranoid madness. Burned men alive with wildfire. Planned to destroy King's Landing rather than lose it — 'Burn them all.' Killed by Jaime Lannister, his own Kingsguard, moments before the order could be carried out.", tv: "The last Targaryen king, descended into paranoid madness. Burned men alive with wildfire. Planned to destroy King's Landing rather than lose it — 'Burn them all.' Killed by Jaime Lannister, his own Kingsguard, moments before the order could be carried out." } }, 
  { id: "aegon_c", name: "Aegon the Conqueror", color: C.targaryen, house: "Targaryen", canon: "both", title: "First of His Name", bio: "United six kingdoms with three dragons. Built the Iron Throne from his enemies' swords, melted by Balerion's fire. Established the Targaryen dynasty that would rule for 300 years.", summaries: { combined: "United six kingdoms with three dragons. Built the Iron Throne from his enemies' swords, melted by Balerion's fire. Established the Targaryen dynasty that would rule for 300 years.", books: "United six kingdoms with three dragons. Built the Iron Throne from his enemies' swords, melted by Balerion's fire. Established the Targaryen dynasty that would rule for nearly 300 years.", tv: "United six kingdoms with three dragons. Built the Iron Throne from his enemies' swords, melted by Balerion's fire. Established the Targaryen dynasty that would rule for nearly 300 years." } }, 
  { id: "aegon_v", name: "Aegon V (Egg)", color: C.targaryen, house: "Targaryen", canon: "both", title: "The Unlikely", bio: "The protagonist of the Dunk & Egg novellas. Traveled Westeros as a commoner, became king by chance. Tried to help the smallfolk, blocked by lords. Died at Summerhall in a mysterious fire, possibly trying to hatch dragons.", summaries: { combined: "The protagonist of the Dunk & Egg novellas. Traveled Westeros as a commoner, became king by chance. Tried to help the smallfolk, blocked by lords. Died at Summerhall in a mysterious fire, possibly trying to hatch dragons.", books: "The protagonist of the Dunk & Egg novellas. Fourth son of a fourth son who traveled Westeros as a commoner. Became king by chance. Tried to help the smallfolk, blocked at every turn by lords. Died at Summerhall in a mysterious fire, possibly trying to hatch dragons.", tv: "Known as 'Egg,' a Targaryen king referenced in historical context. Traveled Westeros as a commoner in his youth. Died at the Tragedy of Summerhall." } }, 
  { id: "bloodraven", name: "Bloodraven (Brynden Rivers)", color: C.targaryen, house: "Targaryen / Children", canon: "both", title: "The Three-Eyed Crow", bio: "Targaryen bastard, Hand of the King, master of spies with 'a thousand eyes and one.' Sent to the Wall, vanished beyond it. Became the Three-Eyed Crow in a cave with the Children of the Forest, waiting for Bran. A greenseer who has watched the world for over a century.", summaries: { combined: "Targaryen bastard, Hand of the King, master of spies with 'a thousand eyes and one.' Sent to the Wall, vanished beyond it. Became the Three-Eyed Crow in a cave with the Children of the Forest, waiting for Bran. A greenseer who has watched the world for over a century.", books: "Targaryen bastard, Hand of the King, master of spies with 'a thousand eyes and one.' Sent to the Wall, vanished beyond it. Became the Three-Eyed Crow, a greenseer merged with a weirwood in a cave with the Children of the Forest, waiting for Bran.", tv: "Known as the Three-Eyed Raven. An ancient greenseer living in a cave beyond the Wall with the Children of the Forest. Trains Bran Stark in greensight. Killed when the Night King attacks the cave." } }, 
  { id: "maester_aemon", name: "Maester Aemon", color: C.targaryen, house: "Targaryen / Night's Watch", canon: "both", title: "Maester of Castle Black", bio: "Aemon Targaryen, who refused the Iron Throne and took the black. Blind and ancient, he served the Watch for decades. Died at sea sailing for Oldtown, whispering about Daenerys: 'the dragon must have three heads.' The last Targaryen link to the old dynasty.", summaries: { combined: "Aemon Targaryen, who refused the Iron Throne and took the black. Blind and ancient, he served the Watch for decades. Died at sea sailing for Oldtown, whispering about Daenerys: 'the dragon must have three heads.' The last Targaryen link to the old dynasty.", books: "Aemon Targaryen, who refused the Iron Throne and took the black. Blind and ancient, he served the Watch for decades. Died at sea sailing for Oldtown, whispering about Daenerys and 'the dragon must have three heads.'", tv: "Aemon Targaryen, who refused the Iron Throne and took the black. Blind and ancient, he served the Watch for decades. Died at Castle Black, calling out for his brother 'Egg.' One of the last Targaryens to know his heritage." } }, 
  { id: "young_griff", name: "Aegon VI (Young Griff)", color: C.targaryen, house: "Targaryen (?)", canon: "book", title: "Claimant to the Iron Throne", bio: "Claims to be Rhaegar's son, supposedly smuggled out of King's Landing before the Sack. Raised in secret by Jon Connington. Invades Westeros with the Golden Company. Whether he is truly Aegon or a Blackfyre pretender is the books' biggest unresolved question. CUT from the show entirely.", summaries: { combined: "Claims to be Rhaegar's son, supposedly smuggled out of King's Landing before the Sack. Raised in secret by Jon Connington. Invades Westeros with the Golden Company. Whether he is truly Aegon or a Blackfyre pretender is the books' biggest unresolved question. CUT from the show entirely.", books: "Claims to be Rhaegar's son, supposedly smuggled out of King's Landing before the Sack. Raised in secret by Jon Connington. Invades Westeros with the Golden Company. Whether he is truly Aegon or a Blackfyre pretender is the books' biggest unresolved question.", tv: "" } }, 
  { id: "connington", name: "Jon Connington", color: C.targaryen, house: "Connington", canon: "book", title: "Lord of Griffin's Roost / Hand of the King", bio: "Rhaegar's closest friend; his feelings for Rhaegar are suggested in his POV. Raised Aegon in hiding for sixteen years. Dying of greyscale. Leads the Golden Company's invasion. Racing against his own death to seat Aegon on the throne. Entirely absent from the show.", summaries: { combined: "Rhaegar's closest friend; his feelings for Rhaegar are suggested in his POV. Raised Aegon in hiding for sixteen years. Dying of greyscale. Leads the Golden Company's invasion. Racing against his own death to seat Aegon on the throne. Entirely absent from the show.", books: "Rhaegar's closest friend; his feelings for Rhaegar are suggested in his POV chapters. Raised Aegon in hiding for sixteen years. Dying of greyscale. Leads the Golden Company's invasion of the Stormlands, racing against his own death to seat Aegon on the throne.", tv: "" } }, 
  // ── TARGARYEN ALLIES (ESSOS) ──
  { id: "drogo", name: "Khal Drogo", color: C.dothraki, house: "Dothraki", canon: "both", title: "Khal of the Great Grass Sea", bio: "Mightiest Dothraki khal, married Dany and fell in love with her. Promised to cross the sea and take Westeros. A minor wound festered; Mirri Maz Duur's 'healing' left him a shell. Dany smothered him on his funeral pyre and walked into the flames with dragon eggs.", summaries: { combined: "Mightiest Dothraki khal, married Dany and fell in love with her. Promised to cross the sea and take Westeros. A minor wound festered; Mirri Maz Duur's 'healing' left him a shell. Dany smothered him on his funeral pyre and walked into the flames with dragon eggs.", books: "Mightiest Dothraki khal, married Dany and grew to love her. Promised to cross the sea and take Westeros. A minor wound festered; Mirri Maz Duur's blood magic left him a shell. Dany smothered him on his funeral pyre and walked into the flames with dragon eggs.", tv: "Mightiest Dothraki khal, married Dany and grew to love her. Promised to cross the sea and take Westeros. A minor wound festered; Mirri Maz Duur's blood magic left him a shell. Dany smothered him on his funeral pyre and walked into the flames with dragon eggs." } }, 
  { id: "jorah", name: "Jorah Mormont", color: C.free_cities, house: "Mormont (exiled)", canon: "both", title: "Ser / Queen's advisor", bio: "Exiled northern lord, spied on Dany for Varys while genuinely falling in love with her. Exposed and banished. Kidnapped Tyrion to bring as a gift. Contracted greyscale. Desperately trying to return to her service. His devotion is both genuine and tragic.", summaries: { combined: "Exiled northern lord, spied on Dany for Varys while genuinely falling in love with her. Exposed and banished. Kidnapped Tyrion to bring as a gift. Contracted greyscale. Desperately trying to return to her service. His devotion is both genuine and tragic.", books: "Exiled northern lord who spied on Dany for Varys while genuinely falling in love with her. Exposed and banished. Kidnapped Tyrion to bring as a gift. Contracted greyscale. Desperately trying to return to her service as the published story continues.", tv: "Exiled northern lord who spied on Dany for Varys while genuinely falling in love with her. Exposed and banished. Kidnapped Tyrion to bring as a gift. Contracted and was cured of greyscale by Sam. Dies defending Dany during the Long Night." } }, 
  { id: "barristan", name: "Barristan Selmy", color: C.kingsguard, house: "Selmy", canon: "both", title: "Barristan the Bold", bio: "Greatest living knight, dismissed by Joffrey. Traveled to Dany in disguise as 'Arstan Whitebeard.' Exposed Jorah's spying. Rules Meereen in Dany's absence. Prepares for the Battle of Fire. The show kills him in a street ambush; GRRM was reportedly unhappy.", bookNote: "In the books, Barristan rules Meereen in Dany's absence and prepares for the Battle of Fire. The show kills him early in a street ambush.", summaries: { combined: "Greatest living knight, dismissed by Joffrey. Traveled to Dany in disguise as 'Arstan Whitebeard.' Exposed Jorah's spying. Rules Meereen in Dany's absence. Prepares for the Battle of Fire. The show kills him in a street ambush; GRRM was reportedly unhappy.", books: "Greatest living knight, dismissed by Joffrey. Traveled to Dany in disguise as 'Arstan Whitebeard.' Exposed Jorah's spying. Rules Meereen in Dany's absence and prepares for the Battle of Fire.", tv: "Greatest living knight, dismissed by Joffrey. Traveled to Dany and became one of her most trusted advisors. Killed in a street ambush by the Sons of the Harpy in Meereen." } }, 
  { id: "missandei", name: "Missandei", color: C.slaver, house: "Freedwoman", canon: "both", title: "Queen's interpreter", bio: "Former slave who speaks nineteen languages. Freed by Dany, becomes her most trusted confidante. A ten-year-old child in the books (aged up significantly in the show). Wise beyond her years.", bookNote: "A ten-year-old child in the books. Aged up significantly in the show and given a major romantic storyline.", summaries: { combined: "Former slave who speaks nineteen languages. Freed by Dany, becomes her most trusted confidante. A ten-year-old child in the books (aged up significantly in the show). Wise beyond her years.", books: "Former slave who speaks nineteen languages. Freed by Dany, becomes her most trusted confidante. A young child, wise beyond her years, who serves as interpreter and handmaid.", tv: "Former slave who speaks nineteen languages. Freed by Dany, becomes her most trusted confidante and advisor. Falls in love with Grey Worm. Captured by Cersei's forces and beheaded by the Mountain before Dany's assault on King's Landing." } }, 
  { id: "grey_worm", name: "Grey Worm", color: C.slaver, house: "Unsullied", canon: "both", title: "Commander of the Unsullied", bio: "Chosen by the freed Unsullied as their commander. Fiercely loyal to Daenerys. The show gives him a major romantic subplot with Missandei that doesn't exist in the books, where he remains a relatively minor character.", bookNote: "A minor character in the books with no romance subplot. Significantly expanded in the show.", summaries: { combined: "Chosen by the freed Unsullied as their commander. Fiercely loyal to Daenerys. The show gives him a major romantic subplot with Missandei that doesn't exist in the books, where he remains a relatively minor character.", books: "Chosen by the freed Unsullied as their commander. Fiercely loyal to Daenerys. A capable soldier and leader of her infantry.", tv: "Chosen by the freed Unsullied as their commander. Fiercely loyal to Daenerys. Falls in love with Missandei. After Daenerys's death, sails with the Unsullied to Naath to protect Missandei's homeland." } }, 
  { id: "daario", name: "Daario Naharis", color: C.free_cities, house: "Stormcrows", canon: "both", title: "Sellsword captain", bio: "Flamboyant sellsword who switches sides for Dany. Becomes her lover. In the books he has a blue trident beard and gold teeth — far wilder than the show's version. Reckless, romantic, and untrustworthy.", summaries: { combined: "Flamboyant sellsword who switches sides for Dany. Becomes her lover. In the books he has a blue trident beard and gold teeth — far wilder than the show's version. Reckless, romantic, and untrustworthy.", books: "Flamboyant sellsword captain with a blue trident beard and gold teeth. Switches sides for Dany and becomes her lover. Reckless, romantic, and untrustworthy. Left as a hostage in Meereen when Dany flies away on Drogon.", tv: "Sellsword captain who switches sides for Dany and becomes her lover. Reckless and charming. Left behind to keep the peace in Meereen when Dany sails for Westeros." } }, 
  { id: "hizdahr", name: "Hizdahr zo Loraq", color: C.slaver, house: "Loraq", canon: "both", title: "King of Meereen", bio: "Meereenese noble Dany marries for peace. May or may not be connected to the Sons of the Harpy — the poisoned locusts at the fighting pit were likely meant for Dany, and Hizdahr didn't eat them.", summaries: { combined: "Meereenese noble Dany marries for peace. May or may not be connected to the Sons of the Harpy — the poisoned locusts at the fighting pit were likely meant for Dany, and Hizdahr didn't eat them.", books: "Meereenese noble Dany marries for peace. May or may not be connected to the Sons of the Harpy. The poisoned locusts at Daznak's Pit were likely meant for Dany, and Hizdahr did not eat them.", tv: "Meereenese noble Dany marries for peace. His connection to the Sons of the Harpy is suspected. Present at Daznak's Pit when the Sons of the Harpy attack." } }, 
  { id: "mirri", name: "Mirri Maz Duur", color: C.slaver, house: "Lhazareen", canon: "both", title: "Godswife / Maegi", bio: "Repaid Drogo's khalasar's atrocities with vengeance disguised as healing. Her blood magic killed Dany's unborn son and left Drogo a shell. Her act of revenge inadvertently created the conditions for the dragons to hatch.", summaries: { combined: "Repaid Drogo's khalasar's atrocities with vengeance disguised as healing. Her blood magic killed Dany's unborn son and left Drogo a shell. Her act of revenge inadvertently created the conditions for the dragons to hatch.", books: "Lhazareen godswife who repaid Drogo's khalasar's atrocities with vengeance disguised as healing. Her blood magic killed Dany's unborn son and left Drogo a shell. Burned alive on Drogo's pyre, inadvertently creating the conditions for the dragons to hatch.", tv: "Lhazareen healer who repaid Drogo's khalasar's atrocities with vengeance disguised as healing. Her blood magic killed Dany's unborn son and left Drogo a shell. Burned alive on Drogo's pyre, inadvertently creating the conditions for the dragons to hatch." } }, 
  { id: "illyrio", name: "Illyrio Mopatis", color: C.free_cities, house: "Mopatis", canon: "both", title: "Magister of Pentos", bio: "Wealthy Pentoshi who sheltered the Targaryen siblings. Arranged Dany's marriage. Plots with Varys — his true loyalty may be to Young Griff/Aegon. His late wife Serra may connect him to the Blackfyre line.", summaries: { combined: "Wealthy Pentoshi who sheltered the Targaryen siblings. Arranged Dany's marriage. Plots with Varys — his true loyalty may be to Young Griff/Aegon. His late wife Serra may connect him to the Blackfyre line.", books: "Wealthy Pentoshi magister who sheltered the Targaryen siblings. Arranged Dany's marriage to Drogo. Plots with Varys — his true loyalty appears to be to Aegon/Young Griff. His late wife Serra may connect him to the Blackfyre line.", tv: "Wealthy Pentoshi magister who sheltered the Targaryen siblings and arranged Dany's marriage to Drogo. Plots with Varys in the early seasons. Appears only briefly before the story moves beyond his reach." } }, 
  { id: "quentyn", name: "Quentyn Martell", color: C.martell, house: "Martell", canon: "book", title: "Prince of Dorne", bio: "Doran's son sent to marry Dany as part of a secret pact. Arrived too late. Tried to steal a dragon. Burned horribly. Died: 'Oh.' Martin's deconstruction of the heroic quest narrative. CUT from the show.", summaries: { combined: "Doran's son sent to marry Dany as part of a secret pact. Arrived too late. Tried to steal a dragon. Burned horribly. Died: 'Oh.' Martin's deconstruction of the heroic quest narrative. CUT from the show.", books: "Doran's son sent to marry Dany as part of a secret pact. Arrived too late. Tried to steal a dragon and was burned horribly. Died with a single word: 'Oh.' Martin's deconstruction of the heroic quest narrative.", tv: "" } }, 
  { id: "victarion", name: "Victarion Greyjoy", color: C.greyjoy, house: "Greyjoy", canon: "book", title: "Lord Captain of the Iron Fleet", bio: "Balon's brother, sent by Euron to fetch Dany. Plans to claim her and the dragons for himself using the horn Dragonbinder. A devout, simple warrior. His hand was healed by fire magic, leaving it charred and smoking. Entirely absent from the show.", summaries: { combined: "Balon's brother, sent by Euron to fetch Dany. Plans to claim her and the dragons for himself using the horn Dragonbinder. A devout, simple warrior. His hand was healed by fire magic, leaving it charred and smoking. Entirely absent from the show.", books: "Balon's brother, Lord Captain of the Iron Fleet. Sent by Euron to fetch Dany. Plans to claim her and the dragons for himself using the horn Dragonbinder. A devout, simple warrior whose hand was healed by fire magic, leaving it charred and smoking.", tv: "" } }, 
  // ── TYRELL ──
  { id: "margaery", name: "Margaery Tyrell", color: C.tyrell, house: "Tyrell", canon: "both", title: "Queen", bio: "Married Renly, then Joffrey, then Tommen. The Tyrell bid for power through marriage. Whether she is genuinely kind or playing a perfect game is one of the books' deliberate ambiguities. Arrested by the Faith on charges engineered by Cersei.", summaries: { combined: "Married Renly, then Joffrey, then Tommen. The Tyrell bid for power through marriage. Whether she is genuinely kind or playing a perfect game is one of the books' deliberate ambiguities. Arrested by the Faith on charges engineered by Cersei.", books: "Married Renly, then Joffrey, then Tommen. The Tyrell bid for power through marriage. Whether she is genuinely kind or playing a perfect game is a deliberate ambiguity. Arrested by the Faith on charges engineered by Cersei. Awaiting trial.", tv: "Married Renly, then Joffrey, then Tommen. The Tyrell bid for power through marriage. Savvy and charismatic, she gains influence over Tommen. Arrested by the Faith on charges engineered by Cersei. Killed in the destruction of the Sept of Baelor." } }, 
  { id: "olenna", name: "Olenna Tyrell", color: C.tyrell, house: "Tyrell", canon: "both", title: "The Queen of Thorns", bio: "Matriarch who poisoned Joffrey at his own wedding to protect Margaery. Worked with Littlefinger. Sharp, witty, and lethal. The most politically astute woman in Westeros.", summaries: { combined: "Matriarch who poisoned Joffrey at his own wedding to protect Margaery. Worked with Littlefinger. Sharp, witty, and lethal. The most politically astute woman in Westeros.", books: "Matriarch who poisoned Joffrey at his own wedding to protect Margaery. Worked with Littlefinger. Sharp, witty, and lethal. The most politically astute woman in Westeros.", tv: "Matriarch who poisoned Joffrey at his own wedding to protect Margaery. Worked with Littlefinger. After the destruction of the Sept kills her grandchildren, she allies with Daenerys against Cersei. Poisoned by Jaime, she uses her final moments to confess to Joffrey's murder." } }, 
  { id: "loras", name: "Loras Tyrell", color: C.tyrell, house: "Tyrell", canon: "both", title: "Knight of Flowers", bio: "Renly's secret lover and one of the finest jousters alive. After Renly's death, joins the Kingsguard. Horribly burned storming Dragonstone (in the books). The show gives him a very different arc involving the Faith Militant.", bookNote: "In the books, Loras is horribly burned storming Dragonstone. The show replaces this with a Faith Militant imprisonment arc.", summaries: { combined: "Renly's secret lover and one of the finest jousters alive. After Renly's death, joins the Kingsguard. Horribly burned storming Dragonstone (in the books). The show gives him a very different arc involving the Faith Militant.", books: "Renly's secret lover and one of the finest jousters alive. After Renly's death, joins the Kingsguard. Severely burned storming Dragonstone — reports suggest he may be dying of his wounds.", tv: "Renly's secret lover and one of the finest jousters alive. After Renly's death, joins the Kingsguard. Imprisoned by the Faith Militant for his relationship with Renly. Killed in the destruction of the Sept of Baelor." } }, 
  { id: "mace", name: "Mace Tyrell", color: C.tyrell, house: "Tyrell", canon: "both", title: "Lord of Highgarden", bio: "The 'oaf of Highgarden' — pompous and self-important but backed by the most powerful army and the richest lands in Westeros. His mother Olenna runs the real show.", summaries: { combined: "The 'oaf of Highgarden' — pompous and self-important but backed by the most powerful army and the richest lands in Westeros. His mother Olenna runs the real show.", books: "The 'oaf of Highgarden' — pompous and self-important but backed by the most powerful army and the richest lands in Westeros. His mother Olenna runs the real strategy. Serves on the Small Council.", tv: "The 'oaf of Highgarden' — pompous and self-important but backed by the most powerful army and the richest lands in Westeros. His mother Olenna runs the real strategy. Killed in the destruction of the Sept of Baelor." } }, 
  // ── MARTELL ──
  { id: "oberyn", name: "Oberyn Martell", color: C.martell, house: "Martell", canon: "both", title: "The Red Viper", bio: "Came to King's Landing seeking vengeance for Elia. Championed Tyrion's trial by combat. Fought brilliantly against the Mountain, demanding a confession. Got his confession — then Gregor crushed his skull. His death ignited Dorne.", summaries: { combined: "Came to King's Landing seeking vengeance for Elia. Championed Tyrion's trial by combat. Fought brilliantly against the Mountain, demanding a confession. Got his confession — then Gregor crushed his skull. His death ignited Dorne.", books: "Came to King's Landing seeking vengeance for Elia. Championed Tyrion's trial by combat. Fought brilliantly against the Mountain, demanding a confession about Elia's murder. Got his confession — then Gregor crushed his skull.", tv: "Came to King's Landing seeking vengeance for Elia. Championed Tyrion's trial by combat. Fought brilliantly against the Mountain, demanding a confession about Elia's murder. Got his confession — then Gregor crushed his skull." } }, 
  { id: "doran", name: "Doran Martell", color: C.martell, house: "Martell", canon: "both", title: "Prince of Dorne", bio: "The patient schemer, crippled by gout. Appears passive for years while pursuing a long game; his Targaryen restoration plans are revealed in the books. 'Vengeance. Justice. Fire and blood.' Sent Quentyn to Dany, positioned Arianne for Aegon. The show kills him quickly; the books make him a major strategist.", bookNote: "In the books, Doran is a major strategist with a long-term Targaryen restoration plot. The show kills him quickly in a Sand Snake coup.", summaries: { combined: "The patient schemer, crippled by gout. Appears passive for years while pursuing a long game; his Targaryen restoration plans are revealed in the books. 'Vengeance. Justice. Fire and blood.' Sent Quentyn to Dany, positioned Arianne for Aegon. The show kills him quickly; the books make him a major strategist.", books: "The patient schemer, crippled by gout. Appears passive for years while secretly pursuing Targaryen restoration. 'Vengeance. Justice. Fire and blood.' Sent Quentyn to marry Dany, positioned Arianne to meet Aegon. A major strategist whose long game is still unfolding.", tv: "The patient Prince of Dorne, crippled by gout. Killed by Ellaria Sand and the Sand Snakes in a coup, who blame him for failing to avenge Oberyn and Elia." } }, 
  { id: "arianne", name: "Arianne Martell", color: C.martell, house: "Martell", canon: "book", title: "Princess of Dorne", bio: "Doran's eldest daughter and heir. Her failed Queenmaker plot to crown Myrcella left the princess scarred. Later sent to meet Aegon/Young Griff — a major plotline entirely absent from the show. She connects Dorne to the Targaryen restoration.", summaries: { combined: "Doran's eldest daughter and heir. Her failed Queenmaker plot to crown Myrcella left the princess scarred. Later sent to meet Aegon/Young Griff — a major plotline entirely absent from the show. She connects Dorne to the Targaryen restoration.", books: "Doran's eldest daughter and heir by Dornish law. Her failed Queenmaker plot to crown Myrcella left the princess scarred. Later sent to treat with Aegon/Young Griff, connecting Dorne to the Targaryen restoration.", tv: "" } }, 
  { id: "sand_snakes", name: "The Sand Snakes", color: C.martell, house: "Martell (bastards)", canon: "both", title: "Oberyn's daughters", bio: "Obara, Nymeria, and Tyene — each advocating different responses to their father's death. In the books, Doran deploys them as strategic agents. The show reduced them to action caricatures.", bookNote: "In the books, Doran deploys the Sand Snakes as strategic agents across Westeros. The show reduced them to action set pieces.", summaries: { combined: "Obara, Nymeria, and Tyene — each advocating different responses to their father's death. In the books, Doran deploys them as strategic agents. The show reduced them to action caricatures.", books: "Obara, Nymeria, and Tyene — Oberyn's eldest bastard daughters, each with distinct skills and temperaments. After Oberyn's death, Doran imprisons them to prevent rash vengeance, then deploys them as strategic agents across Westeros.", tv: "Obara, Nymeria, and Tyene — Oberyn's bastard daughters. After Oberyn's death, they join Ellaria Sand in overthrowing Doran and seeking vengeance against the Lannisters. Captured and killed by Cersei and Euron Greyjoy." } }, 
  // ── GREYJOY ──
  { id: "balon", name: "Balon Greyjoy", color: C.greyjoy, house: "Greyjoy", canon: "both", title: "King of the Iron Islands", bio: "Rejected Robb's alliance, launched his own war against the undefended North. Declared independence. Died falling from a bridge at Pyke; some readers interpret his death as the work of a Faceless Man, but this is not confirmed in the text.", summaries: { combined: "Rejected Robb's alliance, launched his own war against the undefended North. Declared independence. Died falling from a bridge at Pyke; some readers interpret his death as the work of a Faceless Man, but this is not confirmed in the text.", books: "Rejected Robb's alliance and launched his own war against the undefended North. Declared independence. Fell from a bridge at Pyke during a storm. The circumstances strongly suggest murder, likely arranged by Euron through a Faceless Man.", tv: "Rejected Robb's alliance and launched his own war against the undefended North. Declared independence. Killed by Euron, who throws him from a bridge at Pyke." } }, 
  { id: "euron", name: "Euron 'Crow's Eye' Greyjoy", color: C.greyjoy, house: "Greyjoy", canon: "both", title: "King of the Iron Islands", bio: "Returned from exile the day Balon died. Pirate, sorcerer, abuser, kinslayer. Claims to have sailed the Smoking Sea and found Dragonbinder. Won the kingsmoot. His true ambitions may be cosmic — he wants to become a god. The show reduces him to a swashbuckler; book Euron is terrifying.", bookNote: "Book Euron is a terrifying eldritch sorcerer with cosmic ambitions. The show reduces him to a flamboyant pirate.", summaries: { combined: "Returned from exile the day Balon died. Pirate, sorcerer, abuser, kinslayer. Claims to have sailed the Smoking Sea and found Dragonbinder. Won the kingsmoot. His true ambitions may be cosmic — he wants to become a god. The show reduces him to a swashbuckler; book Euron is terrifying.", books: "Returned from exile the day Balon died. Pirate, sorcerer, abuser, kinslayer. Claims to have sailed the Smoking Sea and found the dragon horn Dragonbinder. Won the kingsmoot. His ambitions extend beyond mere kingship — he may seek to become a god.", tv: "Returned from exile after Balon's death. A flamboyant pirate king who allies with Cersei against Daenerys. Commands the Iron Fleet and captures Yara. Killed by Jaime during the battle for King's Landing." } }, 
  { id: "asha", name: "Asha (Yara) Greyjoy", color: C.greyjoy, house: "Greyjoy", canon: "both", title: "Captain / Queen claimant", bio: "Claimed the Seastone Chair at the kingsmoot, lost to Euron. Captured by Stannis at Deepwood Motte. A prisoner in his camp, she argues for Theon's life. Renamed 'Yara' in the show.", summaries: { combined: "Claimed the Seastone Chair at the kingsmoot, lost to Euron. Captured by Stannis at Deepwood Motte. A prisoner in his camp, she argues for Theon's life. Renamed 'Yara' in the show.", books: "Claimed the Seastone Chair at the kingsmoot, lost to Euron. Captured by Stannis at Deepwood Motte. A prisoner in his camp, she argues for Theon's life when Stannis plans to execute him.", tv: "Known as Yara. Claimed the Seastone Chair at the kingsmoot, lost to Euron. Allies with Daenerys. Captured by Euron, later rescued by Theon. Reclaims the Iron Islands while Theon fights at Winterfell." } }, 
  { id: "aeron", name: "Aeron 'Damphair' Greyjoy", color: C.greyjoy, house: "Greyjoy", canon: "both", title: "Priest of the Drowned God", bio: "Called the kingsmoot to stop Euron. Has repressed childhood memories of abuse by Euron. His POV chapters reveal visceral terror of his elder brother.", summaries: { combined: "Called the kingsmoot to stop Euron. Has repressed childhood memories of abuse by Euron. His POV chapters reveal visceral terror of his elder brother.", books: "Priest of the Drowned God who called the kingsmoot to stop Euron. Has repressed childhood memories of sexual abuse by Euron. His POV chapters reveal visceral terror of his elder brother. Captured by Euron and subjected to further torment.", tv: "Priest of the Drowned God who calls the kingsmoot. Supports Yara's claim against Euron. A minor presence who fades from the story after the kingsmoot." } }, 
  // ── TULLY ──
  { id: "edmure", name: "Edmure Tully", color: C.tully, house: "Tully", canon: "both", title: "Lord of Riverrun", bio: "Married Roslin Frey at the Red Wedding — the one Frey who wept. Taken captive. His pregnant wife and unborn child used as leverage to force Riverrun's surrender. A well-meaning man trapped by events far beyond his control.", summaries: { combined: "Married Roslin Frey at the Red Wedding — the one Frey who wept. Taken captive. His pregnant wife and unborn child used as leverage to force Riverrun's surrender. A well-meaning man trapped by events far beyond his control.", books: "Married Roslin Frey at the Red Wedding — the one Frey who wept. Taken captive. His pregnant wife and unborn child used as leverage to force Riverrun's surrender to Jaime. A well-meaning man trapped by events beyond his control.", tv: "Married Roslin Frey at the Red Wedding — the one Frey who wept. Taken captive. Used as leverage to force Riverrun's surrender. Eventually freed and represents the Riverlands at the Great Council, where Bran is chosen as king." } }, 
  { id: "blackfish", name: "Brynden 'Blackfish' Tully", color: C.tully, house: "Tully", canon: "both", title: "Ser", bio: "Catelyn's uncle, legendary knight. Escaped the Red Wedding and held Riverrun against a Lannister siege. Refuses to surrender. In the books, he escapes by swimming the river; the show kills him offscreen.", bookNote: "In the books, the Blackfish escapes Riverrun by swimming the river and his fate is unknown. The show kills him offscreen.", summaries: { combined: "Catelyn's uncle, legendary knight. Escaped the Red Wedding and held Riverrun against a Lannister siege. Refuses to surrender. In the books, he escapes by swimming the river; the show kills him offscreen.", books: "Catelyn's uncle, a legendary knight. Escaped the Red Wedding and held Riverrun against a Lannister-Frey siege. Escaped by swimming the river when Edmure surrendered the castle. His fate and whereabouts remain unknown.", tv: "Catelyn's uncle, a legendary knight. Escaped the Red Wedding and held Riverrun against a siege. Refuses to surrender and dies fighting when the castle falls." } }, 
  { id: "hoster", name: "Hoster Tully", color: C.tully, house: "Tully", canon: "both", title: "Lord of Riverrun", bio: "Joined the rebellion by marrying his daughters into the alliance. Forced Lysa to abort Littlefinger's child. Died during the War of the Five Kings, babbling about 'Tansy' — the moon tea herb he made Lysa drink.", summaries: { combined: "Joined the rebellion by marrying his daughters into the alliance. Forced Lysa to abort Littlefinger's child. Died during the War of the Five Kings, babbling about 'Tansy' — the moon tea herb he made Lysa drink.", books: "Lord of Riverrun who joined the rebellion by marrying his daughters into the alliance. Forced Lysa to abort Littlefinger's child with moon tea. Died during the War of the Five Kings, babbling about 'Tansy' — the herb he made Lysa drink.", tv: "Lord of Riverrun who joined the rebellion by marrying his daughters into the alliance. Died during the War of the Five Kings. His funeral on the river is a memorable early scene." } }, 
  { id: "lysa", name: "Lysa Arryn", color: C.arryn, house: "Arryn (née Tully)", canon: "both", title: "Lady of the Eyrie", bio: "Catelyn's sister. Poisoned her own husband Jon Arryn on Littlefinger's orders, believing he loved her. Her letter to Catelyn blaming the Lannisters started the entire war. Pushed through the Moon Door by Littlefinger after threatening Sansa.", summaries: { combined: "Catelyn's sister. Poisoned her own husband Jon Arryn on Littlefinger's orders, believing he loved her. Her letter to Catelyn blaming the Lannisters started the entire war. Pushed through the Moon Door by Littlefinger after threatening Sansa.", books: "Catelyn's sister. Poisoned her own husband Jon Arryn on Littlefinger's orders, believing he loved her. Her letter blaming the Lannisters started the entire war. Pushed through the Moon Door by Littlefinger after threatening Sansa in a jealous rage.", tv: "Catelyn's sister. Poisoned her own husband Jon Arryn on Littlefinger's orders, believing he loved her. Her letter blaming the Lannisters started the entire war. Pushed through the Moon Door by Littlefinger after threatening Sansa in a jealous rage." } }, 
  // ── ARRYN ──
  { id: "jon_arryn", name: "Jon Arryn", color: C.arryn, house: "Arryn", canon: "both", title: "Lord of the Eyrie, Hand of the King", bio: "Foster father to Ned and Robert. Discovered the truth about Cersei's children. His death — poisoned by his own wife on Littlefinger's orders — is the inciting event of the entire series.", summaries: { combined: "Foster father to Ned and Robert. Discovered the truth about Cersei's children. His death — poisoned by his own wife on Littlefinger's orders — is the inciting event of the entire series.", books: "Foster father to Ned and Robert. Discovered the truth about Cersei's children. His death — poisoned by his own wife Lysa on Littlefinger's orders — is the inciting event of the entire series.", tv: "Foster father to Ned and Robert. Discovered the truth about Cersei's children. His death — poisoned by his own wife Lysa on Littlefinger's orders — is the inciting event of the entire series." } }, 
  { id: "sweetrobin", name: "Robert 'Sweetrobin' Arryn", color: C.arryn, house: "Arryn", canon: "both", title: "Lord of the Eyrie", bio: "Sickly child lord prone to seizures and tantrums. Dependent on Sansa/'Alayne.' Littlefinger is slowly poisoning him with sweetsleep. His death would make Harry the Heir Lord of the Vale — and Sansa his potential bride.", summaries: { combined: "Sickly child lord prone to seizures and tantrums. Dependent on Sansa/'Alayne.' Littlefinger is slowly poisoning him with sweetsleep. His death would make Harry the Heir Lord of the Vale — and Sansa his potential bride.", books: "Sickly child lord of the Eyrie, prone to seizures and tantrums. Dependent on Sansa (as 'Alayne'). Littlefinger is slowly poisoning him with sweetsleep. His death would make Harry the Heir Lord of the Vale — central to Littlefinger's plans.", tv: "Sickly child lord of the Eyrie, prone to seizures and tantrums. Influenced by Littlefinger. Commands the Knights of the Vale, who ride to Jon Snow's aid at the Battle of the Bastards. Attends the Great Council that chooses Bran as king." } }, 
  // ── NIGHT'S WATCH ──
  { id: "mormont_jeor", name: "Jeor Mormont", color: C.watch, house: "Night's Watch", canon: "both", title: "Lord Commander", bio: "The Old Bear who recognized the growing threat. Gave Jon Longclaw. Led the Great Ranging beyond the Wall. Killed by mutineers at Craster's Keep after the disastrous retreat from the Fist of the First Men.", summaries: { combined: "The Old Bear who recognized the growing threat. Gave Jon Longclaw. Led the Great Ranging beyond the Wall. Killed by mutineers at Craster's Keep after the disastrous retreat from the Fist of the First Men.", books: "The Old Bear who recognized the growing threat beyond the Wall. Gave Jon Longclaw. Led the Great Ranging. Killed by mutineers at Craster's Keep after the disastrous retreat from the Fist of the First Men.", tv: "The Old Bear who recognized the growing threat beyond the Wall. Gave Jon Longclaw. Led the Great Ranging. Killed by mutineers at Craster's Keep after the disastrous retreat from the Fist of the First Men." } }, 
  { id: "sam", name: "Samwell Tarly", color: C.watch, house: "Night's Watch", canon: "both", title: "Maester-in-training", bio: "Self-described craven who killed an Other with dragonglass — the first man to do so in millennia. Engineered Jon's election as Lord Commander. Sent to the Citadel in Oldtown to forge his chain. Discovers a suspicious novice who may be Jaqen H'ghar in disguise.", summaries: { combined: "Self-described craven who killed an Other with dragonglass — the first man to do so in millennia. Engineered Jon's election as Lord Commander. Sent to the Citadel in Oldtown to forge his chain. Discovers a suspicious novice who may be Jaqen H'ghar in disguise.", books: "Self-described craven who killed an Other with dragonglass — the first man to do so in millennia. Engineered Jon's election as Lord Commander. Sent to the Citadel in Oldtown to forge his maester's chain. Discovers a suspicious novice at the Citadel who may be Jaqen H'ghar.", tv: "Self-described craven who killed a White Walker with dragonglass. Engineered Jon's election as Lord Commander. Sent to the Citadel in Oldtown. Cures Jorah's greyscale. Discovers Jon's true parentage in Citadel records. Becomes Grand Maester on Bran's Small Council." } }, 
  { id: "qhorin", name: "Qhorin Halfhand", color: C.watch, house: "Night's Watch", canon: "both", title: "Ranger", bio: "Legendary ranger who ordered Jon to kill him so Jon could infiltrate the wildlings. His sacrifice made Jon's entire wildling arc possible. A true man of the Watch who understood that the mission matters more than any one life.", summaries: { combined: "Legendary ranger who ordered Jon to kill him so Jon could infiltrate the wildlings. His sacrifice made Jon's entire wildling arc possible. A true man of the Watch who understood that the mission matters more than any one life.", books: "Legendary ranger who ordered Jon to kill him so Jon could infiltrate the wildlings. His sacrifice made Jon's entire arc among the free folk possible. A true man of the Watch who understood that the mission matters more than any one life.", tv: "Legendary ranger who ordered Jon to kill him so Jon could infiltrate the wildlings. His sacrifice made Jon's entire arc among the free folk possible. A true man of the Watch who understood that the mission matters more than any one life." } }, 
  { id: "ygritte", name: "Ygritte", color: C.wildling, house: "Free Folk", canon: "both", title: "Spearwife", bio: "Wildling who became Jon's lover. 'You know nothing, Jon Snow.' Died in the battle for Castle Black with an arrow through her. Jon never knew who shot her. Kissed by fire.", summaries: { combined: "Wildling who became Jon's lover. 'You know nothing, Jon Snow.' Died in the battle for Castle Black with an arrow through her. Jon never knew who shot her. Kissed by fire.", books: "Wildling spearwife who became Jon's lover north of the Wall. 'You know nothing, Jon Snow.' Died in the battle for Castle Black with an arrow through her. Jon never knew who shot her. Kissed by fire.", tv: "Wildling spearwife who became Jon's lover north of the Wall. 'You know nothing, Jon Snow.' Died in the battle for Castle Black, shot by Olly. Died in Jon's arms. Kissed by fire." } }, 
  { id: "mance", name: "Mance Rayder", color: C.wildling, house: "Free Folk", canon: "both", title: "King-Beyond-the-Wall", bio: "United a hundred warring wildling clans through charisma alone. A former man of the Watch. Led 100,000 against the Wall to escape the Others. Captured by Stannis. In the books, Melisandre glamours him as 'Rattleshirt' and sends him to Winterfell; the show burns him.", bookNote: "In the books, Melisandre glamours Mance as Rattleshirt and sends him on a secret mission to Winterfell. The show burns him alive.", summaries: { combined: "United a hundred warring wildling clans through charisma alone. A former man of the Watch. Led 100,000 against the Wall to escape the Others. Captured by Stannis. In the books, Melisandre glamours him as 'Rattleshirt' and sends him to Winterfell; the show burns him.", books: "United a hundred warring wildling clans through charisma alone. A former man of the Watch. Led 100,000 against the Wall to escape the Others. Captured by Stannis. Melisandre glamoured him to look like Rattleshirt and sent him on a secret mission to Winterfell.", tv: "United the wildling clans through charisma alone. A former man of the Watch. Led them against the Wall to escape the White Walkers. Captured by Stannis. Burned alive for refusing to bend the knee, with Jon granting him a merciful arrow." } }, 
  { id: "tormund", name: "Tormund Giantsbane", color: C.wildling, house: "Free Folk", canon: "both", title: "War chief", bio: "Boisterous wildling leader. His tall tales ('Har!') are legendary. Despite being an enemy, among the most likable characters. His alliance with Jon is built on genuine respect.", summaries: { combined: "Boisterous wildling leader. His tall tales ('Har!') are legendary. Despite being an enemy, among the most likable characters. His alliance with Jon is built on genuine respect.", books: "Boisterous wildling war chief whose tall tales are legendary. His alliance with Jon is built on genuine mutual respect. Leads wildlings through the Wall under Jon's command.", tv: "Boisterous wildling war chief whose tall tales are legendary. His alliance with Jon is built on genuine mutual respect. Fights at Hardhome, the Battle of the Bastards, and the Long Night. Leads the free folk back beyond the Wall with Jon after Daenerys's death." } }, 
  { id: "craster", name: "Craster", color: C.wildling, house: "Wildling", canon: "both", title: "Craster's Keep", bio: "Wildling who married his own daughters and gave his sons to the Others. The Watch's uncomfortable ally beyond the Wall. Killed by mutineers during the ranging.", summaries: { combined: "Wildling who married his own daughters and gave his sons to the Others. The Watch's uncomfortable ally beyond the Wall. Killed by mutineers during the ranging.", books: "Wildling who married his own daughters and gave his sons to the Others. The Watch's uncomfortable ally beyond the Wall. Killed by mutineers during the Great Ranging.", tv: "Wildling who married his own daughters and gave his sons to the White Walkers. The Watch's uncomfortable ally beyond the Wall. Killed by mutineers during the Great Ranging." } }, 
  { id: "gilly", name: "Gilly", color: C.wildling, house: "Wildling / Free", canon: "both", title: "Craster's daughter-wife", bio: "One of Craster's daughter-wives. Sam rescued her and her newborn son during the mutiny at Craster's Keep. Traveled with Sam to the Wall and then south to Oldtown. One of the few genuine love stories in the series.", summaries: { combined: "One of Craster's daughter-wives. Sam rescued her and her newborn son during the mutiny at Craster's Keep. Traveled with Sam to the Wall and then south to Oldtown. One of the few genuine love stories in the series.", books: "One of Craster's daughter-wives. Sam rescued her and her newborn son during the mutiny. Traveled south with Sam to Oldtown. Her baby was swapped with Mance Rayder's infant son to protect the child from Melisandre.", tv: "One of Craster's daughter-wives. Sam rescued her and her newborn son during the mutiny. Traveled south with Sam. Eventually settles with Sam in Oldtown and later at the Citadel." } }, 
  { id: "coldhands", name: "Coldhands", color: C.ancient, house: "Unknown", canon: "both", title: "Undead ally", bio: "An ancient wight who serves the Three-Eyed Crow. Escorts Bran through the haunted forest. The show says he's Benjen; GRRM explicitly told his editor he is not. His true identity remains unknown — possibly a Night's Watch brother dead for centuries.", bookNote: "The show identifies Coldhands as Benjen Stark. GRRM explicitly told his editor that Coldhands is NOT Benjen.", summaries: { combined: "An ancient wight who serves the Three-Eyed Crow. Escorts Bran through the haunted forest. The show says he's Benjen; GRRM explicitly told his editor he is not. His true identity remains unknown — possibly a Night's Watch brother dead for centuries.", books: "An ancient wight who serves the Three-Eyed Crow. Rides a great elk and commands a flock of ravens. Escorts Bran's party through the haunted forest to the cave. His true identity remains unknown — possibly a Night's Watch brother dead for centuries.", tv: "Revealed to be Benjen Stark, Ned's brother who vanished beyond the Wall. Saved by the Children of the Forest from becoming a wight. Rescues Bran and Meera, and later sacrifices himself to save Jon." } }, 
  // ── THE GAME PLAYERS ──
  { id: "littlefinger", name: "Petyr Baelish (Littlefinger)", color: C.other, house: "Baelish", canon: "both", title: "Lord Protector of the Vale", bio: "The architect of everything. Orchestrated Jon Arryn's murder, pointed Catelyn at Tyrion, betrayed Ned, engineered the Lannister-Tyrell alliance, murdered Joffrey, spirited away Sansa, married and murdered Lysa. Now grooming Sansa as his protégée. Every thread of chaos traces back to him.", summaries: { combined: "The architect of everything. Orchestrated Jon Arryn's murder, pointed Catelyn at Tyrion, betrayed Ned, engineered the Lannister-Tyrell alliance, murdered Joffrey, spirited away Sansa, married and murdered Lysa. Now grooming Sansa as his protégée. Every thread of chaos traces back to him.", books: "The architect of the realm's chaos. Orchestrated Jon Arryn's murder, pointed Catelyn at Tyrion, betrayed Ned, engineered the Lannister-Tyrell alliance, murdered Joffrey, spirited Sansa away, married and murdered Lysa. Now in the Vale, grooming Sansa as his protégée.", tv: "The architect of the realm's chaos. Orchestrated Jon Arryn's murder, betrayed Ned, engineered the Lannister-Tyrell alliance, murdered Joffrey, spirited Sansa away, married and murdered Lysa. Tried to turn the Stark sisters against each other in Winterfell. Executed by Arya at Sansa's command." } }, 
  { id: "varys", name: "Lord Varys", color: C.other, house: "None", canon: "both", title: "The Spider / Master of Whisperers", bio: "Eunuch spymaster whose true loyalties are revealed in Dance: he supports Aegon/Young Griff. Murdered Kevan Lannister to destabilize the realm for Aegon's invasion. The show makes him a Dany supporter; the books make him Aegon's man.", bookNote: "In the books, Varys supports Aegon/Young Griff, not Daenerys. He murders Kevan Lannister to destabilize the realm for Aegon's invasion.", summaries: { combined: "Eunuch spymaster whose true loyalties are revealed in Dance: he supports Aegon/Young Griff. Murdered Kevan Lannister to destabilize the realm for Aegon's invasion. The show makes him a Dany supporter; the books make him Aegon's man.", books: "Eunuch spymaster whose true loyalties are revealed late: he supports Aegon/Young Griff. Murdered Kevan Lannister to destabilize the realm for Aegon's invasion. His long game has been for a king 'raised to rule, who knows duty and sacrifice.'", tv: "Eunuch spymaster who ultimately supports Daenerys Targaryen's claim. Helps Tyrion escape King's Landing. Serves as Dany's advisor but grows concerned as she becomes more ruthless. Executed by dragonfire after attempting to betray her in favor of Jon Snow." } }, 
  { id: "pycelle", name: "Grand Maester Pycelle", color: C.other, house: "Citadel", canon: "both", title: "Grand Maester", bio: "Presents himself as doddering but has long been a Lannister loyalist. Murdered by Varys alongside Kevan to prevent the realm from stabilizing.", summaries: { combined: "Presents himself as doddering but has long been a Lannister loyalist. Murdered by Varys alongside Kevan to prevent the realm from stabilizing.", books: "Grand Maester who presents himself as doddering but has long been a secret Lannister loyalist. Murdered by Varys alongside Kevan to prevent the realm from stabilizing under competent leadership.", tv: "Grand Maester who presents himself as doddering but has long been a secret Lannister loyalist. Lured to Qyburn's laboratory and murdered by his little birds before the destruction of the Sept of Baelor." } }, 
  // ── BROTHERHOOD / RIVERLANDS ──
  { id: "beric", name: "Beric Dondarrion", color: C.bwb, house: "Brotherhood", canon: "both", title: "The Lightning Lord", bio: "Resurrected six times by Thoros of Myr. Each death costs him something. Gave his final life to resurrect Catelyn as Lady Stoneheart. The price of his miracle was her monstrousness.", summaries: { combined: "Resurrected six times by Thoros of Myr. Each death costs him something. Gave his final life to resurrect Catelyn as Lady Stoneheart. The price of his miracle was her monstrousness.", books: "Sent by Ned Stark to bring Gregor Clegane to justice. Resurrected six times by Thoros of Myr, losing pieces of himself with each death. Gave his final life to resurrect Catelyn as Lady Stoneheart.", tv: "Sent by Ned Stark to bring Gregor Clegane to justice. Resurrected multiple times by Thoros. Joins the expedition beyond the Wall. Sacrifices himself to protect Arya during the Long Night, dying for the final time." } }, 
  { id: "thoros", name: "Thoros of Myr", color: C.bwb, house: "Brotherhood", canon: "both", title: "Red Priest", bio: "Discovered his ability to resurrect through pure desperation. A former drunk who found genuine faith through miracles. Serves Lady Stoneheart reluctantly.", summaries: { combined: "Discovered his ability to resurrect through pure desperation. A former drunk who found genuine faith through miracles. Serves Lady Stoneheart reluctantly.", books: "Red priest of Myr who discovered his ability to resurrect the dead through desperate prayer. A former drunk who found genuine faith through miracles. Serves under Lady Stoneheart, resurrecting Beric and later losing him when Beric gives his life for Catelyn.", tv: "Red priest of Myr who discovered his ability to resurrect the dead. A former drunk who found genuine faith through miracles. Joins the expedition beyond the Wall. Freezes to death beyond the Wall after being mauled by a wight bear." } }, 
  { id: "stoneheart", name: "Lady Stoneheart", color: C.stark, house: "Brotherhood", canon: "book", title: "Mother Merciless", bio: "Catelyn Stark resurrected, mute and merciless. Hangs every Frey and Lannister she finds. Captured Brienne and demanded she bring Jaime. A horrifying emblem of what vengeance does to a person. CUT from the show entirely — one of the biggest divergences.", summaries: { combined: "Catelyn Stark resurrected, mute and merciless. Hangs every Frey and Lannister she finds. Captured Brienne and demanded she bring Jaime. A horrifying emblem of what vengeance does to a person. CUT from the show entirely — one of the biggest divergences.", books: "Catelyn Stark resurrected by Beric's final breath, mute and merciless. Hangs every Frey and Lannister she can find. Captured Brienne and demanded she bring Jaime or die. A horrifying emblem of what vengeance does to a person.", tv: "" } }, 
  // ── THE HOUND & MOUNTAIN ──
  { id: "hound", name: "Sandor Clegane (The Hound)", color: C.other, house: "Clegane", canon: "both", title: "Joffrey's shield / wanderer", bio: "Scarred by his brother, hates knights and hypocrisy. Protected Sansa, traveled with Arya. Left to die after a wound. A gravedigger at a monastery on the Quiet Isle matches his description exactly. The show confirms he lives; the books hint heavily.", bookNote: "In the books, the Hound's survival is only hinted at through the gravedigger on the Quiet Isle. The show confirms he lives.", summaries: { combined: "Scarred by his brother, hates knights and hypocrisy. Protected Sansa, traveled with Arya. Left to die after a wound. A gravedigger at a monastery on the Quiet Isle matches his description exactly. The show confirms he lives; the books hint heavily.", books: "Scarred by his brother Gregor as a child, hates knights and hypocrisy. Protected Sansa from Joffrey's cruelty, traveled with Arya. Left to die from a wound. A gravedigger on the Quiet Isle matches his description exactly, suggesting he may have found peace.", tv: "Scarred by his brother Gregor as a child, hates knights and hypocrisy. Protected Sansa, traveled with Arya. Left for dead. Returns and joins the Brotherhood. Fights beyond the Wall and at the Long Night. Kills his brother Gregor (Cleganebowl) in the burning Red Keep." } }, 
  { id: "mountain", name: "Gregor Clegane (The Mountain)", color: C.other, house: "Clegane", canon: "both", title: "Ser Robert Strong (?)", bio: "Eight feet of rage. Burned the Hound's face. Raped and murdered Elia Martell. Killed Oberyn. 'Died' from Oberyn's poisoned spear. Resurrected by Qyburn as the monstrous Ser Robert Strong — Cersei's champion.", summaries: { combined: "Eight feet of rage. Burned the Hound's face. Raped and murdered Elia Martell. Killed Oberyn. 'Died' from Oberyn's poisoned spear. Resurrected by Qyburn as the monstrous Ser Robert Strong — Cersei's champion.", books: "Eight feet of rage. Burned the Hound's face as a child. Raped and murdered Elia Martell on Tywin's orders. Killed Oberyn Martell after Oberyn had him beaten. Poisoned by Oberyn's spear, reanimated by Qyburn as the silent, helmed Ser Robert Strong — Cersei's champion.", tv: "Eight feet of rage. Burned the Hound's face as a child. Raped and murdered Elia Martell on Tywin's orders. Killed Oberyn. Reanimated by Qyburn as Ser Robert Strong, Cersei's monstrous bodyguard. Killed by the Hound in their final confrontation as the Red Keep collapses." } }, 
  // ── BOLTON ──
  { id: "roose", name: "Roose Bolton", color: C.bolton, house: "Bolton", canon: "both", title: "Warden of the North", bio: "Drove the dagger into Robb's heart. Named Warden by the Lannisters. Leeches himself regularly. 'A peaceful land, a quiet people.' The quietest, coldest villain — his pragmatic evil contrasts with Ramsay's hot sadism.", summaries: { combined: "Drove the dagger into Robb's heart. Named Warden by the Lannisters. Leeches himself regularly. 'A peaceful land, a quiet people.' The quietest, coldest villain — his pragmatic evil contrasts with Ramsay's hot sadism.", books: "Drove the dagger into Robb Stark's heart at the Red Wedding. Named Warden of the North by the Lannisters. Leeches himself regularly. A coldly pragmatic man who fears Ramsay's instability may destroy everything he built. Still alive and maneuvering at Winterfell.", tv: "Drove the dagger into Robb Stark's heart at the Red Wedding. Named Warden of the North by the Lannisters. Killed by Ramsay, who stabs him immediately after his wife Walda gives birth to a son who threatens Ramsay's inheritance." } }, 
  { id: "ramsay", name: "Ramsay Bolton", color: C.bolton, house: "Bolton", canon: "both", title: "Legitimized bastard", bio: "Tortured Theon into Reek. Married 'Arya Stark' (Jeyne Poole). Flays anyone who displeases him. Sent the Bastard Letter to Jon. Makes Joffrey look well-adjusted.", summaries: { combined: "Tortured Theon into Reek. Married 'Arya Stark' (Jeyne Poole). Flays anyone who displeases him. Sent the Bastard Letter to Jon. Makes Joffrey look well-adjusted.", books: "Tortured Theon into Reek. Married Jeyne Poole (passed off as Arya Stark) and subjected her to unspeakable cruelty. Flays anyone who displeases him. Sent the Bastard Letter to Jon Snow. Holds Winterfell against Stannis's approaching army.", tv: "Tortured Theon into Reek. Married Sansa Stark and subjected her to cruelty. Killed his father Roose and fed Walda and her newborn to his dogs. Defeated by Jon Snow at the Battle of the Bastards. Killed by his own starved hounds at Sansa's command." } }, 
  // ── FREY ──
  { id: "walder_frey", name: "Walder Frey", color: C.frey, house: "Frey", canon: "both", title: "Lord of the Crossing", bio: "Ancient, lecherous lord of the Twins. His wounded pride over being an afterthought metastasized into the Red Wedding. Co-orchestrated with Tywin and Roose the murder of Robb, Catelyn, and their bannermen under guest right — the most sacred law in Westeros.", summaries: { combined: "Ancient, lecherous lord of the Twins. His wounded pride over being an afterthought metastasized into the Red Wedding. Co-orchestrated with Tywin and Roose the murder of Robb, Catelyn, and their bannermen under guest right — the most sacred law in Westeros.", books: "Ancient, lecherous lord of the Twins. His wounded pride over Robb's broken betrothal metastasized into the Red Wedding. Co-orchestrated with Tywin and Roose the massacre of Robb, Catelyn, and their bannermen under guest right. Still alive, surrounded by feuding heirs.", tv: "Ancient, lecherous lord of the Twins. His wounded pride over Robb's broken betrothal metastasized into the Red Wedding. Co-orchestrated with Tywin and Roose the massacre of Robb, Catelyn, and their bannermen under guest right. Killed by Arya Stark, who uses a Frey face to poison his entire house." } }, 
  // ── BRAAVOS ──
  { id: "jaqen", name: "Jaqen H'ghar", color: C.free_cities, house: "Faceless Men", canon: "both", title: "No One", bio: "Mysterious prisoner who gave Arya three deaths and a Braavosi iron coin. Changed his face and vanished. May have reappeared in Oldtown disguised as the novice 'Pate,' infiltrating the Citadel for unknown purposes.", summaries: { combined: "Mysterious prisoner who gave Arya three deaths and a Braavosi iron coin. Changed his face and vanished. May have reappeared in Oldtown disguised as the novice 'Pate,' infiltrating the Citadel for unknown purposes.", books: "Mysterious prisoner who gave Arya three deaths and a Braavosi iron coin. Changed his face and vanished. Reappears at the Citadel in Oldtown disguised as the novice 'Pate,' infiltrating the maesters' order for unknown purposes.", tv: "Mysterious prisoner who gave Arya three deaths and a Braavosi iron coin. Changed his face and vanished. Reappears as Arya's trainer at the House of Black and White in Braavos. Tests her commitment to becoming 'no one.'" } }, 
  { id: "syrio", name: "Syrio Forel", color: C.free_cities, house: "Braavos", canon: "both", title: "First Sword of Braavos", bio: "Hired by Ned to teach Arya the water dance. Fought Lannister guards with a wooden sword so Arya could flee. 'What do we say to the God of Death? Not today.' His fate is left ambiguous in the books — he is not seen again after the confrontation.", summaries: { combined: "Hired by Ned to teach Arya the water dance. Fought Lannister guards with a wooden sword so Arya could flee. 'What do we say to the God of Death? Not today.' His fate is left ambiguous in the books — he is not seen again after the confrontation.", books: "Former First Sword of Braavos, hired by Ned to teach Arya the water dance. Fought Lannister guards with a wooden sword so Arya could flee. His fate is left ambiguous — he is not seen again after the confrontation with Meryn Trant.", tv: "Former First Sword of Braavos, hired by Ned to teach Arya the water dance. Fought Lannister guards with a wooden sword so Arya could flee. 'What do we say to the God of Death? Not today.' Killed by Meryn Trant." } }, 
  // ── OTHER KEY FIGURES ──
  { id: "brienne", name: "Brienne of Tarth", color: C.other, house: "Tarth", canon: "both", title: "Maid of Tarth", bio: "Swore to Renly, then Catelyn. Traveled with Jaime and was transformed by the journey. Given Oathkeeper and a quest to find Sansa. Captured by Lady Stoneheart and given a terrible choice. Last seen leading Jaime into what is almost certainly a trap.", summaries: { combined: "Swore to Renly, then Catelyn. Traveled with Jaime and was transformed by the journey. Given Oathkeeper and a quest to find Sansa. Captured by Lady Stoneheart and given a terrible choice. Last seen leading Jaime into what is almost certainly a trap.", books: "Swore to Renly, then Catelyn. Traveled with Jaime and was transformed by the journey. Given Oathkeeper and a quest to find Sansa. Captured by Lady Stoneheart, who demanded she deliver Jaime or die. Last seen leading Jaime into what is almost certainly a trap.", tv: "Swore to Renly, then Catelyn. Traveled with Jaime and was transformed by the journey. Given Oathkeeper and a quest to find Sansa. Finds and protects Sansa. Fights in the Long Night. Knighted by Jaime. Becomes Lord Commander of King Bran's Kingsguard." } }, 
  { id: "podrick", name: "Podrick Payne", color: C.other, house: "Payne", canon: "both", title: "Squire", bio: "Tyrion's former squire, now accompanying Brienne. Young, earnest, loyal. Being hanged by Lady Stoneheart alongside Brienne.", summaries: { combined: "Tyrion's former squire, now accompanying Brienne. Young, earnest, loyal. Being hanged by Lady Stoneheart alongside Brienne.", books: "Tyrion's former squire who saved his life at the Blackwater. Now accompanies Brienne on her quest. Captured alongside Brienne by Lady Stoneheart and being hanged.", tv: "Tyrion's former squire who saved his life at the Blackwater. Accompanies Brienne on her quest to find Sansa. Becomes a skilled fighter under her training. Knighted and serves on King Bran's Kingsguard." } }, 
  { id: "bronn", name: "Bronn", color: C.other, house: "Stokeworth", canon: "both", title: "Sellsword", bio: "Championed Tyrion at the Eyrie, killing Ser Vardis. Served as Tyrion's enforcer. Refused to fight the Mountain. Married Lollys Stokeworth for her castle. Has no loyalty except to profit, which makes him paradoxically reliable.", summaries: { combined: "Championed Tyrion at the Eyrie, killing Ser Vardis. Served as Tyrion's enforcer. Refused to fight the Mountain. Married Lollys Stokeworth for her castle. Has no loyalty except to profit, which makes him paradoxically reliable.", books: "Sellsword who championed Tyrion at the Eyrie. Served as Tyrion's enforcer in King's Landing. Refused to fight the Mountain — 'I like you, but I like myself more.' Married Lollys Stokeworth for her castle. Has no loyalty except to profit.", tv: "Sellsword who championed Tyrion at the Eyrie. Served as Tyrion's enforcer. Refused to fight the Mountain. Became Jaime's companion. Threatened Tyrion and Jaime for a castle. Becomes Lord of Highgarden and Master of Coin on Bran's Small Council." } }, 
  { id: "manderly", name: "Wyman Manderly", color: C.stark, house: "Manderly", canon: "both", title: "Lord of White Harbor", bio: "Fat lord who appears compliant with the Boltons. Actually plotting revenge for the Red Wedding. Fed the Freys to the Boltons in pies. 'The North remembers, Lord Davos. The mummer's farce is almost done.' Sent Davos to find Rickon.", summaries: { combined: "Fat lord who appears compliant with the Boltons. Actually plotting revenge for the Red Wedding. Fed the Freys to the Boltons in pies. 'The North remembers, Lord Davos. The mummer's farce is almost done.' Sent Davos to find Rickon.", books: "Fat lord of White Harbor who appears compliant with the Boltons. Actually plotting revenge for the Red Wedding. Fed murdered Freys to the Boltons in pies at Ramsay's wedding. 'The North remembers, Lord Davos. The mummer's farce is almost done.' Sends Davos to Skagos to find Rickon.", tv: "Lord of White Harbor. A minor presence who rallies behind Jon Snow and Sansa Stark to retake Winterfell from the Boltons. Declares Jon Snow King in the North." } }, 
  { id: "high_sparrow", name: "The High Sparrow", color: C.faith, house: "Faith of the Seven", canon: "both", title: "High Septon", bio: "Barefoot septon who rearmed the Faith Militant. Weaponized popular fury over the war. Arrested both Margaery and Cersei. Whether genuinely pious or playing his own game remains ambiguous.", summaries: { combined: "Barefoot septon who rearmed the Faith Militant. Weaponized popular fury over the war. Arrested both Margaery and Cersei. Whether genuinely pious or playing his own game remains ambiguous.", books: "Barefoot septon who rearmed the Faith Militant with Cersei's backing. Weaponized popular fury over the war's devastation. Arrested both Margaery and Cersei. Whether genuinely pious or playing his own game remains ambiguous. Still alive and holding power.", tv: "Barefoot septon who rearmed the Faith Militant with Cersei's backing. Weaponized popular fury over the war's devastation. Arrested both Margaery and Cersei. Gained enormous influence over King Tommen. Killed in the destruction of the Sept of Baelor." } }, 
  { id: "qyburn", name: "Qyburn", color: C.other, house: "None", canon: "both", title: "Master of Whisperers", bio: "Disgraced maester stripped of his chain for necromancy. Created Ser Robert Strong from the Mountain's dying body. His work in the black cells is never described in detail. Cersei's most dangerous enabler.", summaries: { combined: "Disgraced maester stripped of his chain for necromancy. Created Ser Robert Strong from the Mountain's dying body. His work in the black cells is never described in detail. Cersei's most dangerous enabler.", books: "Disgraced maester stripped of his chain for necromancy. Created Ser Robert Strong from the Mountain's dying body. Serves Cersei as Master of Whisperers, conducting horrifying experiments in the black cells.", tv: "Disgraced maester stripped of his chain for necromancy. Created Ser Robert Strong from the Mountain. Serves Cersei as Hand and orchestrates the wildfire plot that destroys the Sept of Baelor. Killed by the Mountain during Cleganebowl as the Red Keep collapses." } }, 
  { id: "penny", name: "Penny", color: C.free_cities, house: "None", canon: "book", title: "Dwarf performer", bio: "Her brother was murdered by men hunting for Tyrion. Travels with Tyrion through slavery. Forces him to confront the consequences of his privilege. A gentle soul who humanizes his darkest arc. Cut from the show.", summaries: { combined: "Her brother was murdered by men hunting for Tyrion. Travels with Tyrion through slavery. Forces him to confront the consequences of his privilege. A gentle soul who humanizes his darkest arc. Cut from the show.", books: "Dwarf performer whose brother was murdered by men hunting for Tyrion. Travels with Tyrion through slavery, forcing him to confront the consequences of his family's wars. A gentle soul who humanizes his darkest arc.", tv: "" } }, 
  { id: "septon_meribald", name: "Septon Meribald", color: C.faith, house: "Faith", canon: "book", title: "Wandering Septon", bio: "Delivers the 'broken men' speech — among the most powerful passages in the series. Guides Brienne to the Quiet Isle. Entirely absent from the show; the speech is partially given to Brother Ray.", summaries: { combined: "Delivers the 'broken men' speech — among the most powerful passages in the series. Guides Brienne to the Quiet Isle. Entirely absent from the show; the speech is partially given to Brother Ray.", books: "Wandering septon who delivers the 'broken men' speech — among the most powerful passages in the series. Guides Brienne through the war-torn Riverlands to the Quiet Isle, where the Hound may have found peace.", tv: "" } }, 
  { id: "howland", name: "Howland Reed", color: C.stark, house: "Reed", canon: "both", title: "Lord of Greywater Watch", bio: "The only other survivor of the Tower of Joy besides Ned. Father of Jojen and Meera. Has never appeared on page; many readers expect him to be significant to the Jon parentage question, but this is not confirmed.", summaries: { combined: "The only other survivor of the Tower of Joy besides Ned. Father of Jojen and Meera. Has never appeared on page; many readers expect him to be significant to the Jon parentage question, but this is not confirmed.", books: "Lord of Greywater Watch, the only other survivor of the Tower of Joy besides Ned. Father of Jojen and Meera. Has never appeared on page. He may hold the key to Jon's parentage.", tv: "Lord of Greywater Watch, who fought alongside Ned at the Tower of Joy. Shown in Bran's vision stabbing Ser Arthur Dayne to save Ned. Father of Jojen and Meera." } }, 
  { id: "jeyne_poole", name: "Jeyne Poole", color: C.other, house: "Poole", canon: "book", title: "'Fake Arya'", bio: "Sansa's childhood friend, passed off as Arya Stark and married to Ramsay Bolton. Suffers unspeakable cruelty. Rescued by Theon. Her storyline is given to Sansa in the show — one of the most controversial adaptation decisions.", summaries: { combined: "Sansa's childhood friend, passed off as Arya Stark and married to Ramsay Bolton. Suffers unspeakable cruelty. Rescued by Theon. Her storyline is given to Sansa in the show — one of the most controversial adaptation decisions.", books: "Sansa's childhood friend, passed off as Arya Stark and married to Ramsay Bolton. Suffers unspeakable cruelty. Rescued by Theon, who reclaims his identity through saving her.", tv: "" } }, 
  { id: "lady_dustin", name: "Lady Barbrey Dustin", color: C.stark, house: "Dustin", canon: "book", title: "Lady of Barrowton", bio: "Hates the Starks (Ned never returned her husband's bones from the Tower of Joy) but hates the Boltons and Freys more. A bitter, politically savvy northern lady. Absent from the show.", summaries: { combined: "Hates the Starks (Ned never returned her husband's bones from the Tower of Joy) but hates the Boltons and Freys more. A bitter, politically savvy northern lady. Absent from the show.", books: "Lady of Barrowton who hates the Starks because Ned never returned her husband's bones from the Tower of Joy. She hates the Boltons and Freys more. A bitter, politically savvy northern lady navigating between dangerous factions at Winterfell.", tv: "" } }, 
  { id: "wex", name: "Wex Pyke", color: C.greyjoy, house: "Greyjoy", canon: "book", title: "Theon's squire", bio: "Mute squire who survived the sack of Winterfell by hiding in the heart tree. Witnessed Bran and Rickon's escape. Followed them, eventually providing information to Manderly about Rickon's location on Skagos.", summaries: { combined: "Mute squire who survived the sack of Winterfell by hiding in the heart tree. Witnessed Bran and Rickon's escape. Followed them, eventually providing information to Manderly about Rickon's location on Skagos.", books: "Theon's mute squire who survived the sack of Winterfell by hiding in the heart tree. Witnessed Bran and Rickon's escape direction. Eventually provided Manderly with intelligence about Rickon's location on Skagos.", tv: "" } }, 

  // ── LIST 1: HIGH-IMPACT ──
  { id: "lyanna", name: "Lyanna Stark", color: C.stark, house: "Stark", canon: "both", title: "The She-Wolf of Winterfell", bio: "Ned's sister, Robert's betrothed, Rhaegar's lover (or abductee). Her disappearance ignited Robert's Rebellion. Died at the Tower of Joy after giving birth to Jon Snow. 'Promise me, Ned.' The most consequential dead character in the series — everything traces back to her.", summaries: { combined: "Ned's sister, Robert's betrothed, Rhaegar's lover (or abductee). Her disappearance ignited Robert's Rebellion. Died at the Tower of Joy after giving birth to Jon Snow. 'Promise me, Ned.' The most consequential dead character in the series — everything traces back to her.", books: "Ned's sister, Robert's betrothed. Her disappearance with Rhaegar ignited Robert's Rebellion. Died at the Tower of Joy, extracting a promise from Ned — 'Promise me, Ned.' The circumstances of her relationship with Rhaegar and Jon's birth are strongly implied but not confirmed on the page.", tv: "Ned's sister, Robert's betrothed. Secretly married Rhaegar Targaryen. Died at the Tower of Joy giving birth to their son Jon (named Aegon). Bran's visions confirm she went willingly with Rhaegar. Her promise to Ned was to protect her son." } }, 
  { id: "elia", name: "Elia Martell", color: C.martell, house: "Martell", canon: "both", title: "Princess of Dragonstone", bio: "Rhaegar's first wife and mother of Rhaenys and Aegon. Abandoned when Rhaegar took Lyanna. Raped and murdered by Gregor Clegane during the Sack of King's Landing while Tywin's forces slaughtered her children. Her death drives Dornish politics for a generation.", summaries: { combined: "Rhaegar's first wife and mother of Rhaenys and Aegon. Abandoned when Rhaegar took Lyanna. Raped and murdered by Gregor Clegane during the Sack of King's Landing while Tywin's forces slaughtered her children. Her death drives Dornish politics for a generation.", books: "Rhaegar's first wife and mother of Rhaenys and Aegon. Humiliated when Rhaegar crowned Lyanna at Harrenhal and later left her for Lyanna. Raped and murdered by Gregor Clegane during the Sack of King's Landing while her children were slaughtered. Her death drives Dornish politics for a generation.", tv: "Rhaegar's first wife and mother of his children. Rhaegar annulled his marriage to Elia to marry Lyanna Stark. Raped and murdered by Gregor Clegane during the Sack of King's Landing while her children were slaughtered. Her death drives Oberyn's quest for vengeance." } }, 
  { id: "duncan_tall", name: "Ser Duncan the Tall", color: C.kingsguard, house: "Kingsguard", canon: "book", title: "Lord Commander of the Kingsguard", bio: "Hedge knight who became Egg's sworn shield, lifelong companion, and ultimately Lord Commander of the Kingsguard. Protagonist of the Dunk & Egg novellas. Died at the Tragedy of Summerhall. Some readers suggest Brienne may descend from him; this is not confirmed.", summaries: { combined: "Hedge knight who became Egg's sworn shield, lifelong companion, and ultimately Lord Commander of the Kingsguard. Protagonist of the Dunk & Egg novellas. Died at the Tragedy of Summerhall. Some readers suggest Brienne may descend from him; this is not confirmed.", books: "Hedge knight who became Egg's sworn shield, lifelong companion, and ultimately Lord Commander of the Kingsguard. Protagonist of the Dunk & Egg novellas. Died at the Tragedy of Summerhall. Brienne may be his descendant — she finds a shield with his sigil.", tv: "" } }, 

  // ── LIST 1: MEDIUM-IMPACT ──
  { id: "alliser", name: "Alliser Thorne", color: C.watch, house: "Night's Watch", canon: "both", title: "Master-at-Arms", bio: "Former Targaryen loyalist sent to the Wall after Robert's Rebellion. Jon's primary antagonist at Castle Black. Led the 'For the Watch' mutiny against Jon Snow. Bitter, cruel, but brave — he fought at the Battle of Castle Black.", summaries: { combined: "Former Targaryen loyalist sent to the Wall after Robert's Rebellion. Jon's primary antagonist at Castle Black. Led the 'For the Watch' mutiny against Jon Snow. Bitter, cruel, but brave — he fought at the Battle of Castle Black.", books: "Former Targaryen loyalist sent to the Wall after Robert's Rebellion. Jon's primary antagonist at Castle Black. Participated in the 'For the Watch' mutiny. Bitter, cruel, but brave — he fought at the Battle of Castle Black.", tv: "Former Targaryen loyalist sent to the Wall. Jon's primary antagonist at Castle Black. Led the 'For the Watch' mutiny and stabbed Jon. After Jon's resurrection, Jon executes Alliser and the other mutineers." } }, 
  { id: "bowen", name: "Bowen Marsh", color: C.watch, house: "Night's Watch", canon: "both", title: "First Steward", bio: "Night's Watch steward who wept as he stabbed Jon Snow. 'For the Watch.' Believed Jon had broken his vows by involving the Watch in the politics of the realm. A dutiful man who committed murder out of institutional loyalty.", summaries: { combined: "Night's Watch steward who wept as he stabbed Jon Snow. 'For the Watch.' Believed Jon had broken his vows by involving the Watch in the politics of the realm. A dutiful man who committed murder out of institutional loyalty.", books: "Night's Watch First Steward who wept as he stabbed Jon Snow. 'For the Watch.' Believed Jon had broken his vows by involving the Watch in the politics of the realm. A dutiful man who committed murder out of institutional loyalty.", tv: "Night's Watch steward who participated in the 'For the Watch' mutiny against Jon. Executed by Jon after his resurrection." } }, 
  { id: "randyll", name: "Randyll Tarly", color: C.tyrell, house: "Tarly", canon: "both", title: "Lord of Horn Hill", bio: "Sam's abusive father who forced him to take the black. The finest military commander in the Reach, arguably in all Westeros. Won the only battle Robert ever lost (Ashford). Commands Mace Tyrell's vanguard. As cruel at home as he is capable in the field.", summaries: { combined: "Sam's abusive father who forced him to take the black. The finest military commander in the Reach, arguably in all Westeros. Won the only battle Robert ever lost (Ashford). Commands Mace Tyrell's vanguard. As cruel at home as he is capable in the field.", books: "Sam's abusive father who forced him to take the black or die. The finest military commander in the Reach. Won the only battle Robert ever lost at Ashford. Commands Mace Tyrell's vanguard. As cruel at home as he is capable in the field.", tv: "Sam's abusive father who forced him to take the black. A formidable military commander. Switches allegiance from the Tyrells to Cersei. Captured after the Loot Train attack and burned alive by Daenerys alongside his son Dickon for refusing to bend the knee." } }, 
  { id: "ilyn", name: "Ilyn Payne", color: C.other, house: "Payne", canon: "both", title: "The King's Justice", bio: "Mute royal executioner — Aerys had his tongue torn out with hot pincers for boasting that Tywin ruled the realm. Beheaded Ned Stark with Ice. On Arya's kill list. Becomes Jaime's secret sparring partner after Jaime loses his hand.", summaries: { combined: "Mute royal executioner — Aerys had his tongue torn out with hot pincers for boasting that Tywin ruled the realm. Beheaded Ned Stark with Ice. On Arya's kill list. Becomes Jaime's secret sparring partner after Jaime loses his hand.", books: "Mute royal executioner — Aerys had his tongue torn out. Beheaded Ned Stark with Ice. On Arya's kill list. Becomes Jaime's secret sparring partner after Jaime loses his sword hand, since Ilyn cannot reveal how badly Jaime fights.", tv: "Mute royal executioner — Aerys had his tongue torn out. Beheaded Ned Stark with Ice. On Arya's kill list. Disappears from the series after the early seasons." } }, 
  { id: "val", name: "Val", color: C.wildling, house: "Free Folk", canon: "book", title: "Wildling 'Princess'", bio: "Dalla's sister, Mance's sister-in-law. Southerners call her a princess; the Free Folk recognize no such thing. Beautiful, fierce, politically significant. Stannis wants to marry her to a lord to bind the wildlings. Jon is clearly attracted to her. A major book character entirely absent from the show.", summaries: { combined: "Dalla's sister, Mance's sister-in-law. Southerners call her a princess; the Free Folk recognize no such thing. Beautiful, fierce, politically significant. Stannis wants to marry her to a lord to bind the wildlings. Jon is clearly attracted to her. A major book character entirely absent from the show.", books: "Dalla's sister, Mance's sister-in-law. Called a 'wildling princess' by southerners, though the Free Folk recognize no such title. Beautiful, fierce, and politically significant. Jon is attracted to her. Stannis wants to marry her to a lord to bind the wildlings to the realm.", tv: "" } }, 

  // ── LIST 1: LOWER-IMPACT ──
  { id: "belwas", name: "Strong Belwas", color: C.slaver, house: "Freedman", canon: "book", title: "Dany's Champion", bio: "Enormous former pit fighter who eats liver and onions before every bout. Lets each opponent cut him once before killing them. Champions Dany against Meereen's hero. Poisoned by the locusts at Daznak's Pit — the ones likely meant for Dany. Cut entirely from the show.", summaries: { combined: "Enormous former pit fighter who eats liver and onions before every bout. Lets each opponent cut him once before killing them. Champions Dany against Meereen's hero. Poisoned by the locusts at Daznak's Pit — the ones likely meant for Dany. Cut entirely from the show.", books: "Enormous former pit fighter who eats liver and onions before every bout and lets each opponent cut him once. Champions Dany against Meereen's champion. Poisoned by the locusts at Daznak's Pit — the ones likely meant for Dany — and barely survives.", tv: "" } }, 
  { id: "patchface", name: "Patchface", color: C.baratheon, house: "Baratheon (court)", canon: "book", title: "Fool of Dragonstone", bio: "Shipwrecked fool who drowned for three days and came back changed. His songs are eerily prophetic — 'Under the sea' — predicting the Red Wedding, Blackwater, and other events. Melisandre sees him surrounded by skulls and is terrified of him. One of the series' strangest mysteries.", summaries: { combined: "Shipwrecked fool who drowned for three days and came back changed. His songs are eerily prophetic — 'Under the sea' — predicting the Red Wedding, Blackwater, and other events. Melisandre sees him surrounded by skulls and is terrified of him. One of the series' strangest mysteries.", books: "Shipwrecked fool who drowned for three days and came back changed. His songs are eerily prophetic — 'Under the sea' — appearing to predict the Red Wedding, the Blackwater, and other events. Melisandre sees him surrounded by skulls in her flames and is terrified of him.", tv: "" } }, 
  { id: "marwyn", name: "Marwyn the Mage", color: C.other, house: "Citadel", canon: "book", title: "Archmaester", bio: "The only archmaester who believes in magic. Possesses a glass candle — obsidian that burns with an unnatural flame. When Sam arrives with news of Dany's dragons, Marwyn immediately sails for Meereen, warning Sam that the other maesters will try to kill the dragons. 'Who do you think killed all the dragons the last time around?'", summaries: { combined: "The only archmaester who believes in magic. Possesses a glass candle — obsidian that burns with an unnatural flame. When Sam arrives with news of Dany's dragons, Marwyn immediately sails for Meereen, warning Sam that the other maesters will try to kill the dragons. 'Who do you think killed all the dragons the last time around?'", books: "The only archmaester who believes in magic. Possesses a glass candle — obsidian that burns with an unnatural flame. When Sam brings news of Dany's dragons, Marwyn immediately sails for Meereen, warning Sam that the maesters conspire against magic and dragons.", tv: "" } }, 
  { id: "brown_ben", name: "Brown Ben Plumm", color: C.free_cities, house: "Second Sons", canon: "book", title: "Sellsword Captain", bio: "Commander of the Second Sons sellsword company. Claims distant Targaryen blood — the dragons were calm around him. Defected from Dany to Yunkai when her fortunes waned. A pragmatic survivor whose loyalties follow the gold.", summaries: { combined: "Commander of the Second Sons sellsword company. Claims distant Targaryen blood — the dragons were calm around him. Defected from Dany to Yunkai when her fortunes waned. A pragmatic survivor whose loyalties follow the gold.", books: "Commander of the Second Sons sellsword company. Claims distant Targaryen blood — the dragons were calm around him. Defected from Dany to Yunkai when her fortunes waned. A pragmatic survivor whose loyalties follow the gold.", tv: "" } }, 
  { id: "rhaella", name: "Rhaella Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "Queen of the Seven Kingdoms", bio: "Wife and sister of Aerys II, mother of Rhaegar, Viserys, and Daenerys. Suffered years of marital abuse and forced pregnancy. Died giving birth to Dany on Dragonstone during a great storm — hence 'Stormborn.' A tragic figure used and broken by the Targaryen dynasty.", summaries: { combined: "Wife and sister of Aerys II, mother of Rhaegar, Viserys, and Daenerys. Suffered years of marital abuse and forced pregnancy. Died giving birth to Dany on Dragonstone during a great storm — hence 'Stormborn.' A tragic figure used and broken by the Targaryen dynasty.", books: "Wife and sister of Aerys II, mother of Rhaegar, Viserys, and Daenerys. Suffered years of marital abuse. Died giving birth to Dany on Dragonstone during a great storm — hence 'Stormborn.'", tv: "Wife and sister of Aerys II, mother of Rhaegar, Viserys, and Daenerys. Died giving birth to Dany on Dragonstone during a great storm — hence 'Stormborn.' Referenced but never seen." } }, 

  // ── LIST 2: TYRION'S ARC ──
  { id: "shae", name: "Shae", color: C.other, house: "None", canon: "both", title: "Camp follower / Handmaiden", bio: "Tyrion's lover, hidden in King's Landing against Tywin's orders. At Tyrion's trial, she testified against him, calling him a monster. Found in Tywin's bed. Tyrion strangled her with the Hand's chain of gold. 'I am a whore. And whores are paid.'", summaries: { combined: "Tyrion's lover, hidden in King's Landing against Tywin's orders. At Tyrion's trial, she testified against him, calling him a monster. Found in Tywin's bed. Tyrion strangled her with the Hand's chain of gold. 'I am a whore. And whores are paid.'", books: "Tyrion's lover, hidden in King's Landing against Tywin's orders. At Tyrion's trial, she testified against him with apparent relish. Found in Tywin's bed. Tyrion strangled her with the Hand's chain of gold.", tv: "Tyrion's lover, hidden in King's Landing against Tywin's orders. Genuinely seemed to care for Tyrion and Sansa. At Tyrion's trial, she testified against him. Found in Tywin's bed. Tyrion strangled her in a fit of rage and grief." } }, 
  { id: "tysha", name: "Tysha", color: C.other, house: "None", canon: "book", title: "Tyrion's first wife", bio: "A crofter's daughter Tyrion married at thirteen, believing she loved him. Tywin declared her a whore and had his garrison rape her, paying a silver each. Jaime's confession that Tysha was real — not a whore — drives Tyrion to kill Tywin. 'Wherever whores go' haunts Tyrion across Essos.", summaries: { combined: "A crofter's daughter Tyrion married at thirteen, believing she loved him. Tywin declared her a whore and had his garrison rape her, paying a silver each. Jaime's confession that Tysha was real — not a whore — drives Tyrion to kill Tywin. 'Wherever whores go' haunts Tyrion across Essos.", books: "A crofter's daughter Tyrion married at thirteen, believing she loved him. Tywin declared her a whore and had his garrison rape her. Jaime's confession that Tysha was real — not a whore — drives Tyrion to kill Tywin. 'Wherever whores go' haunts Tyrion across Essos.", tv: "" } }, 

  // ── LIST 2: WINTERFELL HOUSEHOLD ──
  { id: "luwin", name: "Maester Luwin", color: C.stark, house: "Stark (Citadel)", canon: "both", title: "Maester of Winterfell", bio: "Winterfell's maester, advisor to two generations of Starks. Counseled Bran and Rickon during Theon's seizure. Found dying in the godswood after Ramsay's sack of Winterfell. His last act was telling Osha to split up the boys to protect them.", summaries: { combined: "Winterfell's maester, advisor to two generations of Starks. Counseled Bran and Rickon during Theon's seizure. Found dying in the godswood after Ramsay's sack of Winterfell. His last act was telling Osha to split up the boys to protect them.", books: "Winterfell's maester, advisor to two generations of Starks. Counseled Bran and Rickon during Theon's seizure. Found dying in the godswood after Ramsay's sack of Winterfell. His last act was telling Osha to split up the boys.", tv: "Winterfell's maester, advisor to two generations of Starks. Counseled Bran and Rickon during Theon's seizure. Found dying in the godswood after Winterfell's sack. His last act was telling Osha to split up the boys." } }, 
  { id: "rodrik", name: "Rodrik Cassel", color: C.stark, house: "Cassel", canon: "both", title: "Master-at-Arms of Winterfell", bio: "Winterfell's master-at-arms and castellan. Trained the Stark children in combat. Led a force to retake Winterfell from Theon but was betrayed and killed by Ramsay Bolton, whose Bolton forces turned on Rodrik's men mid-parley.", summaries: { combined: "Winterfell's master-at-arms and castellan. Trained the Stark children in combat. Led a force to retake Winterfell from Theon but was betrayed and killed by Ramsay Bolton, whose Bolton forces turned on Rodrik's men mid-parley.", books: "Winterfell's master-at-arms and castellan. Trained the Stark children. Led a force to retake Winterfell from Theon but was betrayed and killed when Ramsay's Bolton forces turned on his men mid-parley.", tv: "Winterfell's master-at-arms and castellan. Trained the Stark children. Executed by Theon during his seizure of Winterfell — a scene that marks Theon's point of no return." } }, 
  { id: "old_nan", name: "Old Nan", color: C.stark, house: "Stark (household)", canon: "both", title: "Storyteller of Winterfell", bio: "Ancient servant of Winterfell whose tales of the Others, the Long Night, and the last hero are treated as children's stories — until they start coming true. Taken captive when Winterfell falls. Her stories are the series' most reliable source of mythic history.", summaries: { combined: "Ancient servant of Winterfell whose tales of the Others, the Long Night, and the last hero are treated as children's stories — until they start coming true. Taken captive when Winterfell falls. Her stories are the series' most reliable source of mythic history.", books: "Ancient servant of Winterfell whose tales of the Others, the Long Night, and the last hero are treated as children's stories — until they start coming true. Taken captive when Winterfell falls. Her stories are the most reliable source of mythic history.", tv: "Ancient servant of Winterfell whose tales of the Others and the Long Night are treated as children's stories — until they start coming true. A beloved figure in Bran's early life." } }, 

  // ── LIST 2: NORTHERN BANNERMEN ──
  { id: "greatjon", name: "Greatjon Umber", color: C.stark, house: "Umber", canon: "both", title: "Lord of Last Hearth", bio: "Enormous, fierce lord who declared Robb 'King in the North' — the first to draw his sword and kneel. Captured at the Red Wedding after killing several Freys with his bare hands. 'It was the Young Wolf! The King in the North!'", summaries: { combined: "Enormous, fierce lord who declared Robb 'King in the North' — the first to draw his sword and kneel. Captured at the Red Wedding after killing several Freys with his bare hands. 'It was the Young Wolf! The King in the North!'", books: "Enormous, fierce lord who was first to declare Robb 'King in the North.' Captured at the Red Wedding after killing several Freys with his bare hands while chained.", tv: "Enormous, fierce lord who was first to declare Robb 'King in the North,' drawing his sword and kneeling before Robb at Winterfell." } }, 
  { id: "maege", name: "Maege Mormont", color: C.stark, house: "Mormont", canon: "both", title: "Lady of Bear Island", bio: "She-Bear of Bear Island, one of Robb's most loyal bannermen. Sent with Galbart Glover to find Howland Reed, carrying Robb's will — which likely names Jon Snow as heir. Her whereabouts remain unknown in the books.", summaries: { combined: "She-Bear of Bear Island, one of Robb's most loyal bannermen. Sent with Galbart Glover to find Howland Reed, carrying Robb's will — which likely names Jon Snow as heir. Her whereabouts remain unknown in the books.", books: "She-Bear of Bear Island, one of Robb's most loyal bannermen. Sent with Galbart Glover to find Howland Reed, carrying Robb's will — which likely names Jon Snow as heir. Her whereabouts remain unknown.", tv: "Lady of Bear Island and one of Robb's loyal bannermen. A tough, warrior-minded noblewoman of the North." } }, 
  { id: "dacey", name: "Dacey Mormont", color: C.stark, house: "Mormont", canon: "both", title: "Heir to Bear Island", bio: "Maege's eldest daughter, a warrior who danced with Robb at the Twins. Murdered at the Red Wedding — one of the most personally felt deaths at that massacre.", summaries: { combined: "Maege's eldest daughter, a warrior who danced with Robb at the Twins. Murdered at the Red Wedding — one of the most personally felt deaths at that massacre.", books: "Maege's eldest daughter, a warrior who danced with Robb at the Twins. Murdered at the Red Wedding — one of the most personally felt deaths at that massacre.", tv: "Maege's eldest daughter, killed at the Red Wedding." } }, 

  // ── LIST 2: NIGHT'S WATCH ──
  { id: "edd", name: "Dolorous Edd", color: C.watch, house: "Night's Watch", canon: "both", title: "Steward", bio: "Eddison Tollett, the most pessimistic man in Westeros and a fan favorite. His gloomy wit lightens the Watch's darkest moments. 'I never win anything. The gods always smiled on Watt, though. He was uglier than a half-rotted dog. Five wives, he had.'", summaries: { combined: "Eddison Tollett, the most pessimistic man in Westeros and a fan favorite. His gloomy wit lightens the Watch's darkest moments. 'I never win anything. The gods always smiled on Watt, though. He was uglier than a half-rotted dog. Five wives, he had.'", books: "Eddison Tollett, the most pessimistic man in Westeros. His gloomy wit lightens the Watch's darkest moments. A loyal brother who survives the Fist, the Battle of Castle Black, and Jon's assassination.", tv: "Eddison Tollett, the most pessimistic man in Westeros. His gloomy wit lightens the Watch's darkest moments. Becomes Lord Commander after Jon leaves the Watch. Killed by wights during the Long Night at Winterfell." } }, 
  { id: "donal", name: "Donal Noye", color: C.watch, house: "Night's Watch", canon: "book", title: "Armorer of Castle Black", bio: "One-armed blacksmith who forged Robert Baratheon's warhammer. Lost his arm at the siege of Storm's End. Died killing Mag the Mighty, king of the giants, in the tunnel beneath the Wall. 'The true steel.' Assessed the Baratheon brothers perfectly.", summaries: { combined: "One-armed blacksmith who forged Robert Baratheon's warhammer. Lost his arm at the siege of Storm's End. Died killing Mag the Mighty, king of the giants, in the tunnel beneath the Wall. 'The true steel.' Assessed the Baratheon brothers perfectly.", books: "One-armed blacksmith of Castle Black who forged Robert Baratheon's warhammer. Lost his arm at the siege of Storm's End. Died killing Mag the Mighty, king of the giants, in the tunnel beneath the Wall. Assessed the Baratheon brothers perfectly: Robert was true steel, Stannis was iron, Renly was copper.", tv: "" } }, 
  { id: "pyp", name: "Pyp", color: C.watch, house: "Night's Watch", canon: "both", title: "Ranger", bio: "Jon's friend at Castle Black, a former mummer's boy with quick ears and a quicker wit. In the books, he survives the Battle of Castle Black. The show kills him during the battle.", bookNote: "Survives the Battle of Castle Black in the books. The show kills him during the battle.", summaries: { combined: "Jon's friend at Castle Black, a former mummer's boy with quick ears and a quicker wit. In the books, he survives the Battle of Castle Black. The show kills him during the battle.", books: "Jon's friend at Castle Black, a former mummer's boy with quick ears and a quicker wit. Survives the Battle of Castle Black and continues to serve.", tv: "Jon's friend at Castle Black, a former mummer's boy with quick ears and a quicker wit. Killed during the wildling attack on Castle Black." } }, 
  { id: "grenn", name: "Grenn", color: C.watch, house: "Night's Watch", canon: "both", title: "Ranger", bio: "Jon's loyal friend, an aurochs of a man. In the show, he dies heroically holding the tunnel against a giant. In the books, he survives and continues to serve. 'He was no lord, no knight, no maester — but he was brave.'", bookNote: "Survives the Battle of Castle Black in the books. The show gives him a heroic death holding the tunnel.", summaries: { combined: "Jon's loyal friend, an aurochs of a man. In the show, he dies heroically holding the tunnel against a giant. In the books, he survives and continues to serve. 'He was no lord, no knight, no maester — but he was brave.'", books: "Jon's loyal friend, an aurochs of a man. Survives the Battle of Castle Black and continues to serve at the Wall.", tv: "Jon's loyal friend, an aurochs of a man. Dies heroically holding the tunnel beneath the Wall against a giant during the Battle of Castle Black." } }, 

  // ── LIST 2: WILDLINGS ──
  { id: "varamyr", name: "Varamyr Sixskins", color: C.wildling, house: "Free Folk", canon: "book", title: "Skinchanger", bio: "Prologue POV of A Dance with Dragons. The most powerful skinchanger among the wildlings — controlled three wolves, a shadowcat, a snow bear, and an eagle. His death chapter establishes the rules of warging, second life, and the abominations of skinchanging. Essential context for Bran and Jon's powers.", summaries: { combined: "Prologue POV of A Dance with Dragons. The most powerful skinchanger among the wildlings — controlled three wolves, a shadowcat, a snow bear, and an eagle. His death chapter establishes the rules of warging, second life, and the abominations of skinchanging. Essential context for Bran and Jon's powers.", books: "Prologue POV character of A Dance with Dragons. The most powerful skinchanger among the wildlings — controlled three wolves, a shadowcat, a snow bear, and an eagle. His death chapter establishes the rules of warging, second life, and the abominations of skinchanging.", tv: "" } }, 
  { id: "rattleshirt", name: "Rattleshirt", color: C.wildling, house: "Free Folk", canon: "both", title: "Lord of Bones", bio: "Wildling raider who wears bones as armor. In the books, Melisandre glamours him to look like Mance and burns him alive, while the real Mance (glamoured as Rattleshirt) is sent on a mission to Winterfell. The deception is central to the Wall's plot in ADWD.", summaries: { combined: "Wildling raider who wears bones as armor. In the books, Melisandre glamours him to look like Mance and burns him alive, while the real Mance (glamoured as Rattleshirt) is sent on a mission to Winterfell. The deception is central to the Wall's plot in ADWD.", books: "Wildling raider who wears bones as armor. Melisandre glamours him to look like Mance Rayder and burns him alive, while the real Mance is sent on a secret mission to Winterfell disguised as Rattleshirt.", tv: "Wildling raider known as the Lord of Bones. A minor antagonist among the free folk. Beaten to death by Tormund at Hardhome." } }, 

  // ── LIST 2: ESSOS ──
  { id: "quaithe", name: "Quaithe", color: C.free_cities, house: "Asshai", canon: "both", title: "Shadowbinder", bio: "Masked woman from Asshai who gives Dany cryptic prophecies. Appears in visions across multiple books. 'To go north, you must journey south. To reach the west, you must go east.' Her identity and purpose remain two of the series' deepest mysteries.", summaries: { combined: "Masked woman from Asshai who gives Dany cryptic prophecies. Appears in visions across multiple books. 'To go north, you must journey south. To reach the west, you must go east.' Her identity and purpose remain two of the series' deepest mysteries.", books: "Masked woman from Asshai who gives Dany cryptic prophecies, appearing in person and in visions. 'To go north, you must journey south. To reach the west, you must go east.' Her identity and purpose remain deep mysteries.", tv: "Masked woman from Asshai who appears briefly in Qarth, giving Dany cryptic guidance. A minor, mysterious presence." } }, 
  { id: "xaro", name: "Xaro Xhoan Daxos", color: C.free_cities, house: "Qarth", canon: "both", title: "Merchant Prince", bio: "Wealthy Qartheen merchant who sheltered Dany and proposed marriage to claim a dragon. When Dany conquered Slaver's Bay, Xaro arrived to demand she leave — and when she refused, Qarth declared war. His gift of an empty ship was an insult disguised as generosity.", summaries: { combined: "Wealthy Qartheen merchant who sheltered Dany and proposed marriage to claim a dragon. When Dany conquered Slaver's Bay, Xaro arrived to demand she leave — and when she refused, Qarth declared war. His gift of an empty ship was an insult disguised as generosity.", books: "Wealthy Qartheen merchant prince who sheltered Dany and proposed marriage to claim a dragon. When Dany conquered Slaver's Bay, Xaro arrived to demand she leave — and when she refused, Qarth declared war. His gift of an empty ship was an insult disguised as generosity.", tv: "Wealthy Qartheen merchant who sheltered Dany and conspired with Pyat Pree to steal her dragons. Locked in his own empty vault by Dany after his treachery was exposed." } }, 

  // ── LIST 2: DORNE ──
  { id: "darkstar", name: "Darkstar (Gerold Dayne)", color: C.martell, house: "Dayne", canon: "book", title: "Knight of High Hermitage", bio: "Reckless, dangerous knight who slashed Myrcella's face during Arianne's failed Queenmaker plot. 'I am of the night.' Fled and is now hunted by Areo Hotah. Set up as a significant figure in The Winds of Winter. Descended from the same house as the legendary Sword of the Morning.", summaries: { combined: "Reckless, dangerous knight who slashed Myrcella's face during Arianne's failed Queenmaker plot. 'I am of the night.' Fled and is now hunted by Areo Hotah. Set up as a significant figure in The Winds of Winter. Descended from the same house as the legendary Sword of the Morning.", books: "Reckless, dangerous knight of House Dayne who slashed Myrcella's face during Arianne's failed Queenmaker plot. Fled and is now hunted. 'I am of the night.' Descended from the same house as the legendary Sword of the Morning.", tv: "" } }, 
  { id: "hotah", name: "Areo Hotah", color: C.martell, house: "Martell (guard)", canon: "both", title: "Captain of the Guards", bio: "Doran Martell's loyal captain, a Norvoshi raised by bearded priests and bonded to his longaxe. POV character in AFFC/ADWD. Obedient, observant, and lethal. Sent to hunt Darkstar after the Queenmaker debacle.", summaries: { combined: "Doran Martell's loyal captain, a Norvoshi raised by bearded priests and bonded to his longaxe. POV character in AFFC/ADWD. Obedient, observant, and lethal. Sent to hunt Darkstar after the Queenmaker debacle.", books: "Doran Martell's loyal captain of the guard, a Norvoshi raised by bearded priests and bonded to his longaxe. POV character who observes Dornish politics. Sent to hunt Darkstar after the Queenmaker debacle.", tv: "Doran Martell's loyal captain of the guard. Killed by the Sand Snakes during their coup against Doran." } }, 

  // ── LIST 2: THE VALE ──
  { id: "harry", name: "Harry the Heir", color: C.arryn, house: "Hardyng / Arryn", canon: "book", title: "Ser Harrold Hardyng", bio: "Robert Arryn's heir presumptive. Young, handsome, arrogant, with two bastard daughters already. Central to Littlefinger's plans: were Robert Arryn to die, Harry would inherit the Vale. Littlefinger aims to wed Sansa (as Alayne) to Harry to consolidate power.", summaries: { combined: "Robert Arryn's heir presumptive. Young, handsome, arrogant, with two bastard daughters already. Central to Littlefinger's plans: were Robert Arryn to die, Harry would inherit the Vale. Littlefinger aims to wed Sansa (as Alayne) to Harry to consolidate power.", books: "Robert Arryn's heir presumptive. Young, handsome, arrogant, with two bastard daughters already. Central to Littlefinger's plans: if Robin dies, Harry inherits the Vale, and Littlefinger aims to wed Sansa to him.", tv: "" } }, 

  // ── LIST 2: ROBB'S STORY ──
  { id: "jeyne_w", name: "Jeyne Westerling", color: C.other, house: "Westerling", canon: "book", title: "Queen in the North", bio: "Robb married Jeyne after she comforted him when he learned of Bran and Rickon's supposed deaths. This broke his Frey betrothal and led directly to the Red Wedding. In the books she survives (unlike Talisa in the show). Her mother may have been feeding her moon tea on Tywin's orders.", summaries: { combined: "Robb married Jeyne after she comforted him when he learned of Bran and Rickon's supposed deaths. This broke his Frey betrothal and led directly to the Red Wedding. In the books she survives (unlike Talisa in the show). Her mother may have been feeding her moon tea on Tywin's orders.", books: "Robb married Jeyne after she comforted him when he learned of Bran and Rickon's supposed deaths. This broke his Frey betrothal and led directly to the Red Wedding. She survives the war. Her mother may have been feeding her moon tea on Tywin's orders to prevent a Stark heir.", tv: "" } }, 

  // ── LIST 2: KING'S LANDING ──
  { id: "kettleblacks", name: "The Kettleblacks", color: C.other, house: "Kettleblack", canon: "book", title: "Cersei's Agents", bio: "Osmund, Osney, and Osfryd — three brothers paid by Cersei to infiltrate the Kingsguard and do her dirty work. Osmund joined the Kingsguard; Osney confessed to the High Sparrow about sleeping with both Margaery and Cersei, unraveling Cersei's own scheme and contributing to her arrest.", summaries: { combined: "Osmund, Osney, and Osfryd — three brothers paid by Cersei to infiltrate the Kingsguard and do her dirty work. Osmund joined the Kingsguard; Osney confessed to the High Sparrow about sleeping with both Margaery and Cersei, unraveling Cersei's own scheme and contributing to her arrest.", books: "Osmund, Osney, and Osfryd — three brothers paid by Cersei to infiltrate the Kingsguard and do her dirty work. Osney confessed to the High Sparrow about sleeping with both Margaery and Cersei, unraveling Cersei's own scheme and contributing to her arrest.", tv: "" } }, 

  // ── LIST 2: HISTORICAL / BLACKFYRE ──
  { id: "daemon_bf", name: "Daemon Blackfyre", color: C.targaryen, house: "Blackfyre", canon: "book", title: "The King Who Bore the Sword", bio: "Bastard son of Aegon IV, given the Targaryen ancestral sword Blackfyre. Led the first Blackfyre Rebellion, nearly won, killed by Bloodraven's arrows on the Redgrass Field. His descendants launched four more rebellions. The theory that Young Griff is a Blackfyre gives his legacy enormous importance.", summaries: { combined: "Bastard son of Aegon IV, given the Targaryen ancestral sword Blackfyre. Led the first Blackfyre Rebellion, nearly won, killed by Bloodraven's arrows on the Redgrass Field. His descendants launched four more rebellions. The theory that Young Griff is a Blackfyre gives his legacy enormous importance.", books: "Bastard son of Aegon IV, given the Targaryen ancestral sword Blackfyre. Led the first Blackfyre Rebellion, nearly won, killed by Bloodraven's arrows on the Redgrass Field. His descendants launched four more rebellions. The theory that Young Griff is a Blackfyre gives his legacy enormous importance.", tv: "" } }, 
  { id: "aegon_iv", name: "Aegon IV (The Unworthy)", color: C.targaryen, house: "Targaryen", canon: "book", title: "King of the Seven Kingdoms", bio: "The worst Targaryen king — corrupt, gluttonous, lecherous. Legitimized all his bastards on his deathbed, including Daemon Blackfyre, sparking a century of civil wars. His reign proves that even without madness, Targaryen kings could destroy the realm through sheer selfishness.", summaries: { combined: "The worst Targaryen king — corrupt, gluttonous, lecherous. Legitimized all his bastards on his deathbed, including Daemon Blackfyre, sparking a century of civil wars. His reign proves that even without madness, Targaryen kings could destroy the realm through sheer selfishness.", books: "The worst Targaryen king — corrupt, gluttonous, lecherous. Legitimized all his bastards on his deathbed, including Daemon Blackfyre, sparking a century of civil wars. His reign proves that even without madness, Targaryen kings could destroy the realm through sheer selfishness.", tv: "" } }, 
  { id: "rhaenyra", name: "Rhaenyra Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "The Half-Year Queen", bio: "Viserys I's designated heir, denied the throne by her half-brother Aegon II, sparking the Dance of the Dragons — the bloodiest Targaryen civil war. Briefly ruled, then was fed to Aegon II's dragon Sunfyre. The Dance killed most of the dragons and weakened the dynasty permanently.", summaries: { combined: "Viserys I's designated heir, denied the throne by her half-brother Aegon II, sparking the Dance of the Dragons — the bloodiest Targaryen civil war. Briefly ruled, then was fed to Aegon II's dragon Sunfyre. The Dance killed most of the dragons and weakened the dynasty permanently.", books: "Viserys I's designated heir, denied the throne by her half-brother Aegon II, sparking the Dance of the Dragons — the bloodiest Targaryen civil war. Briefly ruled, then was fed to Aegon II's dragon Sunfyre. The Dance killed most of the dragons and weakened the dynasty permanently.", tv: "Viserys I's designated heir, denied the throne by her half-brother Aegon II, sparking the Dance of the Dragons — the bloodiest Targaryen civil war. Briefly ruled, then was fed to Aegon II's dragon Sunfyre. The Dance killed most of the dragons and weakened the dynasty permanently." } }, 
  { id: "daemon_t", name: "Daemon Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "The Rogue Prince", bio: "Rhaenyra's uncle-husband, rider of Caraxes the Blood Wyrm. The most dangerous Targaryen of his age — warrior, schemer, provocateur. Died killing Aemond Targaryen and Vhagar above the Gods Eye in the Dance of the Dragons' most legendary duel.", summaries: { combined: "Rhaenyra's uncle-husband, rider of Caraxes the Blood Wyrm. The most dangerous Targaryen of his age — warrior, schemer, provocateur. Died killing Aemond Targaryen and Vhagar above the Gods Eye in the Dance of the Dragons' most legendary duel.", books: "Rhaenyra's uncle-husband, rider of Caraxes the Blood Wyrm. The most dangerous Targaryen of his age — warrior, schemer, provocateur. Died killing Aemond Targaryen and Vhagar above the Gods Eye in the Dance of the Dragons' most legendary duel.", tv: "Rhaenyra's uncle-husband, rider of Caraxes the Blood Wyrm. The most dangerous Targaryen of his age — warrior, schemer, provocateur. Died killing Aemond Targaryen and Vhagar above the Gods Eye in the Dance of the Dragons' most legendary duel." } }, 
  { id: "baelor_bp", name: "Baelor Breakspear", color: C.targaryen, house: "Targaryen", canon: "book", title: "Prince of Dragonstone", bio: "Crown prince who championed Ser Duncan the Tall in the trial of seven at Ashford. Honorable, just, beloved. Killed by a blow from his own brother Maekar's mace during the melee. His death changed the line of succession and eventually put Egg (Aegon V) on the throne.", summaries: { combined: "Crown prince who championed Ser Duncan the Tall in the trial of seven at Ashford. Honorable, just, beloved. Killed by a blow from his own brother Maekar's mace during the melee. His death changed the line of succession and eventually put Egg (Aegon V) on the throne.", books: "Crown prince who championed Ser Duncan the Tall in the trial of seven at Ashford. Honorable, just, beloved. Killed by a blow from his own brother Maekar's mace during the melee. His death changed the line of succession and eventually put Egg on the throne.", tv: "" } }, 
  { id: "maekar", name: "Maekar I", color: C.targaryen, house: "Targaryen", canon: "book", title: "King of the Seven Kingdoms", bio: "Egg's father, a stern warrior-king. Accidentally killed his brother Baelor Breakspear in the trial of seven — a guilt that haunted him for life. Died fighting an outlaw lord in the Dornish Marches. His death led to a Great Council that crowned Egg.", summaries: { combined: "Egg's father, a stern warrior-king. Accidentally killed his brother Baelor Breakspear in the trial of seven — a guilt that haunted him for life. Died fighting an outlaw lord in the Dornish Marches. His death led to a Great Council that crowned Egg.", books: "Egg's father, a stern warrior-king. Accidentally killed his brother Baelor Breakspear in the trial of seven — a guilt that haunted him for life. Died fighting an outlaw lord in the Dornish Marches. His death led to a Great Council that crowned Egg.", tv: "" } }, 
  { id: "aerion", name: "Aerion Brightflame", color: C.targaryen, house: "Targaryen", canon: "book", title: "Prince", bio: "Egg's cruel older brother, a sadist who attacked a puppeteer at Ashford, prompting Dunk's intervention. Exiled to Essos. Died drinking wildfire, believing it would transform him into a dragon. His madness presaged Aerys II's pyromania a century later.", summaries: { combined: "Egg's cruel older brother, a sadist who attacked a puppeteer at Ashford, prompting Dunk's intervention. Exiled to Essos. Died drinking wildfire, believing it would transform him into a dragon. His madness presaged Aerys II's pyromania a century later.", books: "Egg's cruel older brother who attacked a puppeteer at Ashford, prompting Dunk's intervention. Exiled to Essos. Died drinking wildfire, believing it would transform him into a dragon. His madness presaged Aerys II's pyromania a century later.", tv: "" } }, 

  // ── LIST 3: REBELLION TRIGGERS ──
  { id: "rickard", name: "Rickard Stark", color: C.stark, house: "Stark", canon: "both", title: "Lord of Winterfell", bio: "Ned's father. Rode south to demand his son Brandon's release and was burned alive inside his own armor by Aerys II, who used wildfire as 'champion' in a mockery of trial by combat. His murder, alongside Brandon's, triggered Robert's Rebellion.", summaries: { combined: "Ned's father. Rode south to demand his son Brandon's release and was burned alive inside his own armor by Aerys II, who used wildfire as 'champion' in a mockery of trial by combat. His murder, alongside Brandon's, triggered Robert's Rebellion.", books: "Ned's father, Lord of Winterfell. Rode south to demand Brandon's release and was burned alive inside his own armor by Aerys II, who used wildfire as 'champion' in a mockery of trial by combat. His murder triggered Robert's Rebellion.", tv: "Ned's father, Lord of Winterfell. Burned alive by the Mad King Aerys alongside his son Brandon. His murder triggered Robert's Rebellion. Shown briefly in Bran's visions." } }, 
  { id: "brandon_s", name: "Brandon Stark (Ned's brother)", color: C.stark, house: "Stark", canon: "both", title: "Heir to Winterfell", bio: "Ned's elder brother, Cat's original betrothed. Hot-blooded where Ned was quiet. Rode to King's Landing demanding Rhaegar answer for Lyanna's abduction. Aerys arrested him, then murdered him — strangled by a device that tightened as he reached for a sword to save his burning father.", summaries: { combined: "Ned's elder brother, Cat's original betrothed. Hot-blooded where Ned was quiet. Rode to King's Landing demanding Rhaegar answer for Lyanna's abduction. Aerys arrested him, then murdered him — strangled by a device that tightened as he reached for a sword to save his burning father.", books: "Ned's elder brother, Cat's original betrothed. Hot-blooded where Ned was quiet. Rode to King's Landing demanding Rhaegar answer for Lyanna's abduction. Arrested by Aerys and strangled to death by a device that tightened as he reached for a sword to save his burning father.", tv: "Ned's elder brother, Cat's original betrothed. Hot-blooded where Ned was quiet. Rode to King's Landing demanding Rhaegar answer for Lyanna's disappearance. Murdered by the Mad King alongside his father Rickard." } }, 
  { id: "joanna", name: "Joanna Lannister", color: C.lannister, house: "Lannister", canon: "both", title: "Lady of Casterly Rock", bio: "Tywin's wife and cousin, the only person who could make him smile. Died giving birth to Tyrion — the root of Tywin's cold hatred for his son. Aerys took 'liberties' at her bedding, and rumors persist that he fathered one or more of her children. Her death transformed Tywin from a hard man into a merciless one.", summaries: { combined: "Tywin's wife and cousin, the only person who could make him smile. Died giving birth to Tyrion — the root of Tywin's cold hatred for his son. Aerys took 'liberties' at her bedding, and rumors persist that he fathered one or more of her children. Her death transformed Tywin from a hard man into a merciless one.", books: "Tywin's wife and cousin, the only person who could make him smile. Died giving birth to Tyrion — the root of Tywin's cold hatred for his son. Aerys took 'liberties' at her bedding, and rumors persist about his interest in her.", tv: "Tywin's wife who died giving birth to Tyrion — the root of Tywin's cold hatred for his son. Referenced but never seen on screen." } }, 
  { id: "ellaria", name: "Ellaria Sand", color: C.martell, house: "Martell", canon: "both", title: "Paramour of Oberyn", bio: "Oberyn's lover and mother of the four youngest Sand Snakes. After Oberyn's death, she argues passionately against vengeance: 'Oberyn wanted vengeance for Elia. Now the Lannisters send us Gregor's skull. What more can we ask?' The crucial voice of peace in Dorne that the show inverts entirely.", bookNote: "In the books, Ellaria passionately argues AGAINST vengeance after Oberyn's death. The show completely inverts her character into a vengeful killer.", summaries: { combined: "Oberyn's lover and mother of the four youngest Sand Snakes. After Oberyn's death, she argues passionately against vengeance: 'Oberyn wanted vengeance for Elia. Now the Lannisters send us Gregor's skull. What more can we ask?' The crucial voice of peace in Dorne that the show inverts entirely.", books: "Oberyn's lover and mother of the four youngest Sand Snakes. After Oberyn's death, she argues passionately against vengeance: 'Oberyn wanted vengeance for Elia. Now the Lannisters send us Gregor's skull. What more can we ask?' The voice of peace in Dorne.", tv: "Oberyn's lover and mother of the youngest Sand Snakes. After Oberyn's death, she becomes a vengeful killer, poisoning Myrcella and leading a coup that kills Doran. Captured by Cersei and chained in the dungeons, forced to watch her daughter die from the same poison she used on Myrcella." } }, 

  // ── LIST 3: SUBPLOT DRIVERS ──
  { id: "dontos", name: "Dontos Hollard", color: C.other, house: "Hollard", canon: "both", title: "Former knight / Fool", bio: "Drunken knight Sansa saved from Joffrey's wrath by suggesting he be made a fool instead. Recruited by Littlefinger to befriend Sansa and smuggle her out of King's Landing after Joffrey's murder. Shot with a crossbow by Littlefinger's men immediately after. A pawn who thought he was a rescuer.", summaries: { combined: "Drunken knight Sansa saved from Joffrey's wrath by suggesting he be made a fool instead. Recruited by Littlefinger to befriend Sansa and smuggle her out of King's Landing after Joffrey's murder. Shot with a crossbow by Littlefinger's men immediately after. A pawn who thought he was a rescuer.", books: "Drunken knight Sansa saved from Joffrey's wrath. Recruited by Littlefinger to befriend Sansa and smuggle her out of King's Landing after Joffrey's murder. Shot with a crossbow by Littlefinger's men immediately after to silence him.", tv: "Drunken knight Sansa saved from Joffrey's wrath. Recruited by Littlefinger to befriend Sansa and smuggle her out of King's Landing after Joffrey's murder. Shot with a crossbow by Littlefinger's men immediately after to silence him." } }, 
  { id: "yoren", name: "Yoren", color: C.watch, house: "Night's Watch", canon: "both", title: "Wandering Crow / Recruiter", bio: "Grizzled Night's Watch recruiter who grabbed Arya during Ned's execution, shielded her eyes, and hacked off her hair to disguise her as a boy. Killed by Amory Lorch's men on the Kingsroad. His death left Arya alone in the war. 'I'm not going back.'", summaries: { combined: "Grizzled Night's Watch recruiter who grabbed Arya during Ned's execution, shielded her eyes, and hacked off her hair to disguise her as a boy. Killed by Amory Lorch's men on the Kingsroad. His death left Arya alone in the war. 'I'm not going back.'", books: "Grizzled Night's Watch recruiter who grabbed Arya during Ned's execution, shielded her eyes, and disguised her as a boy. Killed by Amory Lorch's men on the Kingsroad. His death left Arya alone in the war.", tv: "Grizzled Night's Watch recruiter who grabbed Arya during Ned's execution, shielded her eyes, and disguised her as a boy. Killed by Lannister soldiers on the Kingsroad. His death left Arya alone in the war." } }, 
  { id: "karstark", name: "Rickard Karstark", color: C.stark, house: "Karstark", canon: "both", title: "Lord of Karhold", bio: "Lost two sons to Jaime Lannister in battle. When Catelyn released Jaime, Karstark murdered two Lannister squire-hostages in vengeance. Robb executed him for it — the honorable choice that cost Robb half his army. 'Kill me and be cursed. You are no king of mine.'", summaries: { combined: "Lost two sons to Jaime Lannister in battle. When Catelyn released Jaime, Karstark murdered two Lannister squire-hostages in vengeance. Robb executed him for it — the honorable choice that cost Robb half his army. 'Kill me and be cursed. You are no king of mine.'", books: "Lost two sons to Jaime Lannister in battle. When Catelyn released Jaime, Karstark murdered two Lannister squire-hostages. Robb executed him — the honorable choice that cost Robb half his army. 'Kill me and be cursed. You are no king of mine.'", tv: "Lost sons in the war. When Catelyn released Jaime, Karstark murdered two Lannister hostages. Robb executed him — the honorable choice that cost Robb the Karstark forces. 'Kill me and be cursed. You are no king of mine.'" } }, 
  { id: "shavepate", name: "Skahaz mo Kandaq", color: C.slaver, house: "Kandaq", canon: "book", title: "The Shavepate", bio: "Shaved his head to show loyalty to Dany's new order. Commands the Brazen Beasts, Meereen's secret police. Pushes Barristan toward violent solutions. Suspects Hizdahr of leading the Sons of the Harpy. Whether he is a genuine ally or a schemer with his own agenda is deliberately ambiguous.", summaries: { combined: "Shaved his head to show loyalty to Dany's new order. Commands the Brazen Beasts, Meereen's secret police. Pushes Barristan toward violent solutions. Suspects Hizdahr of leading the Sons of the Harpy. Whether he is a genuine ally or a schemer with his own agenda is deliberately ambiguous.", books: "Shaved his head to show loyalty to Dany's new order in Meereen. Commands the Brazen Beasts, Meereen's secret police. Pushes Barristan toward violent solutions. Suspects Hizdahr of leading the Sons of the Harpy. Whether he is a genuine ally or a schemer with his own agenda is deliberately ambiguous.", tv: "" } }, 
  { id: "waif", name: "The Waif", color: C.free_cities, house: "Faceless Men", canon: "both", title: "Acolyte", bio: "Arya's trainer at the House of Black and White. Claims to be a Westerosi lord's daughter who was poisoned. Teaches Arya the lying game and beats her with a staff. Whether she is friend, instructor, or future enemy remains unclear. The show makes her an antagonist; the books keep her role ambiguous.", summaries: { combined: "Arya's trainer at the House of Black and White. Claims to be a Westerosi lord's daughter who was poisoned. Teaches Arya the lying game and beats her with a staff. Whether she is friend, instructor, or future enemy remains unclear. The show makes her an antagonist; the books keep her role ambiguous.", books: "Arya's trainer at the House of Black and White. Claims to be a Westerosi lord's daughter who was poisoned and brought to the Faceless Men. Teaches Arya the lying game. Her role remains instructional and ambiguous.", tv: "Arya's trainer at the House of Black and White. Becomes Arya's antagonist, hunting her through Braavos after Arya refuses to carry out an assassination. Killed by Arya in a darkened room where Arya's blindness training gives her the advantage." } }, 
  { id: "royce", name: "Bronze Yohn Royce", color: C.arryn, house: "Royce", canon: "both", title: "Lord of Runestone", bio: "The most powerful lord in the Vale, who wears ancient bronze armor inscribed with runes. Deeply suspicious of Littlefinger. Visited Winterfell before the story began and might recognize Sansa. A potential threat to Littlefinger's entire scheme.", summaries: { combined: "The most powerful lord in the Vale, who wears ancient bronze armor inscribed with runes. Deeply suspicious of Littlefinger. Visited Winterfell before the story began and might recognize Sansa. A potential threat to Littlefinger's entire scheme.", books: "The most powerful lord in the Vale, who wears ancient bronze armor inscribed with First Men runes. Deeply suspicious of Littlefinger. Visited Winterfell before the story began and might recognize Sansa in her Alayne disguise.", tv: "The most powerful lord in the Vale. Initially suspicious of Littlefinger but manipulated into compliance. Commands the Knights of the Vale who arrive to save Jon at the Battle of the Bastards." } }, 

  // ── LIST 3: ARYA'S KILL LIST ──
  { id: "meryn", name: "Meryn Trant", color: C.kingsguard, house: "Kingsguard", canon: "both", title: "Ser", bio: "Kingsguard knight who beat Sansa on Joffrey's orders. Syrio Forel was last seen facing him; Syrio's death is not confirmed on the page. On Arya's kill list. In the show, Arya kills him in Braavos using a face.", summaries: { combined: "Kingsguard knight who beat Sansa on Joffrey's orders. Syrio Forel was last seen facing him; Syrio's death is not confirmed on the page. On Arya's kill list. In the show, Arya kills him in Braavos using a face.", books: "Kingsguard knight who beat Sansa on Joffrey's orders. The last man Syrio Forel was seen fighting. On Arya's kill list.", tv: "Kingsguard knight who beat Sansa on Joffrey's orders. Killed Syrio Forel. On Arya's kill list. Arya kills him in Braavos using a Faceless Man disguise." } }, 
  { id: "amory", name: "Amory Lorch", color: C.lannister, house: "Lorch", canon: "both", title: "Ser", bio: "Killed the infant Princess Rhaenys during the Sack of King's Landing — dragged her from under her father's bed and stabbed her over fifty times. Killed Yoren and his recruits on the Kingsroad. On Arya's list. She used one of Jaqen's three deaths on him at Harrenhal.", summaries: { combined: "Killed the infant Princess Rhaenys during the Sack of King's Landing — dragged her from under her father's bed and stabbed her over fifty times. Killed Yoren and his recruits on the Kingsroad. On Arya's list. She used one of Jaqen's three deaths on him at Harrenhal.", books: "Killed the infant Princess Rhaenys during the Sack of King's Landing — stabbed her over fifty times. Killed Yoren and his recruits. On Arya's list. She used one of Jaqen's three deaths on him at Harrenhal. Later killed by a bear in Harrenhal's bear pit on Roose Bolton's orders.", tv: "Lannister knight who killed Yoren and his recruits on the Kingsroad. One of the Mountain's men at Harrenhal. Arya used one of Jaqen's three deaths on him." } }, 
  { id: "tickler", name: "The Tickler", color: C.lannister, house: "Lannister (soldier)", canon: "both", title: "Torturer", bio: "Gregor Clegane's interrogator at Harrenhal who tortured smallfolk to death with the same questions: 'Is there gold in the village? Is there silver? Gems?' On Arya's list. She killed him, repeating his own questions with each stab. Her first personal kill.", summaries: { combined: "Gregor Clegane's interrogator at Harrenhal who tortured smallfolk to death with the same questions: 'Is there gold in the village? Is there silver? Gems?' On Arya's list. She killed him, repeating his own questions with each stab. Her first personal kill.", books: "Gregor Clegane's interrogator at Harrenhal who tortured smallfolk to death with the same questions: 'Is there gold in the village? Is there silver? Gems?' Arya killed him at a crossroads inn, repeating his own questions with each stab — her first personal kill.", tv: "Gregor Clegane's interrogator at Harrenhal who tortured prisoners with the same questions about hidden gold and silver. One of the men responsible for Arya's suffering at Harrenhal." } }, 
  { id: "polliver", name: "Polliver", color: C.lannister, house: "Lannister (soldier)", canon: "both", title: "Man-at-arms", bio: "Stole Needle from Arya and killed Lommy Greenhands ('carry him, he says'). Arya reclaimed Needle by killing him with it, repeating Lommy's last words back to him. In the books the equivalent character is Raff the Sweetling, killed by 'Mercy' in a Winds preview chapter.", summaries: { combined: "Stole Needle from Arya and killed Lommy Greenhands ('carry him, he says'). Arya reclaimed Needle by killing him with it, repeating Lommy's last words back to him. In the books the equivalent character is Raff the Sweetling, killed by 'Mercy' in a Winds preview chapter.", books: "Stole Needle from Arya and killed Lommy Greenhands. In the books, the equivalent kill is Raff the Sweetling, whom Arya kills in a Winds of Winter preview chapter as 'Mercy.'", tv: "Stole Needle from Arya and killed Lommy Greenhands. Arya and the Hound encounter him at an inn. Arya reclaims Needle by killing him, repeating Lommy's last words back to him." } }, 

  // ── LIST 3: CONQUEROR'S SISTERS ──
  { id: "visenya", name: "Visenya Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "Queen / Warrior", bio: "Aegon's elder sister-wife, the warrior queen. Wielded the Valyrian steel sword Dark Sister, rode Vhagar, and founded the Kingsguard after an assassination attempt on Aegon. Harder and more martial than Rhaenys. Mother of Maegor the Cruel.", summaries: { combined: "Aegon's elder sister-wife, the warrior queen. Wielded the Valyrian steel sword Dark Sister, rode Vhagar, and founded the Kingsguard after an assassination attempt on Aegon. Harder and more martial than Rhaenys. Mother of Maegor the Cruel.", books: "Aegon the Conqueror's elder sister-wife, the warrior queen. Wielded the Valyrian steel sword Dark Sister, rode Vhagar, and founded the Kingsguard after an assassination attempt on Aegon. Mother of Maegor the Cruel.", tv: "Aegon the Conqueror's elder sister-wife, referenced as a legendary warrior queen. Wielded Dark Sister and rode Vhagar. Founded the Kingsguard." } }, 
  { id: "rhaenys_c", name: "Rhaenys Targaryen (Conqueror's sister)", color: C.targaryen, house: "Targaryen", canon: "both", title: "Queen", bio: "Aegon's younger sister-wife, gentler and more beloved than Visenya. Rode Meraxes. Died during the First Dornish War when Meraxes was shot through the eye by a scorpion bolt. Dorne was the only kingdom the Conqueror could never subdue.", summaries: { combined: "Aegon's younger sister-wife, gentler and more beloved than Visenya. Rode Meraxes. Died during the First Dornish War when Meraxes was shot through the eye by a scorpion bolt. Dorne was the only kingdom the Conqueror could never subdue.", books: "Aegon the Conqueror's younger sister-wife, gentler and more beloved than Visenya. Rode Meraxes. Died during the First Dornish War when Meraxes was shot through the eye by a scorpion bolt at Hellholt. Dorne was the only kingdom the Conqueror never subdued.", tv: "Aegon the Conqueror's younger sister-wife. Rode Meraxes. Died during the First Dornish War when her dragon was shot down. Referenced in historical context." } }, 

  // ── LIST 3: DANCE OF THE DRAGONS ──
  { id: "aegon_ii", name: "Aegon II Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "King of the Seven Kingdoms", bio: "Rhaenyra's half-brother who usurped her claim as their father's chosen heir, sparking the Dance of the Dragons. Rode Sunfyre. Fed Rhaenyra to his dragon. Won the war but was poisoned shortly after — a broken, maimed king. The Dance proved that Targaryens were their own worst enemies.", summaries: { combined: "Rhaenyra's half-brother who usurped her claim as their father's chosen heir, sparking the Dance of the Dragons. Rode Sunfyre. Fed Rhaenyra to his dragon. Won the war but was poisoned shortly after — a broken, maimed king. The Dance proved that Targaryens were their own worst enemies.", books: "Rhaenyra's half-brother who usurped her claim, sparking the Dance of the Dragons. Rode Sunfyre. Badly wounded at Rook's Rest. Fed Rhaenyra to his dragon. Won the war but was poisoned shortly after — a broken, maimed king.", tv: "Rhaenyra's half-brother who usurps her claim, sparking the Dance of the Dragons. Crowned by the Greens against his father Viserys's wishes. Rides the dragon Sunfyre." } }, 

  // ── LIST 3: FAN FAVORITE ──
  { id: "hot_pie", name: "Hot Pie", color: C.other, house: "None", canon: "both", title: "Baker", bio: "Arya's companion on the road, a baker's boy recruited for the Watch. Terrified, kind-hearted, obsessed with bread. Left at the Inn at the Crossroads to bake. Gave Brienne crucial information about Arya. A small beacon of normalcy in a brutal world. 'You cannot give up on the gravy.'", summaries: { combined: "Arya's companion on the road, a baker's boy recruited for the Watch. Terrified, kind-hearted, obsessed with bread. Left at the Inn at the Crossroads to bake. Gave Brienne crucial information about Arya. A small beacon of normalcy in a brutal world. 'You cannot give up on the gravy.'", books: "Arya's companion on the road, a baker's boy recruited for the Watch. Terrified but kind-hearted. Left at the Inn at the Crossroads to bake. Gave Brienne crucial information about Arya. A small beacon of normalcy in a brutal world.", tv: "Arya's companion on the road, a baker's boy recruited for the Watch. Terrified but kind-hearted. Left at the Inn at the Crossroads to bake. Gives Arya crucial information about Jon taking back Winterfell, redirecting her journey north. 'You cannot give up on the gravy.'" } }, 

  // ══════════════════════════════════════════════════════
  // DANCE OF THE DRAGONS (Fire & Blood / House of the Dragon)
  // ══════════════════════════════════════════════════════

  // ── THE CROWN ──
  { id: "viserys_i", name: "Viserys I Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "King of the Seven Kingdoms", bio: "The king whose choices created the Dance. Named Rhaenyra his heir over his brother Daemon and his son Aegon. A kind, indecisive man who loved his model of Old Valyria and wanted everyone to get along. His refusal to change the succession — or enforce it clearly — doomed his family.", summaries: { combined: "The king whose choices created the Dance. Named Rhaenyra his heir over his brother Daemon and his son Aegon. A kind, indecisive man who loved his model of Old Valyria and wanted everyone to get along. His refusal to change the succession — or enforce it clearly — doomed his family.", books: "The king whose choices created the Dance. Named Rhaenyra his heir over his brother Daemon and his son Aegon. A kind, indecisive man who loved his model of Old Valyria and wanted everyone to get along. His refusal to enforce the succession clearly doomed his family.", tv: "The king whose choices created the Dance. Named Rhaenyra his heir over his son Aegon. A kind, ailing man who loved his model of Old Valyria and wanted peace in his family. His deteriorating health and ambiguous final words are used by the Greens to justify crowning Aegon." } }, 
  { id: "alicent", name: "Alicent Hightower", color: C.tyrell, house: "Hightower", canon: "both", title: "Queen / Dowager Queen", bio: "Viserys I's second wife, daughter of Otto Hightower. Mother of Aegon II, Aemond, Helaena, and Daeron. The driving force behind the Green faction. Whether she acted from ambition, maternal fear, or genuine belief that her sons deserved the throne is the central question of her character.", summaries: { combined: "Viserys I's second wife, daughter of Otto Hightower. Mother of Aegon II, Aemond, Helaena, and Daeron. The driving force behind the Green faction. Whether she acted from ambition, maternal fear, or genuine belief that her sons deserved the throne is the central question of her character.", books: "Viserys I's second wife, daughter of Otto Hightower. Mother of Aegon II, Aemond, Helaena, and Daeron. The driving force behind the Green faction. Fire & Blood presents her through the lens of biased historians, making her true motives debatable.", tv: "Viserys I's second wife and former best friend of Rhaenyra. Mother of Aegon II, Aemond, and Helaena. Her relationship with Rhaenyra deteriorates into bitter enmity. Driven by maternal fear and political ambition to champion her son Aegon's claim." } }, 
  { id: "otto", name: "Otto Hightower", color: C.tyrell, house: "Hightower", canon: "both", title: "Hand of the King", bio: "Alicent's father and architect of the Green cause. Maneuvered his daughter into Viserys I's bed after Queen Aemma's death. Served as Hand twice. His ambition to put Hightower blood on the Iron Throne drove the realm toward civil war. Executed by Rhaenyra after the fall of King's Landing.", summaries: { combined: "Alicent's father and architect of the Green cause. Maneuvered his daughter into Viserys I's bed after Queen Aemma's death. Served as Hand twice. His ambition to put Hightower blood on the Iron Throne drove the realm toward civil war. Executed by Rhaenyra after the fall of King's Landing.", books: "Alicent's father and architect of the Green cause. Maneuvered his daughter into Viserys I's bed after Queen Aemma's death. Served as Hand twice. His ambition to seat Hightower blood on the Iron Throne drove the realm toward civil war. Executed by Rhaenyra.", tv: "Alicent's father and architect of the Green cause. Maneuvered his daughter into Viserys I's orbit. Served as Hand twice. A calculating political operator whose ambition for his family's power drives the Dance. Dismissed as Hand by Aegon II." } }, 

  // ── THE GREENS ──
  { id: "aemond", name: "Aemond Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "Prince / Regent", bio: "Aegon II's younger brother, the one-eyed prince who claimed Vhagar — the largest living dragon. Lost his eye to Lucerys as a child and never forgave it. Killed Lucerys over Storm's End, the act that made the Dance inevitable. Died killing Daemon over the Gods Eye in the war's most legendary duel.", summaries: { combined: "Aegon II's younger brother, the one-eyed prince who claimed Vhagar — the largest living dragon. Lost his eye to Lucerys as a child and never forgave it. Killed Lucerys over Storm's End, the act that made the Dance inevitable. Died killing Daemon over the Gods Eye in the war's most legendary duel.", books: "Aegon II's younger brother who claimed Vhagar after losing his eye to Lucerys as a child. Killed Lucerys over Storm's End, the act that turned a succession dispute into full-scale war. Served as regent. Died killing Daemon above the Gods Eye in the war's most legendary duel.", tv: "Aegon II's younger brother who claimed Vhagar after losing his eye to Lucerys as a child. A fearsome warrior consumed by resentment. His rivalry with Lucerys and pursuit of him over Storm's End escalates into the killing that ignites the Dance." } }, 
  { id: "helaena", name: "Helaena Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "Queen", bio: "Aegon II's sister-wife, a gentle dreamer who may have had prophetic visions. Driven to madness by the 'Blood and Cheese' incident, in which assassins forced her to choose which of her sons would die. She chose her younger son Maelor; they killed Jaehaerys instead. She eventually threw herself from the Red Keep.", summaries: { combined: "Aegon II's sister-wife, a gentle dreamer who may have had prophetic visions. Driven to madness by the 'Blood and Cheese' incident, in which assassins forced her to choose which of her sons would die. She chose her younger son Maelor; they killed Jaehaerys instead. She eventually threw herself from the Red Keep.", books: "Aegon II's sister-wife, a gentle dreamer who may have been a dragon dreamer. Driven to madness by the 'Blood and Cheese' incident, in which assassins forced her to choose which of her sons would die. She eventually threw herself from the Red Keep.", tv: "Aegon II's sister-wife, a gentle, insect-loving woman with an eerie gift for prophetic statements. Her children are targeted in the escalating violence of the Dance." } }, 
  { id: "criston", name: "Criston Cole", color: C.kingsguard, house: "Cole", canon: "both", title: "Lord Commander of the Kingsguard / The Kingmaker", bio: "Handsome Kingsguard knight who became Rhaenyra's lover, then her bitterest enemy. Crowned Aegon II, earning the name 'Kingmaker.' Whether he turned against Rhaenyra from scorned love, genuine principle, or Alicent's influence is debated. Killed at the Butcher's Ball.", summaries: { combined: "Handsome Kingsguard knight who became Rhaenyra's lover, then her bitterest enemy. Crowned Aegon II, earning the name 'Kingmaker.' Whether he turned against Rhaenyra from scorned love, genuine principle, or Alicent's influence is debated. Killed at the Butcher's Ball.", books: "Handsome Kingsguard knight who became Rhaenyra's lover, then her bitterest enemy. Crowned Aegon II, earning the name 'Kingmaker.' Whether he turned against Rhaenyra from scorned love or genuine conviction is debated by Fire & Blood's historians. Killed at the Butcher's Ball.", tv: "Handsome Kingsguard knight who becomes Rhaenyra's lover, then her bitterest enemy after their falling out. Becomes Alicent's confidant and lover. A self-righteous hypocrite who crowns Aegon II and serves as a key Green military commander." } }, 
  { id: "larys", name: "Larys Strong", color: C.other, house: "Strong", canon: "both", title: "Lord of Harrenhal / Master of Whisperers", bio: "The Clubfoot, one of the most enigmatic figures in Westerosi history. Fire & Blood presents him as the prime suspect in the fire at Harrenhal that killed his father and brother. Served as Aegon II's spymaster. His true motives remain unknowable. Executed after the Dance.", summaries: { combined: "The Clubfoot, one of the most enigmatic figures in Westerosi history. Fire & Blood presents him as the prime suspect in the fire at Harrenhal that killed his father and brother. Served as Aegon II's spymaster. His true motives remain unknowable. Executed after the Dance.", books: "The Clubfoot, one of the most enigmatic figures in Westerosi history. Fire & Blood presents him as the prime suspect in the fire at Harrenhal that killed his own father and brother. Served as Aegon II's spymaster. His true motives remain unknowable. Executed after the Dance.", tv: "The Clubfoot, a sinister and enigmatic schemer. Arranges the fire at Harrenhal that kills his father and brother. Serves as a spymaster and manipulator, offering information to Alicent in exchange for his own unsettling desires." } }, 
  { id: "daeron_d", name: "Daeron Targaryen (The Daring)", color: C.targaryen, house: "Targaryen", canon: "book", title: "Prince", bio: "Aegon II's youngest brother, rider of Tessarion the Blue Queen. Raised in Oldtown by the Hightowers. Won the Battle of the Honeywine. Considered the best of Alicent's sons — brave, capable, and decent. Died at the Second Battle of Tumbleton.", summaries: { combined: "Aegon II's youngest brother, rider of Tessarion the Blue Queen. Raised in Oldtown by the Hightowers. Won the Battle of the Honeywine. Considered the best of Alicent's sons — brave, capable, and decent. Died at the Second Battle of Tumbleton.", books: "Aegon II's youngest brother, rider of Tessarion the Blue Queen. Raised in Oldtown by the Hightowers. Won the Battle of the Honeywine. Considered the best of Alicent's sons — brave, capable, and decent. Died at the Second Battle of Tumbleton.", tv: "" } }, 

  // ── THE BLACKS ──
  { id: "rhaenys_qnw", name: "Rhaenys Targaryen (The Queen Who Never Was)", color: C.targaryen, house: "Targaryen / Velaryon", canon: "both", title: "Princess", bio: "Passed over for the throne in favor of Viserys I despite having a strong claim. Married Corlys Velaryon. Rider of Meleys the Red Queen. Died heroically at Rook's Rest fighting Aegon II and Aemond's dragons simultaneously. Called 'The Queen Who Never Was' — a title she wore with pride.", summaries: { combined: "Passed over for the throne in favor of Viserys I despite having a strong claim. Married Corlys Velaryon. Rider of Meleys the Red Queen. Died heroically at Rook's Rest fighting Aegon II and Aemond's dragons simultaneously. Called 'The Queen Who Never Was' — a title she wore with pride.", books: "Passed over for the throne in favor of Viserys I despite having a strong claim through her father Aemon. Married Corlys Velaryon. Rider of Meleys the Red Queen. Died heroically at Rook's Rest fighting Aegon II and Aemond's dragons simultaneously.", tv: "Passed over for the throne in favor of Viserys I. Married Corlys Velaryon. Rider of Meleys the Red Queen. A formidable dragonrider and political figure who supports Rhaenyra's claim. Dies at Rook's Rest fighting against Aegon II and Aemond." } }, 
  { id: "corlys", name: "Corlys Velaryon", color: C.other, house: "Velaryon", canon: "both", title: "The Sea Snake / Lord of the Tides", bio: "The richest man in Westeros, greatest seafarer in history. Built Driftmark's power through nine legendary voyages. Husband of Rhaenys. Supported the Blacks but served as Hand to both sides. A pragmatist who outlived nearly everyone and ensured his bloodline sat the Iron Throne through his grandsons.", summaries: { combined: "The richest man in Westeros, greatest seafarer in history. Built Driftmark's power through nine legendary voyages. Husband of Rhaenys. Supported the Blacks but served as Hand to both sides. A pragmatist who outlived nearly everyone and ensured his bloodline sat the Iron Throne through his grandsons.", books: "The richest man in Westeros, greatest seafarer in history. Built Driftmark's power through nine legendary voyages. Husband of Rhaenys. Supported the Blacks but served as Hand to both sides. A pragmatist who outlived nearly everyone and ensured his bloodline sat the throne through his grandsons.", tv: "The richest man in Westeros and greatest seafarer in history. Lord of the Tides. Husband of Rhaenys. Supports Rhaenyra's claim. A pragmatist navigating the dangerous politics of the Dance while protecting his family's legacy." } }, 
  { id: "jacaerys", name: "Jacaerys Velaryon", color: C.targaryen, house: "Targaryen / Velaryon", canon: "both", title: "Prince of Dragonstone", bio: "Rhaenyra's eldest son (officially by Laenor, almost certainly by Harwin Strong). Rider of Vermax. Flew to the North and the Vale to secure alliances for his mother. Proposed the dragonseeds program. Died at the Battle of the Gullet fighting Triarchy forces. The most capable of Rhaenyra's children.", summaries: { combined: "Rhaenyra's eldest son (officially by Laenor, almost certainly by Harwin Strong). Rider of Vermax. Flew to the North and the Vale to secure alliances for his mother. Proposed the dragonseeds program. Died at the Battle of the Gullet fighting Triarchy forces. The most capable of Rhaenyra's children.", books: "Rhaenyra's eldest son (officially by Laenor, almost certainly by Harwin Strong). Rider of Vermax. Flew to the North and the Vale to secure alliances. Proposed the dragonseeds program. Died at the Battle of the Gullet fighting the Triarchy. The most capable of Rhaenyra's children.", tv: "Rhaenyra's eldest son (officially by Laenor, almost certainly by Harwin Strong). Rider of Vermax. A dutiful prince learning to navigate the political crisis. Sent as an envoy to secure alliances for his mother's cause." } }, 
  { id: "lucerys", name: "Lucerys Velaryon", color: C.targaryen, house: "Targaryen / Velaryon", canon: "both", title: "Prince", bio: "Rhaenyra's second son, rider of Arrax. Sent as an envoy to Storm's End, where he encountered Aemond. Aemond pursued him on Vhagar; Arrax attacked Vhagar against Luke's commands. Vhagar killed Arrax and Luke over Shipbreaker Bay. His death turned a succession dispute into a war.", summaries: { combined: "Rhaenyra's second son, rider of Arrax. Sent as an envoy to Storm's End, where he encountered Aemond. Aemond pursued him on Vhagar; Arrax attacked Vhagar against Luke's commands. Vhagar killed Arrax and Luke over Shipbreaker Bay. His death turned a succession dispute into a war.", books: "Rhaenyra's second son, rider of Arrax. Sent as envoy to Storm's End, where he encountered Aemond on Vhagar. When Arrax attacked Vhagar against Luke's commands, Vhagar killed both Arrax and Luke over Shipbreaker Bay. His death turned a succession dispute into a war.", tv: "Rhaenyra's second son, rider of Arrax. Sent as envoy to Storm's End, where he encounters Aemond. Pursued by Aemond on Vhagar in a storm. Killed when Vhagar destroys Arrax over Shipbreaker Bay — an act that ignites the Dance." } }, 
  { id: "laenor", name: "Laenor Velaryon", color: C.other, house: "Velaryon", canon: "both", title: "Prince Consort", bio: "Son of Corlys and Rhaenys, Rhaenyra's first husband. Rider of Seasmoke. His children bore no resemblance to him — an open secret that Aemond and others exploited. Allegedly killed by Ser Qarl Correy, though Fire & Blood notes his 'death' was never conclusively proven.", summaries: { combined: "Son of Corlys and Rhaenys, Rhaenyra's first husband. Rider of Seasmoke. His children bore no resemblance to him — an open secret that Aemond and others exploited. Allegedly killed by Ser Qarl Correy, though Fire & Blood notes his 'death' was never conclusively proven.", books: "Son of Corlys and Rhaenys, Rhaenyra's first husband. Rider of Seasmoke. His children bore no resemblance to him — an open secret. Allegedly killed by Ser Qarl Correy, though Fire & Blood notes his death was never conclusively confirmed.", tv: "Son of Corlys and Rhaenys, Rhaenyra's first husband. Rider of Seasmoke. His children bear no resemblance to him. His death is staged by Daemon and Rhaenyra so he can escape across the Narrow Sea and live freely." } }, 
  { id: "laena", name: "Laena Velaryon", color: C.other, house: "Velaryon", canon: "both", title: "Lady / Dragonrider", bio: "Daughter of Corlys and Rhaenys, Daemon's second wife. Rider of Vhagar, the largest dragon alive. Died after a difficult childbirth. In Fire & Blood, she tried to reach Vhagar to die as a dragonrider rather than in bed, but collapsed on the steps. Her death freed Vhagar for Aemond to claim.", summaries: { combined: "Daughter of Corlys and Rhaenys, Daemon's second wife. Rider of Vhagar, the largest dragon alive. Died after a difficult childbirth. In Fire & Blood, she tried to reach Vhagar to die as a dragonrider rather than in bed, but collapsed on the steps. Her death freed Vhagar for Aemond to claim.", books: "Daughter of Corlys and Rhaenys, Daemon's second wife. Rider of Vhagar, the largest dragon alive. Died after a difficult childbirth. Tried to reach Vhagar to die as a dragonrider rather than in bed, but collapsed on the steps. Her death freed Vhagar for Aemond to claim.", tv: "Daughter of Corlys and Rhaenys, Daemon's second wife. Rider of Vhagar. After a devastating stillbirth, she walks to Vhagar and commands the dragon to burn her rather than die slowly. Her death frees Vhagar for Aemond to claim." } }, 
  { id: "baela", name: "Baela Targaryen", color: C.targaryen, house: "Targaryen", canon: "both", title: "Princess / Dragonrider", bio: "Daemon's daughter by Laena. Rider of Moondancer. Confronted Aegon II and Sunfyre over Dragonstone — a young girl on a small dragon against the king. Both dragons fell; Baela survived, badly burned. Fierce, brave, and unyielding. Married Alyn Velaryon after the Dance.", summaries: { combined: "Daemon's daughter by Laena. Rider of Moondancer. Confronted Aegon II and Sunfyre over Dragonstone — a young girl on a small dragon against the king. Both dragons fell; Baela survived, badly burned. Fierce, brave, and unyielding. Married Alyn Velaryon after the Dance.", books: "Daemon's daughter by Laena. Rider of Moondancer. Confronted Aegon II and Sunfyre over Dragonstone. Both dragons fell; Baela survived, badly burned. Fierce and unyielding. Married Alyn Velaryon after the Dance.", tv: "Daemon's daughter by Laena. Rider of Moondancer. A fierce, spirited young woman raised between Driftmark and Dragonstone. Twin sister of Rhaena." } }, 
  { id: "harwin", name: "Harwin Strong", color: C.other, house: "Strong", canon: "both", title: "Ser / Breakbones", bio: "The strongest knight in the realm and Rhaenyra's rumored lover — almost certainly the true father of Jacaerys, Lucerys, and Joffrey Velaryon. Their brown hair and Strong features were the worst-kept secret at court. Died in the suspicious fire at Harrenhal, likely arranged by his own brother Larys.", summaries: { combined: "The strongest knight in the realm and Rhaenyra's rumored lover — almost certainly the true father of Jacaerys, Lucerys, and Joffrey Velaryon. Their brown hair and Strong features were the worst-kept secret at court. Died in the suspicious fire at Harrenhal, likely arranged by his own brother Larys.", books: "The strongest knight in the realm and Rhaenyra's rumored lover — almost certainly the true father of Jacaerys, Lucerys, and Joffrey Velaryon. Their brown hair and Strong features were the worst-kept secret at court. Died in the suspicious fire at Harrenhal, likely arranged by his brother Larys.", tv: "The strongest knight in the realm and Rhaenyra's lover — the true father of her three eldest sons. Their brown hair is an open secret at court. Killed in the fire at Harrenhal arranged by his brother Larys." } }, 

  // ── KEY SUPPORTING ──
  { id: "mysaria", name: "Mysaria", color: C.free_cities, house: "None", canon: "both", title: "The White Worm", bio: "Former dancer from Lys, Daemon's lover turned spymaster. Ran a network of informants in King's Landing. Orchestrated the 'Blood and Cheese' assassination on Daemon's orders — sending two killers to murder one of Aegon II's sons in retaliation for Lucerys. One of the most feared figures of the Dance.", summaries: { combined: "Former dancer from Lys, Daemon's lover turned spymaster. Ran a network of informants in King's Landing. Orchestrated the 'Blood and Cheese' assassination on Daemon's orders — sending two killers to murder one of Aegon II's sons in retaliation for Lucerys. One of the most feared figures of the Dance.", books: "Former dancer from Lys, Daemon's lover turned spymaster. Ran an intelligence network in King's Landing. Orchestrated the 'Blood and Cheese' assassination on Daemon's orders. One of the most feared figures of the Dance. Eventually killed by the mob during the Storming of the Dragonpit.", tv: "Former dancer from Lys, Daemon's former lover turned spymaster. Runs an intelligence network in King's Landing. Becomes an influential figure in the political machinations surrounding the Dance." } }, 
  { id: "addam", name: "Addam Velaryon", color: C.other, house: "Velaryon", canon: "both", title: "Dragonseed / Dragonrider", bio: "Allegedly Laenor's bastard (more likely Corlys's). Claimed the dragon Seasmoke during the dragonseeds program. When other dragonseeds betrayed the Blacks at Tumbleton, Addam remained loyal. Died at the Second Tumbleton fighting to prove that not all dragonseeds were traitors. 'He died a knight.'", summaries: { combined: "Allegedly Laenor's bastard (more likely Corlys's). Claimed the dragon Seasmoke during the dragonseeds program. When other dragonseeds betrayed the Blacks at Tumbleton, Addam remained loyal. Died at the Second Tumbleton fighting to prove that not all dragonseeds were traitors. 'He died a knight.'", books: "Allegedly Laenor's bastard (more likely Corlys's). Claimed the dragon Seasmoke during the dragonseeds program. When other dragonseeds betrayed the Blacks, Addam remained loyal. Died at the Second Battle of Tumbleton fighting to prove that not all dragonseeds were traitors.", tv: "A dragonseed who claims the dragon Seasmoke. His loyalty and identity become central questions as the dragonseeds program unfolds during the Dance." } }, 
  { id: "nettles", name: "Nettles", color: C.other, house: "Unknown", canon: "book", title: "Dragonseed / Dragonrider", bio: "A smallfolk girl who tamed the wild dragon Sheepstealer by feeding it sheep. Possibly Daemon's lover in their later campaign. When Rhaenyra ordered her death, Daemon warned her and she fled. Disappeared into the Mountains of the Moon. One of Fire & Blood's most intriguing mysteries — no one knows who she truly was.", summaries: { combined: "A smallfolk girl who tamed the wild dragon Sheepstealer by feeding it sheep. Possibly Daemon's lover in their later campaign. When Rhaenyra ordered her death, Daemon warned her and she fled. Disappeared into the Mountains of the Moon. One of Fire & Blood's most intriguing mysteries — no one knows who she truly was.", books: "A smallfolk girl who tamed the wild dragon Sheepstealer by feeding it sheep. Possibly Daemon's lover during their campaign in the Riverlands. When Rhaenyra ordered her death, Daemon warned her and she fled. Disappeared into the Mountains of the Moon — one of Fire & Blood's most intriguing mysteries.", tv: "" } }, 
  { id: "hugh", name: "Hugh Hammer", color: C.other, house: "Unknown (dragonseed)", canon: "both", title: "Dragonseed / Dragonrider", bio: "Blacksmith's bastard who claimed the dragon Vermithor, the Bronze Fury — one of the largest dragons alive. Betrayed the Blacks at the First Battle of Tumbleton, switching sides and sacking the town. Tried to claim the Iron Throne for himself. Killed by Ser Jon Roxton before he could.", summaries: { combined: "Blacksmith's bastard who claimed the dragon Vermithor, the Bronze Fury — one of the largest dragons alive. Betrayed the Blacks at the First Battle of Tumbleton, switching sides and sacking the town. Tried to claim the Iron Throne for himself. Killed by Ser Jon Roxton before he could.", books: "Blacksmith's bastard who claimed the dragon Vermithor, one of the largest living dragons. Betrayed the Blacks at Tumbleton, switching sides and sacking the town. Tried to claim the Iron Throne for himself. Killed by Ser Jon Roxton before he could.", tv: "A dragonseed of common birth who claims the dragon Vermithor. His ambitions and loyalties become a dangerous wildcard in the Dance." } }, 
  { id: "ulf", name: "Ulf White", color: C.other, house: "Unknown (dragonseed)", canon: "both", title: "Dragonseed / Dragonrider", bio: "Claimed the dragon Silverwing. Betrayed the Blacks alongside Hugh Hammer at Tumbleton, earning the name 'Ulf the Sot' for his drunkenness. Poisoned after the Second Battle of Tumbleton. The dragonseeds' betrayals proved that dragon blood alone did not guarantee loyalty.", summaries: { combined: "Claimed the dragon Silverwing. Betrayed the Blacks alongside Hugh Hammer at Tumbleton, earning the name 'Ulf the Sot' for his drunkenness. Poisoned after the Second Battle of Tumbleton. The dragonseeds' betrayals proved that dragon blood alone did not guarantee loyalty.", books: "Claimed the dragon Silverwing. Betrayed the Blacks alongside Hugh Hammer at Tumbleton, earning the name 'Ulf the Sot' for his drunkenness. Poisoned after the Second Battle of Tumbleton.", tv: "A dragonseed who claims the dragon Silverwing. His drunkenness and unreliability make him a liability among the dragonseeds." } }, 
  { id: "lyonel", name: "Lyonel Strong", color: C.other, house: "Strong", canon: "both", title: "Lord of Harrenhal / Hand of the King", bio: "Hand of the King to Viserys I, a fair and capable administrator. Father of Harwin and Larys. Died alongside Harwin in the fire at Harrenhal; Fire & Blood suggests Larys may have been responsible. Tried to serve the realm honestly in an impossible situation.", summaries: { combined: "Hand of the King to Viserys I, a fair and capable administrator. Father of Harwin and Larys. Died alongside Harwin in the fire at Harrenhal; Fire & Blood suggests Larys may have been responsible. Tried to serve the realm honestly in an impossible situation.", books: "Hand of the King to Viserys I, a fair and capable administrator. Father of Harwin and Larys. Died alongside Harwin in the fire at Harrenhal; Fire & Blood suggests Larys may have been responsible.", tv: "Hand of the King to Viserys I, a fair and capable administrator. Father of Harwin and Larys. Killed in the fire at Harrenhal that also claims Harwin, with Larys as the prime suspect." } }, 
];

// ═══════════════════════════════════════════════════════
// GRAPH EDGES — Every major connection with description
// ═══════════════════════════════════════════════════════
const graphEdges = [
  // ── STARK FAMILY ──
  { source: "ned", target: "cat", rel: "Husband & wife. Married for political alliance during Robert's Rebellion, grew into genuine love. Their partnership was the bedrock of Stark power." },
  { source: "ned", target: "robb", rel: "Father & eldest son. Robb inherited Ned's honor and military talent, but also his fatal inability to compromise principle for pragmatism." },
  { source: "ned", target: "sansa", rel: "Father & daughter. Sansa's naivety contributed to Ned's downfall when she revealed his plan to Cersei. She watched him die." },
  { source: "ned", target: "arya", rel: "Father & daughter. Ned recognized Arya's wild spirit and hired Syrio Forel. His execution set Arya on her path of vengeance." },
  { source: "ned", target: "bran", rel: "Father & son. Bran's discovery of Jaime and Cersei triggered the chain of events Ned investigated in King's Landing." },
  { source: "ned", target: "rickon", rel: "Father & youngest son." },
  { source: "ned", target: "jon", rel: "Raised Jon as his bastard; the books strongly imply Jon is the son of Rhaegar and Lyanna, and that Ned promised Lyanna to protect him. 'Promise me, Ned' — the promise that defined his life." },
  { source: "ned", target: "robert", rel: "Childhood friends raised together at the Eyrie. Robert's rebellion was fought partly for Lyanna. Ned served as Robert's Hand and uncovered the truth about Cersei's children." },
  { source: "ned", target: "jon_arryn", rel: "Jon Arryn fostered both Ned and Robert. His death brought Ned south. They investigated the same secret — Joffrey's parentage." },
  { source: "ned", target: "jaime", rel: "Ned found Jaime on the Iron Throne after the Sack and judged him as 'Kingslayer' without asking why. That judgment haunted Jaime for 17 years." },
  { source: "ned", target: "littlefinger", rel: "Littlefinger promised Ned the City Watch's support, then betrayed him to Cersei. 'I did warn you not to trust me.'" },
  { source: "ned", target: "cersei", rel: "Ned confronted Cersei about her children and gave her time to flee — a fatal act of mercy that she used to outmaneuver him." },
  { source: "ned", target: "benjen", rel: "Brothers. Benjen took the black. His reasons for joining the Watch are not stated in the books." },
  { source: "ned", target: "howland", rel: "Only two survivors of the Tower of Joy. Howland saved Ned's life. Ned never spoke of what happened there." },
  { source: "ned", target: "rhaegar", rel: "Ned fought to save his sister from Rhaegar (or so he believed). Found Lyanna dying at the Tower of Joy with Rhaegar's Kingsguard standing watch." },
  { source: "ned", target: "tywin", rel: "Ned was disgusted by Tywin's presentation of Elia's murdered children. Their enmity was ideological — honor vs. ruthless pragmatism." },
  { source: "ned", target: "theon", rel: "Took Theon as a ward/hostage after the Greyjoy Rebellion. Raised him alongside his sons, but Theon was always aware he was a hostage." },
  // ── CATELYN ──
  { source: "cat", target: "robb", rel: "Mother & son. Her counsel guided Robb's campaign. Her unauthorized release of Jaime undermined his authority." },
  { source: "cat", target: "sansa", rel: "Mother & daughter. Catelyn fought desperately to recover Sansa from King's Landing. Never succeeded." },
  { source: "cat", target: "arya", rel: "Mother & daughter. They were separated early and never reunited. Arya arrived at the Twins during the Red Wedding." },
  { source: "cat", target: "bran", rel: "Mother & son. Cat stayed at Bran's bedside during his coma, fought the assassin sent to kill him." },
  { source: "cat", target: "tyrion", rel: "Catelyn arrested Tyrion based on Littlefinger's lie about the assassin's dagger, triggering Tywin's invasion of the Riverlands." },
  { source: "cat", target: "littlefinger", rel: "Childhood friends. Littlefinger was obsessed with Cat, fought Brandon Stark for her hand and was defeated. His lifelong obsession drove his scheming." },
  { source: "cat", target: "lysa", rel: "Sisters. Lysa's letter blaming the Lannisters for Jon Arryn's death was Littlefinger's manipulation. Their bond was exploited to start the war." },
  { source: "cat", target: "brienne", rel: "Brienne swore her sword to Catelyn after Renly's death. Their bond was forged in shared grief and duty." },
  { source: "cat", target: "walder_frey", rel: "Catelyn negotiated the crossing at the Twins, promising Robb would marry a Frey. When Robb broke that vow, Walder's wounded pride turned murderous." },
  { source: "cat", target: "jaime", rel: "Cat released Jaime from captivity to trade for Sansa and Arya — an unauthorized gamble that cost Robb political support." },
  { source: "cat", target: "jon", rel: "Cat resented Jon as a living reminder of Ned's supposed infidelity. Her coldness toward him drove Jon to the Wall." },
  { source: "cat", target: "stoneheart", rel: "Cat died at the Red Wedding. Beric gave his life to resurrect her as Lady Stoneheart — the monstrous revenant she became." },
  { source: "cat", target: "edmure", rel: "Siblings. Edmure was married at the Red Wedding — the 'honor' that lured Robb to his death." },
  { source: "cat", target: "blackfish", rel: "Catelyn's uncle, her most reliable military ally. He escaped the Red Wedding and held Riverrun." },
  { source: "cat", target: "hoster", rel: "Father & daughter. Hoster's deathbed confession about 'Tansy' — the moon tea he forced on Lysa — revealed dark family secrets." },
  // ── ROBB ──
  { source: "robb", target: "theon", rel: "Raised as brothers, but Theon betrayed Robb by seizing Winterfell. 'He was my brother' — though whose claim was truer is the tragedy." },
  { source: "robb", target: "jaime", rel: "Robb defeated and captured Jaime at the Whispering Wood — his greatest military triumph." },
  { source: "robb", target: "roose", rel: "Roose served Robb while undermining him — bleeding rival northern houses and preserving his own forces. Drove the dagger into Robb's heart. 'The Lannisters send their regards.'" },
  { source: "robb", target: "walder_frey", rel: "Robb broke his marriage pact with the Freys, a slight Walder repaid with the Red Wedding." },
  { source: "robb", target: "tywin", rel: "Robb never lost to Tywin on the battlefield, but Tywin destroyed him through politics and treachery — the Red Wedding." },
  { source: "robb", target: "edmure", rel: "Edmure's unauthorized attack at the fords disrupted Robb's strategy to trap Tywin. Later offered as the replacement Frey bridegroom." },
  { source: "robb", target: "blackfish", rel: "The Blackfish was Robb's most trusted military advisor, one of the few who escaped the Red Wedding." },
  // ── JON SNOW ──
  { source: "jon", target: "sam", rel: "Closest friends at the Wall. Jon protected Sam; Sam engineered Jon's election as Lord Commander. Jon sent Sam to the Citadel." },
  { source: "jon", target: "ygritte", rel: "Lovers. Jon broke his vows with her, learned to see the free folk as people. She died at Castle Black. 'You know nothing, Jon Snow.'" },
  { source: "jon", target: "mormont_jeor", rel: "The Old Bear groomed Jon for command, gave him Longclaw. Jon tried to live up to Mormont's example as Lord Commander." },
  { source: "jon", target: "maester_aemon", rel: "Aemon was Jon's secret great-great-uncle (both Targaryens). His counsel shaped Jon's understanding of duty. 'Kill the boy.'" },
  { source: "jon", target: "mance", rel: "Jon infiltrated Mance's army, respected him, and later tried to save him. In the books, Melisandre glamours Mance and sends him to Winterfell." },
  { source: "jon", target: "tormund", rel: "Enemies who became allies through mutual respect. Tormund's wildlings came through the Wall under Jon's command." },
  { source: "jon", target: "stannis", rel: "Stannis offered to legitimize Jon as Jon Stark and give him Winterfell. Jon refused, choosing the Watch. Stannis respected his refusal." },
  { source: "jon", target: "melisandre", rel: "Melisandre sees 'Snow' in her flames. She may resurrect Jon after his assassination — or she may have been looking at him wrong all along." },
  { source: "jon", target: "qhorin", rel: "Qhorin ordered Jon to kill him to infiltrate the wildlings. Jon's entire arc among the free folk rests on Qhorin's sacrifice." },
  { source: "jon", target: "rhaegar", rel: "The books strongly imply Jon is Rhaegar's son (R+L=J); Jon does not know this. Whether Rhaegar's prophecy obsession centers on Jon is not confirmed in the text." },
  { source: "jon", target: "ramsay", rel: "Ramsay's 'Bastard Letter' to Jon — claiming Stannis is dead and demanding his bride — provoked Jon to announce a march on Winterfell, triggering the mutiny." },
  { source: "jon", target: "arya", rel: "The closest of the Stark siblings. Jon gave Arya Needle. News of her supposed marriage to Ramsay partly drove Jon's fateful decision." },
  { source: "jon", target: "theon", rel: "Grew up together as near-brothers. Jon's conflicted feelings about Theon mirror the series' themes of identity and belonging." },
  { source: "jon", target: "dany", rel: "Ice and fire. If R+L=J is true, they are aunt and nephew (neither knows in the books). Their eventual meeting is often anticipated by readers; how it will play out remains unwritten." },
  // ── SANSA ──
  { source: "sansa", target: "joffrey", rel: "Sansa's naive crush on Joffrey turned to horror as he tormented her. Her education in the cruelty of power began with him." },
  { source: "sansa", target: "tyrion", rel: "Married against both their wishes by Tywin. Tyrion refused to consummate it. She felt pity, not love. Their legal marriage complicates her future." },
  { source: "sansa", target: "littlefinger", rel: "Littlefinger rescued Sansa from King's Landing, then used her. He sees Cat in her — and wants her as both protégée and object of desire. She is learning his methods." },
  { source: "sansa", target: "hound", rel: "The Hound showed Sansa blunt kindness amid Joffrey's cruelty. Their charged dynamic — beauty and beast — recurs in her memories. She recalls a kiss that never happened." },
  { source: "sansa", target: "cersei", rel: "Cersei alternated between using Sansa as a hostage and offering bitter wisdom about what it means to be a woman in Westeros." },
  { source: "sansa", target: "margaery", rel: "Margaery befriended Sansa in King's Landing, offering a way out through marriage to Willas Tyrell — a plan Tywin crushed by marrying Sansa to Tyrion first." },
  { source: "sansa", target: "sweetrobin", rel: "Sansa manages Robin Arryn with patience and kindness while Littlefinger slowly poisons him. She is his surrogate mother and caretaker." },
  { source: "sansa", target: "lysa", rel: "Lysa nearly killed Sansa in a jealous rage over Littlefinger's attention. Petyr pushed Lysa through the Moon Door to save Sansa." },
  // ── ARYA ──
  { source: "arya", target: "hound", rel: "Captor and captive who became reluctant companions. The Hound tried to ransom her; she left him dying. Their bond was hostile, honest, and oddly tender." },
  { source: "arya", target: "jaqen", rel: "Jaqen gave Arya three deaths and the iron coin that led her to the Faceless Men. He may be operating in Oldtown under another face." },
  { source: "arya", target: "gendry", rel: "Traveling companions who formed a genuine bond. Arya revealed her identity to him. He joined the Brotherhood; she moved on. In the books, they haven't reunited." },
  { source: "arya", target: "syrio", rel: "Syrio taught Arya to fight and to say 'not today' to death. He held off Lannister guards so she could escape; his fate afterward is left ambiguous in the books." },
  { source: "arya", target: "beric", rel: "The Brotherhood captured Arya. She witnessed Beric's resurrection — her first encounter with genuine magic and the Lord of Light." },
  { source: "arya", target: "roose", rel: "Arya served as Roose Bolton's cupbearer at Harrenhal, close enough to kill him but too young and powerless to act." },
  // ── BRAN ──
  { source: "bran", target: "bloodraven", rel: "Bloodraven (the Three-Eyed Crow) called Bran north. He trains Bran in greensight — but his true motives may be more complex than mentorship." },
  { source: "bran", target: "hodor", rel: "Bran wargs into Hodor's mind, using him as a vehicle. This is considered an abomination — a violation of another person's autonomy." },
  { source: "bran", target: "jojen", rel: "Jojen guided Bran to the cave, recognizing his greenseer potential. Knows the day of his own death." },
  { source: "bran", target: "meera", rel: "Meera is Bran's protector and only human connection in the cave. Their relationship carries emotional weight the show largely ignored." },
  { source: "bran", target: "coldhands", rel: "Coldhands escorted Bran's party through the haunted forest to the cave. An ancient undead of unknown identity." },
  { source: "bran", target: "jaime", rel: "Jaime pushed Bran from the tower, crippling him. This single act set multiple plotlines in motion. Bran's greensight may reveal the full truth of this moment." },
  // ── LANNISTER FAMILY ──
  { source: "tywin", target: "cersei", rel: "Father & daughter. Cersei modeled herself on Tywin but lacked his intelligence. He controlled her through Joffrey's regency." },
  { source: "tywin", target: "jaime", rel: "Father & son. Tywin wanted Jaime as his heir; Jaime joined the Kingsguard instead. Their estrangement was never resolved before Tywin's murder." },
  { source: "tywin", target: "tyrion", rel: "Tywin despised Tyrion for being a dwarf and for 'killing' his mother in childbirth. Tyrion murdered him after learning the truth about Tysha." },
  { source: "tywin", target: "roose", rel: "Co-conspirators in the Red Wedding. Tywin provided the political cover; Roose drove the dagger." },
  { source: "tywin", target: "walder_frey", rel: "Co-conspirators. Tywin promised Walder protection and Riverrun's lands in exchange for betraying guest right." },
  { source: "tywin", target: "mountain", rel: "Tywin's attack dog. Gregor murdered Elia and her children on Tywin's orders during the Sack of King's Landing." },
  { source: "tywin", target: "oberyn", rel: "Oberyn came to King's Landing seeking justice for Elia. Tywin's role in her murder was the core of Dornish fury." },
  { source: "tywin", target: "olenna", rel: "Political rivals who cooperated when it suited them. Both maneuvered the Joffrey-Margaery marriage." },
  { source: "cersei", target: "jaime", rel: "Twins and lovers since childhood. Their incest produced three children. Jaime's transformation drives them apart — he burns her letter begging for help." },
  { source: "cersei", target: "tyrion", rel: "Cersei hated Tyrion from birth, blamed him for their mother's death. Convinced he murdered Joffrey. Their mutual hatred is one of the series' defining relationships." },
  { source: "cersei", target: "joffrey", rel: "Mother & son. Cersei couldn't control Joffrey's cruelty. His death devastated her and accelerated her mental decline." },
  { source: "cersei", target: "tommen", rel: "Mother & son. Cersei's overprotection of Tommen drives her worst decisions as regent." },
  { source: "cersei", target: "robert", rel: "A loveless marriage. Cersei's first child by Robert died; after that, all three were Jaime's. She engineered Robert's death on the hunt." },
  { source: "cersei", target: "lancel", rel: "Cersei used Lancel to kill Robert (strongwine on the hunt) and as a sexual replacement for Jaime. His confession helped bring her down." },
  { source: "cersei", target: "margaery", rel: "Rivals for Tommen's loyalty and control of the crown. Cersei armed the Faith Militant to destroy Margaery — and destroyed herself." },
  { source: "cersei", target: "high_sparrow", rel: "Cersei armed the Faith Militant to use against the Tyrells. The High Sparrow turned that weapon back on her, arresting her for her own sins." },
  { source: "cersei", target: "qyburn", rel: "Qyburn enables Cersei's worst impulses — creating Ser Robert Strong, running the spy network, conducting experiments in the black cells." },
  { source: "cersei", target: "mountain", rel: "The Mountain became Cersei's champion as 'Ser Robert Strong' after Qyburn's reanimation." },
  { source: "jaime", target: "brienne", rel: "Captured together, their mutual contempt transformed into respect and something deeper. Jaime gave her Oathkeeper. She named it. He followed her into Stoneheart's trap." },
  { source: "jaime", target: "aerys", rel: "Jaime killed the Mad King to prevent him from burning King's Landing. The act defined his identity — and no one ever asked why." },
  { source: "tyrion", target: "bronn", rel: "Bronn championed Tyrion at the Eyrie and served as his enforcer in King's Landing. Their relationship is transactional but genuine." },
  { source: "tyrion", target: "jorah", rel: "Jorah kidnapped Tyrion to bring to Dany. They were captured by slavers together. An unlikely partnership born of mutual desperation." },
  { source: "tyrion", target: "young_griff", rel: "Tyrion deduced Aegon's identity on the Shy Maid and talked him into invading Westeros immediately — one of the most consequential conversations in the series." },
  { source: "tyrion", target: "varys", rel: "Varys freed Tyrion from his death cell and sent him east. Varys used Tyrion as a piece in his long game for Aegon." },
  { source: "tyrion", target: "littlefinger", rel: "Littlefinger framed Tyrion for Bran's assassination attempt and later for Joffrey's murder. They are rival schemers who never directly confront each other." },
  { source: "tyrion", target: "oberyn", rel: "Oberyn championed Tyrion in the trial by combat — not out of friendship, but to get a chance to fight the Mountain and extract a confession about Elia." },
  { source: "tyrion", target: "penny", rel: "Penny's brother was killed because of Cersei's bounty on Tyrion. She forces Tyrion to confront the collateral damage of his family's wars." },
  { source: "tyrion", target: "dany", rel: "In the books, Tyrion hasn't met Dany yet — he's outside Meereen with the Second Sons. The show brings them together much earlier." },
  // ── BARATHEON ──
  { source: "robert", target: "rhaegar", rel: "Robert killed Rhaegar at the Trident with his warhammer, rubies scattering into the river. 'In my dreams I kill him every night.'" },
  { source: "robert", target: "stannis", rel: "Brothers who never liked each other. Robert gave Storm's End to Renly instead of Stannis, a slight Stannis never forgave." },
  { source: "robert", target: "renly", rel: "Robert loved Renly more than Stannis, giving him Storm's End. Renly's charisma was everything Robert's kingship should have been." },
  { source: "stannis", target: "renly", rel: "Brothers and rival kings. Stannis killed Renly with a shadow assassin. The younger brother's death haunts Stannis — in his nightmares, he grinds his teeth over the peach." },
  { source: "stannis", target: "davos", rel: "Stannis's most loyal advisor and moral compass. Davos tells him truths no one else dares. Their bond is the series' great study in duty and friendship." },
  { source: "stannis", target: "theon", rel: "Stannis holds Theon prisoner and plans to execute him as a turncloak. Asha argues for his life." },
  { source: "stannis", target: "manderly", rel: "Manderly appears to submit to Stannis but has his own agenda — using Stannis's campaign to restore the Starks." },
  { source: "stannis", target: "shireen", rel: "Father & daughter. GRRM confirmed Shireen will burn in the books. The show's most devastating scene." },
  { source: "davos", target: "manderly", rel: "Manderly reveals the North's secret loyalty to the Starks and sends Davos on a mission to find Rickon on Skagos." },
  { source: "davos", target: "rickon", rel: "Davos is sent to Skagos to retrieve Rickon — the last known male Stark heir. His mission's outcome is unknown." },
  // ── TARGARYEN / ESSOS ──
  { source: "dany", target: "viserys", rel: "Brother & sister. Viserys abused Dany her entire life and sold her to Drogo. His death freed her. She pitied him in the end." },
  { source: "dany", target: "drogo", rel: "Arranged marriage that became love. Drogo promised her the world. His death — and Mirri's treachery — catalyzed Dany's transformation and the birth of dragons." },
  { source: "dany", target: "jorah", rel: "Her trusted advisor who was spying on her for Varys while also falling in love with her. His betrayal devastated her. Banished, he has spent two books trying to return to her service." },
  { source: "dany", target: "barristan", rel: "Barristan came to serve her as the last true knight of Westeros. He rules Meereen in her absence." },
  { source: "dany", target: "missandei", rel: "Dany freed Missandei from slavery. She became her closest confidante and most loyal handmaid." },
  { source: "dany", target: "grey_worm", rel: "Grey Worm chose to serve Dany after liberation. Commander of her Unsullied." },
  { source: "dany", target: "daario", rel: "Dany's lover in Meereen. She abandoned him for the political marriage to Hizdahr. He represents the freedom she gave up for duty." },
  { source: "dany", target: "hizdahr", rel: "Dany married Hizdahr for peace in Meereen. He may be connected to the Harpy." },
  { source: "dany", target: "mirri", rel: "Mirri's revenge killed Dany's son and left Drogo a shell, but inadvertently created the conditions for the dragons to hatch. 'Only death can pay for life.'" },
  { source: "dany", target: "illyrio", rel: "Illyrio sheltered the Targaryen siblings and arranged Dany's marriage. His true loyalty may be to Aegon/Young Griff, not Dany." },
  { source: "dany", target: "quentyn", rel: "Quentyn came to propose marriage on Dorne's behalf. He arrived too late. His attempt to steal a dragon killed him." },
  { source: "dany", target: "victarion", rel: "Victarion sails to Meereen with the dragon horn Dragonbinder, planning to claim Dany and her dragons. They haven't met yet." },
  { source: "dany", target: "young_griff", rel: "Aegon claims to be Dany's nephew. If real, he has a stronger claim to the throne. Their potential rivalry is a central tension of the unwritten books." },
  { source: "dany", target: "rhaegar", rel: "Father & daughter... actually brother & sister — Dany is Rhaegar's younger sister. Dany idolizes the brother she never met and his legacy of prophecy." },
  { source: "young_griff", target: "connington", rel: "Connington raised Aegon from infancy; his POV suggests deep devotion to Rhaegar. Dying of greyscale, racing to seat Aegon before his time runs out." },
  { source: "young_griff", target: "varys", rel: "Varys's entire long game has been for Aegon — a king raised to rule, who knows duty and sacrifice." },
  { source: "young_griff", target: "illyrio", rel: "Illyrio funded and sheltered Aegon's upbringing. His dead wife Serra may connect him to the Blackfyre line — raising the question of whether Aegon is real." },
  { source: "young_griff", target: "arianne", rel: "Arianne is sent by Doran to meet Aegon — potentially to marry him and unite Dorne with the Targaryen cause." },
  { source: "connington", target: "rhaegar", rel: "Connington loved Rhaegar and failed him at the Battle of the Bells. Raising Aegon is his redemption." },
  { source: "barristan", target: "jorah", rel: "Barristan exposed Jorah's spying to Daenerys, resulting in Jorah's banishment." },
  { source: "barristan", target: "aerys", rel: "Barristan served the Mad King faithfully but was haunted by what he witnessed. His failure to stop Aerys's cruelty drove him to seek a better monarch in Dany." },
  { source: "barristan", target: "rhaegar", rel: "Barristan served alongside Rhaegar and revered him. He believes Rhaegar would have been a great king." },
  { source: "barristan", target: "joffrey", rel: "Joffrey dismissed Barristan from the Kingsguard on Cersei's orders. The insult sent him to Dany." },
  // ── TYRELL ──
  { source: "margaery", target: "joffrey", rel: "Married Joffrey. Her grandmother Olenna poisoned him at the wedding to protect Margaery from his cruelty." },
  { source: "margaery", target: "tommen", rel: "Married Tommen after Joffrey's death. Gained influence over the young king, enraging Cersei." },
  { source: "margaery", target: "renly", rel: "Married Renly as part of the Tyrell bid for power. Whether she knew about Renly and Loras is left ambiguous." },
  { source: "olenna", target: "littlefinger", rel: "Conspired together to murder Joffrey at the Purple Wedding. Sansa unknowingly carried the poison in her hairnet." },
  { source: "olenna", target: "joffrey", rel: "Olenna poisoned Joffrey to protect Margaery. The Queen of Thorns, playing the game with lethal precision." },
  { source: "loras", target: "renly", rel: "Secret lovers. Loras was devastated by Renly's death and suspected Brienne. Joined the Kingsguard, unable to marry." },
  { source: "loras", target: "brienne", rel: "Loras blamed Brienne for Renly's death. Their mutual love of Renly is an unresolved tension." },
  // ── MARTELL ──
  { source: "oberyn", target: "mountain", rel: "Oberyn fought the Mountain in Tyrion's trial by combat, demanding a confession about Elia. Won the fight, then Gregor crushed his skull while confessing." },
  { source: "oberyn", target: "doran", rel: "Brothers with different approaches — Oberyn was the hot-blooded spear; Doran the cautious strategist. Both wanted justice for Elia." },
  { source: "oberyn", target: "sand_snakes", rel: "Father of eight bastard daughters, each fierce in her own way. His death sent them into a fury for vengeance." },
  { source: "doran", target: "arianne", rel: "Father & daughter. Arianne plotted against him, not knowing he had his own long game for Targaryen restoration." },
  { source: "doran", target: "quentyn", rel: "Father & son. Doran sent Quentyn to marry Dany. The plan failed catastrophically." },
  { source: "doran", target: "dany", rel: "Doran's master plan involves Targaryen restoration through marriage — originally Viserys, then Quentyn to Dany, now possibly Arianne to Aegon." },
  { source: "arianne", target: "myrcella", rel: "Arianne's Queenmaker plot to crown Myrcella using Dornish succession law failed, leaving Myrcella scarred." },
  // ── GREYJOY ──
  { source: "balon", target: "theon", rel: "Father & son. Balon gave Theon away as a hostage and rejected him when he returned. Theon's betrayal of Robb was a desperate bid for Balon's approval." },
  { source: "balon", target: "euron", rel: "Brothers. Euron almost certainly arranged Balon's death via a Faceless Man, returning the day Balon fell from the bridge." },
  { source: "balon", target: "asha", rel: "Balon raised Asha as his heir after giving Theon away. She is the Iron Islands' most competent leader." },
  { source: "euron", target: "victarion", rel: "Brothers. Euron seduced Victarion's wife; Victarion killed her. Euron sent Victarion to fetch Dany, but Victarion plans to betray him." },
  { source: "euron", target: "asha", rel: "Euron defeated Asha at the kingsmoot with promises of dragons and glory." },
  { source: "euron", target: "aeron", rel: "Euron abused Aeron in childhood. Aeron's terror of Euron is visceral and personal." },
  { source: "euron", target: "dany", rel: "Euron wants to claim Dany and her dragons using the horn Dragonbinder. His ambitions may extend to godhood." },
  { source: "asha", target: "theon", rel: "Siblings. Asha is captured by Stannis, as is Theon. She fights to save his life." },
  { source: "theon", target: "ramsay", rel: "Ramsay tortured Theon into Reek, flaying his fingers, breaking his mind. Theon's escape is the series' most powerful redemption." },
  { source: "theon", target: "jeyne_poole", rel: "Theon helped Jeyne escape Ramsay, reclaiming his identity through saving a near-stranger.", canon: "books" },
  { source: "theon", target: "roose", rel: "Roose is Theon's captor's father. Uses Theon to legitimize Bolton control of Winterfell." },
  // ── WATCH / WALL ──
  { source: "mormont_jeor", target: "sam", rel: "Mormont valued Sam's intelligence. Sam fled Craster's with Gilly after the mutiny that killed Mormont." },
  { source: "mormont_jeor", target: "craster", rel: "The Watch's uncomfortable alliance with Craster — who gave his sons to the Others. Mormont knew and looked away." },
  { source: "mormont_jeor", target: "jorah", rel: "Father & son. Jeor gave Jorah's family sword Longclaw to Jon because Jorah fled into exile in disgrace." },
  { source: "sam", target: "jaqen", rel: "Sam arrives at the Citadel and meets 'Pate' — who is likely Jaqen H'ghar wearing a dead novice's face." },
  { source: "sam", target: "maester_aemon", rel: "Sam cared for Aemon on the voyage south. Aemon died in his arms, whispering about dragons." },
  { source: "sam", target: "gilly", rel: "Sam saved Gilly from Craster's Keep. Their relationship is one of the few genuine love stories in the series." },
  { source: "sam", target: "craster", rel: "Sam witnessed the mutiny at Craster's Keep and escaped with Gilly and her baby." },
  { source: "mance", target: "tormund", rel: "Chief allies in uniting the wildlings. Tormund's respect for Mance is absolute." },
  { source: "mance", target: "ygritte", rel: "Ygritte served under Mance's command during the march on the Wall." },
  { source: "mance", target: "stannis", rel: "Stannis crushed Mance's army and captured him. In the books, Mance is glamoured by Melisandre and sent to Winterfell." },
  // ── LITTLEFINGER'S WEB ──
  { source: "littlefinger", target: "lysa", rel: "Manipulated Lysa since childhood, using her love to poison Jon Arryn and write the letter blaming the Lannisters. Married her, then pushed her through the Moon Door." },
  { source: "littlefinger", target: "jon_arryn", rel: "Orchestrated Jon Arryn's murder through Lysa — the inciting event of the entire series." },
  { source: "littlefinger", target: "varys", rel: "Rival schemers. Littlefinger creates chaos to climb; Varys cultivates chaos for Aegon's restoration. Each knows the other is playing a deep game." },
  // ── VARYS'S WEB ──
  { source: "varys", target: "illyrio", rel: "Childhood friends and lifelong conspirators. Arya overheard them plotting beneath the Red Keep. Their plan spans decades." },
  { source: "varys", target: "kevan", rel: "Varys murdered Kevan because his competence threatened to stabilize the realm — exactly what Varys needed to prevent for Aegon's invasion." },
  { source: "varys", target: "pycelle", rel: "Murdered alongside Kevan to create maximum chaos." },
  { source: "varys", target: "dany", rel: "In the show, Varys ultimately supports Dany. In the books, his true loyalty is to Aegon. He may see Dany as a useful distraction or rival." },
  // ── BROTHERHOOD ──
  { source: "beric", target: "thoros", rel: "Thoros resurrected Beric six times. Beric gave his final life to resurrect Catelyn." },
  { source: "beric", target: "stoneheart", rel: "Beric sacrificed himself to resurrect Catelyn. His mercy became her vengeance." },
  { source: "stoneheart", target: "brienne", rel: "Stoneheart captured Brienne and demanded she bring Jaime or be hanged. Brienne screamed a word (likely 'sword') to accept the mission." },
  { source: "stoneheart", target: "jaime", rel: "Stoneheart wants Jaime dead. Brienne is leading him into a trap. The confrontation is one of the books' great pending scenes." },
  { source: "stoneheart", target: "walder_frey", rel: "Lady Stoneheart systematically hunts and hangs Freys for their role in the Red Wedding." },
  // ── BOLTON ──
  { source: "roose", target: "ramsay", rel: "Father & son. Roose is wary of Ramsay's instability but uses his cruelty. Their dynamic is cold calculation vs. hot sadism." },
  { source: "ramsay", target: "jeyne_poole", rel: "Ramsay married 'Arya Stark' (Jeyne) and subjected her to unspeakable cruelty. Her rescue by Theon is the book's moral turning point." },
  // ── CLEGANE ──
  { source: "hound", target: "mountain", rel: "Brothers. Gregor burned Sandor's face in childhood. Their enmity is personal and irreconcilable. 'Cleganebowl' is the series' most anticipated confrontation." },
  // ── MISC CONNECTIONS ──
  { source: "brienne", target: "renly", rel: "Brienne loved Renly and swore to serve him. His assassination devastated her and shaped her quest for honorable service." },
  { source: "brienne", target: "podrick", rel: "Pod became Brienne's loyal squire on her quest for Sansa. He is being hanged alongside her by Stoneheart." },
  { source: "manderly", target: "walder_frey", rel: "Manderly's son was killed at the Red Wedding. He served the Freys to the Boltons in pies at Ramsay's wedding feast." },
  { source: "manderly", target: "roose", rel: "Manderly appears to comply with the Boltons while plotting revenge. 'The North remembers.'" },
  { source: "high_sparrow", target: "lancel", rel: "Lancel confessed to the High Sparrow, providing evidence against Cersei." },
  { source: "bloodraven", target: "aegon_v", rel: "Bloodraven served multiple Targaryen kings. His exile to the Wall came under a later king's reign." },
  { source: "aegon_v", target: "maester_aemon", rel: "Brothers. Aemon refused the crown; Egg became the Unlikely King." },
  { source: "aegon_c", target: "aerys", rel: "Aegon founded the dynasty; Aerys destroyed it 300 years later." },
  { source: "rhaegar", target: "aerys", rel: "Father & son. Rhaegar reportedly planned to depose Aerys at the tournament of Harrenhal." },
  { source: "septon_meribald", target: "hound", rel: "Meribald guides Brienne to the Quiet Isle, where a gravedigger matching the Hound's description lives in peace." },
  { source: "howland", target: "jojen", rel: "Father of Jojen and Meera. Sent them to Winterfell to help Bran." },
  { source: "howland", target: "meera", rel: "Father of Meera. He may hold the key to Jon's parentage." },
  { source: "lady_dustin", target: "ned", rel: "Hates Ned because he never returned her husband's bones from the Tower of Joy." },
  { source: "gendry", target: "robert", rel: "Father & son (unacknowledged). Gendry is Robert's spitting image — the proof of Baratheon blood that helps prove Joffrey's illegitimacy." },
  { source: "gendry", target: "melisandre", rel: "Melisandre wanted Gendry for his king's blood. In the books, she leeches him; Davos helps him escape." },
  { source: "lancel", target: "robert", rel: "Lancel was Robert's squire. He fed Robert strongwine on the hunt at Cersei's command, ensuring the boar killed him." },
  { source: "qyburn", target: "mountain", rel: "Qyburn transformed the dying Mountain into Ser Robert Strong through necromantic experiments." },
  { source: "wex", target: "theon", rel: "Wex was Theon's mute squire at Winterfell. He survived the sack by hiding and eventually provided intelligence about Rickon's location." },
  { source: "wex", target: "manderly", rel: "Wex communicated Rickon's location on Skagos to Manderly, who then sent Davos to retrieve him." },
  // ── ADDITIONAL CONNECTIONS ──
  // Podrick
  { source: "podrick", target: "tyrion", rel: "Pod was Tyrion's squire in King's Landing. Saved Tyrion's life at the Blackwater by killing Ser Mandon Moore. One of the few people who showed Tyrion genuine loyalty." },
  { source: "podrick", target: "stoneheart", rel: "Captured by the Brotherhood under Lady Stoneheart. Being hanged alongside Brienne for carrying Lannister arms." },
  { source: "podrick", target: "sansa", rel: "Accompanies Brienne on the quest to find and protect Sansa Stark. His loyalty to this mission nearly costs him his life." },
  // Bronn
  { source: "bronn", target: "jaime", rel: "Became Jaime's sparring partner and unofficial enforcer after Tyrion's departure. Refused to fight the Mountain for Tyrion — 'I like you, but I like myself more.'" },
  { source: "bronn", target: "cersei", rel: "Cersei arranged for Bronn to marry Lollys Stokeworth to buy his silence and separate him from Tyrion." },
  // Osha
  { source: "osha", target: "rickon", rel: "Wildling spearwife who became Rickon's protector. Fled with him to Skagos after Winterfell fell." },
  { source: "osha", target: "bran", rel: "Initially captured near Winterfell, Osha became a trusted household member and helped Bran and Rickon escape when Theon seized the castle." },
  { source: "osha", target: "theon", rel: "Osha distracted Theon by seducing him, giving Bran and Rickon time to escape from Winterfell through the crypts." },
  // Hodor
  { source: "hodor", target: "jojen", rel: "Travel companions on the journey beyond the Wall. Hodor's strength protects the group." },
  // Mace Tyrell
  { source: "mace", target: "olenna", rel: "Son and mother. Olenna considers Mace a pompous fool and runs the true Tyrell strategy from behind him." },
  { source: "mace", target: "margaery", rel: "Father and daughter. Mace leverages Margaery's marriages to advance Tyrell power." },
  { source: "mace", target: "tywin", rel: "Political allies after the Blackwater. The Lannister-Tyrell alliance is the most powerful faction but built on mutual suspicion." },
  { source: "mace", target: "cersei", rel: "Cersei despises Mace and the Tyrells, seeing them as upstarts trying to steal power from the Lannisters." },
  // Rickon
  { source: "rickon", target: "bran", rel: "Brothers separated after Winterfell's fall. Bran went north, Rickon went to Skagos. Both too young for the horrors visited upon them." },
  // Shireen
  { source: "shireen", target: "davos", rel: "Shireen taught Davos to read. He loves her like his own daughter. Her fate is the series' most devastating tragedy." },
  { source: "shireen", target: "melisandre", rel: "Melisandre sees Shireen's king's blood as a potential sacrifice. GRRM confirmed the burning will happen in the books." },
  // Kevan
  { source: "kevan", target: "tywin", rel: "Brothers. Kevan was Tywin's right hand — loyal, capable, and modest. He tried to undo Cersei's damage after Tywin's death." },
  { source: "kevan", target: "cersei", rel: "Kevan refused Cersei's attempts to control him as regent. His competence threatened her grip on power." },
  // Myrcella
  { source: "myrcella", target: "cersei", rel: "Mother and daughter. Cersei sent Myrcella to Dorne as a political hostage through Tyrion's scheming, and never forgave him." },
  { source: "myrcella", target: "tyrion", rel: "Tyrion arranged Myrcella's betrothal to Trystane Martell as a political alliance with Dorne, infuriating Cersei." },
  // Viserys
  { source: "viserys", target: "drogo", rel: "Viserys sold Dany to Drogo for an army. Drogo gave him his golden crown — molten gold poured over his head." },
  { source: "viserys", target: "illyrio", rel: "Illyrio sheltered Viserys and Dany for years, feeding Viserys's delusions of reconquest while playing his own game." },
  // Drogo
  { source: "drogo", target: "mirri", rel: "Mirri Maz Duur 'healed' Drogo's wound with blood magic that left him a vegetable. Her revenge for the khalasar's atrocities." },
  // Missandei
  { source: "missandei", target: "grey_worm", rel: "In the show, they develop a romance. In the books, both are children and this subplot doesn't exist." },
  // Grey Worm
  { source: "grey_worm", target: "barristan", rel: "Serve together as Dany's military commanders. Grey Worm leads the Unsullied while Barristan advises on strategy." },
  // Daario
  { source: "daario", target: "hizdahr", rel: "Rivals for Dany's attention. Daario is the passionate lover she abandons for the political marriage to Hizdahr." },
  // Hizdahr
  { source: "hizdahr", target: "barristan", rel: "Barristan stages a coup against Hizdahr after Dany disappears, suspecting him of connection to the Sons of the Harpy." },
  // Sand Snakes
  { source: "sand_snakes", target: "doran", rel: "Doran imprisons the Sand Snakes to prevent rash vengeance, then deploys them strategically across Westeros." },
  { source: "sand_snakes", target: "arianne", rel: "Cousins and allies in the Dornish cause. The Sand Snakes and Arianne represent different facets of Dornish anger." },
  // Aeron
  { source: "aeron", target: "balon", rel: "Brothers. Aeron called the kingsmoot after Balon's death to prevent Euron from seizing the Seastone Chair." },
  // Hoster
  { source: "hoster", target: "lysa", rel: "Father and daughter. Hoster forced Lysa to drink moon tea to abort Littlefinger's child — a trauma that shaped Lysa's entire life." },
  { source: "hoster", target: "edmure", rel: "Father and son. Hoster died during the war while Edmure commanded the Riverlands defense." },
  // Sweetrobin
  { source: "sweetrobin", target: "littlefinger", rel: "Littlefinger is slowly poisoning Robin with sweetsleep. Robin's death would make Harry the Heir Lord of the Vale." },
  // Jon Arryn
  { source: "jon_arryn", target: "robert", rel: "Foster father who raised Robert alongside Ned. Served as Robert's Hand for 14 years. His death started everything." },
  { source: "jon_arryn", target: "stannis", rel: "Together investigated Cersei's children's paternity. Jon Arryn's death silenced the truth until Ned arrived." },
  { source: "jon_arryn", target: "lysa", rel: "Husband and wife. Lysa poisoned Jon on Littlefinger's orders, then wrote to Catelyn blaming the Lannisters." },
  // Qhorin
  { source: "qhorin", target: "mance", rel: "Qhorin knew Mance from when Mance was still a brother of the Night's Watch. Old enemies who understood each other." },
  // Gilly
  { source: "gilly", target: "craster", rel: "Gilly is one of Craster's daughter-wives. Sam rescued her and her newborn son during the mutiny at Craster's Keep." },
  { source: "gilly", target: "jon", rel: "Jon ordered Sam to take Gilly south, fearing for the baby (who Melisandre wanted for his king's blood)." },
  // Coldhands
  { source: "coldhands", target: "bloodraven", rel: "Coldhands serves the Three-Eyed Crow and escorts Bran's party to his cave. An ancient wight on a mission." },
  { source: "coldhands", target: "sam", rel: "Coldhands rescued Sam and Gilly near the Nightfort and guided them to the Black Gate through the Wall." },
  // Pycelle
  { source: "pycelle", target: "tywin", rel: "Secret Lannister loyalist for decades. Pycelle fed information to Tywin and helped ensure Lannister dominance of the Small Council." },
  { source: "pycelle", target: "cersei", rel: "Pycelle served Cersei as a spy and enabler. Tyrion exposed and briefly imprisoned him." },
  { source: "pycelle", target: "tyrion", rel: "Tyrion discovered Pycelle was Cersei's spy and had him thrown in the black cells. Pycelle despised him afterward." },
  // Thoros
  { source: "thoros", target: "arya", rel: "Thoros and the Brotherhood captured Arya. She witnessed Beric's resurrection — her first encounter with genuine magic." },
  { source: "thoros", target: "hound", rel: "Thoros and the Brotherhood captured the Hound and held a trial by combat where Beric fought him." },
  // Syrio
  { source: "syrio", target: "ned", rel: "Ned hired Syrio to teach Arya the Braavosi water dance. One of Ned's best decisions — it saved Arya's life." },
  // Penny
  { source: "penny", target: "jorah", rel: "Penny, Tyrion, and Jorah were captured and sold as slaves together, performing in the fighting pits." },
  // Septon Meribald
  { source: "septon_meribald", target: "brienne", rel: "Guided Brienne through the war-torn Riverlands. Delivered the 'broken men' speech — one of the most powerful passages in the series." },
  // Howland
  { source: "howland", target: "rhaegar", rel: "Howland was at the Tower of Joy and knows what happened. He potentially holds the key to Jon's true parentage." },
  // Lady Dustin
  { source: "lady_dustin", target: "roose", rel: "Bolton ally who hates the Boltons almost as much as the Starks. Plays all sides while nursing old grievances." },
  // Jeyne Poole
  { source: "jeyne_poole", target: "sansa", rel: "Sansa's childhood best friend, passed off as Arya and married to Ramsay. Her storyline is given to Sansa in the show." },
  { source: "jeyne_poole", target: "littlefinger", rel: "After the Stark household was destroyed, Littlefinger took Jeyne and eventually delivered her to the Boltons as 'Arya Stark.'" },
  // Victarion
  { source: "victarion", target: "balon", rel: "Brothers. Victarion served as Balon's Lord Captain of the Iron Fleet." },
  // Quentyn
  { source: "quentyn", target: "barristan", rel: "Quentyn's failed attempt to steal a dragon forced Barristan to deal with the aftermath — loose dragons and a dying prince." },
  // Bloodraven
  // Aegon V connections
  // Melisandre
  { source: "melisandre", target: "davos", rel: "Philosophical opposites. Davos distrusts Melisandre's magic; she sees him as a hindrance to Stannis's destiny. They grudgingly respect each other." },
  { source: "melisandre", target: "mance", rel: "In the books, Melisandre glamours Mance as Rattleshirt and sends him to Winterfell on a secret mission." },
  // Davos
  // Edmure
  { source: "edmure", target: "jaime", rel: "Jaime negotiated Riverrun's surrender by threatening Edmure's infant son. Edmure yielded to save his child." },
  { source: "edmure", target: "walder_frey", rel: "Married Roslin Frey at the Red Wedding. Taken captive, his wife and unborn child used as leverage." },
  // Blackfish
  { source: "blackfish", target: "jaime", rel: "The Blackfish held Riverrun against Jaime's siege. Refused all terms. In the books he escapes; the show kills him." },
  { source: "blackfish", target: "edmure", rel: "Uncle and nephew. The Blackfish was furious when Edmure surrendered Riverrun." },
  // Loras
  { source: "loras", target: "margaery", rel: "Siblings. Loras is fiercely protective of Margaery and devastated when the Faith arrests her." },
  { source: "loras", target: "cersei", rel: "Cersei despises Loras and manipulates events to have the Faith arrest him for his relationship with Renly." },
  // Tormund
  { source: "tormund", target: "stannis", rel: "Stannis's cavalry crushed Tormund's wildlings at the Wall. Later, under Jon's agreement, Tormund leads the free folk through." },
  // Ygritte
  { source: "ygritte", target: "tormund", rel: "Fellow wildlings and comrades-in-arms during the march on the Wall. Tormund cared for Ygritte like family." },
  // Craster
  // Maester Aemon
  { source: "maester_aemon", target: "dany", rel: "In his final delirium, Aemon whispered about Daenerys and realized she might be the prince that was promised." },
  // Illyrio
  { source: "illyrio", target: "connington", rel: "Illyrio and Connington jointly raised Aegon/Young Griff. Illyrio funded the operation from Pentos." },
  // Arianne
  // Benjen
  { source: "benjen", target: "jon", rel: "Uncle who encouraged Jon to consider the Night's Watch. His disappearance beyond the Wall is one of the series' enduring mysteries." },
  { source: "benjen", target: "mormont_jeor", rel: "Benjen served under Mormont as First Ranger. His disappearance prompted the Great Ranging." },
  // Asha
  { source: "asha", target: "stannis", rel: "Captured by Stannis at Deepwood Motte. She argues for Theon's life when Stannis plans to execute him." },
  // Lancel
  // High Sparrow
  { source: "high_sparrow", target: "margaery", rel: "Arrested Margaery on charges of fornication engineered by Cersei. Her imprisonment was a political weapon." },
  { source: "high_sparrow", target: "tommen", rel: "The High Sparrow gained influence over young King Tommen, using religious authority to check royal power." },
  // Beric
  { source: "beric", target: "hound", rel: "Beric fought the Hound in a trial by combat, wielding a flaming sword. The Hound killed him — but Thoros brought him back." },
  // Tommen
  // Aegon the Conqueror
  { source: "aegon_c", target: "rhaegar", rel: "Aegon founded the dynasty that Rhaegar's actions would ultimately destroy — and potentially restore through his son." },
  // Jaqen
  // Gendry
  { source: "gendry", target: "ned", rel: "Ned visited Gendry's forge while investigating Jon Arryn's death. Gendry's black hair proved Baratheon blood runs true." },
  // Manderly
  { source: "manderly", target: "ramsay", rel: "Manderly appears to serve the Boltons while plotting to destroy them from within. Fed the Freys to the Boltons in pies at Ramsay's wedding." },

  // ── LYANNA STARK ──
  { source: "lyanna", target: "ned", rel: "Sister and brother. Ned found Lyanna dying at the Tower of Joy and made a promise to protect her newborn son Jon. 'Promise me, Ned.' He kept that secret for fourteen years, letting the world believe Jon was his bastard." },
  { source: "lyanna", target: "rhaegar", rel: "The central mystery. Did Rhaegar abduct her or did they elope for love? Their union produced Jon Snow. Rhaegar gave her a crown of winter roses at the Tourney at Harrenhal, passing over his wife Elia. This act destroyed a dynasty." },
  { source: "lyanna", target: "robert", rel: "Robert's betrothed. Her 'abduction' drove Robert to war. He loved her — or loved the idea of her. 'In my dreams, I kill him every night,' he says of Rhaegar. Ned knew Robert never truly knew her." },
  { source: "lyanna", target: "jon", rel: "Mother and son. Lyanna gave birth to Jon at the Tower of Joy, making him the son of Rhaegar Targaryen and potentially the heir to the Iron Throne. The secret Ned kept his entire life." },
  { source: "lyanna", target: "howland", rel: "Howland Reed was at the Tower of Joy with Ned. He is the only living person besides Bran who knows the truth about Lyanna's death and Jon's birth." },

  // ── ELIA MARTELL ──
  { source: "elia", target: "rhaegar", rel: "Wife and husband. Rhaegar left Elia for Lyanna, humiliating her publicly. Whether he annulled their marriage or took a second wife (Targaryen custom) is debated. Elia bore him two children before Lyanna." },
  { source: "elia", target: "oberyn", rel: "Brother and sister. Oberyn adored Elia and spent his life seeking vengeance for her murder. He came to King's Landing specifically to confront the Mountain and Tywin. Her death drove everything Oberyn did." },
  { source: "elia", target: "mountain", rel: "Gregor Clegane raped and murdered Elia during the Sack of King's Landing, after smashing her infant son's head against a wall. Tywin ordered it. The most horrifying act of the war." },
  { source: "elia", target: "tywin", rel: "Tywin ordered the murders of Elia and her children to prove Lannister loyalty to Robert and eliminate Targaryen heirs. He never admitted giving the order directly." },
  { source: "elia", target: "doran", rel: "Doran's sister. Her murder drove his secret fourteen-year plot for Targaryen restoration. 'Vengeance. Justice. Fire and blood.' Everything Doran does is for Elia." },

  // ── SER DUNCAN THE TALL ──
  { source: "duncan_tall", target: "aegon_v", rel: "Knight and squire, lifelong companions. Dunk swore to protect Egg and never stopped. They traveled Westeros together in the Dunk & Egg novellas. Both died together at the Tragedy of Summerhall." },
  { source: "duncan_tall", target: "baelor_bp", rel: "Baelor Breakspear championed Dunk in the trial of seven at Ashford, believing in his honor. Baelor died from a blow in that trial — the crown prince killed defending a hedge knight." },
  { source: "duncan_tall", target: "brienne", rel: "Brienne may be descended from Dunk. She finds a shield in her story with the same sigil Dunk once carried — an elm tree and a falling star. Their parallel stories of unglamorous, stubborn honor echo across a century." },
  { source: "duncan_tall", target: "aerion", rel: "Dunk struck Prince Aerion for attacking a puppeteer, leading to the trial of seven at Ashford. This act of defiance against royalty defined Dunk's character — and nearly killed him." },

  // ── ALLISER THORNE ──
  { source: "alliser", target: "jon", rel: "Thorne bullied and antagonized Jon from the day he arrived at Castle Black. Eventually led the mutiny that killed Jon. A man whose resentment of privilege curdled into deadly hatred." },
  { source: "alliser", target: "mormont_jeor", rel: "Thorne served under Mormont but resented his authority. Mormont sent Thorne to King's Landing with a wight's hand as proof of the threat — no one listened." },

  // ── BOWEN MARSH ──
  { source: "bowen", target: "jon", rel: "The First Steward who stabbed Jon Snow, weeping as he did it. 'For the Watch.' He believed Jon's decisions — saving wildlings, involving the Watch in politics — would destroy the institution." },

  // ── RANDYLL TARLY ──
  { source: "randyll", target: "sam", rel: "Father and son. Randyll considered Sam a disgrace and gave him a choice: take the black or die in a hunting 'accident.' His cruelty shaped everything Sam became." },
  { source: "randyll", target: "robert", rel: "Randyll Tarly defeated Robert Baratheon at the Battle of Ashford — the only battle Robert ever lost. One of the finest military commanders in Westeros." },
  { source: "randyll", target: "mace", rel: "Randyll commands Mace Tyrell's vanguard and does the real fighting while Mace takes the credit. He is the Tyrell army's true military strength." },

  // ── ILYN PAYNE ──
  { source: "ilyn", target: "ned", rel: "Ilyn Payne beheaded Ned Stark with Ned's own sword, Ice, on the steps of the Great Sept of Baelor. He has been on Arya's kill list ever since." },
  { source: "ilyn", target: "jaime", rel: "After losing his hand, Jaime trains with Ilyn Payne in private; Ilyn's muteness means he cannot reveal how badly Jaime fights at first. An unlikely but fitting sparring partner." },
  { source: "ilyn", target: "arya", rel: "On Arya's kill list for executing her father. She recites his name nightly." },
  { source: "ilyn", target: "aerys", rel: "Aerys had Ilyn's tongue torn out with hot pincers for joking that Tywin was the true ruler of the realm." },

  // ── VAL ──
  { source: "val", target: "jon", rel: "Jon is clearly attracted to Val and she to him. Stannis wants to marry her to a lord to bind the wildlings to the realm. She is fierce, beautiful, and politically important." },
  { source: "val", target: "mance", rel: "Val is Dalla's sister and Mance's sister-in-law. She cares for Mance's infant son after Dalla dies in childbirth during the battle at the Wall." },
  { source: "val", target: "stannis", rel: "Stannis considers Val a 'wildling princess' and a political asset to be married off. Val and the free folk reject the concept entirely." },

  // ── STRONG BELWAS ──
  { source: "belwas", target: "dany", rel: "Dany's loyal champion. Fought Meereen's hero Oznak zo Pahl before the city gates, defeating him easily. Ate the poisoned locusts at Daznak's Pit — locusts likely meant for Dany — and barely survived." },
  { source: "belwas", target: "barristan", rel: "Sent together by Illyrio to find Dany. Barristan posed as Belwas's squire 'Arstan Whitebeard.' An unlikely pair — the greatest knight and the greatest pit fighter." },

  // ── PATCHFACE ──
  { source: "patchface", target: "shireen", rel: "Patchface is Shireen's companion and playmate. She loves him. Melisandre sees him in her flames surrounded by skulls, and is deeply afraid of the fool." },
  { source: "patchface", target: "melisandre", rel: "Melisandre sees Patchface in her flames and considers him a servant of darkness. 'That creature is dangerous. Many a time I have glimpsed him in my flames. Sometimes there are skulls about him.'" },
  { source: "patchface", target: "stannis", rel: "Patchface washed ashore at Dragonstone after the shipwreck that killed Stannis's parents. He drowned for three days and came back changed, singing his eerie prophetic songs." },

  // ── MARWYN ──
  { source: "marwyn", target: "sam", rel: "When Sam arrives at the Citadel with news of Dany's dragons, Marwyn immediately sails east to find her — warning Sam that the other maesters will try to kill the dragons." },
  { source: "marwyn", target: "dany", rel: "Marwyn sails for Meereen to serve Dany, believing in magic and dragons while the rest of the Citadel seeks to suppress both." },
  { source: "marwyn", target: "qyburn", rel: "Qyburn once studied under Marwyn at the Citadel. Both were interested in the forbidden — magic, necromancy, the boundaries of life and death." },

  // ── BROWN BEN PLUMM ──
  { source: "brown_ben", target: "dany", rel: "Defected to Dany's side, then defected back to Yunkai when her position weakened. Claims distant Targaryen blood — Dany's dragons were calm around him. The ultimate fair-weather ally." },
  { source: "brown_ben", target: "tyrion", rel: "Tyrion encounters Brown Ben in the siege camps outside Meereen and uses his wit to survive among the sellswords." },

  // ── RHAELLA TARGARYEN ──
  { source: "rhaella", target: "aerys", rel: "Wife and sister. Aerys abused Rhaella horribly — the Kingsguard could hear her screams but were sworn to do nothing. Jaime's inability to protect her haunts him." },
  { source: "rhaella", target: "dany", rel: "Mother and daughter. Rhaella died giving birth to Dany on Dragonstone during the great storm that gave Dany the name 'Stormborn.'" },
  { source: "rhaella", target: "rhaegar", rel: "Mother and son. Rhaella watched Rhaegar grow from a bookish boy into a warrior prince obsessed with prophecy." },
  { source: "rhaella", target: "viserys", rel: "Mother and son. Rhaella fled King's Landing with young Viserys while pregnant with Dany. Viserys grew up bitter and cruel without her guidance after her death." },

  // ── SHAE ──
  { source: "shae", target: "tyrion", rel: "Tyrion's lover, hidden in King's Landing. At his trial she testified that he had planned to murder Joffrey. Tyrion found her in Tywin's bed and strangled her with the Hand's chain. Her betrayal — or survival instinct — broke something in Tyrion permanently." },
  { source: "shae", target: "tywin", rel: "Found in Tywin's bed by Tyrion, despite Tywin's lifelong condemnation of whores. The hypocrisy was the final trigger for Tyrion to kill his father." },
  { source: "shae", target: "sansa", rel: "Shae served as Sansa's handmaiden in King's Landing. Whether she was genuinely fond of Sansa or always playing a role remains ambiguous." },

  // ── TYSHA ──
  { source: "tysha", target: "tyrion", rel: "Tyrion's first wife, married at thirteen. Tywin declared her a whore and had his garrison rape her. Jaime later confessed she was real — never a whore. 'Wherever whores go' becomes Tyrion's obsessive refrain across Essos." },
  { source: "tysha", target: "tywin", rel: "Tywin orchestrated Tysha's gang rape to teach Tyrion a lesson about marrying beneath his station. This act — more than anything else — is why Tyrion killed him." },
  { source: "tysha", target: "jaime", rel: "Jaime lied to Tyrion for years, claiming Tysha was a whore he'd arranged. His confession of the truth in the dungeons shattered their relationship and sent Tyrion spiraling." },

  // ── MAESTER LUWIN ──
  { source: "luwin", target: "bran", rel: "Served as Bran's advisor and protector after Ned left for King's Landing. Skeptical of magic but loyal to the end. Died in the godswood after Winterfell's sack." },
  { source: "luwin", target: "theon", rel: "Counseled Theon against seizing Winterfell, and later against his escalating cruelty. Theon ignored him. Luwin was wounded when Ramsay's men stormed the castle." },
  { source: "luwin", target: "rickon", rel: "In his dying breath, Luwin told Osha to split up Bran and Rickon so they couldn't both be captured. His last act saved the youngest Stark." },

  // ── RODRIK CASSEL ──
  { source: "rodrik", target: "ned", rel: "Winterfell's master-at-arms for decades, loyal to Ned. Trained all the Stark children in combat." },
  { source: "rodrik", target: "theon", rel: "Led a force to retake Winterfell from Theon. Betrayed and killed by Ramsay Bolton, who turned his men on Rodrik's during a parley." },
  { source: "rodrik", target: "ramsay", rel: "Ramsay arrived at Winterfell pretending to be an ally, then slaughtered Rodrik's forces. Rodrik died cursing Theon as a turncloak." },

  // ── OLD NAN ──
  { source: "old_nan", target: "bran", rel: "Told Bran stories of the Others, the Long Night, the last hero, and the Night's King. Bran thought they were fairy tales. They were all true." },
  { source: "old_nan", target: "hodor", rel: "Old Nan is Hodor's great-grandmother. She has served Winterfell for so long that no one remembers when she arrived." },

  // ── GREATJON UMBER ──
  { source: "greatjon", target: "robb", rel: "'The King in the North!' The Greatjon drew his sword and declared Robb king — the first to kneel. Earlier, Grey Wind bit off two of his fingers when he threatened Robb, and the Greatjon laughed it off." },
  { source: "greatjon", target: "walder_frey", rel: "Captured at the Red Wedding after killing several Freys with his bare hands. They needed six men to subdue him." },

  // ── MAEGE MORMONT ──
  { source: "maege", target: "robb", rel: "One of Robb's most loyal bannermen. Robb sent her north with his will — which likely names Jon as his heir. Her whereabouts remain unknown." },
  { source: "maege", target: "howland", rel: "Robb sent Maege and Galbart Glover to find Howland Reed at Greywater Watch, carrying his will. Whether they succeeded is one of the books' open questions." },

  // ── DACEY MORMONT ──
  { source: "dacey", target: "robb", rel: "Danced with Robb at the Twins just before the slaughter began. Murdered at the Red Wedding — one of the most personally felt deaths." },
  { source: "dacey", target: "maege", rel: "Mother and daughter. Dacey was Maege's eldest and heir to Bear Island." },

  // ── DOLOROUS EDD ──
  { source: "edd", target: "jon", rel: "One of Jon's closest friends at the Wall. Loyal through everything — the ranging, the election, the wildling crisis. His pessimistic humor lightens Jon's darkest moments." },
  { source: "edd", target: "sam", rel: "Friends and fellow stewards. Edd and Sam share the unglamorous work of the Watch while their friend Jon leads." },
  { source: "edd", target: "grenn", rel: "Fellow Night's Watch brothers and friends. Part of Jon's core group at Castle Black." },

  // ── DONAL NOYE ──
  { source: "donal", target: "jon", rel: "Donal counseled Jon early at the Watch, telling him to stop beating the other recruits — they didn't have his advantages. Shaped Jon into a leader." },
  { source: "donal", target: "robert", rel: "Donal forged Robert Baratheon's warhammer — the weapon that killed Rhaegar at the Trident. He famously assessed the three Baratheon brothers: Robert was true steel, Stannis iron, Renly copper." },
  { source: "donal", target: "stannis", rel: "Donal lost his arm at the siege of Storm's End during Robert's Rebellion, where Stannis was besieged. He called Stannis 'iron — hard and strong, but brittle.'" },

  // ── PYP & GRENN ──
  { source: "pyp", target: "jon", rel: "One of Jon's first friends at Castle Black. A former mummer's boy with quick wit and sharp ears." },
  { source: "grenn", target: "jon", rel: "Jon's loyal friend, strong and simple. In the show, dies heroically holding the tunnel gate against a giant." },
  { source: "pyp", target: "grenn", rel: "Inseparable friends and brothers of the Watch. They represent the common men who make up the Watch's true strength." },

  // ── VARAMYR SIXSKINS ──
  { source: "varamyr", target: "mance", rel: "Served Mance as a skinchanger, controlling animals in battle. After Mance's defeat, Varamyr tried to steal a wildling woman's body through warging — and failed." },
  { source: "varamyr", target: "jon", rel: "Varamyr's prologue chapter establishes the rules of skinchanging that apply to Jon's fate — the 'second life' a warg can live inside an animal after death." },

  // ── RATTLESHIRT ──
  { source: "rattleshirt", target: "mance", rel: "Melisandre glamoured Rattleshirt to look like Mance and burned him alive. The real Mance, disguised as Rattleshirt, was sent to Winterfell on a secret mission." },
  { source: "rattleshirt", target: "melisandre", rel: "Melisandre used her ruby glamour to make Rattleshirt appear as Mance, then burned 'Mance' publicly. Only she, Jon, and a few others knew the truth." },
  { source: "rattleshirt", target: "jon", rel: "Jon knew the man burned was actually Rattleshirt, not Mance. This secret weighed heavily on him as Lord Commander." },

  // ── QUAITHE ──
  { source: "quaithe", target: "dany", rel: "Appears to Dany in visions across multiple books, delivering cryptic prophecies. 'To go north, you must go south. To reach the west, you must go east.' Her warnings guide Dany's path but are never fully understood." },
  { source: "quaithe", target: "jorah", rel: "Quaithe warned Jorah about treachery around Dany: 'The glass candles are burning. Soon comes the pale mare, and after her the others.' She seems to know everything." },

  // ── XARO XHOAN DAXOS ──
  { source: "xaro", target: "dany", rel: "Sheltered Dany in Qarth and proposed marriage to claim a dragon. Later arrived in Meereen bearing gifts and threats. When Dany refused to leave, Qarth declared war. His empty ship was a veiled insult." },

  // ── DARKSTAR ──
  { source: "darkstar", target: "myrcella", rel: "Slashed Myrcella's face during Arianne's failed Queenmaker plot, scarring the princess and ruining the plan. Fled into the desert and is hunted in TWOW." },
  { source: "darkstar", target: "arianne", rel: "Participated in Arianne's Queenmaker plot to crown Myrcella. His attack on Myrcella was unauthorized and destroyed Arianne's plan." },
  { source: "darkstar", target: "hotah", rel: "Doran sends Areo Hotah to hunt Darkstar after his attack on Myrcella. Their confrontation is set up for The Winds of Winter." },

  // ── AREO HOTAH ──
  { source: "hotah", target: "doran", rel: "Doran's loyal captain of guards. Hotah is bonded to his longaxe and has served Doran for decades, carrying out his quiet orders without question." },
  { source: "hotah", target: "arianne", rel: "Hotah arrested Arianne when her Queenmaker plot was exposed. Despite his affection for her, his loyalty to Doran is absolute." },

  // ── HARRY THE HEIR ──
  { source: "harry", target: "sansa", rel: "Littlefinger's plan: reveal Sansa's identity and marry her to Harry. When Sweetrobin dies, Harry inherits the Vale, and Sansa — as a Stark — reclaims the North. A political masterstroke if it works." },
  { source: "harry", target: "sweetrobin", rel: "Harry is Robert Arryn's heir presumptive. Littlefinger is slowly poisoning Sweetrobin with sweetsleep to clear the way for Harry — and Sansa." },
  { source: "harry", target: "littlefinger", rel: "Harry is the centerpiece of Littlefinger's endgame in the Vale. Through Harry and Sansa, Littlefinger aims to control both the Vale and the North." },

  // ── JEYNE WESTERLING ──
  { source: "jeyne_w", target: "robb", rel: "Robb married Jeyne after she comforted him, breaking his Frey betrothal. In the books she survives the Red Wedding (unlike Talisa in the show). It is suggested in the text that her mother may have been giving her moon tea, possibly on Tywin's orders; not confirmed." },
  { source: "jeyne_w", target: "walder_frey", rel: "Robb's marriage to Jeyne was the insult that gave Walder Frey justification for the Red Wedding. 'He broke his vow.'" },
  { source: "jeyne_w", target: "cat", rel: "Catelyn was furious that Robb married Jeyne, knowing it would cost them the Frey alliance. She was right." },

  // ── THE KETTLEBLACKS ──
  { source: "kettleblacks", target: "cersei", rel: "Cersei's agents. She paid them, slept with Osmund, and used Osney to seduce Margaery. When the scheme collapsed, the Kettleblacks' confessions helped bring Cersei down." },
  { source: "kettleblacks", target: "littlefinger", rel: "The Kettleblacks were originally Littlefinger's men, planted with Cersei. Their true loyalty was always to Petyr — another thread in his web." },
  { source: "kettleblacks", target: "margaery", rel: "Cersei ordered Osney to seduce Margaery and then confess to the High Sparrow. When Osney was tortured, he confessed about Cersei instead." },

  // ── DAEMON BLACKFYRE ──
  { source: "daemon_bf", target: "aegon_iv", rel: "Father and son. Aegon IV legitimized Daemon and gave him the Valyrian steel sword Blackfyre — the sword of Targaryen kings — fueling Daemon's claim to the throne." },
  { source: "daemon_bf", target: "bloodraven", rel: "Bloodraven's archers cut down Daemon and his twin sons on the Redgrass Field, ending the first Blackfyre Rebellion. The rivalry between Blackfyres and Bloodraven defined a generation." },
  { source: "daemon_bf", target: "young_griff", rel: "The central theory: is Young Griff truly Rhaegar's son Aegon, or a Blackfyre pretender descended from Daemon? Illyrio's wife Serra and his involvement suggest the latter." },

  // ── AEGON IV ──
  { source: "aegon_iv", target: "bloodraven", rel: "Father and bastard son. Aegon IV's deathbed legitimization of all his bastards — including Daemon and Bloodraven — plunged the realm into a century of Blackfyre rebellions." },
  { source: "aegon_iv", target: "aerys", rel: "Aegon IV's legacy of excess and illegitimate heirs destabilized the Targaryen dynasty for generations, contributing to the conditions that produced Aerys II's madness and paranoia." },

  // ── RHAENYRA TARGARYEN ──
  { source: "rhaenyra", target: "daemon_t", rel: "Uncle and niece, then husband and wife. Daemon was Rhaenyra's greatest champion and most dangerous ally. Together they fought for her claim in the Dance of the Dragons." },
  { source: "rhaenyra", target: "aegon_c", rel: "Both claimed descent from Aegon the Conqueror. Rhaenyra was her father's chosen heir, but the precedent of male-preference succession — set by a Great Council — was used against her." },

  // ── DAEMON TARGARYEN ──
  { source: "daemon_t", target: "aegon_c", rel: "Descendant of the Conqueror's line. Daemon rode Caraxes and embodied the Targaryen fire-and-blood ethos more than any prince of his era." },

  // ── BAELOR BREAKSPEAR ──
  { source: "baelor_bp", target: "maekar", rel: "Brothers. Maekar accidentally killed Baelor with a blow from his mace during the trial of seven at Ashford. The guilt haunted Maekar for the rest of his life." },
  { source: "baelor_bp", target: "aegon_v", rel: "Uncle and nephew. Baelor's death changed the line of succession, eventually leading to Egg's unlikely path to the throne." },

  // ── MAEKAR I ──
  { source: "maekar", target: "aegon_v", rel: "Father and son. Maekar was stern and harsh where Egg was kind. His death fighting an outlaw lord led to the Great Council that crowned Egg." },
  { source: "maekar", target: "aerion", rel: "Father and son. Maekar tolerated Aerion's cruelty until Dunk forced the issue at Ashford. Aerion was eventually exiled." },

  // ── AERION BRIGHTFLAME ──
  { source: "aerion", target: "aegon_v", rel: "Brothers. Aerion tormented Egg throughout their childhood. His death — drinking wildfire — removed a potential rival for the throne and cleared the way for Egg." },

  // ── RICKARD STARK ──
  { source: "rickard", target: "ned", rel: "Father and son. Rickard's murder by Aerys shaped Ned's entire worldview — honor, duty, and a deep distrust of southern politics." },
  { source: "rickard", target: "brandon_s", rel: "Father and son. Brandon rode south to save Lyanna; Rickard rode south to save Brandon. Both died together in Aerys's throne room." },
  { source: "rickard", target: "aerys", rel: "Aerys burned Rickard alive inside his own armor using wildfire as his 'champion' in a perverse trial by combat, while his son Brandon strangled himself trying to reach a sword to save him." },
  { source: "rickard", target: "lyanna", rel: "Father and daughter. Rickard betrothed Lyanna to Robert Baratheon. Her disappearance with Rhaegar set off the chain of events that killed him." },

  // ── BRANDON STARK (NED'S BROTHER) ──
  { source: "brandon_s", target: "cat", rel: "Cat was betrothed to Brandon before his death. She was meant to be Lady of Winterfell with the elder brother — Ned only married her because Brandon died." },
  { source: "brandon_s", target: "littlefinger", rel: "Young Petyr Baelish challenged Brandon to a duel for Catelyn's hand. Brandon nearly killed him. This humiliation — a lord's son swatting aside a minor lord's boy — is the seed of everything Littlefinger becomes." },
  { source: "brandon_s", target: "aerys", rel: "Brandon rode to King's Landing shouting for Rhaegar to 'come out and die.' Aerys arrested him for treason and murdered him alongside his father." },
  { source: "brandon_s", target: "lady_dustin", rel: "Barbrey Dustin was Brandon's lover before his death. She never forgave the Starks — Ned never returned her husband's bones from the Tower of Joy, adding personal insult to grief." },

  // ── JOANNA LANNISTER ──
  { source: "joanna", target: "tywin", rel: "The love of Tywin's life. Her death giving birth to Tyrion transformed Tywin from merely hard into truly merciless. 'The only woman he ever loved.'" },
  { source: "joanna", target: "tyrion", rel: "Died giving birth to Tyrion. Tywin and Cersei never forgave him for it. Tyrion carries this guilt: 'I killed my mother being born.'" },
  { source: "joanna", target: "cersei", rel: "Cersei idolized her mother and blames Tyrion for killing her. Joanna's death left Cersei without the one person who might have tempered her worst instincts." },
  { source: "joanna", target: "aerys", rel: "Aerys took 'liberties' with Joanna at her bedding and later made crude remarks about her. This estranged Tywin from his king. Theories persist that Aerys fathered one or more of Joanna's children." },

  // ── ELLARIA SAND ──
  { source: "ellaria", target: "oberyn", rel: "Lovers and partners. Ellaria watched Oberyn die in the most horrific way possible — his skull crushed by the Mountain. Despite this, she argues against continuing the cycle of vengeance." },
  { source: "ellaria", target: "sand_snakes", rel: "Mother of the four youngest Sand Snakes. In the books she opposes their calls for war: 'I saw your father die. No more.' The show inverts her character entirely." },
  { source: "ellaria", target: "doran", rel: "Ellaria pleads with Doran to end the cycle of vengeance. She is the moral counterweight to the Sand Snakes' rage and Doran's secret plotting." },

  // ── DONTOS HOLLARD ──
  { source: "dontos", target: "sansa", rel: "Sansa saved his life from Joffrey; in return, Dontos helped her escape King's Landing after the Purple Wedding, giving her the hairnet containing the poison. He believed himself her true rescuer." },
  { source: "dontos", target: "littlefinger", rel: "Littlefinger recruited Dontos to befriend Sansa and deliver her. Once the job was done, Littlefinger had him killed. 'A bag of dragons or a dirk in the back — a fool makes the best of tools.'" },

  // ── YOREN ──
  { source: "yoren", target: "arya", rel: "Grabbed Arya during Ned's execution, shielded her, and disguised her as a boy to take north. His protection was the only thing standing between Arya and capture. When he died, Arya's journey into violence truly began." },
  { source: "yoren", target: "amory", rel: "Amory Lorch attacked Yoren's group on the Kingsroad, killing Yoren and scattering the Night's Watch recruits. This led to Arya's capture and arrival at Harrenhal." },
  { source: "yoren", target: "ned", rel: "Yoren was at the Sept of Baelor when Ned was executed. He recognized Arya in the crowd and acted instantly to save her — the last decent act connected to Ned's death." },

  // ── RICKARD KARSTARK ──
  { source: "karstark", target: "robb", rel: "Robb executed Karstark for murdering Lannister squire-hostages. The honorable choice — it cost Robb half his army and arguably cost him the war." },
  { source: "karstark", target: "jaime", rel: "Karstark's two sons were killed by Jaime during his escape attempt. The loss drove Karstark mad with grief and into the act that got him executed." },
  { source: "karstark", target: "cat", rel: "Karstark blamed Catelyn for releasing Jaime — the man who killed his sons. His rage was understandable, even if his revenge was directed at innocents." },

  // ── THE SHAVEPATE ──
  { source: "shavepate", target: "dany", rel: "Shaved his head as a sign of loyalty to Dany's new regime. Commands the Brazen Beasts. Pushes for harsher methods against the Sons of the Harpy." },
  { source: "shavepate", target: "barristan", rel: "After Dany flies away, the Shavepate pushes Barristan toward a coup against Hizdahr. He may be manipulating the old knight for his own ends." },
  { source: "shavepate", target: "hizdahr", rel: "The Shavepate is convinced Hizdahr is behind the Sons of the Harpy. After Dany's disappearance, he helps Barristan arrest Hizdahr." },

  // ── THE WAIF ──
  { source: "waif", target: "arya", rel: "Trains Arya at the House of Black and White, teaching the lying game and beating her with a staff. Whether she is friend, instructor, or future enemy depends on whether Arya can truly become 'no one.'" },
  { source: "waif", target: "jaqen", rel: "Both serve in the House of Black and White. The Waif is further along in her training than Arya, more obedient to the Many-Faced God's demands." },

  // ── BRONZE YOHN ROYCE ──
  { source: "royce", target: "littlefinger", rel: "Deeply suspicious of Littlefinger's power in the Vale. Royce is the most powerful lord opposing Petyr's regency. If anyone can unravel Littlefinger's scheme, it's him." },
  { source: "royce", target: "sansa", rel: "Royce visited Winterfell before the story began. He may recognize Sansa despite her disguise as Alayne Stone — a ticking bomb for Littlefinger's plans." },
  { source: "royce", target: "sweetrobin", rel: "Royce serves as one of the Lords Declarant concerned about Sweetrobin's welfare under Littlefinger's guardianship." },

  // ── MERYN TRANT ──
  { source: "meryn", target: "sansa", rel: "Beat Sansa publicly in court on Joffrey's orders. Tyrion stopped him: 'I'm no stranger to threats. But I'm a stranger to gratitude.'" },
  { source: "meryn", target: "syrio", rel: "Syrio was last seen facing Meryn Trant when Lannister men came for Arya; Syrio fought guards with a wooden sword. Syrio's death is not confirmed on the page." },
  { source: "meryn", target: "arya", rel: "On Arya's kill list for killing Syrio. In the show, she kills him in Braavos — her first assassination using a face from the House of Black and White." },

  // ── AMORY LORCH ──
  { source: "amory", target: "elia", rel: "During the Sack of King's Landing, Amory Lorch killed the infant Princess Rhaenys, dragging her from under her father Rhaegar's bed. He stabbed her over fifty times." },
  { source: "amory", target: "arya", rel: "Arya used one of Jaqen H'ghar's three promised deaths on Amory Lorch at Harrenhal, after he killed Yoren and nearly discovered her identity." },
  { source: "amory", target: "tywin", rel: "Tywin used Lorch as a blunt instrument during the Sack. He later expressed disgust at how clumsily Lorch killed Rhaenys — not for the act itself, but for the mess." },

  // ── THE TICKLER ──
  { source: "tickler", target: "arya", rel: "Tortured prisoners at Harrenhal with his signature questions. Arya killed him, stabbing him while repeating every question: 'Is there gold in the village?' Her most visceral early kill." },
  { source: "tickler", target: "mountain", rel: "One of Gregor Clegane's men, assigned to extract information through torture. The Tickler represents the Mountain's casual cruelty by delegation." },

  // ── POLLIVER ──
  { source: "polliver", target: "arya", rel: "Stole Needle from Arya and killed her friend Lommy. She reclaimed Needle by killing Polliver with it, whispering Lommy's last words: 'Carry him? Carry him?'" },

  // ── VISENYA TARGARYEN ──
  { source: "visenya", target: "aegon_c", rel: "Elder sister-wife. The warrior queen who wielded Dark Sister and rode Vhagar. Founded the Kingsguard after a Dornish assassination attempt on Aegon. The iron to Rhaenys's silk." },
  { source: "visenya", target: "rhaenys_c", rel: "Sisters and co-queens. Visenya was the warrior, Rhaenys the diplomat and beloved. Their rivalry shaped early Targaryen court dynamics." },

  // ── RHAENYS (CONQUEROR'S SISTER) ──
  { source: "rhaenys_c", target: "aegon_c", rel: "Younger sister-wife, beloved by the smallfolk. Rode Meraxes. Died in Dorne when a scorpion bolt took Meraxes through the eye — the Conquest's greatest defeat." },

  // ── AEGON II ──
  { source: "aegon_ii", target: "rhaenyra", rel: "Half-siblings and mortal enemies. Aegon usurped Rhaenyra's claim, sparking the Dance of the Dragons. He fed her to his dragon Sunfyre. She called him a 'thief with a stolen crown.' The war destroyed both of them." },
  { source: "aegon_ii", target: "daemon_t", rel: "Aegon II's side killed Daemon's allies; Daemon's dragon Caraxes killed Aegon's brother Aemond and Vhagar over the Gods Eye." },

  // ── HOT PIE ──
  { source: "hot_pie", target: "arya", rel: "Traveled together from King's Landing with Yoren's recruits. Hot Pie was terrified, kind, and obsessed with bread. They parted at the Inn at the Crossroads — he stayed to bake." },
  { source: "hot_pie", target: "brienne", rel: "When Brienne stopped at the Inn at the Crossroads searching for Sansa, Hot Pie told her about Arya — giving her a wolf-shaped bread. A small act that connected two storylines." },
  { source: "hot_pie", target: "gendry", rel: "Fellow travelers with Arya on the Kingsroad. Hot Pie, Gendry, and Arya formed an unlikely band of survivors." },

  // ══════════════════════════════════════════════════════
  // DANCE OF THE DRAGONS RELATIONSHIPS
  // ══════════════════════════════════════════════════════

  // ── VISERYS I ──
  { source: "viserys_i", target: "rhaenyra", rel: "Father and daughter. Named Rhaenyra his heir and never revoked it, despite having sons by Alicent. His indecisive love for all his children made civil war inevitable." },
  { source: "viserys_i", target: "alicent", rel: "Husband and wife. Alicent was chosen (by Otto) to comfort the grieving king after Queen Aemma's death. Their marriage produced four children and split the realm." },
  { source: "viserys_i", target: "aegon_ii", rel: "Father and son. Viserys never named Aegon his heir despite pressure from the Greens. Whether Viserys truly changed his mind on his deathbed — as Alicent claimed — is the Dance's greatest ambiguity." },
  { source: "viserys_i", target: "daemon_t", rel: "Brothers. Viserys loved Daemon but feared his ambition. Exiled him repeatedly, yet never permanently. Their relationship was the most complicated in the Targaryen dynasty — love and distrust in equal measure." },
  { source: "viserys_i", target: "otto", rel: "King and Hand. Otto served Viserys capably but always with Hightower interests in mind. Viserys dismissed him once for pushing Aegon's claim, then Alicent brought him back." },
  { source: "viserys_i", target: "rhaenys_qnw", rel: "Cousins. The Great Council of 101 AC chose Viserys over Rhaenys, establishing the precedent that a male claim trumps a female one — the very precedent Viserys later tried to override for Rhaenyra." },
  { source: "viserys_i", target: "lyonel", rel: "King and Hand. Lyonel Strong replaced Otto as Hand and served Viserys honestly. His death at Harrenhal removed the only neutral advisor from the king's council." },

  // ── ALICENT HIGHTOWER ──
  { source: "alicent", target: "rhaenyra", rel: "Stepmother and stepdaughter, childhood friends turned mortal enemies. Their personal rivalry became the realm's political fault line. Whether ambition or genuine fear for her children drove Alicent is the heart of the story." },
  { source: "alicent", target: "aegon_ii", rel: "Mother and son. Alicent pushed the reluctant Aegon to claim the throne, insisting Rhaenyra would kill him and his siblings if she became queen." },
  { source: "alicent", target: "aemond", rel: "Mother and son. Aemond was Alicent's fiercest child — the one most willing to fight for the Green cause. His aggression both served and terrified her." },
  { source: "alicent", target: "helaena", rel: "Mother and daughter. Alicent married Helaena to Aegon II. When Blood and Cheese murdered Helaena's son, the guilt and grief consumed them both." },
  { source: "alicent", target: "criston", rel: "Close allies, possibly lovers. Criston became Alicent's devoted champion after his falling out with Rhaenyra. Together they engineered Aegon II's coronation." },
  { source: "alicent", target: "otto", rel: "Father and daughter. Otto placed Alicent at court to seduce the king. She spent her life executing her father's political vision — or trapped by it." },

  // ── AEGON II (additional edges) ──
  { source: "aegon_ii", target: "aemond", rel: "Brothers. Aemond served as Aegon's regent after Aegon was badly burned at Rook's Rest. Their alliance held the Green cause together, though Aemond's ambition grew dangerous." },
  { source: "aegon_ii", target: "helaena", rel: "Husband and sister-wife. An unhappy marriage. When their son was murdered by Blood and Cheese, Helaena's descent into madness mirrored Aegon's descent into cruelty." },
  { source: "aegon_ii", target: "criston", rel: "Criston Cole crowned Aegon with Aegon the Conqueror's crown, earning the name 'Kingmaker.' Cole was Aegon's Lord Commander and chief military commander until his death at the Butcher's Ball." },
  { source: "aegon_ii", target: "rhaenys_qnw", rel: "Enemies. Aegon and Aemond ambushed Rhaenys at Rook's Rest with two dragons against one. Rhaenys and Meleys fought ferociously. All three dragons fell; Rhaenys died, Aegon was horrifically burned." },
  { source: "aegon_ii", target: "larys", rel: "Larys served as Aegon's spymaster and closest advisor. He helped Aegon escape King's Landing when the Blacks took it and helped him retake the throne." },

  // ── AEMOND ──
  { source: "aemond", target: "daemon_t", rel: "The Dance's defining rivalry. They killed each other over the Gods Eye — Daemon leapt from Caraxes to Vhagar mid-air and drove Dark Sister through Aemond's remaining eye. All four (two riders, two dragons) died. The most legendary duel in Westerosi history." },
  { source: "aemond", target: "lucerys", rel: "Aemond lost his eye to Lucerys as a child and swore vengeance. When Luke came to Storm's End as an envoy, Aemond pursued him on Vhagar. Luke and Arrax died over Shipbreaker Bay. This killing turned a succession crisis into a civil war." },
  { source: "aemond", target: "laena", rel: "Aemond claimed Vhagar at Laena's funeral — the dragon that had been Laena's. This act enraged Laena's daughters Baela and Rhaena, and the resulting fight cost Aemond his eye." },

  // ── HELAENA ──
  { source: "helaena", target: "mysaria", rel: "Mysaria orchestrated the Blood and Cheese plot that destroyed Helaena. Assassins invaded the royal apartments and forced Helaena to choose which of her sons would die." },

  // ── CRISTON COLE ──
  { source: "criston", target: "rhaenyra", rel: "Rhaenyra's sworn shield turned bitter enemy. Whether he loved her, was scorned by her, or was disgusted by her is told differently in every source. Their falling out split the court." },
  { source: "criston", target: "daemon_t", rel: "Rivals. Criston defeated Daemon in a famous tourney and earned his enmity. Their personal hatred mirrored the Green-Black divide." },

  // ── LARYS STRONG ──
  { source: "larys", target: "harwin", rel: "Brothers. Larys almost certainly arranged the fire at Harrenhal that killed Harwin and their father Lyonel — murdering his own family to inherit the lordship and remove the evidence of Rhaenyra's affair." },
  { source: "larys", target: "lyonel", rel: "Father and son. Larys killed his own father in the Harrenhal fire. Lyonel was Hand of the King — his death removed a moderating influence from court." },

  // ── RHAENYRA (additional edges) ──
  { source: "rhaenyra", target: "alicent", rel: "Once childhood friends, their rivalry tore the realm apart. Rhaenyra saw Alicent as a usurper's mother; Alicent saw Rhaenyra as a threat to her children's lives." },
  { source: "rhaenyra", target: "laenor", rel: "First husband. A political marriage — Laenor preferred men, and Rhaenyra's children were almost certainly not his. The open secret of their arrangement gave the Greens their most potent weapon." },
  { source: "rhaenyra", target: "harwin", rel: "Rhaenyra's lover and the likely true father of Jacaerys, Lucerys, and Joffrey. Their affair was the realm's worst-kept secret. Harwin's death at Harrenhal removed the evidence — but the damage was done." },
  { source: "rhaenyra", target: "jacaerys", rel: "Mother and eldest son. Jace was Rhaenyra's most capable child, her chief diplomat and military commander. His death at the Battle of the Gullet devastated her." },
  { source: "rhaenyra", target: "corlys", rel: "Allied through marriage and mutual interest. Corlys provided the Velaryon fleet — the Blacks' greatest military asset. Their alliance was the backbone of Rhaenyra's cause." },
  { source: "rhaenyra", target: "mysaria", rel: "Mysaria served as Rhaenyra's mistress of whisperers in King's Landing, running a spy network. It was Mysaria who proposed the Blood and Cheese assassination as revenge for Lucerys." },
  { source: "rhaenyra", target: "nettles", rel: "Rhaenyra grew jealous (or suspicious) of Nettles's closeness with Daemon and ordered her killed. Daemon refused and helped Nettles escape — a betrayal that shattered what remained of Rhaenyra's trust." },

  // ── DAEMON (additional edges) ──
  { source: "daemon_t", target: "laena", rel: "Husband and wife. Daemon married Laena Velaryon after his first wife's death. They lived in Pentos and had twin daughters, Baela and Rhaena. Laena died in childbirth." },
  { source: "daemon_t", target: "mysaria", rel: "Daemon's first lover and longtime ally. Mysaria became his spymaster. He ordered the Blood and Cheese mission through her — a monstrous act of vengeance for Lucerys." },
  { source: "daemon_t", target: "nettles", rel: "Daemon and Nettles campaigned together hunting Aemond. Their relationship — protector, lover, father-figure — is deliberately ambiguous. He chose to save her over obeying Rhaenyra." },
  { source: "daemon_t", target: "baela", rel: "Father and daughter. Baela inherited Daemon's fearlessness — she attacked Aegon II on dragonback despite impossible odds." },
  { source: "daemon_t", target: "viserys_i", rel: "Brothers. Daemon loved Viserys but chafed under his cautious rule. Viserys repeatedly exiled and recalled him, unable to fully trust or fully abandon his brother." },
  { source: "daemon_t", target: "criston", rel: "Personal rivals. Criston unhorsed Daemon in a tourney, earning lasting enmity. Their mutual hatred helped split the court into factions." },

  // ── CORLYS VELARYON ──
  { source: "corlys", target: "rhaenys_qnw", rel: "Husband and wife. Their marriage combined Velaryon wealth with Targaryen blood. Rhaenys's death at Rook's Rest nearly broke Corlys, but he continued fighting for the Blacks." },
  { source: "corlys", target: "laenor", rel: "Father and son. Corlys arranged Laenor's marriage to Rhaenyra despite knowing it was a political match. Laenor's apparent death was a blow, though Corlys may have known the truth." },
  { source: "corlys", target: "laena", rel: "Father and daughter. Laena's death grieved Corlys deeply. Her daughter Baela became his link to the future." },
  { source: "corlys", target: "addam", rel: "Corlys claimed Addam was Laenor's bastard, but many believed Addam was actually Corlys's own son. Corlys fought to save Addam from Rhaenyra's purge of dragonseeds." },
  { source: "corlys", target: "jacaerys", rel: "Grandfather (officially). Despite the open secret of Jace's parentage, Corlys accepted him as heir to Driftmark and supported his diplomatic missions." },

  // ── JACAERYS ──
  { source: "jacaerys", target: "lucerys", rel: "Brothers. Jace sent Luke to Storm's End as an envoy — the mission that got him killed. Luke's death transformed Jace from diplomat to war leader." },
  { source: "jacaerys", target: "harwin", rel: "Almost certainly Harwin's biological son, though officially Laenor's. Jace's brown hair was the strongest evidence of his Strong parentage." },

  // ── LUCERYS ──
  { source: "lucerys", target: "laenor", rel: "Officially Laenor's son. Luke inherited Driftmark's claim, which Aemond and Vaemond Velaryon challenged based on his obvious Strong parentage." },

  // ── BAELA ──
  { source: "baela", target: "aegon_ii", rel: "Baela attacked Aegon II over Dragonstone on Moondancer, a dragon a fraction of Sunfyre's size. Both dragons fell. Baela survived, burned but unbroken." },
  { source: "baela", target: "laena", rel: "Daughter of Laena and Daemon. Lost her mother young. Inherited Laena's courage — perhaps the bravest dragonrider of the Dance." },
  { source: "baela", target: "jacaerys", rel: "Betrothed to Jacaerys. His death at the Gullet left her unmarried until after the Dance." },

  // ── HARWIN STRONG ──
  { source: "harwin", target: "lyonel", rel: "Father and son. Both died in the fire at Harrenhal — a fire set by Harwin's own brother Larys." },

  // ── MYSARIA ──
  { source: "mysaria", target: "daemon_t", rel: "Daemon's lover and spymaster. She orchestrated Blood and Cheese on his orders. Her network of spies in King's Landing was unmatched." },

  // ── ADDAM VELARYON ──
  { source: "addam", target: "laenor", rel: "Officially Laenor's bastard, though more likely Corlys's. Claimed Laenor's dragon Seasmoke, which lent credence to the Velaryon connection." },
  { source: "addam", target: "hugh", rel: "Fellow dragonseeds. When Hugh and Ulf betrayed the Blacks at Tumbleton, Addam remained loyal and died fighting to prove dragonseed honor." },
  { source: "addam", target: "nettles", rel: "Fellow dragonseeds who remained loyal to the Blacks when others turned traitor. Their loyalty cost Addam his life; Nettles survived by fleeing." },

  // ── NETTLES ──
  { source: "nettles", target: "aemond", rel: "Daemon and Nettles hunted Aemond across the Riverlands. Their campaign ended when Rhaenyra ordered Nettles killed and Daemon chose to save her instead." },

  // ── HUGH HAMMER ──
  { source: "hugh", target: "rhaenyra", rel: "Rhaenyra authorized the dragonseeds program that gave Hugh a dragon. He repaid her by betraying the Blacks at Tumbleton and trying to claim the throne for himself." },
  { source: "hugh", target: "ulf", rel: "Fellow traitors. Hugh and Ulf betrayed the Blacks together at Tumbleton, sacking the town they were sent to defend. Both died shortly after — treachery bought them nothing." },

  // ── ULF WHITE ──
  { source: "ulf", target: "rhaenyra", rel: "Another dragonseed who betrayed Rhaenyra. His treachery at Tumbleton proved that giving dragons to unknown bastards was as dangerous as Rhaenyra's enemies warned." },

  // ── DAERON THE DARING ──
  { source: "daeron_d", target: "aegon_ii", rel: "Brothers. Daeron was the best of Alicent's sons — brave and decent where Aegon was cruel and Aemond was savage. His death at Tumbleton was a genuine loss." },
  { source: "daeron_d", target: "alicent", rel: "Son and mother. Raised away from court in Oldtown, Daeron escaped the toxicity that warped his brothers. Alicent's youngest and arguably her finest child." },
];

// Normalize each edge to canon-aware shape: availability { books, tv }, descriptions { combined, books, tv }
function normalizeEdge(e) {
  const rel = e.rel || "";
  const availability = e.availability || {
    books: e.canon !== "tv",
    tv: e.canon !== "books",
  };
  return {
    ...e,
    availability,
    descriptions: e.descriptions || {
      combined: rel,
      books: (e.relBooks != null && String(e.relBooks).trim() !== "") ? e.relBooks : rel,
      tv: (e.relTv != null && String(e.relTv).trim() !== "") ? e.relTv : rel,
    },
  };
}
const normalizedGraphEdges = graphEdges.map(normalizeEdge);

// Canon mode: "combined" | "books" | "tv"
function getGraphNodesForCanon(nodes, mode) {
  if (mode === "combined") return nodes;
  if (mode === "books") return nodes.filter(n => n.canon === "both" || n.canon === "book");
  return nodes.filter(n => n.canon === "both");
}

function getGraphEdgesForCanon(edges, nodeIds, mode) {
  const idSet = new Set(nodeIds);
  return edges.filter(e => {
    const src = typeof e.source === "object" ? e.source.id : e.source;
    const tgt = typeof e.target === "object" ? e.target.id : e.target;
    if (!idSet.has(src) || !idSet.has(tgt)) return false;
    if (mode === "combined") return e.availability.books || e.availability.tv;
    if (mode === "books") return e.availability.books;
    return e.availability.tv;
  });
}

function getConnectionDescription(edge, mode) {
  const d = edge.descriptions || {};
  if (mode === "combined") return d.combined || edge.rel || "";
  if (mode === "books") return d.books || "";
  return d.tv || "";
}

function getConnectionsForCharacter(edges, characterId, mode) {
  return edges.filter(e => {
    const src = typeof e.source === "object" ? e.source.id : e.source;
    const tgt = typeof e.target === "object" ? e.target.id : e.target;
    return (src === characterId || tgt === characterId);
  });
}

function getConnectionCountForCanon(edges, characterId, mode) {
  return getConnectionsForCharacter(edges, characterId, mode).length;
}

// ═══════════════════════════════════════════════════════
// WORLD MAP — Interactive lore map of Planetos
// ═══════════════════════════════════════════════════════
const MAP_REGIONS = [
  { id: "north", name: "The North", path: "M 66,62 L 192,58 L 192,80 L 190,108 L 185,130 L 178,148 L 170,160 L 130,164 L 100,162 L 68,158 L 68,135 L 66,108 L 65,82 Z", color: "#6BAACC", desc: "The largest of the Seven Kingdoms, nearly as big as the other six combined. A cold, vast, sparsely populated land of ancient forests, frozen rivers, and endless moors. The Starks have ruled here for 8,000 years from Winterfell. The people keep the old gods and the traditions of the First Men." },
  { id: "riverlands", name: "The Riverlands", path: "M 100,162 L 130,164 L 170,160 L 175,172 L 180,190 L 178,210 L 168,228 L 150,240 L 128,232 L 108,218 L 96,200 L 92,182 Z", color: "#5080C0", desc: "The crossroads of Westeros — fertile, strategic, and endlessly fought over. Ruled by House Tully from Riverrun. Every war in Westeros bleeds through the Riverlands. Contains the Trident, the God's Eye, and Harrenhal — the cursed castle no lord can hold." },
  { id: "vale", name: "The Vale", path: "M 170,160 L 175,172 L 192,168 L 218,170 L 235,178 L 240,190 L 232,205 L 218,218 L 200,222 L 178,210 Z", color: "#88BBD8", desc: "A mountain fastness nearly impregnable behind the Bloody Gate and the Mountains of the Moon. House Arryn rules from the Eyrie, a castle so high in the mountains that attackers cannot reach it. The Vale stayed neutral in many wars, protected by geography." },
  { id: "westerlands", name: "The Westerlands", path: "M 92,182 L 96,200 L 108,218 L 128,232 L 118,258 L 102,275 L 75,268 L 60,248 L 58,228 L 62,210 L 66,195 Z", color: "#C9A83E", desc: "Hills and gold mines. House Lannister rules from Casterly Rock, carved into a great stone hill above the Sunset Sea. The wealthiest kingdom, their gold funds the Iron Throne's debts. 'A Lannister always pays his debts' — though the mines may have run dry." },
  { id: "crownlands", name: "The Crownlands", path: "M 150,240 L 168,228 L 200,222 L 215,235 L 208,252 L 200,262 L 180,258 Z", color: "#8B6914", desc: "The lands surrounding King's Landing, ruled directly by the Iron Throne. Includes Dragonstone in Blackwater Bay. Created by Aegon the Conqueror when he built his capital at the mouth of the Blackwater Rush." },
  { id: "stormlands", name: "The Stormlands", path: "M 180,258 L 200,262 L 208,278 L 216,300 L 222,325 L 215,345 L 192,350 L 170,340 L 158,315 L 155,285 Z", color: "#DAA520", desc: "Wind-lashed coasts and deep forests. House Baratheon rules from Storm's End, a castle so strong it has never fallen to siege. The storms that batter Shipbreaker Bay are legendary. The Baratheons seized the Stormlands after Aegon's Conquest destroyed the ancient Storm Kings." },
  { id: "reach", name: "The Reach", path: "M 75,268 L 102,275 L 118,258 L 150,240 L 155,270 L 158,305 L 155,330 L 140,350 L 115,348 L 90,350 L 68,342 L 55,325 L 48,300 L 50,278 Z", color: "#5A9E5A", desc: "The most fertile and populous kingdom, a land of green fields, vineyards, and chivalry. House Tyrell rules from Highgarden, having been raised from stewards to lords by Aegon after the Gardener kings burned at the Field of Fire. The Reach produces more food and more knights than any other region." },
  { id: "dorne", name: "Dorne", path: "M 140,350 L 155,330 L 170,340 L 192,350 L 215,345 L 232,352 L 250,360 L 248,374 L 232,388 L 210,398 L 188,400 L 168,392 L 152,378 Z", color: "#D48040", desc: "The southernmost kingdom — hot, arid, and fiercely independent. The only kingdom Aegon could not conquer with dragons. House Martell rules from Sunspear, using the title Prince instead of King. Dornish law allows equal primogeniture, and the Rhoynish influence makes their culture distinct from the rest of Westeros." },
  { id: "iron_islands", name: "The Iron Islands", path: "M 34,176 L 56,170 L 66,186 L 54,202 L 34,196 Z", color: "#4A8A8A", desc: "Harsh, rocky islands in Ironman's Bay. The ironborn follow the Drowned God and the Old Way — paying the iron price by taking what they want through reaving. House Greyjoy rules from Pyke. Once kings in their own right, they rose in failed rebellion under Balon Greyjoy." },
];

const MAP_LOCATIONS = [
  // ── THE WALL & BEYOND ──
  { x: 140, y: 58, name: "The Wall", region: "Beyond", color: "#aaccdd",
    lore: "A colossal structure of ice 700 feet high and 300 miles long, stretching from the Gorge in the west to the Shivering Sea in the east. Built by Brandon the Builder with the aid of giants and the Children of the Forest after the Long Night to keep the Others at bay. The Wall is woven with ancient spells — the dead cannot pass through it, and the weirwood Black Gate beneath the Nightfort only opens for sworn brothers. Nineteen castles line its southern face, but only three remain garrisoned: Castle Black, Eastwatch-by-the-Sea, and the Shadow Tower. The Night's Watch once numbered 10,000; by the time of the books, fewer than 1,000 remain — criminals, castoffs, and the occasional volunteer. The Wall weeps on warm days, its face slick with meltwater, yet it has endured for eight millennia.",
    rulers: [
    { name: "Brandon the Builder", period: "~8,000 BC", note: "Legendary founder. Raised the Wall with giants and the Children's magic." },
    { name: "The Night's King (13th LC)", period: "Ancient", note: "Wed a woman with skin white as moon. Ruled the Nightfort for 13 years. Brought down by the Stark King and King-Beyond-the-Wall." },
    { name: "998 Lord Commanders", period: "8,000 years", note: "From the first to Jon Snow. Oath: 'I am the sword in the darkness, the watcher on the walls.'" },
    { name: "Jeor Mormont", period: "Lord Commander until 299 AC", note: "The Old Bear. Led the Great Ranging. Killed by mutineers at Craster's Keep." },
    { name: "Jon Snow", period: "998th Lord Commander, 300 AC", note: "Let the wildlings through. Stabbed by his own men. 'For the Watch.'" },
  ]},
  { x: 130, y: 22, name: "The Lands of Always Winter", region: "Beyond the Wall", color: "#aaddee",
    lore: "The frozen wasteland at the uttermost north of the known world, beyond the furthest point any ranger or wildling has mapped. This is the domain of the Others — the White Walkers — beautiful, alien creatures of ice with eyes like blue stars, wielding crystal swords that shatter steel. In the books, their origins are entirely unknown. They have not been seen for 8,000 years until they began stirring again in the years before the story opens. No living man has ventured into these lands and returned to tell of it. Even the Children of the Forest abandoned the far north long ago.",
    rulers: [
      { name: "The Others", period: "Unknown", note: "Their nature, origins, and purpose remain the series' deepest mystery. The books have not revealed what they want." },
    ]},
  { x: 125, y: 42, name: "Fist of the First Men", region: "Beyond the Wall", color: "#8A9060",
    lore: "An ancient ringfort atop a hill, built by the First Men thousands of years ago. The Night's Watch camped here during the Great Ranging under Lord Commander Mormont. The ranging was a disaster — a massive army of wights attacked the camp, slaughtering dozens of brothers. The survivors retreated to Craster's Keep, where mutineers killed Mormont. Sam Tarly killed an Other here with a dragonglass dagger — the first to do so in living memory. The dragonglass cache found here suggests the Children of the Forest may have placed it deliberately.",
    rulers: [
      { name: "First Men", period: "Dawn Age", note: "Built the ringfort. Purpose unknown — possibly a defensive position against the Others." },
      { name: "Night's Watch camp", period: "299 AC", note: "Site of the catastrophic wight attack that destroyed the Great Ranging." },
    ]},
  { x: 178, y: 35, name: "Hardhome", region: "Beyond the Wall", color: "#8A9060",
    lore: "A ruined wildling settlement on a sheltered bay of the Shivering Sea. Six hundred years ago, it was the closest thing to a town the free folk ever had — growing rich on trade with ships from the east. Then, one night, hellish screams echoed across the water, and a glow was seen from the sea. When ships investigated, the settlement was in ashes. Corpses filled the bay. The cause of its destruction has never been determined — fire, plague, slavers, demons, or something worse. In the present, thousands of wildlings fleeing the Others have gathered here. Jon Snow sent ships to rescue them. Cotter Pyke's desperate letter back describes dead things in the water and dead things in the woods.",
    rulers: [
      { name: "Free Folk settlement", period: "Destroyed ~600 years ago", note: "Cause unknown. Hellish screams, then ashes." },
      { name: "Wildling refugees", period: "300 AC", note: "Thousands trapped between the sea and the Others." },
    ]},
  // ── THE NORTH ──
  { x: 132, y: 100, name: "Winterfell", region: "The North", color: "#6BAACC",
    lore: "The ancestral seat of House Stark for 8,000 years, built by Brandon the Builder over natural hot springs that heat its walls and glass gardens even in the deepest winter. The castle's godswood contains an ancient heart tree — a weirwood with a carved face that weeps red sap. The crypts beneath stretch for miles, holding the bones of every Stark lord and King of Winter, each guarded by a stone statue with an iron sword across its lap to keep vengeful spirits at rest. The oldest section, the First Keep, is a squat drum tower no longer in use. The Broken Tower was struck by lightning 140 years ago and never rebuilt — this is where Bran saw Jaime and Cersei. Winterfell's walls have never been breached by siege in 8,000 years — only by treachery when Theon took it, and burning when Ramsay sacked it.",
    rulers: [
      { name: "Brandon the Builder", period: "~8,000 BC", note: "Legendary founder. Built Winterfell over hot springs." },
      { name: "Kings of Winter", period: "~8,000 years", note: "Defeated the Red Kings (Boltons), drove giants from the north, repelled the Andals at Moat Cailin. Longest unbroken dynasty in Westeros." },
      { name: "King Theon Stark", period: "Ancient", note: "Defeated the Andal invader Argos Sevenstar, then sailed to Andalos to extract revenge." },
      { name: "Torrhen Stark", period: "Last King, knelt to Aegon ~2 BC", note: "The King Who Knelt rather than see his army burned by dragons." },
      { name: "Lord Cregan Stark", period: "~130 AC", note: "Marched south during the Dance of the Dragons. Served as Hand for one day — the Hour of the Wolf." },
      { name: "Eddard Stark", period: "Lord until 298 AC", note: "Went south as Hand. Never came back." },
      { name: "Robb Stark", period: "King in the North, 298—299 AC", note: "Won every battle. Murdered at the Red Wedding." },
      { name: "Theon Greyjoy", period: "Seized Winterfell, 299 AC", note: "Took it with 20 men. Ramsay sacked and burned it." },
      { name: "Roose Bolton", period: "Warden of the North, 300 AC", note: "Rebuilt the castle. Rules through fear and the farce of 'Arya Stark's' marriage to Ramsay." },
    ]},
  { x: 158, y: 115, name: "The Dreadfort", region: "The North", color: "#8B3040",
    lore: "The ancient seat of House Bolton along the Weeping Water — a castle whose very name inspires dread. For thousands of years, the Boltons were the Starks' most dangerous rivals. The Red Kings flayed their enemies alive and wore cloaks of human skin. One Bolton king allegedly had a cloak made from the skin of a Stark prince. The Starks eventually defeated them, but the Boltons never truly submitted. Their sigil — the flayed man — tells you everything. The Dreadfort's dungeons are legendary. Now the seat of Ramsay Bolton, the most sadistic man in Westeros.",
    rulers: [
      { name: "Red Kings (Bolton)", period: "Thousands of years", note: "Ancient Stark rivals. Wore cloaks of human skin." },
      { name: "Roose Bolton", period: "Current lord", note: "Leeches himself regularly. 'A peaceful land, a quiet people.'" },
      { name: "Ramsay Bolton", period: "Legitimized heir", note: "Tortured Theon into Reek. Hunts women with dogs for sport." },
    ]},
  { x: 180, y: 138, name: "White Harbor", region: "The North", color: "#6BAACC",
    lore: "The North's only true city and its primary port, built where the White Knife river meets the Bite. Seat of House Manderly, a unique northern house — originally from the Reach, they were exiled a thousand years ago and given lands by the Starks. The Manderlys are the only major northern house that follows the Seven instead of the old gods. They repaid the Starks' generosity with fierce loyalty that survives to this day. The New Castle overlooks the harbor. Lord Wyman Manderly appears to serve the Boltons but secretly plots vengeance for the Red Wedding, where his son was murdered. He baked three Frey men into pies and served them at Ramsay's wedding feast.",
    rulers: [
      { name: "House Manderly", period: "~1,000 years", note: "Exiled from the Reach. The Starks gave them White Harbor. They never forgot." },
      { name: "Wyman Manderly", period: "Current lord", note: "'The North remembers, Lord Davos. The mummer's farce is almost done.'" },
    ]},
  { x: 130, y: 158, name: "Moat Cailin", region: "The North", color: "#6BAACC",
    lore: "A ruined fortress guarding the causeway through the swamps of the Neck — the only dry road between the North and the South. In its prime, it had twenty towers and a great curtain wall. Now only three crumbling towers remain, but even in ruins it is nearly impregnable from the south: attackers must approach single-file through miles of swamp while archers rain arrows from above. The Children of the Forest are said to have used the Hammer of the Waters here to try to break the land apart, as they did at the Arm of Dorne. The Andals never passed Moat Cailin, which is why the North still keeps the old gods and the blood of the First Men runs strong.",
    rulers: [
      { name: "Ancient stronghold", period: "Dawn Age", note: "Where the Children tried to shatter the Neck with the Hammer of the Waters." },
      { name: "Key defensive position", period: "8,000 years", note: "Never taken from the south. The reason the North resisted the Andals." },
      { name: "Ironborn garrison", period: "299—300 AC", note: "Briefly held by ironborn during Greyjoy invasion. Ramsay took it through Theon's deception." },
    ]},
  { x: 112, y: 165, name: "Greywater Watch", region: "The North", color: "#607060",
    lore: "The mysterious seat of House Reed in the Neck — a crannog (floating castle) that moves through the swamps so no enemy can ever find it. No army has ever reached it. The crannogmen are small, reclusive people who fight with poisoned arrows, frog spears, and guerrilla tactics. They are considered the closest living descendants of the Children of the Forest's allies. Lord Howland Reed fought beside Ned at the Tower of Joy — the only other survivor — and may hold the secret of Jon Snow's true parentage. Despite being one of the most important living characters, Howland has never appeared on page.",
    rulers: [
      { name: "House Reed", period: "Ancient", note: "Loyal Stark bannermen since the Pact. The crannogmen keep the old ways." },
      { name: "Howland Reed", period: "Current lord", note: "Fought at the Tower of Joy. Father of Jojen and Meera. Holds Jon's secret." },
    ]},
  // ── THE RIVERLANDS ──
  { x: 128, y: 218, name: "Riverrun", region: "The Riverlands", color: "#5080C0",
    lore: "Seat of House Tully, a strong three-sided castle built at the confluence of the Tumblestone and the Red Fork of the Trident. Its unique defense: sluice gates can flood the surrounding land, turning the castle into an island. The Tullys were river lords for centuries but only became Lords Paramount when Aegon the Conqueror raised them for supporting his invasion against Harren the Black. During the War of the Five Kings, Riverrun served as Robb's base. After the Red Wedding, the Blackfish held it against a Lannister-Frey siege until Jaime negotiated its surrender through Edmure, threatening his infant son.",
    rulers: [
      { name: "House Tully", period: "Ancient lords, paramount from 1 AC", note: "Raised by Aegon after Harren's fall. Words: 'Family, Duty, Honor.'" },
      { name: "Hoster Tully", period: "Lord until 299 AC", note: "Joined Robert's Rebellion by marrying Catelyn to Ned, Lysa to Jon Arryn." },
      { name: "Edmure Tully", period: "Lord from 299 AC", note: "Married at the Red Wedding. Surrendered Riverrun as a captive." },
      { name: "Emmon Frey", period: "Granted Riverrun ~300 AC", note: "Installed by the Lannisters. The Blackfish calls him 'a wet goat.'" },
    ]},
  { x: 150, y: 192, name: "The Twins", region: "The Riverlands", color: "#7A7A6A",
    lore: "Two identical castles spanning the Green Fork of the Trident, connected by a great stone bridge and a water wheel. Seat of House Frey for 600 years — an upstart house that other lords mock as toll collectors. Lord Walder Frey, over 90 years old, has outlived seven wives and sired over a hundred descendants. He controls the only bridge crossing for hundreds of miles and never does anything without extracting a price. The Red Wedding — the murder of Robb Stark, Catelyn, and their bannermen under the sacred protection of guest right — occurred here. It was the most infamous violation of guest right in Westerosi history. Lady Stoneheart's Brotherhood now hunts Freys across the Riverlands.",
    rulers: [
      { name: "House Frey", period: "~600 years", note: "Built the bridge. Enriched by tolls. Despised by every other house." },
      { name: "Walder Frey", period: "Lord for 60+ years", note: "The Late Lord Frey — arrived late to Robert's Rebellion, late to everything. Orchestrated the Red Wedding." },
    ]},
  { x: 158, y: 238, name: "Harrenhal", region: "The Riverlands", color: "#555555",
    lore: "The largest castle ever built in Westeros — and the most cursed. Harren the Black of the Iron Islands spent 40 years constructing it using slave labor from the Riverlands. Its five towers were the tallest in the realm. It was completed the very day Aegon the Conqueror landed in Westeros. Aegon flew Balerion the Black Dread over its walls and melted its towers like candles. Harren and his sons burned alive inside. Since then, every house that has held Harrenhal has come to ruin — Qoherys, Harroway, Towers, Strong, Lothston, Whent. The castle is so vast that it cannot be properly garrisoned or maintained. Its kitchens can roast 40 oxen. Arya served as cupbearer here. Roose Bolton ruled from here. Littlefinger was granted the title but never visited.",
    rulers: [
      { name: "Harren the Black (Hoare)", period: "Completed 2 BC", note: "Burned alive by Balerion on completion day. 'Your walls are not so thick as that.'" },
      { name: "House Qoherys", period: "1—37 AC", note: "First Targaryen-appointed lord. Died in a rebellion." },
      { name: "House Harroway", period: "37—44 AC", note: "Entire family wiped out by Maegor the Cruel." },
      { name: "House Towers, then Strong", period: "44—130 AC", note: "The Strongs perished in a fire during the Dance." },
      { name: "House Lothston", period: "~200 AC", note: "Mad Danelle Lothston reportedly bathed in blood. Destroyed by a Targaryen army." },
      { name: "House Whent", period: "Until ~300 AC", note: "Hosted the great Tourney at Harrenhal where Rhaegar crowned Lyanna." },
      { name: "Petyr Baelish", period: "Granted ~300 AC", note: "Granted the title. Uses it for political leverage. Never visits." },
    ]},
  // ── THE VALE ──
  { x: 228, y: 192, name: "The Eyrie", region: "The Vale", color: "#88BBD8",
    lore: "A small, elegant castle perched atop the Giant's Lance — the tallest mountain in the Vale — 600 feet above the valley floor. It is accessible only by a narrow mule trail that passes through three waycastles: Stone, Snow, and Sky. No army in history has ever taken it. The Moon Door is a narrow weirwood door that opens onto empty sky — prisoners are executed by being pushed through it. The Eyrie is the seat of House Arryn, who claim descent from the Andal adventurer who married the daughter of the last Mountain King. The castle cannot be held in winter — the snow makes the path impassable — so the Arryns descend to the Gates of the Moon below. Littlefinger now rules as Lord Protector, slowly poisoning young Robert Arryn with sweetsleep.",
    rulers: [
      { name: "House Arryn", period: "~6,000 years", note: "Oldest Andal dynasty. Kings of Mountain and Vale. Words: 'As High as Honor.'" },
      { name: "Jon Arryn", period: "Lord until 298 AC", note: "Fostered Ned and Robert. Hand of the King. Poisoned by Lysa on Littlefinger's orders." },
      { name: "Robert 'Sweetrobin' Arryn", period: "Lord from 298 AC", note: "Sickly child lord. Littlefinger controls the Vale through him." },
      { name: "Petyr Baelish", period: "Lord Protector, 300 AC", note: "Married Lysa, pushed her through the Moon Door. Grooming Sansa for his schemes." },
    ]},
  // ── THE WESTERLANDS ──
  { x: 78, y: 242, name: "Casterly Rock", region: "The Westerlands", color: "#C9A83E",
    lore: "A colossal rock formation jutting out over the Sunset Sea, two leagues long from west to east and nearly three times the height of the Wall. The castle is carved into the rock itself, with tunnels, halls, dungeons, and mines honeycombing the interior. Legend says Lann the Clever — ancestor of the Lannisters — swindled Casterly Rock from House Casterly using nothing but his wits, though the stories vary: some say he stole into the Rock and whispered threats from the walls until the Casterlys fled; others say he filled it with lions. The gold mines of the Rock funded the Lannister wealth for millennia, though Tyrion believes they may have run dry. The seat has never been taken by force. Tywin Lannister ruled from here for decades, making House Lannister the most feared name in Westeros.",
    rulers: [
      { name: "House Casterly", period: "Ancient", note: "First rulers. Tricked out of their seat by Lann the Clever." },
      { name: "Lann the Clever", period: "Age of Heroes", note: "Legendary trickster. Founder of House Lannister. How he took the Rock is debated." },
      { name: "Lannister Kings of the Rock", period: "~6,000 years", note: "Among the wealthiest and most powerful kings in Westeros." },
      { name: "Tywin Lannister", period: "Lord until 300 AC", note: "Restored Lannister dominance after his father's weakness. Killed by Tyrion." },
      { name: "Cersei Lannister", period: "Lady from 300 AC", note: "Rules in name while imprisoned by the Faith in King's Landing." },
    ]},
  { x: 78, y: 258, name: "Lannisport", region: "The Westerlands", color: "#C9A83E",
    lore: "The largest city on Westeros's western coast, built at the base of Casterly Rock along a natural harbor. One of the major trading ports of the realm and the third largest city in Westeros after King's Landing and Oldtown. Governed by a cadet branch of House Lannister. During the Greyjoy Rebellion, Euron Greyjoy led a raid that burned the Lannister fleet at anchor — one of the few times the city has been seriously attacked. The gold road connects it to King's Landing.",
    rulers: [
      { name: "House Lannister (cadet branch)", period: "Ancient", note: "Governed under the Lords of Casterly Rock." },
    ]},
  // ── KING'S LANDING ──
  { x: 195, y: 255, name: "King's Landing", region: "The Crownlands", color: "#8B6914",
    lore: "The capital of the Seven Kingdoms, built on three hills — Aegon's High Hill (the Red Keep), Visenya's Hill (the Great Sept of Baelor), and Rhaenys's Hill (the Dragonpit) — at the mouth of the Blackwater Rush. Founded by Aegon the Conqueror, who built the Aegonfort where he first landed. Maegor the Cruel built the Red Keep and murdered every builder to keep its secrets. Half a million people live here, in a sprawl of mansions, markets, slums, and the infamous Flea Bottom where residents eat 'bowls of brown' — a mystery stew that may contain anything. Beneath the city lie miles of tunnels, forgotten dungeons, dragon skulls, and caches of wildfire placed by the Mad King. The Iron Throne itself, forged from a thousand swords melted by Balerion's dragonfire, sits in the Great Hall. The throne cuts unworthy kings — Maegor died impaled on it, and Aerys II cut himself so often the court called him King Scab.",
    rulers: [
      { name: "Aegon I Targaryen", period: "Founded ~2 AC", note: "Built the Aegonfort. Forged the Iron Throne from 1,000 enemy swords." },
      { name: "Maegor I, the Cruel", period: "42—48 AC", note: "Built the Red Keep. Murdered every builder. Found dead on the Iron Throne." },
      { name: "17 Targaryen Kings", period: "2—283 AC", note: "From Aegon I to Aerys II, the Mad King." },
      { name: "Robert Baratheon", period: "283—298 AC", note: "Took the throne by conquest. Hated ruling." },
      { name: "Joffrey Baratheon", period: "298—300 AC", note: "Product of incest. Sadistic. Poisoned at his wedding." },
      { name: "Tommen Baratheon", period: "300 AC—present", note: "Eight-year-old boy king. Controlled by Cersei, the Tyrells, and the Faith." },
    ]},
  { x: 222, y: 258, name: "Dragonstone", region: "The Crownlands", color: "#C44040",
    lore: "A volcanic island fortress in Blackwater Bay, the westernmost outpost of the Valyrian Freehold. The castle is built of fused black dragonstone, with walls shaped into dragons, gargoyles, and wyrms by Valyrian sorcery. The Targaryens established it as a trading post two centuries before the Doom, and it saved their family — they were the only dragonlords to survive. Daenerys was born here during a great storm that smashed the Targaryen fleet, earning her the name Stormborn. After Robert's Rebellion, it was given to Stannis (who resented getting it instead of Storm's End). Stannis burned the sept and the statues of the Seven here when he embraced R'hllor. The island's dragonglass deposits may prove crucial against the Others.",
    rulers: [
      { name: "Valyrian Freehold", period: "Pre-Doom", note: "Western outpost. The Targaryens moved here 12 years before the Doom on Daenys the Dreamer's prophecy." },
      { name: "House Targaryen", period: "~200 BC — 283 AC", note: "The seat from which Aegon launched his Conquest." },
      { name: "Stannis Baratheon", period: "283—300 AC", note: "Given by Robert. Burned the Seven. Base for his campaign." },
    ]},
  // ── STORMLANDS ──
  { x: 208, y: 318, name: "Storm's End", region: "The Stormlands", color: "#DAA520",
    lore: "A massive drum tower castle on the coast of Shipbreaker Bay, one of the strongest fortifications in Westeros. Legend says Durran Godsgrief built it to defy the Storm God after falling in love with the daughter of the Sea God and the Wind Goddess. The gods sent storms to destroy each castle he built — six fell before the seventh stood. Some say the Children of the Forest helped with spells woven into its walls, others credit Brandon the Builder. The walls are 40 feet thick on the seaward side and 80 feet high, topped with a massive drum tower. During Robert's Rebellion, Stannis held Storm's End for a year under siege, his garrison reduced to eating rats, book paste, and dogs. Davos smuggled in onions and salted fish by night, saving them. Stannis cut off Davos's fingertips as punishment for his years of smuggling — then knighted him and raised him to lordship for the onions.",
    rulers: [
      { name: "Durran Godsgrief", period: "Mythic founder", note: "Built seven castles. The Storm God destroyed six. The seventh was Storm's End." },
      { name: "House Durrandon (Storm Kings)", period: "Thousands of years", note: "Last: Argilac the Arrogant, slain by Orys Baratheon in Aegon's Conquest." },
      { name: "Orys Baratheon", period: "1st Baratheon lord, ~1 AC", note: "Rumored bastard half-brother of Aegon. Took Argilac's castle, sigil, and daughter." },
      { name: "Robert Baratheon", period: "Lord until 283 AC", note: "Rose in rebellion. Became king. Gave Storm's End to Renly over Stannis." },
      { name: "Renly Baratheon", period: "Lord until 299 AC", note: "Given Storm's End by Robert. Murdered by Stannis's shadow." },
    ]},
  // ── THE REACH ──
  { x: 100, y: 305, name: "Highgarden", region: "The Reach", color: "#5A9E5A",
    lore: "The most beautiful castle in Westeros, surrounded by three concentric rings of white stone walls, briar mazes, groves of golden roses, and terraced gardens famous across the known world. The seat sits on a hill overlooking the Mander, the great river of the Reach. House Gardener ruled here for 10,000 years, claiming descent from Garth Greenhand — the legendary figure said to have made the Reach bloom. When King Mern IX Gardener died alongside his sons at the Field of Fire (the only battle where all three Targaryen dragons fought together), the Gardener line ended. Their steward, Harlan Tyrell, surrendered Highgarden to Aegon and was raised to Lord Paramount — a promotion that older Reach houses like the Florents, Rowans, and Hightowers have resented ever since.",
    rulers: [
      { name: "Garth Greenhand", period: "Mythic ancestor", note: "Said to have made the land bloom. Ancestor of dozens of Reach houses." },
      { name: "House Gardener", period: "~10,000 years", note: "Kings of the Reach. The longest Westeros dynasty except the Starks." },
      { name: "Mern IX Gardener", period: "Last Gardener, died 2 BC", note: "Burned at the Field of Fire with all his sons. Line extinct." },
      { name: "House Tyrell", period: "1 AC—present", note: "Former stewards. Surrendered to Aegon and were rewarded." },
      { name: "Mace Tyrell", period: "Current lord", note: "The 'oaf of Highgarden.' His mother Olenna is the real strategist." },
    ]},
  { x: 72, y: 340, name: "Oldtown", region: "The Reach", color: "#5A9E5A",
    lore: "The oldest city in Westeros — possibly predating the First Men's arrival. Built at the mouth of the Honeywine river, where the ancient Hightower rises from Battle Isle. The Hightower is the tallest structure in Westeros, its beacon visible for miles. Oldtown is home to the Citadel, where every maester in Westeros trains — a great university of stone where the accumulated knowledge of thousands of years is stored. The Starry Sept served as the seat of the Faith of the Seven before Baelor built the Great Sept in King's Landing. Sam Tarly arrives to train and discovers a suspicious novice called 'Pate' — who died in the prologue of Feast and was replaced, likely by Jaqen H'ghar. Whatever the Faceless Men want in the Citadel may be one of the story's most important unrevealed plots.",
    rulers: [
      { name: "House Hightower", period: "Ancient — possibly pre-First Men", note: "Built the Hightower on Battle Isle. One of the oldest, richest houses in Westeros." },
      { name: "The Citadel", period: "Thousands of years", note: "Where all maesters are forged. May contain secrets about the Others and dragons." },
      { name: "Leyton Hightower", period: "Current lord", note: "Has not descended the Hightower in over a decade. Rumored to practice sorcery with his daughter." },
    ]},
  // ── DORNE ──
  { x: 200, y: 388, name: "Sunspear", region: "Dorne", color: "#D48040",
    lore: "Capital of Dorne, a modest castle compared to the great seats of other kingdoms, but backed by the most fiercely independent people in Westeros. It contains the Tower of the Sun and the Sandship — an ancient keep that looks like a great ship half-buried in sand. Nearby lie the Water Gardens, a palace where Dornish children of all classes play together in pools and fountains — a living symbol of Dorne's more egalitarian culture. Dorne's uniqueness stems from the Rhoynar: Princess Nymeria of the Rhoynar arrived with ten thousand ships after fleeing Valyria's expansion. She burned her fleet, married Mors Martell, and together they united Dorne. This Rhoynish influence gave Dorne equal primogeniture (women inherit equally), the title 'Prince' instead of 'King,' and a culture far more tolerant of sexuality, bastards, and individual freedom than the rest of Westeros. Dorne is the only kingdom Aegon the Conqueror could not take — they fought with guerrilla tactics, retreating into the deserts and letting the dragons burn empty castles. Queen Rhaenys died here, and her dragon Meraxes was shot down with a scorpion bolt through the eye over Hellholt.",
    rulers: [
      { name: "Princess Nymeria", period: "~700 BC", note: "Rhoynish warrior queen. Burned 10,000 ships. Married Mors Martell. United Dorne." },
      { name: "House Martell", period: "~1,000 years", note: "Unbowed, Unbent, Unbroken. The only kingdom to resist Aegon's dragons." },
      { name: "Maron Martell", period: "~187 AC", note: "Finally joined the Seven Kingdoms through marriage to a Targaryen princess — not conquest." },
      { name: "Doran Martell", period: "Current prince", note: "Crippled by gout. Seemingly passive for 14 years while secretly plotting. 'Vengeance. Justice. Fire and blood.'" },
    ]},
  // ── IRON ISLANDS ──
  { x: 48, y: 188, name: "Pyke", region: "Iron Islands", color: "#4A8A8A",
    lore: "The seat of House Greyjoy on the largest of the Iron Islands, built on a headland and several sea stacks connected by swaying rope bridges over crashing waves. The castle is slowly crumbling into the sea — which the ironborn consider fitting. The Great Keep sits on one stack, the Kitchen Keep on another, with the Seastone Chair (their throne, carved from a black oily stone of unknown origin) in the Great Hall. The ironborn follow the Drowned God ('What is dead may never die') and the Old Way — paying the iron price by taking what they want through raiding and reaving. Balon Greyjoy launched two failed rebellions for independence. He fell from a bridge at Pyke — almost certainly pushed by a Faceless Man hired by his brother Euron, who returned from exile that very day to claim the Seastone Chair through a kingsmoot.",
    rulers: [
      { name: "House Greyjoy", period: "Since Aegon's Conquest", note: "Chosen by Aegon to rule after he destroyed House Hoare." },
      { name: "Balon Greyjoy", period: "Lord until ~300 AC", note: "Declared independence twice. Fell from a bridge." },
      { name: "Euron 'Crow's Eye' Greyjoy", period: "King from ~300 AC", note: "Won the kingsmoot. Pirate, kinslayer, sorcerer. Claims to have sailed the Smoking Sea and found Dragonbinder in Valyria." },
    ]},
  // ── ESSOS ──
  { x: 292, y: 92, name: "Braavos", region: "Essos — Free Cities", color: "#B080A0",
    lore: "The wealthiest, most powerful of the Free Cities — and the only one never founded as a Valyrian colony. Braavos was born when slaves being transported to a new Valyrian colony in Sothoryos rose in bloody rebellion, seized their ships, and sailed north. Guided by the moonsingers — priestesses of the Jogos Nhai — they found a hidden lagoon shrouded in fog and built a secret city. For over 400 years, Braavos existed in secret, accepting other escaped slaves and refugees. The fugitives hid their valuables in an abandoned iron mine — this became the Iron Bank, which grew to become the most powerful financial institution in the known world. 'The Iron Bank will have its due' — those who refuse to repay find the Bank funding their enemies. The Faceless Men also originated in the Valyrian slave mines, where a mysterious figure began granting the 'gift' of death to suffering slaves, then learned to give that gift to their masters. Their House of Black and White stands in Braavos. The Titan — a massive armed colossus straddling the harbor entrance — guards the city. Braavos hates slavery and has fought six wars against Pentos to stamp it out.",
    rulers: [
      { name: "Escaped slaves (founders)", period: "~500+ years ago", note: "Rose in rebellion on Valyrian slave ships. Guided north by moonsingers." },
      { name: "Uthero Zalyne", period: "Sealord during the Uncloaking", note: "Revealed Braavos to the world. Paid off the descendants of the shipowners (but not for the slaves)." },
      { name: "Sealords (elected)", period: "Since founding", note: "Not hereditary. Elected rulers serving for life." },
      { name: "The Iron Bank", period: "Ancient institution", note: "Founded in an iron mine. Now funds and destroys kings." },
      { name: "The Faceless Men", period: "Pre-Braavos", note: "Originated in Valyrian slave mines. Their first gift was mercy; they learned to give it to the masters too." },
    ]},
  { x: 282, y: 175, name: "Pentos", region: "Essos — Free Cities", color: "#B080A0",
    lore: "A trading city across the Narrow Sea from King's Landing, one of the Free Cities founded as a Valyrian colony. The city is ruled in name by a Prince — but the true power lies with the magisters (merchant-lords). The Prince is a figurehead chosen by the magisters; if crops fail or a war is lost, his throat is slit and a new Prince is selected. Slavery is officially banned (Braavos forced this through six wars), but in practice the magisters keep slaves in all but name, calling them 'servants.' Illyrio Mopatis, the magister who sheltered Daenerys and Viserys and arranged Dany's marriage to Drogo, lives in a manse here. His conspiracy with Varys — overheard by Arya in the tunnels beneath the Red Keep — spans decades. His late wife Serra may have been a Blackfyre descendant, connecting him personally to Aegon/Young Griff.",
    rulers: [
      { name: "Prince of Pentos (elected figurehead)", period: "Since founding", note: "A scapegoat. If things go wrong, his throat is cut." },
      { name: "The Magisters (true power)", period: "Since founding", note: "Merchant oligarchs who control trade and politics." },
      { name: "Illyrio Mopatis", period: "Current influential magister", note: "Sheltered the Targaryens. Ally of Varys. His true motives remain opaque." },
    ]},
  { x: 340, y: 268, name: "Volantis", region: "Essos — Free Cities", color: "#B080A0",
    lore: "The oldest, proudest, and largest of the Free Cities, founded as the first daughter of Valyria. Built where the Rhoyne — the greatest river in Essos — meets the Summer Sea. The city is divided by the Black Wall, a massive fortification of fused dragonstone 200 feet high: inside live the Old Blood, Valyrian-descended nobles; outside is everyone else. There are five slaves for every free man. After the Doom, Volantis tried to rebuild the Freehold by force, launching wars of conquest — Braavos led the coalition that stopped them. The city is ruled by three Triarchs, elected annually: the Tiger party (military expansion) and the Elephant party (trade and peace) compete for power. The red temple of R'hllor in Volantis is three times the size of the Great Sept of Baelor — the largest in the world. The slaves of Volantis are tattooed on their faces: tears for sex workers, flames for temple slaves, wheels for cart drivers.",
    rulers: [
      { name: "Valyrian Freehold", period: "Founded pre-Doom", note: "First and oldest colony. Claims to be Valyria's heir." },
      { name: "Three Triarchs (elected)", period: "Since the Doom", note: "Tigers (war) vs. Elephants (trade). Currently Elephants dominate." },
    ]},
  { x: 378, y: 315, name: "Valyria (ruins)", region: "Essos", color: "#C44040",
    lore: "The shattered remains of the greatest civilization the world has ever known. The Valyrian Freehold was an empire of dragonlords who discovered dragons in the Fourteen Flames — a chain of volcanic mountains on a peninsula in southern Essos. Using blood magic, they bound the dragons and forged Valyrian steel, conquering most of Essos over 5,000 years. The Freehold had no single ruler — forty dragonlord families governed through a senate. Then came the Doom: every volcano erupted simultaneously, the peninsula shattered, and the sea rushed in. The greatest civilization in history was obliterated in a single day. The Smoking Sea now covers where the peninsula was — water that still boils, where demons and kraken are said to lurk. Treasure hunters, slavers, and madmen occasionally sail in. None return. The Targaryens survived only because Daenys the Dreamer foresaw the Doom twelve years before and convinced her family to relocate to Dragonstone. Euron Greyjoy claims to have sailed the Smoking Sea and found the dragon horn Dragonbinder in the ruins.",
    rulers: [
      { name: "The Forty Families", period: "~5,000 years", note: "Dragonlord senate. No single ruler. Power through dragons and blood magic." },
      { name: "The Doom", period: "~114 BC", note: "Every volcano erupted at once. Civilization obliterated in a day." },
      { name: "No rulers since", period: "Cursed ruins", note: "The Smoking Sea kills all who enter. Only Euron claims to have survived." },
    ]},
  { x: 440, y: 248, name: "Slaver's Bay", region: "Essos", color: "#906848",
    lore: "Three great slave cities on the shores of Slaver's Bay — Astapor, Yunkai, and Meereen — built on the ashes of the ancient Ghiscari Empire. Old Ghis was the first great empire in Essos, rivaling Valyria itself. The Ghiscari went to war with Valyria five times and were defeated five times, their cities burned by dragonfire and their people enslaved. The three slaver cities rose from the ruins, building their entire economy on the slave trade. Astapor trains the Unsullied — eunuch warrior-slaves conditioned from childhood. Yunkai trains bed slaves. Meereen is the richest and largest, ruled by the Great Masters from atop stepped pyramids. Daenerys conquered all three, but keeping them proved far harder than taking them.",
    rulers: [
      { name: "Old Ghis", period: "Ancient", note: "First great empire. Rival of Valyria. Defeated in five wars. Destroyed." },
      { name: "Good Masters (Astapor)", period: "Post-Ghis", note: "Slave traders. Specialized in Unsullied." },
      { name: "Wise Masters (Yunkai)", period: "Post-Ghis", note: "Slave trainers. The 'Yellow City.'" },
      { name: "Great Masters (Meereen)", period: "Post-Ghis", note: "Wealthiest slavers. Ruled from pyramids." },
      { name: "Daenerys Targaryen", period: "Conquered 299 AC", note: "Freed every slave. Struggles to hold what she took." },
    ]},
  { x: 465, y: 235, name: "Meereen", region: "Essos", color: "#906848",
    lore: "The largest and wealthiest of the three slaver cities, built of colored bricks with a great bronze harpy atop its tallest pyramid. Daenerys took it by sending Grey Worm and freed slaves through the sewers to open the gates from within. She crucified 163 Great Masters — one for each slave child they had crucified along the road to guide her march. But ruling proved harder than conquering. The Sons of the Harpy — masked insurgents funded by the old aristocracy — murder Unsullied in the alleys. Dany chained Rhaegal and Viserion after Drogon killed a child. She married Hizdahr zo Loraq for peace and reopened the fighting pits. During the games, Drogon returned and she flew away on his back. Barristan Selmy rules in her absence, preparing for the Battle of Fire as Yunkai's armies close in and Victarion's Iron Fleet approaches from the west.",
    rulers: [
      { name: "Great Masters", period: "Ancient", note: "Slave aristocracy. Ruled from pyramids." },
      { name: "Daenerys Targaryen", period: "Queen from 299 AC", note: "Married Hizdahr for peace. Flew away on Drogon." },
      { name: "Hizdahr zo Loraq", period: "King consort, briefly", note: "May be connected to the Sons of the Harpy." },
      { name: "Barristan Selmy", period: "Ruling in Dany's absence", note: "Deposed Hizdahr. Preparing for the Battle of Fire." },
    ]},
  { x: 535, y: 228, name: "Qarth", region: "Essos", color: "#B080A0",
    lore: "A magnificent walled city on the straits between the Summer Sea and the Jade Sea — the gateway between East and West. The Qartheen call it 'the greatest city that ever was or ever will be.' Triple walls of red, black, and white stone surround it, carved with animals, war scenes, and lovemaking. The city is ruled by the Pureborn, who sit on the council of the Thirteen. The warlocks of the House of the Undying drink shade of the evening (which turns their lips blue) and practice fading magic. Daenerys visited after crossing the Red Waste. The Pureborn refused her ships. The warlocks lured her to the House of the Undying, where she saw prophetic visions — a blue flower in a wall of ice, a cloth dragon surrounded by cheering crowds, a red wedding — before Drogon burned them. Xaro Xhoan Daxos, a merchant prince who hosted her, proposed marriage; she refused and fled.",
    rulers: [
      { name: "The Pureborn", period: "Ancient", note: "Aristocratic ruling council. Descendants of ancient kings." },
      { name: "The Thirteen", period: "Current", note: "Merchant council including Xaro Xhoan Daxos." },
      { name: "The Warlocks", period: "Fading power", note: "The House of the Undying is burned. Pyat Pree swears vengeance." },
    ]},
  { x: 440, y: 150, name: "The Dothraki Sea", region: "Essos", color: "#A08040",
    lore: "An immense ocean of grass stretching across central Essos from the Free Cities to the Bone Mountains. The Dothraki ride their horses in khalasars tens of thousands strong, following their khals. They worship the Great Stallion and believe in prophecy through their dosh khaleen (crone priestesses) in Vaes Dothrak. This 'city' — the only one the Dothraki have — sits at the heart of the grass sea, where a thousand carved idols stolen from conquered cities line the godsway. No blood may be shed in Vaes Dothrak; a khal who sheds blood there is cursed. The Dothraki were once contained by the Valyrian Freehold and their dragons; after the Doom, they swept across the continent destroying cities and kingdoms. The grass sea is dotted with ruins of cities the Dothraki burned. At the end of Dance, Dany is stranded in the grass sea, sick and hallucinating, found by a new khalasar.",
    rulers: [
      { name: "The Khals", period: "Hundreds of years", note: "Nomadic warlords. No permanent rulers. Khalasars fragment when a khal dies." },
      { name: "Khal Drogo", period: "Greatest khal, died 298 AC", note: "United the largest khalasar in living memory. Married Dany." },
      { name: "The Dosh Khaleen", period: "Ancient", note: "Widows of dead khals. Seers and priestesses at Vaes Dothrak." },
    ]},
  // ── SOTHORYOS ──
  { x: 380, y: 408, name: "Sothoryos", region: "Sothoryos", color: "#556644",
    lore: "A vast, jungle-covered continent south of Essos — larger than Westeros, and far more dangerous. The northern coast has been mapped, but no expedition has ever charted the interior and returned. The jungles teem with basilisks, wyverns, disease-carrying flies, and reports of ape-like creatures and darker things. Valyrian dragonrider Jaenara Belaerys flew her dragon Terrax south for three years searching for the end of the continent and never found it. Princess Nymeria of the Rhoynar settled refugees here after fleeing Valyria but abandoned the coast within a year — plagues, slave raids, and the jungle's horrors drove them on to Dorne. The Ghiscari Empire and later the Valyrian Freehold established colonies along the north coast, including Zamettar, Gogossos, and Gorosh. All were eventually destroyed or abandoned. Gogossos was called 'the Tenth Free City' before a plague killed every inhabitant. The ruins still stand, but no one goes there. Sothoryos remains the known world's greatest mystery — a continent-sized deathtrap.",
    rulers: [
      { name: "Ghiscari Empire", period: "Ancient", note: "Founded colonies like Zamettar. All eventually destroyed." },
      { name: "Valyrian Freehold", period: "Pre-Doom", note: "Established Gogossos, the 'Tenth Free City.' Wiped out by plague." },
      { name: "Princess Nymeria", period: "~700 BC (briefly)", note: "Settled Rhoynar refugees on the coast. Abandoned within a year due to plagues and raids." },
      { name: "Jaenara Belaerys", period: "Pre-Doom explorer", note: "Flew her dragon Terrax south for three years. Never found the end of the continent." },
      { name: "No permanent rulers", period: "Present", note: "Every colonization attempt has failed. The continent belongs to no one." },
    ]},
];

// ═══════════════════════════════════════════════════════
// GRAPH VIEW COMPONENT
// ═══════════════════════════════════════════════════════
function GraphView() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 800 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileDetailExpanded, setMobileDetailExpanded] = useState(false);
  const [panelMaxH, setPanelMaxH] = useState(null);
  const panelDragRef = useRef(null);
  const [canonMode, setCanonMode] = useState("combined"); // "combined" | "books" | "tv" — drives graph, connections, and detail panel
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const simulationRef = useRef(null);
  const nodesRef = useRef([]);
  const [tick, setTick] = useState(0);
  const hasAutoFit = useRef(false);
  const dragRef = useRef(null);
  const panRef = useRef(null);
  const panListenersRef = useRef(null);
  const dragListenersRef = useRef(null);
  const touchRef = useRef(null);

  const filteredNodes = useMemo(() => getGraphNodesForCanon(graphNodes, canonMode), [canonMode]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() =>
    getGraphEdgesForCanon(normalizedGraphEdges, Array.from(filteredNodeIds), canonMode),
  [canonMode, filteredNodeIds]);

  const searchMatches = useMemo(() => {
    if (!searchTerm.trim()) return new Set();
    const t = searchTerm.toLowerCase();
    return new Set(filteredNodes.filter(n =>
      n.name.toLowerCase().includes(t) || n.house.toLowerCase().includes(t)
    ).map(n => n.id));
  }, [searchTerm, filteredNodes]);

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return filteredEdges.filter(e => e.source === selectedNode || e.target === selectedNode ||
      (typeof e.source === "object" && e.source.id === selectedNode) ||
      (typeof e.target === "object" && e.target.id === selectedNode));
  }, [selectedNode, filteredEdges]);

  const connectedIds = useMemo(() => {
    if (!selectedNode) return new Set();
    const ids = new Set([selectedNode]);
    connectedEdges.forEach(e => {
      ids.add(typeof e.source === "object" ? e.source.id : e.source);
      ids.add(typeof e.target === "object" ? e.target.id : e.target);
    });
    return ids;
  }, [selectedNode, connectedEdges]);

  // Canon detail view: available modes for the selected character
  const getAvailableCanonModes = useCallback((node) => {
    if (!node) return [];
    if (node.canon === "book") return ["books"];
    if (node.canon === "tv") return ["tv"];
    return ["combined", "books", "tv"];
  }, []);

  // Summary text for the selected canon mode — strict separation: no fallback to combined for Book/TV Only
  const getSummaryForCanon = useCallback((node, mode) => {
    if (!node) return { text: "", isPlaceholder: false };
    if (mode === "combined") return { text: (node.summaries?.combined ?? node.bio) || "", isPlaceholder: false };
    if (mode === "books") {
      const raw = node.bioBooks ?? node.summaries?.books;
      if (raw != null && String(raw).trim() !== "") return { text: raw, isPlaceholder: false };
      return { text: "No book-only summary available yet.", isPlaceholder: true };
    }
    if (mode === "tv") {
      const raw = node.bioTv ?? node.summaries?.tv;
      if (raw != null && String(raw).trim() !== "") return { text: raw, isPlaceholder: false };
      return { text: "No TV-only summary available yet.", isPlaceholder: true };
    }
    return { text: node.bio || "", isPlaceholder: false };
  }, []);

  // connectedEdges are already canon-filtered (from filteredEdges), so no extra filter needed

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: Math.max(rect.height, 700) });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const nodes = filteredNodes.map(n => ({ ...n }));
    const edges = filteredEdges.map(e => ({ ...e }));
    nodesRef.current = nodes;

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(edges).id(d => d.id).distance(105).strength(0.3))
      .force("charge", d3.forceManyBody().strength(-250).distanceMax(500))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", d3.forceCollide().radius(22))
      .force("x", d3.forceX(dimensions.width / 2).strength(0.03))
      .force("y", d3.forceY(dimensions.height / 2).strength(0.03))
      .alphaDecay(0.015)
      .on("tick", () => setTick(t => t + 1));

    simulationRef.current = sim;
    hasAutoFit.current = false;
    return () => sim.stop();
  }, [dimensions.width, dimensions.height, filteredNodes, filteredEdges]);

  useEffect(() => {
    if (hasAutoFit.current || tick < 30) return;
    const nodes = nodesRef.current;
    if (!nodes || nodes.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      if (n.x == null || n.y == null) continue;
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }
    if (!isFinite(minX)) return;
    const pad = 40;
    const graphW = maxX - minX + pad * 2;
    const graphH = maxY - minY + pad * 2;
    const scaleX = dimensions.width / graphW;
    const scaleY = dimensions.height / graphH;
    const k = Math.min(scaleX, scaleY, 1) * 0.92;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const tx = dimensions.width / 2 - cx * k;
    const ty = dimensions.height / 2 - cy * k;
    setTransform({ x: tx, y: ty, k });
    hasAutoFit.current = true;
  }, [tick, dimensions.width, dimensions.height]);

  // If the currently selected node disappears from the filtered graph (e.g. due to canon change),
  // clear the selection; otherwise preserve it across canon toggles.
  useEffect(() => {
    if (!selectedNode) return;
    const stillPresent = filteredNodes.some(n => n.id === selectedNode);
    if (!stillPresent) {
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, [selectedNode, filteredNodes]);

  const handleWheel = useCallback((e) => {
    if (e.target.closest(".info-panel")) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    setTransform(prev => {
      const newK = Math.max(0.15, Math.min(4, prev.k * factor));
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return prev;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      return {
        k: newK,
        x: mx - (mx - prev.x) * (newK / prev.k),
        y: my - (my - prev.y) * (newK / prev.k),
      };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handlePanStart = useCallback((e) => {
    if (e.target.closest(".graph-node")) return;
    if (panListenersRef.current) {
      window.removeEventListener("mousemove", panListenersRef.current.move);
      window.removeEventListener("mouseup", panListenersRef.current.up);
    }
    const t = transformRef.current;
    panRef.current = { startX: e.clientX - t.x, startY: e.clientY - t.y };
    const onMove = (ev) => {
      const pan = panRef.current;
      if (!pan) return;
      setTransform(prev => ({
        ...prev,
        x: ev.clientX - pan.startX,
        y: ev.clientY - pan.startY,
      }));
    };
    const onUp = () => {
      panRef.current = null;
      panListenersRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    panListenersRef.current = { move: onMove, up: onUp };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const handleDragStart = useCallback((e, nodeId) => {
    e.stopPropagation();
    const sim = simulationRef.current;
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!sim || !node) return;
    if (dragListenersRef.current) {
      window.removeEventListener("mousemove", dragListenersRef.current.move);
      window.removeEventListener("mouseup", dragListenersRef.current.up);
    }
    sim.alphaTarget(0.3).restart();
    const onMove = (ev) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const t = transformRef.current;
      node.fx = (ev.clientX - rect.left - t.x) / t.k;
      node.fy = (ev.clientY - rect.top - t.y) / t.k;
    };
    const onUp = () => {
      sim.alphaTarget(0);
      node.fx = null;
      node.fy = null;
      dragListenersRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    node.fx = node.x;
    node.fy = node.y;
    dragListenersRef.current = { move: onMove, up: onUp };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.target.closest(".info-panel")) return;
    if (e.target.closest("input, button, select, textarea, a")) return;
    const touches = e.touches;
    if (touches.length === 2) {
      e.preventDefault();
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const cx = (touches[0].clientX + touches[1].clientX) / 2;
      const cy = (touches[0].clientY + touches[1].clientY) / 2;
      touchRef.current = { type: "pinch", dist: Math.hypot(dx, dy), cx, cy };
    } else if (touches.length === 1) {
      const target = e.target.closest(".graph-node");
      if (target) {
        e.preventDefault();
        const nodeId = target.dataset.nodeId;
        const sim = simulationRef.current;
        const node = nodesRef.current.find(n => n.id === nodeId);
        if (sim && node) {
          sim.alphaTarget(0.3).restart();
          node.fx = node.x;
          node.fy = node.y;
          touchRef.current = { type: "drag", nodeId, node, sim };
        }
      } else {
        const t = transformRef.current;
        touchRef.current = { type: "pan", startX: touches[0].clientX - t.x, startY: touches[0].clientY - t.y };
      }
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchRef.current) return;
    e.preventDefault();
    const touches = e.touches;
    const tr = touchRef.current;

    if (tr.type === "pinch" && touches.length === 2) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const scale = newDist / tr.dist;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
      const cy = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;
      setTransform(prev => {
        const newK = Math.max(0.15, Math.min(4, prev.k * scale));
        return {
          k: newK,
          x: cx - (cx - prev.x) * (newK / prev.k),
          y: cy - (cy - prev.y) * (newK / prev.k),
        };
      });
      touchRef.current = { ...tr, dist: newDist };
    } else if (tr.type === "pan" && touches.length === 1) {
      setTransform(prev => ({
        ...prev,
        x: touches[0].clientX - tr.startX,
        y: touches[0].clientY - tr.startY,
      }));
    } else if (tr.type === "drag" && touches.length === 1) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const t = transformRef.current;
      tr.node.fx = (touches[0].clientX - rect.left - t.x) / t.k;
      tr.node.fy = (touches[0].clientY - rect.top - t.y) / t.k;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchRef.current) return;
    if (touchRef.current.type === "drag") {
      touchRef.current.sim.alphaTarget(0);
      touchRef.current.node.fx = null;
      touchRef.current.node.fy = null;
    }
    touchRef.current = null;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const nodes = nodesRef.current;
  const simEdges = simulationRef.current?.force("link")?.links() || [];

  const nodeInfo = selectedNode ? filteredNodes.find(n => n.id === selectedNode) : null;

  const toolbarBg = theme.bgCard;
  const toolbarBorder = theme.glassBorder;

  const isMobileGraph = dimensions.width < 680;

  return (
    <div ref={containerRef} style={{
      width: "100%",
      height: isMobileGraph ? "calc(100vh - 160px)" : "calc(100vh - 120px)",
      minHeight: isMobileGraph ? "min(400px, 55vh)" : "min(500px, 65vh)",
      position: "relative", overflow: "hidden",
      background: theme.bgCharcoal,
      borderRadius: isMobileGraph ? 10 : 14,
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
    }}>
      {/* Toolbar — search, count, clear */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", flexWrap: "wrap", gap: isMobileGraph ? 6 : 12, alignItems: "center",
        padding: isMobileGraph ? "8px 10px" : "14px 16px",
        background: toolbarBg,
        borderBottom: `1px solid ${toolbarBorder}`,
      }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            padding: isMobileGraph ? "8px 12px" : "10px 16px",
            flex: isMobileGraph ? "1 1 0" : "0 0 240px",
            minWidth: 0,
            background: theme.bgNearBlack,
            border: `1px solid ${theme.glassBorder}`,
            borderRadius: 8,
            color: theme.textPrimary,
            fontSize: isMobileGraph ? 13 : 14, fontFamily: theme.fontBody,
            outline: "none",
          }}
        />
        {!isMobileGraph && (
          <span style={{
            fontSize: 12, color: theme.textMuted, letterSpacing: 0.5,
            padding: "8px 12px", background: theme.bgNearBlack,
            borderRadius: 6, border: `1px solid ${toolbarBorder}`,
          }}>
            {filteredNodes.length} characters
          </span>
        )}
        {selectedNode && (
          <button
            onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
            style={{
              padding: isMobileGraph ? "8px 12px" : "8px 16px",
              minHeight: 44,
              background: `rgba(139, 58, 42, 0.2)`,
              border: `1px solid ${theme.crimson}55`,
              borderRadius: 8,
              color: theme.goldWarm,
              fontSize: 12, fontFamily: theme.fontBody, fontWeight: 500,
            }}
          >
            {isMobileGraph ? "\u2715" : "Clear selection"}
          </button>
        )}

        {/* Canon mode — syncs with detail panel; drives graph, connections, and counts */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: "auto" }}>
          {[
            { val: "combined", label: isMobileGraph ? "All" : "TV & Books" },
            { val: "books", label: isMobileGraph ? "Book" : "Book Only" },
            { val: "tv", label: isMobileGraph ? "TV" : "TV Only" },
          ].map(({ val, label }) => {
            const active = canonMode === val;
            return (
              <button
                key={val}
                onClick={() => setCanonMode(val)}
                style={{
                  padding: isMobileGraph ? "8px 10px" : "6px 12px",
                  minHeight: 44,
                  fontSize: isMobileGraph ? 11 : 11, fontFamily: theme.fontBody,
                  letterSpacing: 0.3, borderRadius: 6,
                  background: active ? "rgba(184, 160, 120, 0.15)" : "transparent",
                  border: active ? `1px solid ${theme.goldMuted}44` : `1px solid ${theme.glassBorder}`,
                  color: active ? theme.goldMuted : theme.textMuted,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls hint — subtle, framed */}
      <div style={{
        position: "absolute", bottom: 14, left: 16, zIndex: 20,
        fontSize: 11, color: theme.textFaded, letterSpacing: 0.5,
        padding: "8px 14px",
        background: toolbarBg,
        borderRadius: 8,
        border: `1px solid ${toolbarBorder}`,
        display: dimensions.width < 680 ? "none" : "block",
      }}>
        Scroll zoom{"\u00B7"} Pan background{"\u00B7"} Drag nodes{"\u00B7"} Click node or edge for details
      </div>

      {/* Legend — top-right on desktop, hidden on mobile */}
      <div style={{
        position: "absolute", right: 16, top: 74, zIndex: 15,
        padding: "8px 12px",
        background: toolbarBg,
        borderRadius: 8,
        border: `1px solid ${toolbarBorder}`,
        display: isMobileGraph ? "none" : "flex",
        flexWrap: "wrap", gap: "8px 12px",
        maxWidth: 320,
      }}>
        {[
          ["Stark", C.stark], ["Lannister", C.lannister], ["Targaryen", C.targaryen],
          ["Baratheon", C.baratheon], ["Tyrell", C.tyrell], ["Martell", C.martell],
          ["Greyjoy", C.greyjoy], ["Tully", C.tully], ["Watch", C.watch],
          ["Wildling", C.wildling], ["Other", C.other],
        ].map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: theme.textMuted }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Graph Canvas */}
      <svg
        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, touchAction: "none" }}
        onMouseDown={handlePanStart}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* Edges */}
          {simEdges.map((e, i) => {
            if (!e.source || !e.target || e.source.x == null) return null;
            const srcId = typeof e.source === "object" ? e.source.id : e.source;
            const tgtId = typeof e.target === "object" ? e.target.id : e.target;
            const isConnected = selectedNode && (connectedIds.has(srcId) && connectedIds.has(tgtId));
            const isSelected = selectedEdge === i;
            const opacity = selectedNode ? (isConnected ? 0.6 : 0.04) : 0.12;
            return (
              <line key={i}
                x1={e.source.x} y1={e.source.y} x2={e.target.x} y2={e.target.y}
                stroke={isSelected ? theme.crimson : isConnected ? theme.goldMuted : "#444"}
                strokeWidth={isSelected ? 2.5 : isConnected ? 1.5 : 0.5}
                opacity={opacity}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                onClick={(ev) => { ev.stopPropagation(); setSelectedEdge(selectedEdge === i ? null : i); }}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map((n) => {
            if (n.x == null) return null;
            const isActive = !selectedNode || connectedIds.has(n.id);
            const isSearched = searchMatches.size > 0 && searchMatches.has(n.id);
            const isSelf = n.id === selectedNode;
            const opacity = selectedNode ? (isActive ? 1 : 0.1) : (searchMatches.size > 0 ? (isSearched ? 1 : 0.15) : 0.85);
            const r = isSelf ? 14 : isSearched ? 12 : 9;
            return (
              <g key={n.id} className="graph-node" data-node-id={n.id} style={{ cursor: "pointer" }}
                onMouseDown={(e) => handleDragStart(e, n.id)}
                onClick={(e) => { e.stopPropagation(); setSelectedNode(selectedNode === n.id ? null : n.id); setSelectedEdge(null); setMobileDetailExpanded(false); setPanelMaxH(null); }}
                onMouseEnter={() => setHoveredNode(n.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle cx={n.x} cy={n.y} r={isMobileGraph ? Math.max(r + 10, 22) : r + 5} fill="transparent" />
                {isSelf && <circle cx={n.x} cy={n.y} r={r + 4} fill="none" stroke={n.color} strokeWidth={2} opacity={0.5} />}
                {n.canon === "book" && <circle cx={n.x} cy={n.y} r={r + 3} fill="none" stroke="#c4a44a" strokeWidth={1} strokeDasharray="3,2" opacity={opacity * 0.6} />}
                <circle cx={n.x} cy={n.y} r={r}
                  fill={n.color} opacity={opacity}
                  stroke={isSelf ? n.color : "rgba(255,255,255,0.08)"}
                  strokeWidth={isSelf ? 2 : 0.5}
                />
                {(transform.k > 0.4 || isSelf || isSearched || hoveredNode === n.id) && (
                  <text x={n.x} y={n.y - r - 5}
                    textAnchor="middle" fontSize={isSelf ? 11 : 9}
                    fill={isSelf ? theme.textPrimary : isActive ? theme.textSecondary : "#444"}
                    opacity={opacity}
                    fontFamily={theme.fontBody}
                    fontWeight={isSelf ? 600 : 400}
                    style={{ pointerEvents: "none", transition: "opacity 0.2s" }}
                  >
                    {n.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Edge info panel */}
      {selectedEdge !== null && simEdges[selectedEdge] && (() => {
        const edge = simEdges[selectedEdge];
        const srcId = typeof edge.source === "object" ? edge.source.id : edge.source;
        const tgtId = typeof edge.target === "object" ? edge.target.id : edge.target;
        const srcNode = filteredNodes.find(n => n.id === srcId);
        const tgtNode = filteredNodes.find(n => n.id === tgtId);
        const origEdge = filteredEdges[selectedEdge];
        if (!srcNode || !tgtNode || !origEdge) return null;
        const relText = getConnectionDescription(origEdge, canonMode);
        const isMobileEdge = dimensions.width < 680;
        return (
          <>
          {isMobileEdge && (
            <div onClick={() => setSelectedEdge(null)} style={{
              position: "fixed", inset: 0, zIndex: 109, background: "rgba(0,0,0,0.4)",
            }} />
          )}
          <div className="info-panel" style={{
            position: isMobileEdge ? "fixed" : "absolute",
            bottom: isMobileEdge ? 0 : 56,
            left: isMobileEdge ? 0 : "50%",
            right: isMobileEdge ? 0 : "auto",
            transform: isMobileEdge ? "none" : "translateX(-50%)",
            maxWidth: isMobileEdge ? "100%" : 580,
            width: isMobileEdge ? "100%" : "92%",
            zIndex: 110,
            background: toolbarBg,
            border: `1px solid ${theme.crimson}55`,
            borderRadius: isMobileEdge ? "16px 16px 0 0" : 12,
            padding: isMobileEdge ? "0 16px 20px" : "20px 24px",
            boxShadow: isMobileEdge
              ? "0 -4px 24px rgba(0,0,0,0.5)"
              : `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${theme.crimsonGlow}`,
          }}>
            {isMobileEdge && (
              <div onClick={() => setSelectedEdge(null)}
                style={{ display: "flex", justifyContent: "center", padding: "10px 0 8px", cursor: "pointer" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: srcNode.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: srcNode.color, fontFamily: theme.fontBody }}>{srcNode.name}</span>
              <span style={{ fontSize: 12, color: theme.textMuted }}>{"\u27F7"}</span>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: tgtNode.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: tgtNode.color, fontFamily: theme.fontBody }}>{tgtNode.name}</span>
              <button onClick={() => setSelectedEdge(null)} style={{
                marginLeft: "auto", background: "none", border: `1px solid ${theme.glassBorder}`,
                borderRadius: 8,
                color: theme.textMuted, cursor: "pointer", fontSize: 22, fontFamily: "inherit",
                padding: "4px 10px", lineHeight: 1, minWidth: 44, minHeight: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{"\u00D7"}</button>
            </div>
            <div style={{ fontSize: 13.5, color: theme.textSecondary, lineHeight: 1.8, fontFamily: theme.fontBody }}>
              {relText}
            </div>
          </div>
          </>
        );
      })()}

      {/* Node info panel */}
      {nodeInfo && !selectedEdge && (() => {
        const availableModes = getAvailableCanonModes(nodeInfo);
        const showCanonToggles = availableModes.length > 1;
        const summary = getSummaryForCanon(nodeInfo, canonMode);
        const displayConnections = connectedEdges.filter(e => {
          const srcId = (typeof e.source === "object" ? e.source.id : e.source);
          const tgtId = (typeof e.target === "object" ? e.target.id : e.target);
          const origEdge = filteredEdges.find(ge =>
            ge.source === srcId && ge.target === tgtId
          ) || filteredEdges.find(ge =>
            ge.target === srcId && ge.source === tgtId
          );
          if (!origEdge) return false;
          const relText = getConnectionDescription(origEdge, canonMode);
          return relText != null && String(relText).trim() !== "";
        });
        const showBookNote = nodeInfo.bookNote && canonMode === "combined";

        const isMobile = dimensions.width < 680;
        const [mobileExpanded, setMobileExpanded] = [mobileDetailExpanded, setMobileDetailExpanded];
        const summaryPreview = summary.text ? (summary.text.length > 90 ? summary.text.substring(0, 90) + "..." : summary.text) : "";
        const defaultMaxH = dimensions.height - 110;
        const effectiveMaxH = panelMaxH != null ? Math.max(120, Math.min(panelMaxH, defaultMaxH)) : defaultMaxH;

        const handleResizeStart = (e) => {
          e.preventDefault();
          const startY = e.clientY || (e.touches && e.touches[0].clientY);
          const startH = effectiveMaxH;
          panelDragRef.current = { startY, startH };
          const onMove = (ev) => {
            const y = ev.clientY || (ev.touches && ev.touches[0].clientY);
            const delta = y - panelDragRef.current.startY;
            setPanelMaxH(Math.max(120, panelDragRef.current.startH - delta));
          };
          const onEnd = () => {
            panelDragRef.current = null;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onEnd);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onEnd);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onEnd);
          window.addEventListener("touchmove", onMove, { passive: false });
          window.addEventListener("touchend", onEnd);
        };

        return (
          <div className="info-panel" style={{
            position: "absolute",
            top: isMobile ? "auto" : 74,
            right: isMobile ? 4 : 16,
            left: isMobile ? 4 : "auto",
            bottom: isMobile ? 4 : "auto",
            width: isMobile ? "auto" : 340,
            maxHeight: isMobile ? (mobileExpanded ? "60vh" : "auto") : effectiveMaxH,
            overflowY: isMobile && mobileExpanded ? "auto" : (isMobile ? "hidden" : "auto"),
            zIndex: 25,
            background: toolbarBg,
            border: `1px solid ${nodeInfo.color}55`,
            borderRadius: isMobile ? 14 : 12,
            padding: isMobile ? "10px 14px 12px" : "0 22px 20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}>
            {/* Resize handle at top */}
            {!isMobile && (
              <div
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
                style={{
                  display: "flex", justifyContent: "center", alignItems: "center",
                  padding: "8px 0 6px", cursor: "ns-resize",
                  userSelect: "none", WebkitUserSelect: "none",
                }}
              >
                <div style={{
                  width: 32, height: 4, borderRadius: 2,
                  background: "rgba(255,255,255,0.15)",
                  transition: "background 0.2s",
                }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.35)"}
                   onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"} />
              </div>
            )}
            {/* Compact header — always visible */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: isMobile ? 12 : 16, height: isMobile ? 12 : 16, borderRadius: "50%", background: nodeInfo.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 600, color: theme.textPrimary, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontFamily: theme.fontDisplay }}>
                  {nodeInfo.name}
                  {!isMobile && <span style={{
                    fontSize: 9, padding: "3px 8px", borderRadius: 4, letterSpacing: 0.8, fontWeight: 500,
                    background: nodeInfo.canon === "book" ? "rgba(168, 140, 64, 0.2)" : "rgba(100, 130, 120, 0.2)",
                    color: nodeInfo.canon === "book" ? theme.goldMuted : "#7aaa9a",
                    border: nodeInfo.canon === "book" ? "1px solid rgba(168, 140, 64, 0.35)" : "1px solid rgba(80, 120, 110, 0.35)",
                  }}>{nodeInfo.canon === "book" ? "BOOKS ONLY" : "TV & BOOKS"}</span>}
                </div>
                {isMobile && !mobileExpanded && <div style={{ fontSize: 11, color: nodeInfo.color, letterSpacing: 0.5, textTransform: "uppercase", marginTop: 1 }}>{nodeInfo.house}</div>}
                {!isMobile && <div style={{ fontSize: 11, color: nodeInfo.color, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{nodeInfo.house}</div>}
              </div>
              <button onClick={() => { setSelectedNode(null); setSelectedEdge(null); setMobileDetailExpanded(false); }} style={{
                background: "none", border: `1px solid ${theme.glassBorder}`, borderRadius: 8,
                color: theme.textMuted, cursor: "pointer", fontSize: 22, fontFamily: "inherit",
                padding: "4px 10px", lineHeight: 1, flexShrink: 0, minWidth: 44, minHeight: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{"\u00D7"}</button>
            </div>

            {/* Mobile collapsed: show preview + expand button */}
            {isMobile && !mobileExpanded && (
              <div style={{ marginTop: 6 }}>
                {summaryPreview && <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.6, marginBottom: 8 }}>{summaryPreview}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setMobileDetailExpanded(true)} style={{
                    flex: 1, padding: "10px 12px", minHeight: 44,
                    background: `rgba(139, 58, 42, 0.15)`, border: `1px solid ${theme.crimson}55`,
                    borderRadius: 8, color: theme.goldWarm, fontSize: 12, fontWeight: 500,
                    fontFamily: theme.fontBody, letterSpacing: 0.5,
                  }}>
                    {"\u25BC"} Full Details  {displayConnections.length > 0 ? `(${displayConnections.length} connections)` : ""}
                  </button>
                </div>
              </div>
            )}

            {/* Expanded content — full detail on desktop always, on mobile when expanded */}
            {(!isMobile || mobileExpanded) && (
              <>
              {isMobile && <div style={{ fontSize: 11, color: nodeInfo.color, letterSpacing: 1, textTransform: "uppercase", marginTop: 6, marginBottom: 4 }}>{nodeInfo.house}</div>}

            {showCanonToggles && (
              <div style={{
                display: "flex", gap: 4, marginBottom: 14, marginTop: isMobile ? 8 : 0,
                padding: 4, background: theme.bgNearBlack, borderRadius: 8, border: `1px solid ${theme.glassBorder}`,
              }}>
                {availableModes.includes("combined") && (
                  <button
                    type="button"
                    onClick={() => setCanonMode("combined")}
                    style={{
                      flex: 1, padding: "10px 8px", minHeight: 44, fontSize: 12, fontFamily: theme.fontBody, fontWeight: canonMode === "combined" ? 600 : 400,
                      background: canonMode === "combined" ? "rgba(139, 58, 42, 0.2)" : "transparent",
                      border: canonMode === "combined" ? `1px solid ${theme.crimson}55` : "1px solid transparent",
                      borderRadius: 6,
                      color: canonMode === "combined" ? theme.goldWarm : theme.textMuted,
                    }}
                  >
                    TV & Books
                  </button>
                )}
                {availableModes.includes("books") && (
                  <button
                    type="button"
                    onClick={() => setCanonMode("books")}
                    style={{
                      flex: 1, padding: "10px 8px", minHeight: 44, fontSize: 12, fontFamily: theme.fontBody, fontWeight: canonMode === "books" ? 600 : 400,
                      background: canonMode === "books" ? "rgba(168, 140, 64, 0.15)" : "transparent",
                      border: canonMode === "books" ? `1px solid ${theme.goldMuted}44` : "1px solid transparent",
                      borderRadius: 6,
                      color: canonMode === "books" ? theme.goldMuted : theme.textMuted,
                    }}
                  >
                    Book Only
                  </button>
                )}
                {availableModes.includes("tv") && (
                  <button
                    type="button"
                    onClick={() => setCanonMode("tv")}
                    style={{
                      flex: 1, padding: "10px 8px", minHeight: 44, fontSize: 12, fontFamily: theme.fontBody, fontWeight: canonMode === "tv" ? 600 : 400,
                      background: canonMode === "tv" ? "rgba(70, 130, 180, 0.15)" : "transparent",
                      border: canonMode === "tv" ? "1px solid rgba(70,130,180,0.4)" : "1px solid transparent",
                      borderRadius: 6,
                      color: canonMode === "tv" ? "#87CEEB" : theme.textMuted,
                    }}
                  >
                    TV Only
                  </button>
                )}
              </div>
            )}

            <div style={{ fontSize: 12, color: theme.textMuted, fontStyle: "italic", marginBottom: 14, fontFamily: theme.fontDisplay }}>
              {nodeInfo.title}
            </div>
            <div style={{
              fontSize: 13,
              color: summary.isPlaceholder ? theme.textMuted : theme.textSecondary,
              fontStyle: summary.isPlaceholder ? "italic" : "normal",
              lineHeight: 1.8,
              marginBottom: showBookNote ? 12 : 18,
            }}>
              {summary.text}
            </div>
            {showBookNote && (
              <div style={{
                fontSize: 12, color: theme.goldMuted, lineHeight: 1.65, marginBottom: 18,
                padding: "12px 14px", background: "rgba(168, 140, 64, 0.08)",
                borderRadius: 8, borderLeft: `3px solid ${theme.goldMuted}88`,
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, display: "block", marginBottom: 6, color: theme.ember }}>BOOK vs TV</span>
                {nodeInfo.bookNote}
              </div>
            )}
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: theme.textMuted, marginBottom: 12 }}>
              Connections ({displayConnections.length})
            </div>
            {displayConnections.length === 0 && (
              <div style={{ fontSize: 11, color: theme.textMuted, fontStyle: "italic", marginBottom: 10 }}>
                {canonMode === "books" && "No book-only connections defined yet for this character."}
                {canonMode === "tv" && "No TV-only connections defined yet for this character."}
                {canonMode === "combined" && "No connections defined yet for this character."}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayConnections.map((e, i) => {
                const otherId = (typeof e.source === "object" ? e.source.id : e.source) === selectedNode
                  ? (typeof e.target === "object" ? e.target.id : e.target)
                  : (typeof e.source === "object" ? e.source.id : e.source);
                const other = filteredNodes.find(n => n.id === otherId);
                if (!other) return null;
                const origEdge = filteredEdges.find(ge =>
                  (ge.source === (typeof e.source === "object" ? e.source.id : e.source)) &&
                  (ge.target === (typeof e.target === "object" ? e.target.id : e.target))
                ) || filteredEdges.find(ge =>
                  (ge.target === (typeof e.source === "object" ? e.source.id : e.source)) &&
                  (ge.source === (typeof e.target === "object" ? e.target.id : e.target))
                );
                return (
                  <div key={i}
                    role="button"
                    tabIndex={0}
                    onKeyDown={ev => ev.key === "Enter" && setSelectedNode(otherId)}
                    style={{
                      padding: "12px 14px", background: theme.bgNearBlack,
                      borderRadius: 8, borderLeft: `3px solid ${other.color}77`,
                      cursor: "pointer",
                      border: `1px solid ${theme.glassBorder}`,
                    }}
                    onClick={() => { setSelectedNode(otherId); setMobileDetailExpanded(false); }}
                    onMouseEnter={ev => { ev.currentTarget.style.background = "rgba(255,255,255,0.04)"; ev.currentTarget.style.borderColor = theme.glassBorderHover; }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = theme.bgNearBlack; ev.currentTarget.style.borderColor = theme.glassBorder; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, color: other.color, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: other.color, flexShrink: 0 }} />
                      <span>{other.name}</span>
                      <span style={{ fontSize: 10, color: theme.textMuted }}>{"\u2192"}</span>
                    </div>
                    {origEdge && (
                      <div style={{ fontSize: 11.5, color: theme.textMuted, lineHeight: 1.65 }}>
                        {(() => {
                          const relText = getConnectionDescription(origEdge, canonMode);
                          return relText.length > 160 ? relText.substring(0, 160) + "..." : relText;
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {isMobile && mobileExpanded && (
              <button onClick={() => setMobileDetailExpanded(false)} style={{
                marginTop: 12, padding: "10px 12px", minHeight: 44, width: "100%",
                background: theme.bgNearBlack, border: `1px solid ${theme.glassBorder}`,
                borderRadius: 8, color: theme.textMuted, fontSize: 12, fontWeight: 500,
                fontFamily: theme.fontBody, letterSpacing: 0.5,
              }}>
                {"\u25B2"} Collapse
              </button>
            )}
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TIMELINE DATA (same as before, abbreviated keys for size)
// ═══════════════════════════════════════════════════════
const eras = [
  {
    era: "The Dawn Age & The Long Night",
    timeframe: "~12,000—6,000 BC", color: "#4a6670", type: "ancient",
    summary: "The First Men crossed the land bridge from Essos and warred with the Children of the Forest for millennia before forging the Pact on the Isle of Faces. The Long Night brought the Others and an endless winter lasting a generation. The last hero sought out the Children of the Forest and together they drove back the darkness. Brandon the Builder raised the Wall and founded House Stark.",
    showNote: "The show depicts the Children of the Forest creating the Night King by driving dragonsteel into a man's chest. This figure does not exist in the books, where the Others' origins remain a mystery. The book's 'Night's King' is a legendary Lord Commander who wed an Other, an entirely different figure.",
    factions: [
      { name: "Legendary Figures", characters: [
        { name: "The Last Hero", actions: "Sought the Children during the Long Night, losing his companions, his horse, and his dog to the cold and the Others. His sword froze so hard the steel shattered, but he found the Children and together they drove back the darkness." },
        { name: "Brandon the Builder", actions: "Raised the Wall with the aid of giants and the Children's magic. Built Winterfell, Storm's End, and the Hightower's foundation. Every impossible ancient structure is attributed to him." },
        { name: "The Night's King", actions: "The 13th Lord Commander who fell in love with a woman with bright blue eyes — possibly a female Other. Ruled the Nightfort for thirteen years with human sacrifices before being brought down.", showNote: "The show's 'Night King' is completely different — the leader of all White Walkers, created by the Children. Book lore treats this as a cautionary tale, not an active antagonist." },
        { name: "Azor Ahai", actions: "Forged Lightbringer by plunging it through the heart of his wife Nissa Nissa. Led the fight against the darkness. Some prophecies suggest he will be reborn; Melisandre equates him with The Prince That Was Promised, though the texts do not confirm they are the same figure." },
        { name: "Garth Greenhand", actions: "Mythic High King of the First Men in the Reach, ancestor of House Gardener. Said to have made the land bloom wherever he walked." },
        { name: "The Grey King", actions: "First King of the Iron Islands who slew the sea dragon Nagga and made a hall of its bones. Ancestor of all ironborn noble houses." },
      ]}
    ], characterCount: "6 legendary figures",
  },
  {
    era: "The Andal Invasion & Rise of the Seven Kingdoms",
    timeframe: "~6,000—700 BC", color: "#7a6955", type: "ancient",
    summary: "The Andals sailed from Essos carrying the Faith of the Seven, carving seven-pointed stars into their flesh. They overwhelmed the First Men kingdoms one by one. Only the North held them off. Seven great kingdoms eventually emerged.",
    factions: [
      { name: "The Seven Kingdoms (Pre-Conquest)", characters: [
        { name: "House Stark — Kings of Winter", actions: "Ruled the North for 8,000 years from Winterfell, the longest unbroken dynasty. Repelled the Andal invasion at Moat Cailin." },
        { name: "House Lannister — Kings of the Rock", actions: "Descended from Lann the Clever. Became the wealthiest family through the gold mines beneath Casterly Rock." },
        { name: "House Gardener — Kings of the Reach", actions: "Claimed descent from Garth Greenhand. Their line ended at the Field of Fire." },
        { name: "House Durrandon — Storm Kings", actions: "Ruled from Storm's End, supposedly built by Brandon the Builder. Their last king, Argilac the Arrogant, refused Aegon's alliance." },
        { name: "House Hoare — Kings of the Iron Islands", actions: "Harren the Black built Harrenhal, completed the day Aegon landed." },
        { name: "House Arryn — Kings of Mountain and Vale", actions: "Among the oldest Andal bloodlines, ruling from the impregnable Eyrie." },
        { name: "House Martell — Princes of Dorne", actions: "Rose through marriage with Princess Nymeria of the Rhoynar and her ten thousand ships." },
      ]}
    ], characterCount: "7 great houses",
  },
  {
    era: "Aegon's Conquest & Targaryen Dynasty",
    timeframe: "1—282 AC", color: "#8B2500", type: "history",
    summary: "Aegon I and his sister-wives conquered six kingdoms with three dragons. For nearly 300 years, the Targaryens ruled from the Iron Throne, surviving civil wars, plagues, and the extinction of dragons. Their dynasty ended when Robert Baratheon rose in rebellion.",
    factions: [
      { name: "Targaryen Kings & Major Events", characters: [
        { name: "Aegon I, the Conqueror", actions: "Unified six kingdoms with Balerion, Vhagar, and Meraxes. Burned Harrenhal. Defeated the Lannister-Gardener host at the Field of Fire. Forged the Iron Throne." },
        { name: "Maegor I, the Cruel", actions: "Destroyed the Faith Militant with Balerion. Built the Red Keep and murdered every builder. Found dead on the Iron Throne, impaled on its blades." },
        { name: "Jaehaerys I, the Conciliator", actions: "Longest-reigning king (55 years). Reconciled with the Faith, built roads, reformed laws. His many descendants sparked the Dance." },
        { name: "The Dance of the Dragons (129—131 AC)", actions: "Rhaenyra vs. Aegon II. Dragons fought dragons. Both claimants died. The species went nearly extinct.", showNote: "House of the Dragon covers this conflict." },
        { name: "Aegon IV, the Unworthy", actions: "His deathbed legitimization of bastards spawned five generations of Blackfyre Rebellions." },
        { name: "Daemon Blackfyre", actions: "Legitimized bastard who wielded the sword Blackfyre. Slain at the Redgrass Field. His descendants launched four more rebellions.", showNote: "The Blackfyre plotline is entirely absent from the show, despite potentially being crucial to the books' endgame." },
        { name: "Bloodraven (Brynden Rivers)", actions: "Targaryen bastard, Hand, spymaster. Sent to the Wall, vanished beyond it. Became the Three-Eyed Crow.", showNote: "The show merges him with the 'Three-Eyed Raven.' His Targaryen heritage is never mentioned on screen." },
        { name: "Aegon V (Egg)", actions: "The Unlikely King from the Dunk & Egg tales. Died at Summerhall trying to hatch dragons." },
        { name: "Aerys II, the Mad King", actions: "Descended into madness. Burned enemies alive. Murdered Rickard and Brandon Stark. Planned to burn King's Landing. Slain by Jaime." },
      ]}
    ], characterCount: "9 key figures",
  },
  {
    era: "Robert's Rebellion",
    timeframe: "282—283 AC", color: "#B8860B", type: "history",
    summary: "When Rhaegar Targaryen took Lyanna Stark, the Mad King executed Rickard and Brandon Stark — burning Rickard alive in his armor while Brandon strangled himself trying to save his father. Jon Arryn raised his banners. Robert crushed Rhaegar at the Trident. Tywin sacked King's Landing. Jaime killed the king. Ned found Lyanna dying at the Tower of Joy.",
    showNote: "The show confirms R+L=J. The books have not yet confirmed this, though the evidence is overwhelming.",
    factions: [
      { name: "The Rebels", characters: [
        { name: "Robert Baratheon", actions: "Won three battles in a day. Slew Rhaegar at the Trident. Took the Iron Throne." },
        { name: "Eddard Stark", actions: "Rode to the Tower of Joy. Found Lyanna dying. 'Promise me, Ned.'" },
        { name: "Jon Arryn", actions: "Refused to surrender his wards. Raised his banners first." },
      ]},
      { name: "The Loyalists", characters: [
        { name: "Rhaegar Targaryen", actions: "Crown prince obsessed with prophecy. Died whispering a woman's name.", showNote: "The show reveals Rhaegar and Lyanna were in love. The books leave more ambiguity." },
        { name: "Ser Arthur Dayne", actions: "The Sword of the Morning, finest knight in the realm. Killed at the Tower of Joy.", showNote: "In the show, Howland stabs Dayne in the back. The books leave details ambiguous." },
      ]},
      { name: "The Opportunists", characters: [
        { name: "Tywin Lannister", actions: "Waited until the outcome was certain, then sacked King's Landing. Presented Rhaegar's murdered family as a gift." },
        { name: "Jaime Lannister", actions: "Killed the Mad King to save 500,000 lives. Sat on the Iron Throne. Judged forever." },
      ]},
    ], characterCount: "7 key figures",
  },
  {
    era: "A Game of Thrones",
    timeframe: "298 AC", color: "#4682B4", type: "book", bookNum: 1,
    summary: "Jon Arryn's death sets everything in motion. Ned goes south, discovers the truth, dies. Dany hatches dragons. Jon joins the Watch. The game begins.",
    showNote: "Season 1 is the most faithful adaptation. Characters are aged up significantly.",
    factions: [
      { name: "House Stark", characters: [
        { name: "Eddard Stark", actions: "Discovers Joffrey's illegitimacy. Betrayed by Littlefinger. Executed by Joffrey. His death ignites the war." },
        { name: "Catelyn Stark", actions: "Captures Tyrion, triggering Tywin's invasion. A mother whose every decision is driven by love for her children." },
        { name: "Robb Stark", actions: "Calls the banners at 14. Wins every battle. Proclaimed King in the North." },
        { name: "Sansa Stark", actions: "Dreams of princes. Watches her father die. Her worldview shatters completely." },
        { name: "Arya Stark", actions: "Escapes King's Landing. Syrio Forel buys her time. Begins her kill list." },
        { name: "Bran Stark", actions: "Pushed from a tower by Jaime. Begins having wolf dreams and visions of the three-eyed crow." },
        { name: "Jon Snow", actions: "Joins the Watch. Befriends Sam. Given Longclaw. Fights a wight." },
        { name: "Theon Greyjoy", actions: "Robb's companion and ward of the Starks. Rides south with Robb when the banners are called." },
      ]},
      { name: "House Lannister", characters: [
        { name: "Tywin Lannister", actions: "Unleashes Gregor on the Riverlands. Tricked by Robb into engaging a decoy force at the Green Fork while the main Stark host captures Jaime at the Whispering Wood." },
        { name: "Cersei Lannister", actions: "Engineers Robert's death. Seizes power for Joffrey." },
        { name: "Jaime Lannister", actions: "Captured by Robb at the Whispering Wood." },
        { name: "Tyrion Lannister", actions: "Arrested, demands trial by combat, wins. Sent to King's Landing as Hand." },
        { name: "Joffrey Baratheon", actions: "Orders Ned's execution against all advice. His cruelty begins." },
      ]},
      { name: "House Baratheon", characters: [
        { name: "Robert Baratheon", actions: "Mortally wounded on a hunt. His death lights the fuse." },
        { name: "Stannis Baratheon", actions: "Helped Jon Arryn investigate the truth about Cersei's children. Withdrew to Dragonstone after Jon Arryn's death." },
        { name: "Renly Baratheon", actions: "Flees King's Landing after Robert's death, refusing to support either Joffrey or Stannis." },
      ]},
      { name: "Essos", characters: [
        { name: "Daenerys Targaryen", actions: "Sold to Drogo. Becomes khaleesi. Walks into fire. Emerges with three dragons." },
        { name: "Viserys Targaryen", actions: "Receives his golden crown. 'He was no dragon.'" },
        { name: "Khal Drogo", actions: "Married Dany. Promised Westeros. Wounded. Destroyed by Mirri's 'healing.'" },
        { name: "Ser Jorah Mormont", actions: "Spying on Dany for Varys while falling in love with her." },
      ]},
      { name: "King's Landing", characters: [
        { name: "Littlefinger", actions: "Orchestrated Jon Arryn's murder. Framed Tyrion. Betrayed Ned. The architect of catastrophe." },
        { name: "Varys", actions: "Warns Ned. Plots with Illyrio. Plays a longer game than anyone suspects.", showNote: "The show makes Varys pro-Dany. The books suggest his loyalty is to Aegon/Young Griff." },
      ]},
    ], characterCount: "22 characters",
  },
  {
    era: "A Clash of Kings",
    timeframe: "299 AC", color: "#DAA520", type: "book", bookNum: 2,
    summary: "Five kings contest the throne. Stannis wields dark magic. Robb is undefeated. Balon strikes at the North. The war reaches its crescendo at the Blackwater. Dany visits Qarth and the House of the Undying.",
    showNote: "Season 2. Key changes: Robb's romance (Talisa replaces Jeyne Westerling), Dany's Qarth arc heavily embellished, House of the Undying visions almost entirely different.",
    factions: [
      { name: "The War", characters: [
        { name: "Robb Stark", actions: "Wins battles, loses the political war. Marries Jeyne Westerling, breaking his Frey betrothal.", showNote: "In the show, he marries 'Talisa' out of passion. In the books, he weds Jeyne out of duty after dishonoring her while wounded." },
        { name: "Theon Greyjoy", actions: "Seizes Winterfell. Murders two miller's boys as 'Bran and Rickon.' Captured by Ramsay." },
        { name: "Stannis Baratheon", actions: "Shadow-assassinates Renly. Assaults King's Landing. Loses the Blackwater." },
        { name: "Tyrion Lannister", actions: "Serves as Hand. Forges the chain. Leads the Blackwater defense. Gravely wounded in the battle.", showNote: "In the books, Tyrion loses most of his nose. The show gives him a facial scar instead." },
        { name: "Renly Baratheon", actions: "Assembles the largest army. Murdered by Stannis's shadow." },
      ]},
      { name: "Other Key Arcs", characters: [
        { name: "Arya Stark", actions: "Captured at Harrenhal. Jaqen H'ghar gives her three deaths and a coin: 'Valar Morghulis.'" },
        { name: "Jon Snow", actions: "Scouts the Skirling Pass. Captures Ygritte but lets her go. Kills Qhorin Halfhand on Qhorin's orders to infiltrate the wildlings." },
        { name: "Daenerys Targaryen", actions: "Reaches Qarth. Enters the House of the Undying. Sees prophetic visions. Destroys the Undying.", showNote: "The show creates an entirely original Qarth storyline. The book's House of the Undying is a dense web of prophecies." },
        { name: "Brienne of Tarth", actions: "Wins Renly's melee. Blamed for his death. Swears to Catelyn. Tasked with escorting Jaime." },
      ]},
    ], characterCount: "9 highlighted",
  },
  {
    era: "A Storm of Swords",
    timeframe: "299—300 AC", color: "#8B0000", type: "book", bookNum: 3,
    summary: "The bloodiest book. The Red Wedding. The Purple Wedding. Tyrion murders Tywin. Jon defends the Wall. Dany conquers Slaver's Bay. Sansa escapes. Lady Stoneheart rises.",
    showNote: "Seasons 3-4. Key omissions: Tysha reveal (changes Tyrion's entire arc), Lady Stoneheart (never introduced on screen).",
    factions: [
      { name: "The Red & Purple Weddings", characters: [
        { name: "Robb Stark", actions: "Executed Karstark, lost men. Went to the Twins. Murdered at the Red Wedding." },
        { name: "Catelyn / Stoneheart", actions: "Throat cut at the Red Wedding. Resurrected three days later as Lady Stoneheart.", showNote: "Lady Stoneheart was CUT from the show entirely. One of the biggest divergences." },
        { name: "Joffrey Baratheon", actions: "Poisoned at his own wedding by Olenna Tyrell and Littlefinger." },
        { name: "Tywin Lannister", actions: "Masterminded the Red Wedding. Murdered by Tyrion on the privy." },
      ]},
      { name: "Character Transformations", characters: [
        { name: "Jaime Lannister", actions: "Lost his hand. Told Brienne why he killed the Mad King. Gave her Oathkeeper. Broke from Cersei." },
        { name: "Tyrion Lannister", actions: "Married Sansa. Accused of murder. Killed Shae and Tywin. Fled east.", showNote: "The show OMITS the Tysha revelation. Book-Tyrion becomes much darker." },
        { name: "Sansa Stark", actions: "Escaped King's Landing via Littlefinger. Taken to the Vale. Watched Littlefinger push Lysa through the Moon Door." },
        { name: "Arya Stark", actions: "Traveled with the Hound. Arrived at the Twins during the Red Wedding. Left the Hound dying. Sailed for Braavos." },
        { name: "Jon Snow", actions: "Fell in love with Ygritte. Defended the Wall. Ygritte died. Elected Lord Commander." },
      ]},
      { name: "Essos", characters: [
        { name: "Daenerys Targaryen", actions: "Bought the Unsullied. Conquered Astapor, Yunkai, Meereen. Decided to stay and rule." },
        { name: "Oberyn Martell", actions: "Championed Tyrion. Fought the Mountain. Got his confession — then got his skull crushed." },
      ]},
    ], characterCount: "11 highlighted",
  },
  {
    era: "A Feast for Crows",
    timeframe: "300 AC", color: "#2F4F4F", type: "book", bookNum: 4,
    summary: "Cersei rules and self-destructs. The Faith Militant rises. Brienne searches the Riverlands. The ironborn hold a kingsmoot. Dorne plots. Sansa hides in the Vale. The crows feast on a kingdom's corpse.",
    showNote: "Season 5 (partial). Major changes: Sansa sent to Winterfell/Ramsay (doesn't happen in books), Jaime goes to Dorne (Riverlands in books), Arianne cut entirely.",
    factions: [
      { name: "Cersei's Downfall", characters: [
        { name: "Cersei Lannister", actions: "Arms the Faith Militant. Frames Margaery. Gets arrested for her own sins.", showNote: "The Walk of Atonement occurs in her ADWD chapters, since AFFC and ADWD are concurrent." },
        { name: "The High Sparrow", actions: "Weaponizes popular fury. Arrests both Margaery and Cersei." },
      ]},
      { name: "The Riverlands", characters: [
        { name: "Brienne of Tarth", actions: "Searches for Sansa. Finds only devastation. Captured by Lady Stoneheart. Screams a word to save her life.", showNote: "Stoneheart absent from the show. Brienne goes to Winterfell instead." },
        { name: "Septon Meribald", actions: "Delivers the 'broken men' speech. Guides Brienne to where the Hound may have found peace.", showNote: "Absent from the show. Speech partially given to Brother Ray." },
      ]},
      { name: "Iron Islands & Dorne", characters: [
        { name: "Euron Greyjoy", actions: "Won the kingsmoot. Sent Victarion to fetch Dany. His ambitions may extend to godhood.", showNote: "The show dramatically reduces Euron. Book Euron is far more terrifying and important." },
        { name: "Arianne Martell", actions: "Failed Queenmaker plot to crown Myrcella. Imprisoned by her father, then learns of Doran's long game for Targaryen restoration.", showNote: "CUT from the show entirely. Released TWOW sample chapters have her sent to meet Aegon." },
      ]},
      { name: "The Vale", characters: [
        { name: "Sansa (Alayne Stone)", actions: "Learning the game from Littlefinger. Managing Sweetrobin. Becoming a player.", showNote: "The show sends Sansa to Winterfell. Book-Sansa remains in the Vale." },
      ]},
    ], characterCount: "7 highlighted",
  },
  {
    era: "A Dance with Dragons",
    timeframe: "300 AC (concurrent)", color: "#800020", type: "book", bookNum: 5,
    summary: "Jon tries to save the realm. Dany struggles to rule Meereen. Tyrion journeys east. Stannis marches on Winterfell. Theon is reborn. Aegon invades Westeros. Jon is stabbed by his own brothers.",
    showNote: "Seasons 5-6. Major divergences: Young Griff/Aegon's invasion CUT. Stannis's fate left ambiguous in books. Battle of Ice and Battle of Fire are pending.",
    factions: [
      { name: "The Wall", characters: [
        { name: "Jon Snow", actions: "Lets wildlings through. Receives the Bastard Letter. Announces march on Winterfell. Stabbed. 'For the Watch.'", showNote: "The show resurrects Jon quickly. The books leave his fate as a cliffhanger." },
        { name: "Melisandre", actions: "Her POV reveals she's far less certain than she appears. Sees 'Snow' in her flames." },
      ]},
      { name: "The North", characters: [
        { name: "Stannis Baratheon", actions: "Rallies northern mountain clans. Bogged down in blizzards. His fate is unresolved.", showNote: "The show kills Stannis definitively. The books suggest a much more complex endgame." },
        { name: "Theon / Reek", actions: "Broken by Ramsay. Helps Jeyne Poole escape. Reclaims his identity. The series' most powerful redemption.", showNote: "The show substitutes Sansa for Jeyne Poole in the Winterfell storyline." },
        { name: "Wyman Manderly", actions: "Baked three missing Freys into pies and served them at the Winterfell feast. Swore vengeance for the Red Wedding. 'The North remembers, Lord Davos. The North remembers, and the mummer's farce is almost done.'", showNote: "Drastically reduced in the show. His speech and role are partially given to Lyanna Mormont." },
      ]},
      { name: "Essos", characters: [
        { name: "Daenerys Targaryen", actions: "Struggles with Meereen. Marries Hizdahr. Flies away on Drogon. Stranded. 'Dragons plant no trees.'" },
        { name: "Tyrion Lannister", actions: "Meets Aegon. Talks him into invading. Kidnapped by Jorah. Sold to slavers. Joins the Second Sons.", showNote: "The show sends Tyrion directly to Dany, much earlier and simpler." },
        { name: "Aegon (Young Griff)", actions: "Invades Westeros with the Golden Company. Takes castles. Real Targaryen or Blackfyre pretender?", showNote: "ENTIRELY CUT from the show. Arguably the single biggest divergence." },
        { name: "Barristan Selmy", actions: "Rules Meereen in Dany's absence. Prepares for the Battle of Fire.", showNote: "The show kills him in a street ambush in Season 5. In the books, he remains alive and commands Meereen's defense." },
        { name: "Quentyn Martell", actions: "Tried to steal a dragon. Burned. Died: 'Oh.'", showNote: "Cut from the show." },
        { name: "Victarion Greyjoy", actions: "Sails for Meereen with the dragon horn. Plans betrayal.", showNote: "Entirely absent from the show." },
      ]},
      { name: "Key Cliffhangers", characters: [
        { name: "Jaime Lannister", actions: "Burned Cersei's letter. Followed Brienne into Stoneheart's trap.", showNote: "The show has Jaime return to Cersei repeatedly. In the books, he breaks from her completely." },
        { name: "Varys", actions: "Murdered Kevan. Revealed as Aegon's supporter. 'I want a king raised to rule.'", showNote: "The show makes Varys a Dany supporter." },
        { name: "Davos Seaworth", actions: "Sent to Skagos to find Rickon Stark." },
        { name: "Arya Stark", actions: "Training as a Faceless Man. Cannot truly become no one — hides Needle." },
        { name: "Bran Stark", actions: "Learning greensight in Bloodraven's cave. Eating weirwood paste. His power is immense and terrifying." },
      ]},
    ], characterCount: "15 highlighted",
  },
];

// ═══════════════════════════════════════════════════════
// TIMELINE VIEW COMPONENT
// ═══════════════════════════════════════════════════════
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function MapView() {
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [hoveredLoc, setHoveredLoc] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [mapDims, setMapDims] = useState({ width: typeof window !== "undefined" ? window.innerWidth : 1000 });

  useEffect(() => {
    const onResize = () => setMapDims({ width: window.innerWidth });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobileMap = mapDims.width < 680;
  const loc = selectedLoc ? MAP_LOCATIONS.find(l => l.name === selectedLoc) : null;

  return (
    <div>
      {!isMobileMap && (
        <div style={{
          fontSize: 14, color: theme.textSecondary, lineHeight: 1.85, marginBottom: 28,
          padding: "20px 24px",
          background: "rgba(20,18,14,0.92)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderRadius: 12,
          border: "1px solid rgba(160,140,100,0.1)",
          borderLeft: "3px solid rgba(139,58,42,0.35)",
          fontWeight: 400,
          fontFamily: theme.fontBody,
        }}>
          The known world spans two major continents — <strong style={{ color: theme.textPrimary }}>Westeros</strong> in the west, a long landmass stretching from the frozen Lands of Always Winter to the deserts of Dorne, and <strong style={{ color: theme.textPrimary }}>Essos</strong> in the east, a vast continent of free cities, dothraki plains, slave ports, and the shattered ruins of Valyria. A third continent, <strong style={{ color: theme.textPrimary }}>Sothoryos</strong>, lies to the south — a jungle hell no one has successfully explored. Click any location for its complete history.
        </div>
      )}

      <div className="map-flex-container" style={{ display: "flex", gap: isMobileMap ? 0 : 20, flexWrap: "wrap", position: "relative" }}>
        <div style={{
          flex: "1 1 500px", minWidth: isMobileMap ? 0 : 320, position: "relative",
          background: "#12100c",
          borderRadius: isMobileMap ? 10 : 12,
          border: "1px solid rgba(140,120,80,0.12)",
          overflow: "hidden",
          boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
          padding: isMobileMap ? 2 : 4,
        }}>
          <div style={{ borderRadius: 8, overflow: "hidden" }}>
          <svg viewBox="0 0 560 460" style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <radialGradient id="oceanGrad" cx="42%" cy="38%" r="72%" fx="42%" fy="38%">
                <stop offset="0%" stopColor="#2a4a62" />
                <stop offset="35%" stopColor="#223d55" />
                <stop offset="70%" stopColor="#192e42" />
                <stop offset="100%" stopColor="#101e2e" />
              </radialGradient>
              <filter id="markerGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Ocean */}
            <rect x="0" y="0" width="560" height="460" fill="url(#oceanGrad)" />


            {/* Westeros landmass — with The Bite, Neck, Blackwater Bay, Ironman's Bay, Arm of Dorne */}
            <path d="M 72,12 C 95,6 138,4 165,8 C 180,12 192,22 194,38 C 195,50 192,58 190,65 C 190,75 192,88 192,100 C 192,115 188,130 182,142 C 178,150 172,158 166,165 C 158,172 160,178 168,176 C 180,172 198,166 218,168 C 235,174 242,185 238,198 C 232,210 222,220 215,228 C 210,234 206,242 200,252 C 194,260 198,270 206,278 C 212,288 216,305 220,322 C 224,338 232,350 244,358 C 254,362 264,360 266,362 C 262,370 248,380 235,390 C 222,396 205,402 188,400 C 172,396 158,386 148,372 C 137,358 122,348 104,348 C 87,350 72,348 62,340 C 52,328 48,310 48,292 C 48,276 52,262 58,250 C 62,238 64,224 62,210 C 58,200 52,192 52,184 C 54,176 60,168 66,162 C 70,152 68,138 66,122 C 64,106 64,86 66,68 C 68,50 70,32 72,18 C 72,14 72,12 72,12 Z"
              fill="#9a8e72" opacity="0.92" />

            {/* Iron Islands */}
            <path d="M 36,178 C 40,172 50,170 58,172 C 64,174 68,180 66,188 C 64,194 58,200 50,202 C 42,204 36,200 34,194 C 33,188 34,182 36,178 Z"
              fill="#9a8e72" opacity="0.85" />
            {/* Bear Island */}
            <ellipse cx="52" cy="54" rx="7" ry="5" fill="#9a8e72" opacity="0.7" />

            {/* Essos */}
            <path d="M 278,82 C 310,70 365,64 415,70 C 455,78 490,98 520,125 C 540,145 550,168 550,195 C 548,220 540,242 525,255 C 512,265 498,268 485,262 C 472,256 462,268 458,280 C 456,290 465,292 475,286 C 482,280 488,272 490,265 C 488,260 475,258 460,262 C 442,270 425,278 410,285 C 395,292 384,305 378,318 C 374,325 370,320 366,312 C 362,300 356,290 348,280 C 338,270 325,262 310,255 C 296,248 284,235 278,218 C 274,200 272,180 274,158 C 276,138 278,115 278,95 C 278,88 278,84 278,82 Z"
              fill="#9a8e72" opacity="0.85" />

            {/* Sothoryos */}
            <path d="M 310,378 C 340,370 375,365 405,368 C 430,372 450,385 456,400 C 460,412 452,428 440,440 C 426,450 405,456 380,458 C 356,458 334,452 318,442 C 304,432 296,418 296,405 C 296,392 302,385 310,378 Z"
              fill="#5e6e48" opacity="0.55" />

            {/* The Arbor island */}
            <ellipse cx="68" cy="355" rx="8" ry="5" fill="#9a8e72" opacity="0.6" />
            {/* Dragonstone island */}
            <ellipse cx="222" cy="258" rx="4" ry="3.5" fill="#9a8e72" opacity="0.65" />
            {/* Tarth island */}
            <ellipse cx="218" cy="298" rx="3.5" ry="5" fill="#9a8e72" opacity="0.55" />

            {/* Stepstones */}
            <g opacity="0.55" style={{ pointerEvents: "none" }}>
              <circle cx="270" cy="356" r="2.2" fill="#9a8e72" />
              <circle cx="274" cy="348" r="1.5" fill="#9a8e72" />
              <circle cx="276" cy="340" r="1.8" fill="#9a8e72" />
              <circle cx="274" cy="332" r="1.2" fill="#9a8e72" />
              <circle cx="278" cy="324" r="1.5" fill="#9a8e72" />
              <circle cx="276" cy="316" r="1.0" fill="#9a8e72" />
            </g>

            {/* Region borders (cartographic internal divisions) */}
            {MAP_REGIONS.map((r) => (
              <path key={r.id} d={r.path}
                fill={hoveredRegion === r.id ? "rgba(200,190,165,0.08)" : "transparent"}
                stroke={hoveredRegion === r.id ? "rgba(160,140,100,0.4)" : "rgba(120,105,75,0.18)"}
                strokeWidth={hoveredRegion === r.id ? 0.8 : 0.5}
                strokeLinejoin="round"
                style={{ cursor: "pointer", transition: "fill 0.3s ease, stroke 0.3s ease" }}
                onMouseEnter={() => setHoveredRegion(r.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
            ))}
            {/* Essos interactive region */}
            <path d="M 278,82 C 310,70 365,64 415,70 C 455,78 490,98 520,125 C 540,145 550,168 550,195 C 548,220 540,242 525,255 C 512,265 498,268 485,262 C 472,256 462,268 458,280 C 442,270 425,278 410,285 C 395,292 384,305 378,318 C 370,320 362,300 348,280 C 338,270 310,255 278,218 C 274,200 272,180 274,158 C 276,138 278,115 278,82 Z"
              fill={hoveredRegion === "essos" ? "rgba(200,190,165,0.06)" : "transparent"}
              stroke={hoveredRegion === "essos" ? "rgba(160,140,100,0.3)" : "transparent"}
              strokeWidth={0.6}
              onMouseEnter={() => setHoveredRegion("essos")}
              onMouseLeave={() => setHoveredRegion(null)}
              style={{ cursor: "pointer", transition: "fill 0.3s ease" }}
            />

            {/* The Wall */}
            <line x1="66" y1="62" x2="192" y2="58" stroke="rgba(210,225,240,0.45)" strokeWidth={2} strokeDasharray="5,2" />
            <text x="85" y="56" fontSize="6" fill="rgba(220,230,240,0.6)" fontFamily={theme.fontDisplay} letterSpacing="7" fontWeight="600">THE WALL</text>

            {/* Sea labels */}
            <text x="380" y="52" fontSize="10" fill="rgba(180,205,230,0.45)" fontStyle="italic" fontFamily={theme.fontDisplay} letterSpacing="5">THE SHIVERING SEA</text>
            <text x="222" y="225" fontSize="8" fill="rgba(180,205,230,0.4)" fontStyle="italic" fontFamily={theme.fontDisplay} letterSpacing="4">THE NARROW SEA</text>
            <text x="15" y="430" fontSize="9" fill="rgba(180,205,230,0.35)" fontStyle="italic" fontFamily={theme.fontDisplay} letterSpacing="4">THE SUNSET SEA</text>
            <text x="340" y="360" fontSize="9" fill="rgba(180,205,230,0.35)" fontStyle="italic" fontFamily={theme.fontDisplay} letterSpacing="4">THE SUMMER SEA</text>
            <text x="380" y="335" fontSize="7" fill="rgba(180,205,230,0.3)" fontStyle="italic" fontFamily={theme.fontDisplay} letterSpacing="2">SMOKING SEA</text>
            <text x="440" y="275" fontSize="7" fill="rgba(180,205,230,0.32)" fontStyle="italic" fontFamily={theme.fontDisplay} letterSpacing="3">SLAVER'S BAY</text>
            <text x="415" y="155" fontSize="7" fill="rgba(180,205,230,0.3)" fontStyle="italic" fontFamily={theme.fontDisplay} letterSpacing="3">DOTHRAKI SEA</text>

            {/* Region labels */}
            {MAP_REGIONS.map((r) => {
              const pts = r.path.match(/\d+/g).map(Number);
              const cx = pts.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0) / (pts.length / 2);
              const cy = pts.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0) / (pts.length / 2);
              const isActive = hoveredRegion === r.id;
              return (
                <text key={r.id + "_label"} x={cx} y={cy} textAnchor="middle"
                  fontSize={isActive ? "7" : "6.5"}
                  fill={isActive ? "rgba(230,220,195,0.85)" : "rgba(210,200,175,0.55)"}
                  fontFamily={theme.fontDisplay}
                  letterSpacing="2.5" fontWeight={isActive ? "600" : "400"}
                  style={{ textTransform: "uppercase", pointerEvents: "none", transition: "fill 0.3s" }}
                >{r.name}</text>
              );
            })}
            <text x="420" y="185" textAnchor="middle" fontSize="10" fill="rgba(220,210,185,0.5)"
              fontFamily={theme.fontDisplay} letterSpacing="10" fontWeight="500"
              style={{ pointerEvents: "none" }}>ESSOS</text>
            <text x="380" y="420" textAnchor="middle" fontSize="7" fill="rgba(180,195,160,0.5)"
              fontFamily={theme.fontDisplay} letterSpacing="5" fontWeight="400"
              style={{ pointerEvents: "none" }}>SOTHORYOS</text>

            {/* Location markers */}
            {MAP_LOCATIONS.map((l) => {
              const isSelected = selectedLoc === l.name;
              const isHovered = hoveredLoc === l.name;
              const rad = isSelected ? 5 : isHovered ? 4 : 2.5;
              return (
                <g key={l.name} style={{ cursor: "pointer" }}
                  onClick={() => setSelectedLoc(isSelected ? null : l.name)}
                  onMouseEnter={() => setHoveredLoc(l.name)}
                  onMouseLeave={() => setHoveredLoc(null)}
                >
                  <circle cx={l.x} cy={l.y} r={rad + 8} fill="transparent" />
                  {(isSelected || isHovered) && (
                    <circle cx={l.x} cy={l.y} r={isSelected ? 12 : 8} fill={l.color} opacity={0.08} filter="url(#markerGlow)" />
                  )}
                  {isSelected && (
                    <>
                      <circle cx={l.x} cy={l.y} r={rad + 4} fill="none" stroke={l.color} strokeWidth={0.5} opacity={0.35} />
                      <circle cx={l.x} cy={l.y} r={rad + 2} fill="none" stroke={l.color} strokeWidth={0.7} opacity={0.5} />
                    </>
                  )}
                  <circle cx={l.x} cy={l.y} r={rad}
                    fill={isSelected || isHovered ? l.color : "#c8b898"}
                    opacity={isSelected ? 1 : isHovered ? 0.95 : 0.7}
                    stroke={isSelected ? l.color : isHovered ? l.color : "rgba(20,16,10,0.4)"}
                    strokeWidth={isSelected ? 1.2 : 0.5}
                    filter={(isSelected || isHovered) ? "url(#markerGlow)" : undefined}
                  />
                  {(isHovered || isSelected) && (
                    <>
                      <text x={l.x + (l.x > 350 ? -9 : 9)} y={l.y + 3.5}
                        textAnchor={l.x > 350 ? "end" : "start"} fontSize="7.5"
                        fill="rgba(10,8,5,0.5)"
                        fontFamily={theme.fontDisplay}
                        fontWeight="600" letterSpacing="0.3"
                        style={{ pointerEvents: "none" }}
                        stroke="rgba(240,232,215,0.75)" strokeWidth={2.5} paintOrder="stroke"
                      >{l.name}</text>
                      <text x={l.x + (l.x > 350 ? -9 : 9)} y={l.y + 3.5}
                        textAnchor={l.x > 350 ? "end" : "start"} fontSize="7.5"
                        fill={isSelected ? "#f0e8d8" : "#ddd2bc"}
                        fontFamily={theme.fontDisplay}
                        fontWeight={isSelected ? "700" : "500"} letterSpacing="0.3"
                        style={{ pointerEvents: "none" }}
                      >{l.name}</text>
                    </>
                  )}
                </g>
              );
            })}

          </svg>
          </div>

          {hoveredRegion && !selectedLoc && (() => {
            const reg = MAP_REGIONS.find(r => r.id === hoveredRegion);
            if (!reg) return null;
            return (
              <div style={{
                position: "absolute", bottom: isMobileMap ? 6 : 12, left: isMobileMap ? 6 : 12, right: isMobileMap ? 6 : 12,
                background: "rgba(20,18,14,0.94)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                borderRadius: 10,
                padding: isMobileMap ? "10px 14px" : "14px 18px",
                border: "1px solid rgba(160,140,100,0.2)",
                borderTop: `2px solid ${reg.color}50`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                zIndex: 5,
              }}>
                <div style={{ fontSize: isMobileMap ? 10 : 11, fontWeight: 600, color: reg.color, marginBottom: 4, letterSpacing: 2, textTransform: "uppercase", fontFamily: theme.fontDisplay }}>{reg.name}</div>
                <div style={{ fontSize: isMobileMap ? 11 : 12, color: theme.textSecondary, lineHeight: 1.65, fontFamily: theme.fontBody }}>{reg.desc}</div>
              </div>
            );
          })()}
        </div>

        {loc && (
          <>
          {isMobileMap && (
            <div onClick={() => setSelectedLoc(null)} style={{
              position: "fixed", inset: 0, zIndex: 109, background: "rgba(0,0,0,0.4)",
            }} />
          )}
          <div className="map-location-panel" style={{
            ...(isMobileMap ? {
              position: "fixed", bottom: 0, left: 0, right: 0,
              zIndex: 110, borderRadius: "16px 16px 0 0",
              padding: "0 16px 20px",
            } : {
              flex: "1 1 280px", maxWidth: 420,
              borderRadius: 12, padding: "20px",
            }),
            background: "rgba(20,18,14,0.96)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(160,140,100,0.12)",
            maxHeight: isMobileMap ? "45vh" : 600, overflowY: "auto",
            boxShadow: isMobileMap
              ? "0 -4px 24px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}>
            {isMobileMap && (
              <div onClick={() => setSelectedLoc(null)}
                style={{ display: "flex", justifyContent: "center", padding: "10px 0 8px", cursor: "pointer", position: "sticky", top: 0, background: "rgba(20,18,14,0.96)", zIndex: 1 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: loc.color, boxShadow: `0 0 6px ${loc.color}55`, flexShrink: 0 }} />
              <span style={{ fontSize: isMobileMap ? 18 : 20, fontWeight: 600, color: theme.textPrimary, fontFamily: theme.fontDisplay }}>{loc.name}</span>
              {isMobileMap && (
                <button onClick={() => setSelectedLoc(null)} style={{
                  marginLeft: "auto", background: "none", border: `1px solid ${theme.glassBorder}`,
                  borderRadius: 8, color: theme.textMuted, cursor: "pointer", fontSize: 22,
                  padding: "4px 10px", lineHeight: 1, minWidth: 44, minHeight: 44,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{"\u00D7"}</button>
              )}
            </div>
            <div style={{ fontSize: 11, color: loc.color, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16, fontFamily: theme.fontDisplay }}>
              {loc.region}
            </div>
            <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.85, marginBottom: 24, fontFamily: theme.fontBody }}>
              {loc.lore}
            </div>

            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: theme.textMuted, marginBottom: 14, fontFamily: theme.fontDisplay }}>
              Rulers & History
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {loc.rulers.map((r, i) => (
                <div key={i} style={{
                  paddingLeft: 16,
                  borderLeft: `3px solid ${loc.color}44`,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: theme.textPrimary, fontFamily: theme.fontDisplay }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: loc.color, marginTop: 4 }}>{r.period}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 6, lineHeight: 1.7 }}>{r.note}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedLoc(null)} style={{
              marginTop: 24, padding: "12px 20px", width: "100%", minHeight: 48,
              background: "rgba(15,12,10,0.8)",
              border: "1px solid rgba(160,140,100,0.12)",
              borderRadius: 10, cursor: "pointer",
              color: theme.goldMuted, fontSize: 13, fontWeight: 500,
              fontFamily: theme.fontBody,
              letterSpacing: 1, textTransform: "uppercase",
            }}>Close</button>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

function TimelineView() {
  const [expanded, setExpanded] = useState(null);
  const [expandedFaction, setExpandedFaction] = useState(null);
  const [showDivergences, setShowDivergences] = useState(true);
  const isMobileTL = typeof window !== "undefined" && window.innerWidth < 680;

  return (
    <div>
      <div style={{ marginBottom: isMobileTL ? 16 : 24, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowDivergences(!showDivergences)}
          style={{
            padding: isMobileTL ? "10px 14px" : "10px 18px", minHeight: 44, fontSize: 12, letterSpacing: 1,
            background: showDivergences ? "rgba(70, 130, 180, 0.15)" : theme.bgCard,
            border: `1px solid ${showDivergences ? "rgba(70,130,180,0.4)" : theme.glassBorder}`,
            borderRadius: 10,
            color: showDivergences ? "#87CEEB" : theme.textMuted,
            fontFamily: theme.fontBody, textTransform: "uppercase", fontWeight: 500,
          }}
        >
          {"\u2699"} Show Divergences {showDivergences ? "On" : "Off"}
        </button>
      </div>

      {/* Timeline bar */}
      <div style={{ marginBottom: isMobileTL ? 24 : 40, padding: "0 4px" }}>
        <div style={{ display: "flex", height: isMobileTL ? 20 : 6, borderRadius: isMobileTL ? 6 : 4, overflow: "hidden", background: theme.bgCard, border: `1px solid ${theme.glassBorder}` }}>
          {eras.map((p, i) => (
            <div key={i} style={{
              flex: i < 2 ? 1 : i < 4 ? 0.8 : 1.2,
              background: p.color, opacity: expanded === i ? 1 : 0.5,
              cursor: "pointer", transition: "opacity 0.3s",
            }}
            onClick={() => { setExpanded(expanded === i ? null : i); setExpandedFaction(null); }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: theme.textFaded, marginTop: 8, letterSpacing: 1 }}>
          <span>Dawn Age</span><span>Conquest</span><span>Rebellion</span><span>AGOT</span><span>ADWD</span>
        </div>
      </div>

      {/* Era cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {eras.map((era, i) => {
          const isOpen = expanded === i;
          const isAncient = era.type === "ancient";
          const isBook = era.type === "book";
          return (
            <div key={i} style={{
              background: isOpen ? `linear-gradient(135deg, ${era.color}18 0%, ${theme.bgCard} 100%)` : theme.bgCard,
              border: `1px solid ${isOpen ? era.color + "55" : theme.glassBorder}`,
              borderRadius: 12, overflow: "hidden", transition: "all 0.3s ease",
              boxShadow: isOpen ? `0 4px 24px rgba(0,0,0,0.25)` : "none",
            }}>
              <div onClick={() => { setExpanded(isOpen ? null : i); setExpandedFaction(null); }}
                style={{ padding: isMobileTL ? "12px 12px" : (isOpen ? "16px 16px" : "12px 16px"), cursor: "pointer", minHeight: 48, display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: isMobileTL ? 8 : 10, flexWrap: "wrap", flex: 1 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: era.color, boxShadow: isOpen ? `0 0 14px ${era.color}55` : "none", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: isMobileTL ? 100 : 140 }}>
                    <span style={{
                      fontSize: isMobileTL ? 13 : (isAncient ? 14 : isBook ? 16 : 15),
                      fontWeight: isBook ? 500 : isAncient ? 300 : 400,
                      color: isBook ? theme.textPrimary : isAncient ? theme.textMuted : theme.goldMuted,
                      fontStyle: isAncient ? "italic" : "normal",
                      fontFamily: theme.fontDisplay,
                    }}>{era.era}</span>
                    {isBook && !isMobileTL && <span style={{ fontSize: 10, color: era.color, marginLeft: 10, background: era.color + "22", padding: "3px 8px", borderRadius: 4, letterSpacing: 1 }}>BOOK {era.bookNum}</span>}
                  </div>
                  {!isMobileTL && <div style={{ fontSize: 12, color: theme.textFaded }}>{era.timeframe}</div>}
                  <div style={{ fontSize: 11, color: era.color, fontWeight: 500, background: era.color + "18", padding: "4px 10px", borderRadius: 6 }}>{era.characterCount}</div>
                  <div style={{ fontSize: 12, color: theme.textMuted, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>{"\u25BC"}</div>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding: isMobileTL ? "0 10px 16px" : "0 16px 20px" }}>
                  <div style={{ fontSize: isMobileTL ? 13 : 14, color: theme.textSecondary, lineHeight: 1.8, marginBottom: isMobileTL ? 14 : 20, padding: isMobileTL ? "12px 12px" : "14px 16px", background: theme.bgNearBlack, borderRadius: 10, borderLeft: `4px solid ${era.color}66` }}>{era.summary}</div>
                  {showDivergences && era.showNote && (
                    <div style={{ fontSize: 13, color: "#6a9fb8", marginBottom: 20, padding: "14px 18px", background: "rgba(70,130,180,0.08)", borderRadius: 10, borderLeft: "4px solid rgba(70,130,180,0.5)", lineHeight: 1.75 }}>
                      <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#4682B4", fontWeight: 600 }}>TV NOTE</span><br />{era.showNote}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {era.factions.map((f, fi) => {
                      const fKey = `${i}-${fi}`;
                      const fOpen = expandedFaction === fKey;
                      return (
                        <div key={fi} style={{ background: fOpen ? theme.bgNearBlack : theme.bgCard, border: `1px solid ${fOpen ? era.color + "33" : theme.glassBorder}`, borderRadius: 10, overflow: "hidden" }}>
                          <div onClick={e => { e.stopPropagation(); setExpandedFaction(fOpen ? null : fKey); }}
                            style={{ padding: isMobileTL ? "10px 12px" : "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, minHeight: 48 }}>
                            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: era.color, fontWeight: 600, flex: 1 }}>{f.name}</span>
                            <span style={{ fontSize: 11, color: theme.textMuted }}>{f.characters.length}</span>
                            <span style={{ fontSize: 11, color: theme.textMuted, transform: fOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>{"\u25BC"}</span>
                          </div>
                          {fOpen && (
                            <div style={{ padding: isMobileTL ? "6px 12px 14px" : "8px 18px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                              {f.characters.map((c, ci) => (
                                <div key={ci} style={{ paddingLeft: isMobileTL ? 12 : 16, borderLeft: `3px solid ${era.color}44` }}>
                                  <span style={{ fontSize: isMobileTL ? 14 : 15, fontWeight: 500, color: theme.textPrimary }}>{c.name}</span>
                                  <div style={{ fontSize: isMobileTL ? 12 : 13, color: theme.textSecondary, marginTop: 6, lineHeight: 1.8 }}>{c.actions}</div>
                                  {showDivergences && c.showNote && (
                                    <div style={{ fontSize: 12, color: "#6a9fb8", marginTop: 10, padding: "10px 14px", background: "rgba(70,130,180,0.08)", borderRadius: 8, borderLeft: "3px solid rgba(70,130,180,0.5)", lineHeight: 1.7 }}>
                                      <span style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#4682B4", fontWeight: 600 }}>TV DIVERGENCE</span><br />{c.showNote}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP — PAGE SWITCHER
// ═══════════════════════════════════════════════════════
export default function ASOIAFComplete() {
  const [page, setPage] = useState("graph");

  const isMobileApp = typeof window !== "undefined" && window.innerWidth < 680;

  return (
    <div style={{
      minHeight: "100vh",
      color: theme.textPrimary,
      fontFamily: theme.fontBody,
      padding: isMobileApp
        ? "16px 10px 80px"
        : "clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)",
      position: "relative", overflowX: "hidden",
    }}>
      {/* Background — layered, responsive scaling for large screens */}
      <div className="asoiaf-bg-wrapper">
        <img
          src={`${import.meta.env.BASE_URL}background.png`}
          alt=""
          className="asoiaf-bg-img"
          fetchPriority="high"
        />
      </div>
      {/* Scrim overlay — content readability, responsive vignette for large screens */}
      <div className="asoiaf-scrim" />

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Hero — premium dark glass panel, subtly translucent */}
        <header style={{
          textAlign: "center", marginBottom: isMobileApp ? 16 : "clamp(28px, 4vw, 40px)",
          padding: isMobileApp ? "24px 16px" : "clamp(36px, 6vw, 56px) clamp(24px, 4vw, 48px)",
          background: "rgba(10, 8, 9, 0.78)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderRadius: isMobileApp ? 12 : 16,
          border: "1px solid rgba(201, 166, 92, 0.14)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
          {!isMobileApp && (
            <div style={{
              fontSize: "clamp(9px, 1.2vw, 11px)", letterSpacing: 10, textTransform: "uppercase",
              color: theme.textMuted, marginBottom: 12, fontFamily: theme.fontBody,
            }}>
              ~12,000 BC — 300 AC
            </div>
          )}
          <h1 style={{
            fontSize: isMobileApp ? 24 : "clamp(28px, 5.5vw, 52px)", fontWeight: 500, margin: 0,
            fontFamily: theme.fontDisplay,
            letterSpacing: isMobileApp ? 1 : 3, color: theme.textPrimary,
            textShadow: "0 2px 24px rgba(0,0,0,0.6), 0 0 48px rgba(139,58,42,0.12)",
          }}>A Song of Ice and Fire</h1>
          <p style={{
            marginTop: 8, fontSize: isMobileApp ? 13 : "clamp(14px, 2vw, 18px)",
            fontFamily: theme.fontDisplay, fontStyle: "italic",
            color: theme.ember, letterSpacing: 0.5,
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}>
            The Complete Character Timeline
          </p>
          {!isMobileApp && (
            <>
            <div style={{
              width: 80, height: 1,
              background: `linear-gradient(90deg, transparent, ${theme.crimson}88, transparent)`,
              margin: "22px auto 24px",
            }} />
            <a
              href="https://ko-fi.com/pinkdev"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "12px 28px",
                background: `linear-gradient(135deg, ${theme.crimson} 0%, #6b2a1a 100%)`,
                border: "1px solid rgba(232, 200, 160, 0.25)",
                borderRadius: 10,
                color: theme.textPrimary,
                fontSize: 14, fontWeight: 500,
                textDecoration: "none",
                letterSpacing: 1,
                boxShadow: "0 4px 20px rgba(139, 58, 42, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {"\u2615"} Support on Ko-fi
            </a>
            </>
          )}
        </header>

        {/* Navigation — clear active state, cohesive group */}
        <nav className="asoiaf-nav" style={{
          display: "flex", justifyContent: "center", gap: 6,
          marginBottom: "clamp(28px, 3vw, 36px)",
          padding: 6,
          background: theme.bgCard,
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderRadius: 12,
          border: `1px solid ${theme.glassBorder}`,
          maxWidth: 420, margin: "0 auto clamp(28px, 3vw, 36px) auto",
        }}>
          {[
            { id: "graph", label: "Connection Graph", mobileLabel: "Graph", icon: "\u25C8" },
            { id: "map", label: "World Map", mobileLabel: "Map", icon: "\u25C9" },
            { id: "timeline", label: "Timeline", mobileLabel: "Timeline", icon: "\u25C6" },
          ].map(p => {
            const isActive = page === p.id;
            return (
              <button
                key={p.id}
                data-active={isActive}
                onClick={() => setPage(p.id)}
                style={{
                  flex: 1, padding: isMobileApp ? "8px 6px" : "12px 18px", minHeight: 48,
                  background: isActive ? "rgba(139, 58, 42, 0.25)" : "transparent",
                  border: isActive ? `1px solid ${theme.crimson}66` : `1px solid transparent`,
                  borderRadius: 8,
                  color: isActive ? theme.goldWarm : theme.textMuted,
                  fontSize: isMobileApp ? 11 : 14, fontFamily: theme.fontBody,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: 0.5,
                  boxShadow: isActive ? `0 0 20px ${theme.crimsonGlow}` : "none",
                  textAlign: "center", lineHeight: 1.3,
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.8, marginRight: isMobileApp ? 0 : 6, display: isMobileApp ? "block" : "inline", fontSize: isMobileApp ? 18 : "inherit", marginBottom: isMobileApp ? 2 : 0 }}>{p.icon}</span>
                {isMobileApp ? p.mobileLabel : p.label}
              </button>
            );
          })}
        </nav>

        {/* Page content */}
        {page === "graph" ? <GraphView /> : page === "map" ? <MapView /> : <TimelineView />}

        {/* Footer */}
        <footer style={{
          marginTop: "clamp(36px, 5vw, 48px)",
          textAlign: "center",
          padding: "24px clamp(20px, 4vw, 32px)",
          background: theme.bgCard,
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderRadius: 12,
          border: `1px solid ${theme.glassBorder}`,
        }}>
          <div style={{
            width: 48, height: 1,
            background: `linear-gradient(90deg, transparent, ${theme.textFaded}, transparent)`,
            margin: "0 auto 16px",
          }} />
          <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.9, maxWidth: 520, margin: "0 auto" }}>
            Based on <em>A Song of Ice and Fire</em> by George R.R. Martin.
            <br />TV notes reference <em>Game of Thrones</em> (HBO, 2011—2019).
          </div>
          <div style={{ marginTop: 14, fontSize: 10, color: theme.textFaded, letterSpacing: 3, textTransform: "uppercase" }}>
            Valar Morghulis
          </div>
        </footer>
      </div>
    </div>
  );
}
