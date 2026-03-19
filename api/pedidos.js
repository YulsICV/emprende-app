import { connectDB } from "./lib/mongodb.js"
import { Pedido } from "./models/index.js"
import { verificarToken } from "./lib/verificarToken.js"

export default async function handler(req, res) {
    await connectDB()

    const usuario = verificarToken(req)
    if (!usuario) return res.status(401).json({ error: "No autorizado" })
    const negocioId = usuario.negocioId

    switch (req.method) {
        case "GET": {
            const pedidos = await Pedido.find({ negocioId }).sort({ createdAt: -1 })
            return res.status(200).json(pedidos)
        }
        case "POST": {
            const pedido = await Pedido.create({ ...req.body, negocioId })
            return res.status(201).json(pedido)
        }
        case "PUT": {
            const { id, ...datos } = req.body
            const updated = await Pedido.findOneAndUpdate(
                { _id: id, negocioId }, datos, { new: true }
            )
            if (!updated) return res.status(404).json({ error: "No encontrado" })
            return res.status(200).json(updated)
        }
        case "DELETE": {
            const { id } = req.query
            await Pedido.findOneAndDelete({ _id: id, negocioId })
            return res.status(200).json({ ok: true })
        }
        default:
            return res.status(405).json({ error: "Método no permitido" })
    }
}