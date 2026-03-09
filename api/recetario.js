import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI
let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

async function connectDB() {
    if (cached.conn) return cached.conn
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
    }
    cached.conn = await cached.promise
    return cached.conn
}

const schema = new mongoose.Schema({
    negocioId:     { type: String, required: true, index: true },
    nombre:        { type: String, required: true },
    categoria:     { type: String },
    unidades:      { type: Number },
    ingredientes:  { type: Array, default: [] },
    fotoBase64:    { type: String },
    fotoUrl:       { type: String },
    equipo:        { type: String },
    temperatura:   { type: Number },
    tiempoCoccion: { type: Number },
    pasos:         { type: Array, default: [] },
    fecha:         { type: Date, default: Date.now },
}, { timestamps: true })

const Recetario = mongoose.models.Recetario || mongoose.model("Recetario", schema)

export default async function handler(req, res) {
    await connectDB()
    const negocioId = req.headers["x-negocio-id"] || "default"

    switch (req.method) {
        case "GET": {
            const items = await Recetario.find({ negocioId }).sort({ createdAt: -1 })
            return res.status(200).json(items)
        }
        case "POST": {
            const item = await Recetario.create({ ...req.body, negocioId })
            return res.status(201).json(item)
        }
        case "PUT": {
            const { id, ...datos } = req.body
            const updated = await Recetario.findOneAndUpdate(
                { _id: id, negocioId }, datos, { new: true }
            )
            if (!updated) return res.status(404).json({ error: "No encontrado" })
            return res.status(200).json(updated)
        }
        case "DELETE": {
            const { id } = req.query
            await Recetario.findOneAndDelete({ _id: id, negocioId })
            return res.status(200).json({ ok: true })
        }
        default:
            return res.status(405).json({ error: "Método no permitido" })
    }
}