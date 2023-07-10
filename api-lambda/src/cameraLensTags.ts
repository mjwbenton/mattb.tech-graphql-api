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
  voigtlanderbessar3m: {
    name: "Voigtlander Bessa R3M",
    fixedLens: false,
  },
  // 120
  gf670: {
    name: "Fuji GF670",
    fixedLens: true,
  },
  rolleiflex35e: {
    name: "Rolleiflex 3.5E",
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
  yashicamat: {
    name: "Yashica Mat",
    fixedLens: true,
  },
  bronicaetrsi: {
    name: "Bronica ETRSi",
    fixedLens: false,
  },
  mamiya645e: {
    name: "Mamiya 645E",
    fixedLens: false,
  },
  wirgin6x9folder: {
    name: "Wirgin 6x9 folder",
    fixedLens: true,
  },
  hasselblad500cm: {
    name: "Hasselblad 500CM",
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
  mamiyauniversalpress: {
    name: "Mamiya Universal Press",
    fixedLens: false,
  },
  fujiinstaxwide: {
    name: "Fuji Instax Wide",
    fixedLens: true,
  },
  // Pentax
  pentaxmx: {
    name: "Pentax MX",
    fixedLens: false,
  },
  pentaxmesuper: {
    name: "Pentax ME Super",
    fixedLens: false,
  },
  pentaxk1000: {
    name: "Pentax K1000",
    fixedLens: false,
  },
  pentaxkm: {
    name: "Pentax K-m",
    fixedLens: false,
  },
  // 35mm
  olympustrip35: {
    name: "Olympus Trip 35",
    fixedLens: true,
  },
  olympus35ecr: {
    name: "Olympus 35 ECR",
    fixedLens: true,
  },
  olympusxa: {
    name: "Olympus XA",
    fixedLens: true,
  },
  actionsampler: {
    name: "Action Sampler",
    fixedLens: true,
  },
  kodakpop: {
    name: "Kodak Pop",
    fixedLens: true,
  },
  canoneos300: {
    name: "Canon EOS 300",
    fixedLens: false,
  },
  // Other Digital
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
  fujifilmfinepixf30: {
    name: "Fujifilm FinePix F30",
    fixedLens: true,
  },
  canon40d: {
    name: "Canon 40D",
    fixedLens: false,
  },
  panasoniclumixgf1: {
    name: "Panasonic Lumix GF-1",
    fixedLens: false,
  },
  //Phones
  sonyericssonk750i: {
    name: "Sony Ericsson K750i",
    fixedLens: true,
  },
  iphone6s: {
    name: "iPhone 6s",
    fixedLens: true,
  },
  pixel2: {
    name: "Google Pixel 2",
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
  voigtlanderultron35mmf2: {
    name: "Voigtlander Ultron 35mm f2",
  },
  // Bronica
  bronica80mmf28zenzanonps: {
    name: "Bronica Zenzanon-PS 80mm f2.8",
  },
  bronicazenzanons150mmf35: {
    name: "Bronica Zenzanon-S 150mm f3.5",
  },
  bronicazenzanons40mmf4: {
    name: "Bronica Zenzanon-S 40mm f4",
  },
  // Pentax
  pentaxm11750mm: {
    name: "Pentax-M 50mm f1.7",
  },
  pentaxm40mmf28: {
    name: "Pentax-M 40mm f2.8",
  },
  takumar125135mm: {
    name: "Pentax Takumar 135mm f2.5",
  },
  pentaxdal135561855mm: {
    name: "Pentax-DA L 18-55mm f3.5-5.6",
  },
  smcpentaxda50200mmf456ed: {
    name: "Pentax-DA 50-200mm F4-5.6 ED",
  },
  sigmasuperwideii12824mm: {
    name: "Sigma Super Wide II 24mm f2.8",
  },
  cosina20mmf38: {
    name: "Cosina 20mm f3.8",
  },
  vivitar19mmf38: {
    name: "Vivitar 19mm f3.8",
  },
  pentaxm12050mm: {
    name: "Pentax-M 1:2.0 50mm",
  },
  // Canon
  canonef50mmf18ii: {
    name: "Canon EF 50mm f1.8 II",
  },
  sigma30mmf14exdchsm: {
    name: "Sigma 30mm f1.4 EX DC HSM",
  },
  canon70200mmf4l: {
    name: "Canon 70-200mm f4 L",
  },
  canonef85mmf18: {
    name: "Canon EF 85mm f1.8",
  },
  sigma1850f28exdc: {
    name: "Sigma 18-50 f/2.8 EX DC",
  },
  // Panasonic
  panasonic20mmf17: {
    name: "Panasonic 20mm f1.7",
  },
  panasonic14mmf25: {
    name: "Panasonic 14mm f2.5",
  },
  camdiox25mmf14tvlens: {
    name: "Camdiox 25mm f1.4 TV Lens",
  },
  // Other
  mamiya127mmf47: {
    name: "Mamiya 127mm f4.7",
  },
  mamiya80mmf19: {
    name: "Mamiya 80mm f1.9",
  },
  carlzeissplanar80mmf28t: {
    name: "Carl Zeiss Planar 80mm f2.8 T*",
  },
  bronica75mmf28zenzanonpe: {
    name: "Bronica 75mm f2.8 Zenzanon PE",
  },
};
