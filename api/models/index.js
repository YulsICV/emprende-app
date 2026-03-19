import { connectDB } from "./lib/mongodb.js"
import { Produccion } from "./models/index.js"
import { verificarToken } from "./lib/verificarToken.js"

export default async function handler(req, res) {
    await connectDB()

    const usuario = verificarToken(req)
    if (!usuario) return res.status(401).json({ error: "No autorizado" })
    const negocioId = usuario.negocioId

    switch (req.method) {
        case "GET": {
            const registros = await Produccion.find({ negocioId }).sort({ createdAt: -1 })
            return res.status(200).json(registros)
        }
        case "POST": {
            const registro = await Produccion.create({ ...req.body, negocioId })
            return res.status(201).json(registro)
        }
        case "DELETE": {
            const { id } = req.query
            await Produccion.findOneAndDelete({ _id: id, negocioId })
            return res.status(200).json({ ok: true })
        }
        default:
            return res.status(405).json({ error: "Método no permitido" })
    }
}