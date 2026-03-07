const DB_KEY = "emprende_app_data"

export const cargarDatos = () => {
    const datos = localStorage.getItem(DB_KEY)
    if (datos) {
        const parsed = JSON.parse(datos)
        // Asegurar que todos los campos existan aunque sean datos viejos
        return {
            recetas: parsed.recetas || [],
            ventas: parsed.ventas || [],
            clientes: parsed.clientes || [],
            inventario: parsed.inventario || [],
            pedidos: parsed.pedidos || [],
            gastosFijos: parsed.gastosFijos || [],
        }
    }
    return {
        recetas: [],
        ventas: [],
        clientes: [],
        inventario: [],
        pedidos: [],
        gastosFijos: [],
    }
}

export const guardarDatos = (data) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data))
}