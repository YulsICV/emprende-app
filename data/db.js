const DB_KEY = "emprende_app_data"

export const cargarDatos = () => {
    const datos = localStorage.getItem(DB_KEY)
    if (datos) {
        return JSON.parse(datos)
    }
    return {
        recetas: [],
        ventas: [],
        clientes: [],
        inventario: [],
        pedidos: []
    }
}

export const guardarDatos = (data) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data))
}