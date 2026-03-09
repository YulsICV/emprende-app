export const CONVERSIONES_A_GRAMOS = {
  // Peso
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  // Volumen (agua/líquidos: 1ml ≈ 1g)
  ml: 1,
  L: 1000,
  "fl oz": 29.5735,
  // Medidas de cocina
  taza: 240,
  cda: 15,       // cucharada
  cdta: 5,       // cucharadita
  pizca: 0.3,    // ~1/8 cdta
  gota: 0.05,
  // Conteo genérico
  unidad: 1,
  // Presentaciones comerciales (sin conversión fija, depende del producto)
  paquete: null,
  caja: null,
  lata: null,
  bolsa: null,
  frasco: null,
  botella: null,
  sobre: null,
  rollo: null,
  pliego: null,
  // Longitud
  cm: null,
  metro: null,
  yarda: null,
  // Insumos decoración/repostería
  pincho: null,
  sticker: null,
  tarjeta: null,
  topper: null,
  cinta: null,
  cápsula: null,
  manga: null,
  molde: null,
}

export const UNIDADES_USO = [
  // Volumen
  "ml", "L", "taza", "cda", "cdta", "fl oz",
  // Peso
  "g", "kg", "oz", "lb",
  // Conteo
  "unidad", "pizca", "gota",
]

export const UNIDADES_PAQUETE = [
  // Peso
  "g", "kg", "oz", "lb",
  // Volumen
  "ml", "L", "fl oz",
  // Longitud (cintas, papel, fondant en rollo)
  "cm", "metro", "yarda",
  // Empaque general
  "unidad", "paquete", "caja", "bolsa", "lata", "frasco", "botella", "sobre", "rollo",
  // Insumos decoración/repostería
  "pincho", "sticker", "tarjeta", "topper", "cinta", "cápsula", "manga", "molde", "pliego",
]
