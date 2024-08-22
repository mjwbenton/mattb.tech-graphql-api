export enum Format {
  Digital = "Digital",
  Film120 = "Film120",
  Film35mm = "Film35mm",
  Instant = "Instant",
}

export const CAMERA = {
  // M-Mount
  leicam10: {
    name: "Leica M10",
    fixedLens: false,
    format: Format.Digital,
  },
  leicam10monochrom: {
    name: "Leica M10 Monochrom",
    fixedLens: false,
    format: Format.Digital,
  },
  leicam9: {
    name: "Leica M9",
    fixedLens: false,
    format: Format.Digital,
  },
  leicammonochrom: {
    name: "Leica M Monochrom",
    fixedLens: false,
    format: Format.Digital,
  },
  leicame: {
    name: "Leica M-E",
    fixedLens: false,
    format: Format.Digital,
  },
  minoltacle: {
    name: "Minolta CLE",
    fixedLens: false,
    format: Format.Film35mm,
  },
  zeissikon: {
    name: "Zeiss Ikon",
    fixedLens: false,
    format: Format.Film35mm,
  },
  voigtlanderbessar3m: {
    name: "Voigtlander Bessa R3M",
    fixedLens: false,
    format: Format.Film35mm,
  },
  // 120
  gf670: {
    name: "Fuji GF670",
    fixedLens: true,
    format: Format.Film120,
  },
  rolleiflex35e: {
    name: "Rolleiflex 3.5E",
    fixedLens: true,
    format: Format.Film120,
  },
  rolleiflex28c: {
    name: "Rolleiflex 2.8C",
    fixedLens: true,
    format: Format.Film120,
  },
  bronicasqa: {
    name: "Bronica SQ-A",
    fixedLens: false,
    format: Format.Film120,
  },
  yashicamat: {
    name: "Yashica Mat",
    fixedLens: true,
    format: Format.Film120,
  },
  bronicaetrsi: {
    name: "Bronica ETRSi",
    fixedLens: false,
    format: Format.Film120,
  },
  mamiya645e: {
    name: "Mamiya 645E",
    fixedLens: false,
    format: Format.Film120,
  },
  wirgin6x9folder: {
    name: "Wirgin 6x9 folder",
    fixedLens: true,
    format: Format.Film120,
  },
  hasselblad500cm: {
    name: "Hasselblad 500CM",
    fixedLens: false,
    format: Format.Film120,
  },
  // Instant
  polaroidlandcamera355: {
    name: "Polaroid Land Camera 355",
    fixedLens: true,
    format: Format.Instant,
  },
  polaroidlandcamera340: {
    name: "Polaroid Land Camera 340",
    fixedLens: true,
    format: Format.Instant,
  },
  mamiyauniversalpress: {
    name: "Mamiya Universal Press",
    fixedLens: false,
    format: Format.Instant,
  },
  fujiinstaxwide: {
    name: "Fuji Instax Wide",
    fixedLens: true,
    format: Format.Instant,
  },
  // Pentax
  pentaxmx: {
    name: "Pentax MX",
    fixedLens: false,
    format: Format.Film35mm,
  },
  pentaxmesuper: {
    name: "Pentax ME Super",
    fixedLens: false,
    format: Format.Film35mm,
  },
  pentaxk1000: {
    name: "Pentax K1000",
    fixedLens: false,
    format: Format.Film35mm,
  },
  pentaxkm: {
    name: "Pentax K-m",
    fixedLens: false,
    format: Format.Film35mm,
  },
  // 35mm
  olympustrip35: {
    name: "Olympus Trip 35",
    fixedLens: true,
    format: Format.Film35mm,
  },
  olympus35ecr: {
    name: "Olympus 35 ECR",
    fixedLens: true,
    format: Format.Film35mm,
  },
  olympusxa: {
    name: "Olympus XA",
    fixedLens: true,
    format: Format.Film35mm,
  },
  actionsampler: {
    name: "Action Sampler",
    fixedLens: true,
    format: Format.Film35mm,
  },
  kodakpop: {
    name: "Kodak Pop",
    fixedLens: true,
    format: Format.Film35mm,
  },
  canoneos300: {
    name: "Canon EOS 300",
    fixedLens: false,
    format: Format.Film35mm,
  },
  contaxt: {
    name: "Contax T",
    fixedLens: true,
    format: Format.Film35mm,
  },
  // Other Digital
  ricohgr: {
    name: "Ricoh GR",
    fixedLens: true,
    format: Format.Digital,
  },
  ricohgriii: {
    name: "Ricoh GR III",
    fixedLens: true,
    format: Format.Digital,
  },
  ricohgriiix: {
    name: "Ricoh GR IIIx",
    fixedLens: true,
    format: Format.Digital,
  },
  sonyalpha7: {
    name: "Sony Alpha 7",
    fixedLens: false,
    format: Format.Digital,
  },
  x100: {
    name: "Fuji X100",
    fixedLens: true,
    format: Format.Digital,
  },
  x100t: {
    name: "Fuji X100T",
    fixedLens: true,
    format: Format.Digital,
  },
  fujifilmfinepixf30: {
    name: "Fujifilm FinePix F30",
    fixedLens: true,
    format: Format.Digital,
  },
  canon40d: {
    name: "Canon 40D",
    fixedLens: false,
    format: Format.Digital,
  },
  panasoniclumixgf1: {
    name: "Panasonic Lumix GF-1",
    fixedLens: false,
    format: Format.Digital,
  },
  leicaq2monochrom: {
    name: "Leica Q2 Monochrom",
    fixedLens: true,
    format: Format.Digital,
  },
  //Phones
  sonyericssonk750i: {
    name: "Sony Ericsson K750i",
    fixedLens: true,
    format: Format.Digital,
  },
  iphone6s: {
    name: "iPhone 6s",
    fixedLens: true,
    format: Format.Digital,
  },
  pixel2: {
    name: "Google Pixel 2",
    fixedLens: true,
    format: Format.Digital,
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
  voigtlandercolorskopar21mmf35: {
    name: "Voigtlander Color-Skopar 21mm f3.5",
  },
  voigtlanderultron75mmf19: {
    name: "Voigtlander Ultron 75mm f1.9",
  },
  leica90mmmacroelmarm: {
    name: "Leica Macro-Elmar-M 90mm f4",
  },
  voigtlandernokton35mmf15: {
    name: "Voigtlander Nokton 35mm f1.5",
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

export const FILM = {
  fujineopan100acros: {
    name: "Fuji Neopan 100 Acros",
  },
  // Duplicate
  neopan100acros: {
    name: "Fuji Neopan 100 Acros",
  },
  kodaktmax100: {
    name: "Kodak T-Max 100",
  },
  // Duplicate
  tmax100: {
    name: "Kodak T-Max 100",
  },
  kodaktmax400: {
    name: "Kodak T-Max 400",
  },
  // Duplicate
  tmax400: {
    name: "Kodak T-Max 400",
  },
  reala: {
    name: "Fuji Superia Reala 100",
  },
  legacypro100: {
    name: "Legacy Pro 100",
  },
  rolleicr200: {
    name: "Rollei CR200",
  },
  kodaktrix400: {
    name: "Kodak Tri-X 400",
  },
  ilfordpanf50: {
    name: "Ilford PanF+ 50",
  },
  ilforddelta3200: {
    name: "Ilford Delta 3200",
  },
  provia400x: {
    name: "Fuji Provia 400X",
  },
  fujivelvia100: {
    name: "Fuji Velvia 100",
  },
  // Duplicate
  velvia100: {
    name: "Fuji Velvia 100",
  },
  ektar100: {
    name: "Kodak Ektar 100",
  },
  fujisuperia1600: {
    name: "Fuji Superia 1600",
  },
  fujifilmpro800z: {
    name: "Fuji Pro800Z",
  },
  kodakektachromeeliteii: {
    name: "Kodak Ektachrome Elite II",
  },
  kodakektachromee200: {
    name: "Kodak Ektachrome E200",
  },
  ilfordhp5: {
    name: "Ilford HP5+",
  },
  ilforddelta100: {
    name: "Ilford Delta 100",
  },
  kodake100vs: {
    name: "Kodak E100VS",
  },
  // Duplicate
  e100vs: {
    name: "Kodak E100VS",
  },
  fujisensia400: {
    name: "Fuji Sensia 400",
  },
  fujivelvia50: {
    name: "Fuji Velvia 50",
  },
  fujineopan400: {
    name: "Fuji Neopan 400",
  },
  fujiprovia100f: {
    name: "Fuji Provia 100F",
  },
  rolleirpx400: {
    name: "Rollei RPX 400",
  },
  fujipro160ns: {
    name: "Fuji Pro 160NS",
  },
  rolleiretro400s: {
    name: "Rollei Retro 400S",
  },
  astia: {
    name: "Fuji Astia 100F",
  },
  fp4: {
    name: "Ilford FP4+",
  },
  fomapan100: {
    name: "Fomapan 100",
  },
  fomapan200: {
    name: "Fomapan 200",
  },
  fomapan400: {
    name: "Fomapan 400",
  },
  kodakgold200: {
    name: "Kodak Gold 200",
  },
  ilfordpan100: {
    name: "Ilford Pan 100",
  },
  kodakultramax400: {
    name: "Kodak UltraMax 400",
  },
  fujicolorc200: {
    name: "Fuji C200",
  },
  ilfordxp2400: {
    name: "Ilford XP2 400",
  },
};
