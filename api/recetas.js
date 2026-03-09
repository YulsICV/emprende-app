import { connectDB } from "./lib/mongodb.js"
import { Receta } from "./models/index.js"
import { verificarToken } from "./lib/verificarToken.js"

export default async function handler(req, res) {
    await connectDB()

    const usuario = verificarToken(req)
    if (!usuario) return res.status(401).json({ error: "No autorizado" })
    const negocioId = usuario.negocioId

    switch (req.method) {
        case "GET": {
            const recetas = await Receta.find({ negocioId }).sort({ createdAt: -1 })
            return res.status(200).json(recetas)
        }
        case "POST": {
            const receta = await Receta.create({ ...req.body, negocioId })
            return res.status(201).json(receta)
        }
        case "PUT": {
            const { id, ...datos } = req.body
            const updated = await Receta.findOneAndUpdate(
                { _id: id, negocioId }, datos, { new: true }
            )
            if (!updated) return res.status(404).json({ error: "No encontrado" })
            return res.status(200).json(updated)
        }
        case "DELETE": {
            const { id } = req.query
            await Receta.findOneAndDelete({ _id: id, negocioId })
            return res.status(200).json({ ok: true })
        }
        default:
            return res.status(405).json({ error: "Método no permitido" })
    }
}