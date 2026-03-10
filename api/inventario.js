import { connectDB } from "./lib/mongodb.js"
import { Inventario } from "./models/index.js"
import { verificarToken } from "./lib/verificarToken.js"

export default async function handler(req, res) {
    try {
        await connectDB()
    } catch (err) {
        console.error("Error conectando a MongoDB:", err)
        return res.status(500).json({ error: "Error de conexión a la base de datos" })
    }

    const usuario = verificarToken(req)
    if (!usuario) return res.status(401).json({ error: "No autorizado" })
    const negocioId = usuario.negocioId

    switch (req.method) {
        case "GET": {
            try {
                const items = await Inventario.find({ negocioId }).sort({ createdAt: -1 })
                return res.status(200).json(items)
            } catch (err) {
                console.error("GET inventario error:", err)
                return res.status(500).json({ error: "Error al obtener inventario" })
            }
        }

        case "POST": {
            try {
                const { nombre, cantidadPaquetes, tamañoPaquete } = req.body
                if (!nombre || cantidadPaquetes == null || tamañoPaquete == null) {
                    return res.status(400).json({ error: "Faltan campos requeridos: nombre, cantidadPaquetes, tamañoPaquete" })
                }
                const item = await Inventario.create({ ...req.body, negocioId })
                return res.status(201).json(item)
            } catch (err) {
                console.error("POST inventario error:", err)
                return res.status(500).json({ error: "Error al crear item: " + err.message })
            }
        }

        case "PUT": {
            try {
                const { id, ...datos } = req.body
                if (!id) return res.status(400).json({ error: "Falta el id" })
                const updated = await Inventario.findOneAndUpdate(
                    { _id: id, negocioId },
                    datos,
                    { new: true }
                )
                if (!updated) return res.status(404).json({ error: "No encontrado" })
                return res.status(200).json(updated)
            } catch (err) {
                console.error("PUT inventario error:", err)
                return res.status(500).json({ error: "Error al actualizar: " + err.message })
            }
        }

        case "DELETE": {
            try {
                const { id } = req.query
                if (!id) return res.status(400).json({ error: "Falta el id" })
                await Inventario.findOneAndDelete({ _id: id, negocioId })
                return res.status(200).json({ ok: true })
            } catch (err) {
                console.error("DELETE inventario error:", err)
                return res.status(500).json({ error: "Error al eliminar: " + err.message })
            }
        }

        default:
            return res.status(405).json({ error: "Método no permitido" })
    }
}