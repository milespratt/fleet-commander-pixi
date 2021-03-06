// VARIABLES
export const colors = {
  blue: 0xe670ffe9,
  blueGlow: 0x0070ffe9,
  // blue: 0x70ffe9,
  black: 0x120114,
  purple: 0x190b28,
  pink: 0xf7567c,
  yellow: 0xf9e784,
  white: 0xffffff,
  green: 0x2ad15c,
};

export const statuses = {
  idle: "idle",
  travelling: "travelling",
  accelerating: "accelerating",
  decelerating: "decelerating",
  spooling: "spooling",
  mining: "mining",
};

export const textResolution = 2;
export const calculationMultiplier = 16.6666666666666666666666666666666666666667;
export const lightYear = 9460730472580800; // meters per light year
export const lightSpeed = 299792458; // meters per second
export const pixelsPerLightyear = 100;
export const au = 149597870700; // 1 astronomical unit in meters 1AU
export const baseAPIurl =
  process.env.NODE_ENV === "dev"
    ? "http://192.168.1.30"
    : "https://api.fltcmdr.com";
export const worldSize = 10000;
// universe
export const generationParameters = {
  maxExtraGenerationLoops: 1000000,
  maxStars: 10000, // 50,000
  maxGenTime: 1000 * 10, // milliseconds base
  edgeDistance: 100, // pixels from edge
  // 100 pixels per light year
  // numbers below in pixels
  size: worldSize,
  minimumStarDistance: 100, // 100 default
  radial: false,
};

// VIEWPORT
const viewContainer = document.getElementById("view");
const viewContainerBounds = viewContainer.getBoundingClientRect();
export const screenWidth = viewContainerBounds.width;
export const screenHeight = viewContainerBounds.height;
export const viewportClamps = {
  minWidth: screenWidth / 2, // zoom in
  minHeight: screenHeight / 2, // zoom in
  // maxWidth: screenWidth > screenHeight ? 1000000000000 : worldHeight * 1, // zoom out
  // maxHeight: screenHeight > screenWidth ? 1000000000000 : worldWidth * 1 // zoom out
  maxWidth: screenWidth * 2.5, // zoom out
  maxHeight: screenWidth * 2.5, // zoom out
};

// SHIPS
export const shipTypes = [
  "BC",
  "BS",
  "CS",
  "HMS",
  "HWSS",
  "ISS",
  "LWSS",
  "SC",
  "SS",
  "SSE",
  "USS",
];

export const shipNames = [
  "Ace of Spades",
  "Actium",
  "Adam",
  "Adder",
  "Advance",
  "Alexander",
  "Alliance",
  "Anarchy",
  "Angel",
  "Annihilator",
  "Antarctica",
  "Antioch",
  "Apocalypse",
  "Aquila",
  "Archmage",
  "Arden",
  "Ares",
  "Atlantic",
  "Aurora",
  "Avalon",
  "Avius",
  "Bastion",
  "Beluga",
  "Big Boy",
  "Big Momma",
  "Bishop",
  "Black Cloud",
  "Blue Space",
  "Boa",
  "Bronze Age",
  "Brotherhood",
  "Carnage",
  "Centurion",
  "Cloud",
  "Columbia",
  "Comet",
  "Cretaceous",
  "Cromwell",
  "Dart",
  "Death",
  "Deep Space",
  "Defiance",
  "Deimos",
  "Desire",
  "Detection",
  "Detector",
  "Diplomat",
  "Eagle",
  "Einstein",
  "Emissary",
  "Enlightenment",
  "Enterprise",
  "Eternal",
  "Executioner",
  "Executor",
  "Foghorn",
  "Fortune",
  "Fudgy",
  "Galactic Core",
  "Galactica",
  "Ganges",
  "Gauntlet",
  "Genesis",
  "Green",
  "Gremlin",
  "Hammer",
  "Hercules",
  "Himalaya",
  "Hummingbird",
  "Hurricane Laura",
  "Imperial",
  "Infinite Frontier",
  "Inquisitor",
  "Intrepid",
  "Invictus",
  "Jellyfish",
  "Justice",
  "Karma",
  "Kingfisher",
  "Knossos",
  "Kryptoria",
  "Lavanda",
  "Leviathan",
  "Liberator",
  "Lightning",
  "Little Ral",
  "Little Rascal",
  "Manticore",
  "Marauder",
  "Marduk",
  "Masada",
  "Mercenary Star",
  "Mercenary",
  "Messenger",
  "Montgomery",
  "Natural Selection",
  "Nelson",
  "Nemesis",
  "Neptune",
  "New Hope",
  "Newton",
  "Nightingale",
  "Nostradamus",
  "Observer",
  "Ohio",
  "Opal Star",
  "Paradise",
  "Paramount",
  "Peacock",
  "Pegasus",
  "Perilous",
  "Philadelphia",
  "Piranha",
  "Poseidon",
  "Proton",
  "Quantum",
  "Ravager",
  "Rebellious",
  "Reliant",
  "Retribution",
  "Revenant",
  "Rhodes",
  "Rising",
  "Sagittarius",
  "Scorpio",
  "Seraphim",
  "Sirius",
  "Sparrow",
  "Spider",
  "Star Talon",
  "Steel Aurora",
  "Stormfalcon",
  "Tempest",
  "Templar",
  "Teresa",
  "Termite",
  "Thanksgiving",
  "Exterminator",
  "Prophet",
  "Thor",
  "Thunderbolt",
  "Thylacine",
  "Tomahawk",
  "Ultimate Law",
  "Venom",
  "Victoria",
  "Virginia",
  "Visitor",
  "Watcher",
  "Wellington",
  "Wolverine",
];
