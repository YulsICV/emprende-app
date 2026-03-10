import { connectDB } from "./lib/mongodb.js"
import { Usuario, Inventario, Receta, Recetario, Pedido } from "./models/index.js"
import { verificarToken } from "./lib/verificarToken.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

function generarToken(usuario) {
    return jwt.sign(
        { id: usuario._id, negocioId: usuario.negocioId, email: usuario.email, nombre: usuario.nombre, inicial: usuario.inicial },
        JWT_SECRET,
        { expiresIn: "30d" }
    )
}

export default async function handler(req, res) {
    try {
        await connectDB()
    } catch {
        return res.status(500).json({ error: "Error de conexión" })
    }

    const usuario = verificarToken(req)
    if (!usuario) return res.status(401).json({ error: "No autorizado" })

    // ── GET: obtener perfil completo ──
    if (req.method === "GET") {
        try {
            const u = await Usuario.findById(usuario.id).select("-passwordHash -resetToken -resetTokenExpiry")
            if (!u) return res.status(404).json({ error: "Usuario no encontrado" })
            return res.status(200).json(u)
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // ── PUT: actualizar perfil ──
    if (req.method === "PUT") {
        try {
            // ✅ ahora también recibe avatarBase64
            const { nombre, nombreNegocio, email, passwordActual, passwordNueva, logoBase64, avatarBase64 } = req.body
            const u = await Usuario.findById(usuario.id)
            if (!u) return res.status(404).json({ error: "Usuario no encontrado" })

            if (passwordNueva) {
                if (!passwordActual) return res.status(400).json({ error: "Ingresa tu contraseña actual" })
                const valido = await bcrypt.compare(passwordActual, u.passwordHash || "")
                if (!valido) return res.status(401).json({ error: "Contraseña actual incorrecta" })
                u.passwordHash = await bcrypt.hash(passwordNueva, 12)
            }

            if (nombre) { u.nombre = nombre; u.inicial = nombre.charAt(0).toUpperCase() }
            if (nombreNegocio) u.nombreNegocio = nombreNegocio
            if (email && email !== u.email) {
                const existe = await Usuario.findOne({ email: email.toLowerCase().trim() })
                if (existe) return res.status(409).json({ error: "Ese email ya está en uso" })
                u.email = email.toLowerCase().trim()
            }
            if (logoBase64 !== undefined) u.logoBase64 = logoBase64
            if (avatarBase64 !== undefined) u.avatarBase64 = avatarBase64  // ✅ NUEVO

            await u.save()
            const token = generarToken(u)

            return res.status(200).json({
                token,
                usuario: {
                    id: u._id,
                    negocioId: u.negocioId,
                    email: u.email,
                    nombre: u.nombre,
                    inicial: u.inicial,
                    nombreNegocio: u.nombreNegocio,
                    fotoGoogle: u.fotoGoogle,
                    logoBase64: u.logoBase64,
                    avatarBase64: u.avatarBase64,   // ✅ NUEVO
                }
            })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // ── DELETE: eliminar cuenta y todos sus datos ──
    if (req.method === "DELETE") {
        try {
            const negocioId = usuario.negocioId
            await Promise.all([
                Inventario.deleteMany({ negocioId }),
                Receta.deleteMany({ negocioId }),
                Recetario.deleteMany({ negocioId }),
                Pedido.deleteMany({ negocioId }),
                Usuario.findByIdAndDelete(usuario.id),
            ])
            return res.status(200).json({ ok: true })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    return res.status(405).json({ error: "Método no permitido" })
}