export function normalizarEquipo(equipo) {
    if (Array.isArray(equipo)) return equipo
    if (equipo && typeof equipo === "string") return [equipo]
    return []
}