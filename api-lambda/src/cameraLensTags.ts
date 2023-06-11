export const CAMERA = {
  // M-Mount
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
  leicame: {
    name: "Leica M-E",
    fixedLens: false,
  },
  minoltacle: {
    name: "Minolta CLE",
    fixedLens: false,
  },
  zeissikon: {
    name: "Zeiss Ikon",
    fixedLens: false,
  },
  // 120
  gf670: {
    name: "Fuji GF670",
    fixedLens: true,
  },
  rolleiflex28c: {
    name: "Rolleiflex 2.8C",
    fixedLens: true,
  },
  bronicasqa: {
    name: "Bronica SQ-A",
    fixedLens: false,
  },
  // Instant
  polaroidlandcamera355: {
    name: "Polaroid Land Camera 355",
    fixedLens: true,
  },
  polaroidlandcamera340: {
    name: "Polaroid Land Camera 340",
    fixedLens: true,
  },
  // Other
  ricohgr: {
    name: "Ricoh GR",
    fixedLens: true,
  },
  ricohgriii: {
    name: "Ricoh GR III",
    fixedLens: true,
  },
  ricohgriiix: {
    name: "Ricoh GR IIIx",
    fixedLens: true,
  },
  sonyalpha7: {
    name: "Sony Alpha 7",
    fixedLens: false,
  },
  x100: {
    name: "Fuji X100",
    fixedLens: true,
  },
  x100t: {
    name: "Fuji X100T",
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
  voigtlandernokton40mmf14sc: {
    name: "Voigtlander Nokton 40mm f1.4",
  },
  elmar90mmf4: {
    name: "Leica Elmar-C 90mm f4",
  },
  zeiss35mmf2biogonzm: {
    name: "Zeiss 35mm Biogon f2",
  },
  ["7artisans50mm11"]: {
    name: "7artisans 50mm f1.1",
  },
  leica50mmsummicron: {
    name: "Leica Summicron 50mm f2",
  },
  leica21mmsuperelmarmf34: {
    name: "Leica Super-Elmar-M 21mm f3.4",
  },
  leica90mmelmaritmf28: {
    name: "Leica Elmarit-M 90mm f2.8",
  },
  leica35mmsummicron: {
    name: "Leica Summicron 35mm f2",
  },
  minoltamrokkor40mmf2: {
    name: "Minolta M-Rokkor 40mm f2",
  },
  voigtlandersuperwideheliar15mmf45: {
    name: "Voigtlander Super-wide Heliar 15mm f4.5",
  },
  voigtlandernokton75mmf15: {
    name: "Voigtlander Nokton 75mm f1.5",
  },
  voigtlandernokton40mmf12: {
    name: "Voigtlander Nokton 40mm f1.2",
  },
};
