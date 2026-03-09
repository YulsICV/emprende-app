// Acepta "7,140.00", "7.140,00", "7140", "1/2", "3/4", "1 1/2" → siempre devuelve número
export function parsearNumero(valor) {
    if (!valor && valor !== 0) return 0
    const str = String(valor).trim()

    const fracMixta = str.match(/^(\d+)\s+(\d+)\/(\d+)$/)
    if (fracMixta) {
        return parseInt(fracMixta[1]) + parseInt(fracMixta[2]) / parseInt(fracMixta[3])
    }
    const fracSimple = str.match(/^(\d+)\/(\d+)$/)
    if (fracSimple) {
        return parseInt(fracSimple[1]) / parseInt(fracSimple[2])
    }

    if (str.includes(",") && str.includes(".")) {
        const ultimaComa = str.lastIndexOf(",")
        const ultimoPunto = str.lastIndexOf(".")
        if (ultimaComa > ultimoPunto) {
            return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0
        } else {
            return parseFloat(str.replace(/,/g, "")) || 0
        }
    }
    if (str.includes(",")) {
        const partes = str.split(",")
        if (partes.length === 2 && partes[1].length <= 2) {
            return parseFloat(str.replace(",", ".")) || 0
        }
        return parseFloat(str.replace(/,/g, "")) || 0
    }
    return parseFloat(str) || 0
}

// Sugiere conversión a unidad más natural (ej: 0.5 kg → 500 g)
export function sugerirConversion(valor, unidad) {
    const num = parsearNumero(valor)
    if (!num) return null
    if ((unidad === "kg" || unidad === "L") && num > 0 && num < 1) {
        const nuevaUnidad = unidad === "kg" ? "g" : "ml"
        return { valor: Math.round(num * 1000), unidad: nuevaUnidad }
    }
    if ((unidad === "kg" || unidad === "L") && !Number.isInteger(num) && num > 0) {
        const nuevaUnidad = unidad === "kg" ? "g" : "ml"
        return { valor: Math.round(num * 1000), unidad: nuevaUnidad }
    }
    return null
}