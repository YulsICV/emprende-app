import { connectDB } from "./lib/mongodb.js"
import { Usuario } from "./models/index.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import { OAuth2Client } from "google-auth-library"

const JWT_SECRET = process.env.JWT_SECRET
const CLIENT_ID  = process.env.GOOGLE_CLIENT_ID
const googleClient = CLIENT_ID ? new OAuth2Client(CLIENT_ID) : null

// ── Transporte de email ──
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

function generarToken(usuario) {
    return jwt.sign(
        {
            id:        usuario._id,
            negocioId: usuario.negocioId,
            email:     usuario.email,
            nombre:    usuario.nombre,
            inicial:   usuario.inicial,
        },
        JWT_SECRET,
        { expiresIn: "30d" }
    )
}

export default async function handler(req, res) {
    await connectDB()

    const { accion } = req.query

    // ══ REGISTRO ══
    if (accion === "registro" && req.method === "POST") {
        const { email, password, nombre, nombreNegocio } = req.body
        if (!email || !password || !nombre) {
            return res.status(400).json({ error: "Email, contraseña y nombre son requeridos." })
        }
        const existe = await Usuario.findOne({ email: email.toLowerCase().trim() })
        if (existe) {
            return res.status(409).json({ error: "Ya existe una cuenta con ese email." })
        }
        const passwordHash = await bcrypt.hash(password, 12)
        const usuario = await Usuario.create({
            email: email.toLowerCase().trim(),
            passwordHash,
            nombre,
            nombreNegocio: nombreNegocio || nombre,
            inicial: nombre.charAt(0).toUpperCase(),
        })
        const token = generarToken(usuario)
        return res.status(201).json({
            token,
            usuario: {
                id:           usuario._id,
                negocioId:    usuario.negocioId,
                email:        usuario.email,
                nombre:       usuario.nombre,
                inicial:      usuario.inicial,
                nombreNegocio:usuario.nombreNegocio,
            }
        })
    }

    // ══ LOGIN ══
    if (accion === "login" && req.method === "POST") {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son requeridos." })
        }
        const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() })
        if (!usuario || !usuario.passwordHash) {
            return res.status(401).json({ error: "Email o contraseña incorrectos." })
        }
        const valido = await bcrypt.compare(password, usuario.passwordHash)
        if (!valido) {
            return res.status(401).json({ error: "Email o contraseña incorrectos." })
        }
        const token = generarToken(usuario)
        return res.status(200).json({
            token,
            usuario: {
                id:           usuario._id,
                negocioId:    usuario.negocioId,
                email:        usuario.email,
                nombre:       usuario.nombre,
                inicial:      usuario.inicial,
                nombreNegocio:usuario.nombreNegocio,
            }
        })
    }

    // ══ GOOGLE LOGIN ══
    if (accion === "google" && req.method === "POST") {
        if (!googleClient) {
            return res.status(503).json({ error: "Google OAuth no configurado." })
        }
        const { credential } = req.body
        if (!credential) {
            return res.status(400).json({ error: "Token de Google requerido." })
        }
        let payload
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: CLIENT_ID,
            })
            payload = ticket.getPayload()
        } catch {
            return res.status(401).json({ error: "Token de Google inválido." })
        }

        const { sub: googleId, email, name, picture } = payload
        let usuario = await Usuario.findOne({ $or: [{ googleId }, { email }] })

        if (!usuario) {
            // Primera vez con Google — crear cuenta
            usuario = await Usuario.create({
                email:        email.toLowerCase(),
                googleId,
                fotoGoogle:   picture,
                nombre:       name,
                nombreNegocio:name,
                inicial:      name.charAt(0).toUpperCase(),
            })
        } else if (!usuario.googleId) {
            // Ya tenía cuenta con email — vincular Google
            usuario.googleId   = googleId
            usuario.fotoGoogle = picture
            await usuario.save()
        }

        const token = generarToken(usuario)
        return res.status(200).json({
            token,
            usuario: {
                id:           usuario._id,
                negocioId:    usuario.negocioId,
                email:        usuario.email,
                nombre:       usuario.nombre,
                inicial:      usuario.inicial,
                nombreNegocio:usuario.nombreNegocio,
                fotoGoogle:   usuario.fotoGoogle,
            }
        })
    }

    // ══ OLVIDÉ CONTRASEÑA ══
    if (accion === "recuperar" && req.method === "POST") {
        const { email } = req.body
        if (!email) return res.status(400).json({ error: "Email requerido." })

        const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() })
        // Siempre responder OK para no revelar si el email existe
        if (!usuario) {
            return res.status(200).json({ ok: true })
        }

        const token  = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: "1h" })
        const expiry = new Date(Date.now() + 60 * 60 * 1000)

        usuario.resetToken       = token
        usuario.resetTokenExpiry = expiry
        await usuario.save()

        const url = `${process.env.VITE_API_URL}/reset-password?token=${token}`

        await transporter.sendMail({
            from:    `"Emprende App" <${process.env.EMAIL_USER}>`,
            to:      usuario.email,
            subject: "Recuperar contraseña — Emprende App",
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #1a9e87;">Recuperar contraseña</h2>
                    <p>Hola <strong>${usuario.nombre}</strong>,</p>
                    <p>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón:</p>
                    <a href="${url}" style="
                        display: inline-block; margin: 20px 0;
                        background: #1a9e87; color: #fff;
                        padding: 12px 28px; border-radius: 8px;
                        text-decoration: none; font-weight: bold;
                    ">Restablecer contraseña</a>
                    <p style="color: #718096; font-size: 13px;">
                        Este enlace expira en 1 hora. Si no solicitaste esto, ignorá este email.
                    </p>
                </div>
            `,
        })

        return res.status(200).json({ ok: true })
    }

    // ══ RESET CONTRASEÑA ══
    if (accion === "reset" && req.method === "POST") {
        const { token, password } = req.body
        if (!token || !password) {
            return res.status(400).json({ error: "Token y nueva contraseña requeridos." })
        }
        let decoded
        try {
            decoded = jwt.verify(token, JWT_SECRET)
        } catch {
            return res.status(401).json({ error: "Token inválido o expirado." })
        }

        const usuario = await Usuario.findOne({
            _id:             decoded.id,
            resetToken:      token,
            resetTokenExpiry:{ $gt: new Date() },
        })
        if (!usuario) {
            return res.status(401).json({ error: "Token inválido o expirado." })
        }

        usuario.passwordHash     = await bcrypt.hash(password, 12)
        usuario.resetToken       = undefined
        usuario.resetTokenExpiry = undefined
        await usuario.save()

        return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: "Método no permitido" })
}