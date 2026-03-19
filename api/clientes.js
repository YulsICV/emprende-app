import { connectDB } from "./lib/mongodb.js"
import { Cliente } from "./models/index.js"
import { verificarToken } from "./lib/verificarToken.js"

export default async function handler(req, res) {
    await connectDB()

    const usuario = verificarToken(req)
    if (!usuario) return res.status(401).json({ error: "No autorizado" })
    const negocioId = usuario.negocioId

    switch (req.method) {
        case "GET": {
            const clientes = await Cliente.find({ negocioId }).sort({ createdAt: -1 })
            return res.status(200).json(clientes)
        }
        case "POST": {
            const cliente = await Cliente.create({ ...req.body, negocioId })
            return res.status(201).json(cliente)
        }
        case "PUT": {
            const { id, ...datos } = req.body
            const updated = await Cliente.findOneAndUpdate(
                { _id: id, negocioId }, datos, { new: true }
            )
            if (!updated) return res.status(404).json({ error: "No encontrado" })
            return res.status(200).json(updated)
        }
        case "DELETE": {
            const { id } = req.query
            await Cliente.findOneAndDelete({ _id: id, negocioId })
            return res.status(200).json({ ok: true })
        }
        default:
            return res.status(405).json({ error: "Método no permitido" })
    }
}