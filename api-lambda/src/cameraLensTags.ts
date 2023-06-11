export const CAMERA = {
  leicam10: {
    name: "Leica M10",
    fixedLens: false,
  },
  leicam9: {
    name: "Leica M9",
    fixedLens: false,
  },
  leicammonochrom: {
    name: "Leica M Monochrom",
    fixedLens: false,
  },
  gf670: {
    name: "Fuji GF670",
    fixedLens: true,
  },
  ricohgr: {
    name: "Ricoh GR",
    fixedLens: true,
  },
};

export const LENS = {
  // Include all cameras that have a fixed lens as a lens
  ...Object.keys(CAMERA)
    .filter((tag) => CAMERA[tag].fixedLens)
    .reduce((acc, tag) => {
      acc[tag] = { name: CAMERA[tag].name };
      return acc;
    }, {}),

  // M-Mount
  ["voigtlandernokton40mmf1.4sc"]: {
    name: "Voigtlander Nokton 40mm f1.4",
  },
  ["elmar90mmf4"]: {
    name: "Leica Elmar-C 90mm f4",
  },
  ["zeiss35mmf2biogonzm"]: {
    name: "Zeiss 35mm Biogon f2",
  },
  ["7artisans50mmf1.1"]: {
    name: "7artisans 50mm f1.1",
  },
  ["leicasummicron50mmf2"]: {
    name: "Leica Summicron 50mm f2",
  },
  ["leicasuperelmar21mmf3.4"]: {
    name: "Leica Super-Elmar-M 21mm f3.4",
  },
  ["leicaelmarit90mmf2.8"]: {
    name: "Leica Elmarit-M 90mm f2.8",
  },
  ["leicasummicron35mmf2"]: {
    name: "Leica Summicron 35mm f2",
  },
  ["minoltamrokkor40mmf2"]: {
    name: "Minolta M-Rokkor 40mm f2",
  },
  ["voigtlandersuperwideheliar15mmf4.5"]: {
    name: "Voigtlander Super-wide Heliar 15mm f4.5",
  },
  ["voigtlandernokton75mmf1.5"]: {
    name: "Voigtlander Nokton 75mm f1.5",
  },
  ["voigtlandernokton40mmf1.2"]: {
    name: "Voigtlander Nokton 40mm f1.2",
  },
};
