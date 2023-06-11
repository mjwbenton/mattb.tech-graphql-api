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
};
