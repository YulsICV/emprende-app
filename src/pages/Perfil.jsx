import { useState, useEffect, useRef } from "react"
import { useAuth } from "../AuthContext"

function useReloj() {
    const [ahora, setAhora] = useState(new Date())
    useEffect(() => {
        const id = setInterval(() => setAhora(new Date()), 1000)
        return () => clearInterval(id)
    }, [])
    return ahora
}

function saludo(nombre) {
    const h = new Date().getHours()
    if (h >= 5 && h < 12) return { texto: `☀️ Buenos días, ${nombre}` }
    if (h >= 12 && h < 19) return { texto: `🌤️ Buenas tardes, ${nombre}` }
    return { texto: `🌙 Buenas noches, ${nombre}` }
}

function formatearHora(fecha) {
    return fecha.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

function formatearFecha(fecha) {
    return fecha.toLocaleDateString("es-CR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

function comprimirImagen(base64, maxSize = 400, calidad = 0.7) {
    return new Promise((resolve) => {
        if (!base64 || base64.startsWith("http")) { resolve(base64); return }
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement("canvas")
            let w = img.width, h = img.height
            if (w > h) { if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize } }
            else        { if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize } }
            canvas.width = w
            canvas.height = h
            canvas.getContext("2d").drawImage(img, 0, 0, w, h)
            resolve(canvas.toDataURL("image/jpeg", calidad))
        }
        img.onerror = () => resolve(base64)
        img.src = base64
    })
}

export default function Perfil() {
    const { usuario, login, logout } = useAuth()
    const ahora = useReloj()
    const { texto: saludoTexto } = saludo(usuario?.nombre?.split(" ")[0] || "")

    const [form, setForm] = useState({
        nombre: usuario?.nombre || "",
        nombreNegocio: usuario?.nombreNegocio || "",
        email: usuario?.email || "",
        passwordActual: "",
        passwordNueva: "",
        passwordConfirm: "",
    })
    const [logoPreview, setLogoPreview] = useState(usuario?.logoBase64 || null)
    const [avatarPreview, setAvatarPreview] = useState(usuario?.avatarBase64 || null)

    useEffect(() => {
        if (!usuario) return
        setForm(prev => ({
            ...prev,
            nombre: usuario.nombre || "",
            nombreNegocio: usuario.nombreNegocio || "",
            email: usuario.email || "",
        }))
        setLogoPreview(usuario.logoBase64 || null)
        setAvatarPreview(usuario.avatarBase64 || null)
    }, [usuario])

    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState(null)
    const [error, setError] = useState(null)
    const [seccion, setSeccion] = useState("perfil")
    const [confirmarEliminar, setConfirmarEliminar] = useState(false)
    const [textoConfirm, setTextoConfirm] = useState("")
    const [eliminando, setEliminando] = useState(false)
    const fileRef = useRef()
    const avatarRef = useRef()

    const esNoche = new Date().getHours() >= 19 || new Date().getHours() < 5

    const handleLogo = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => setLogoPreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    const handleAvatar = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => setAvatarPreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    const guardar = async () => {
        setError(null)
        setMensaje(null)
        if (form.passwordNueva && form.passwordNueva !== form.passwordConfirm) {
            setError("Las contraseñas nuevas no coinciden")
            return
        }
        setGuardando(true)
        try {
            const [avatarFinal, logoFinal] = await Promise.all([
                comprimirImagen(avatarPreview, 400, 0.75),
                comprimirImagen(logoPreview, 300, 0.80),
            ])
            const token = localStorage.getItem("token")
            const res = await fetch("/api/usuario", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    nombre: form.nombre,
                    nombreNegocio: form.nombreNegocio,
                    email: form.email,
                    passwordActual: form.passwordActual || undefined,
                    passwordNueva: form.passwordNueva || undefined,
                    logoBase64: logoFinal,
                    avatarBase64: avatarFinal,
                })
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            login(data.token, data.usuario)
            setMensaje("✅ Perfil actualizado correctamente")
            setForm(prev => ({ ...prev, passwordActual: "", passwordNueva: "", passwordConfirm: "" }))
        } catch (err) {
            setError("Error al guardar: " + err.message)
        } finally {
            setGuardando(false)
        }
    }

    const eliminarCuenta = async () => {
        if (textoConfirm !== "ELIMINAR") return
        setEliminando(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/usuario", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) logout()
            else setError("Error al eliminar la cuenta")
        } catch (err) {
            setError("Error: " + err.message)
        } finally {
            setEliminando(false)
        }
    }

    const esNocheActual = new Date().getHours() >= 19 || new Date().getHours() < 5
    const fondo = esNocheActual
        ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
        : "linear-gradient(135deg, #e8f8f5 0%, #f0fdf9 50%, #e8f8f5 100%)"

    const colorTexto = esNoche ? "#e2e8f0" : "#1a202c"
    const colorSuave = esNoche ? "#94a3b8" : "#718096"
    const colorCard = esNoche ? "rgba(30,41,59,0.9)" : "#fff"
    const colorBorde = esNoche ? "#334155" : "#e2e8f0"
    const colorAcento = "#1a9e87"

    const inputStyle = {
        width: "100%", padding: "10px 14px",
        border: `1.5px solid ${colorBorde}`,
        borderRadius: 10, fontSize: 14,
        fontFamily: "inherit", outline: "none",
        boxSizing: "border-box",
        background: esNoche ? "#0f172a" : "#f8fafc",
        color: colorTexto,
    }
    const labelStyle = {
        fontSize: 11, fontWeight: 700, color: colorSuave,
        textTransform: "uppercase", letterSpacing: "0.5px",
        display: "block", marginBottom: 6,
    }

    // ✅ fotoGoogle → avatarBase64 de MongoDB → avatarPreview local → null
    const avatarSrc = usuario?.fotoGoogle || usuario?.avatarBase64 || avatarPreview || null
    const inicialFallback = usuario?.inicial || usuario?.nombre?.charAt(0).toUpperCase() || "U"

    const stack = [
        { icon: "⚛️", nombre: "React + Vite",      desc: "Interfaz de usuario" },
        { icon: "🟢", nombre: "Node.js",            desc: "Backend serverless" },
        { icon: "🍃", nombre: "MongoDB + Mongoose", desc: "Base de datos" },
        { icon: "▲",  nombre: "Vercel",             desc: "Deploy en la nube" },
        { icon: "🔐", nombre: "JWT + Google OAuth", desc: "Autenticación" },
    ]

    return (
        <div style={{ minHeight: "100vh", background: fondo, padding: "32px 16px", transition: "background 1s" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>

                {/* ── Reloj y saludo ── */}
                <div style={{
                    background: colorCard, borderRadius: 20, padding: "28px 32px",
                    marginBottom: 20, boxShadow: esNoche ? "0 4px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.06)",
                    border: `1px solid ${colorBorde}`, textAlign: "center"
                }}>
                    <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -2, color: colorAcento, fontVariantNumeric: "tabular-nums" }}>
                        {formatearHora(ahora)}
                    </div>
                    <div style={{ fontSize: 13, color: colorSuave, marginTop: 4, textTransform: "capitalize" }}>
                        {formatearFecha(ahora)}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: colorTexto, marginTop: 16 }}>
                        {saludoTexto}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                    {[
                        { id: "perfil",    label: "👤 Mi perfil" },
                        { id: "negocio",   label: "🏪 Mi negocio" },
                        { id: "seguridad", label: "🔒 Seguridad" },
                        { id: "creditos",  label: "✨ Créditos" },
                        { id: "cuenta",    label: "⚠️ Cuenta" },
                    ].map(tab => (
                        <button key={tab.id} type="button" onClick={() => setSeccion(tab.id)} style={{
                            flex: 1, minWidth: 80, padding: "10px 8px", borderRadius: 12, border: "none",
                            cursor: "pointer", fontSize: 11.5, fontWeight: 600,
                            background: seccion === tab.id ? colorAcento : colorCard,
                            color: seccion === tab.id ? "#fff" : colorSuave,
                            boxShadow: seccion === tab.id ? "0 2px 12px rgba(26,158,135,0.3)" : "none",
                            transition: "all 0.2s",
                        }}>{tab.label}</button>
                    ))}
                </div>

                {/* ── Mensajes ── */}
                {mensaje && (
                    <div style={{ background: "#e8f8f5", border: "1.5px solid #2ec4a9", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#1a9e87", fontWeight: 600, fontSize: 14 }}>
                        {mensaje}
                    </div>
                )}
                {error && (
                    <div style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#e53e3e", fontWeight: 600, fontSize: 14 }}>
                        ❌ {error}
                    </div>
                )}

                {/* ── Sección: Mi perfil ── */}
                {seccion === "perfil" && (
                    <div style={{ background: colorCard, borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: `1px solid ${colorBorde}` }}>
                        <h3 style={{ margin: "0 0 20px", color: colorTexto }}>👤 Mi perfil</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: "50%",
                                    background: colorAcento, display: "flex", alignItems: "center",
                                    justifyContent: "center", fontSize: 30, fontWeight: 700,
                                    color: "#fff", overflow: "hidden", border: `3px solid ${colorAcento}`,
                                }}>
                                    {avatarSrc
                                        ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : inicialFallback}
                                </div>
                                {!usuario?.fotoGoogle && (
                                    <label style={{
                                        position: "absolute", bottom: 0, right: 0,
                                        width: 26, height: 26, borderRadius: "50%",
                                        background: colorAcento, border: "2px solid #fff",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", fontSize: 13,
                                    }} title="Cambiar foto">
                                        📷
                                        <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />
                                    </label>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 18, color: colorTexto }}>{usuario?.nombre}</div>
                                <div style={{ fontSize: 13, color: colorSuave }}>{usuario?.email}</div>
                                {usuario?.fotoGoogle
                                    ? <div style={{ fontSize: 11, color: colorAcento, marginTop: 4 }}>🔗 Foto gestionada por Google</div>
                                    : avatarPreview
                                        ? <button type="button" onClick={() => setAvatarPreview(null)} style={{
                                            all: "unset", cursor: "pointer", fontSize: 11,
                                            color: "#e53e3e", marginTop: 4, display: "block"
                                          }}>🗑 Quitar foto</button>
                                        : <div style={{ fontSize: 11, color: colorSuave, marginTop: 4 }}>Toca 📷 para subir tu foto de perfil</div>
                                }
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <span style={labelStyle}>Nombre completo</span>
                                <input style={inputStyle} value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Tu nombre" />
                            </div>
                            <div>
                                <span style={labelStyle}>Email</span>
                                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="tu@email.com" />
                            </div>
                        </div>
                        <button type="button" onClick={guardar} disabled={guardando} style={{
                            marginTop: 20, padding: "12px 28px", borderRadius: 12, border: "none",
                            background: colorAcento, color: "#fff", fontSize: 14, fontWeight: 600,
                            cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.7 : 1,
                        }}>{guardando ? "Guardando..." : "💾 Guardar cambios"}</button>
                    </div>
                )}

                {/* ── Sección: Mi negocio ── */}
                {seccion === "negocio" && (
                    <div style={{ background: colorCard, borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: `1px solid ${colorBorde}` }}>
                        <h3 style={{ margin: "0 0 20px", color: colorTexto }}>🏪 Mi negocio</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <span style={labelStyle}>Nombre del negocio</span>
                                <input style={inputStyle} value={form.nombreNegocio} onChange={e => setForm(p => ({ ...p, nombreNegocio: e.target.value }))} placeholder="Nombre de tu negocio" />
                            </div>
                            <div>
                                <span style={labelStyle}>Logo del negocio</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{
                                        width: 90, height: 90, borderRadius: 16,
                                        border: `2px dashed ${colorAcento}`,
                                        background: esNoche ? "#0f172a" : "#e8f8f5",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", flexShrink: 0,
                                    }}>
                                        {logoPreview
                                            ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                            : <span style={{ fontSize: 32 }}>🏪</span>}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        <label style={{
                                            padding: "9px 16px", borderRadius: 10, cursor: "pointer",
                                            background: colorAcento, color: "#fff", fontSize: 13, fontWeight: 600,
                                            display: "inline-block",
                                        }}>
                                            📁 Subir logo
                                            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: "none" }} />
                                        </label>
                                        {logoPreview && (
                                            <button type="button" onClick={() => setLogoPreview(null)} style={{
                                                padding: "9px 16px", borderRadius: 10, border: `1.5px solid ${colorBorde}`,
                                                background: "transparent", color: "#e53e3e", fontSize: 13, fontWeight: 600, cursor: "pointer",
                                            }}>🗑 Quitar logo</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="button" onClick={guardar} disabled={guardando} style={{
                            marginTop: 20, padding: "12px 28px", borderRadius: 12, border: "none",
                            background: colorAcento, color: "#fff", fontSize: 14, fontWeight: 600,
                            cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.7 : 1,
                        }}>{guardando ? "Guardando..." : "💾 Guardar cambios"}</button>
                    </div>
                )}

                {/* ── Sección: Seguridad ── */}
                {seccion === "seguridad" && (
                    <div style={{ background: colorCard, borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: `1px solid ${colorBorde}` }}>
                        <h3 style={{ margin: "0 0 20px", color: colorTexto }}>🔒 Cambiar contraseña</h3>
                        {usuario?.fotoGoogle && (
                            <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400e" }}>
                                ⚠️ Tu cuenta usa Google. Para establecer una contraseña, usá la opción de recuperar contraseña.
                            </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <span style={labelStyle}>Contraseña actual</span>
                                <input style={inputStyle} type="password" value={form.passwordActual} onChange={e => setForm(p => ({ ...p, passwordActual: e.target.value }))} placeholder="••••••••" />
                            </div>
                            <div>
                                <span style={labelStyle}>Nueva contraseña</span>
                                <input style={inputStyle} type="password" value={form.passwordNueva} onChange={e => setForm(p => ({ ...p, passwordNueva: e.target.value }))} placeholder="••••••••" />
                            </div>
                            <div>
                                <span style={labelStyle}>Confirmar nueva contraseña</span>
                                <input style={inputStyle} type="password" value={form.passwordConfirm} onChange={e => setForm(p => ({ ...p, passwordConfirm: e.target.value }))} placeholder="••••••••" />
                            </div>
                        </div>
                        <button type="button" onClick={guardar} disabled={guardando || !form.passwordActual || !form.passwordNueva} style={{
                            marginTop: 20, padding: "12px 28px", borderRadius: 12, border: "none",
                            background: colorAcento, color: "#fff", fontSize: 14, fontWeight: 600,
                            cursor: (guardando || !form.passwordActual || !form.passwordNueva) ? "not-allowed" : "pointer",
                            opacity: (guardando || !form.passwordActual || !form.passwordNueva) ? 0.6 : 1,
                        }}>{guardando ? "Guardando..." : "🔒 Cambiar contraseña"}</button>
                    </div>
                )}

                {/* ── Sección: Créditos ── */}
                {seccion === "creditos" && (
                    <div style={{ background: colorCard, borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: `1px solid ${colorBorde}` }}>
                        <div style={{ textAlign: "center", marginBottom: 28 }}>
                            <div style={{ fontSize: 48, marginBottom: 8 }}>✨</div>
                            <h3 style={{ margin: "0 0 6px", fontSize: 22, color: colorAcento }}>Emprende App</h3>
                            <div style={{
                                display: "inline-block",
                                background: esNoche ? "#1e293b" : "#e8f8f5",
                                border: `1px solid ${colorAcento}`,
                                borderRadius: 20, padding: "4px 14px",
                                fontSize: 12, fontWeight: 700, color: colorAcento, marginBottom: 12,
                            }}>v1.0.0 Beta</div>
                            <p style={{ fontSize: 14, color: colorSuave, margin: 0 }}>
                                Desarrollado con ❤️ para emprendedoras
                            </p>
                        </div>

                        {/* Desarrolladora */}
                        <div style={{
                            background: esNoche ? "#0f172a" : "#f0fdf9",
                            border: `1.5px solid ${colorAcento}`,
                            borderRadius: 16, padding: "20px 24px",
                            marginBottom: 20, display: "flex",
                            alignItems: "center", gap: 16,
                        }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: "50%",
                                background: `linear-gradient(135deg, ${colorAcento}, #2ec4a9)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0,
                            }}>Y</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 16, color: colorTexto }}>Yuliana</div>
                                <div style={{ fontSize: 12, color: colorSuave, marginBottom: 8 }}>Desarrolladora Full Stack</div>
                                <a href="https://github.com/YulsICV" target="_blank" rel="noopener noreferrer" style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    background: esNoche ? "#1e293b" : "#fff",
                                    border: `1.5px solid ${colorBorde}`,
                                    borderRadius: 8, padding: "5px 12px",
                                    fontSize: 12, fontWeight: 600,
                                    color: colorTexto, textDecoration: "none",
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                                    </svg>
                                    YulsICV
                                </a>
                            </div>
                        </div>

                        {/* Stack */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: colorSuave, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                                🛠 Stack tecnológico
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {stack.map((item, i) => (
                                    <div key={i} style={{
                                        display: "flex", alignItems: "center", gap: 12,
                                        background: esNoche ? "#0f172a" : "#f8fafc",
                                        border: `1px solid ${colorBorde}`,
                                        borderRadius: 10, padding: "10px 14px",
                                    }}>
                                        <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: colorTexto }}>{item.nombre}</div>
                                            <div style={{ fontSize: 11, color: colorSuave }}>{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            textAlign: "center", paddingTop: 16,
                            borderTop: `1px solid ${colorBorde}`,
                            fontSize: 12, color: colorSuave,
                        }}>
                            © {new Date().getFullYear()} Emprende App — Todos los derechos reservados
                        </div>
                    </div>
                )}

                {/* ── Sección: Cuenta ── */}
                {seccion === "cuenta" && (
                    <div style={{ background: colorCard, borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: `1px solid ${colorBorde}` }}>
                        <h3 style={{ margin: "0 0 8px", color: "#e53e3e" }}>⚠️ Zona de peligro</h3>
                        <p style={{ color: colorSuave, fontSize: 14, marginBottom: 20 }}>
                            Eliminar tu cuenta borrará permanentemente todos tus datos: inventario, recetas, pedidos y clientes. Esta acción no se puede deshacer.
                        </p>
                        {!confirmarEliminar ? (
                            <button type="button" onClick={() => setConfirmarEliminar(true)} style={{
                                padding: "12px 28px", borderRadius: 12, border: "2px solid #e53e3e",
                                background: "transparent", color: "#e53e3e", fontSize: 14, fontWeight: 600, cursor: "pointer",
                            }}>🗑 Eliminar mi cuenta</button>
                        ) : (
                            <div style={{ background: "#fff5f5", border: "2px solid #fecaca", borderRadius: 16, padding: 20 }}>
                                <p style={{ fontWeight: 700, color: "#e53e3e", marginBottom: 8 }}>¿Estás segura? Esta acción es irreversible.</p>
                                <p style={{ fontSize: 13, color: colorSuave, marginBottom: 16 }}>
                                    Escribe <strong>ELIMINAR</strong> para confirmar:
                                </p>
                                <input
                                    style={{ ...inputStyle, marginBottom: 16, borderColor: "#fecaca" }}
                                    value={textoConfirm}
                                    onChange={e => setTextoConfirm(e.target.value)}
                                    placeholder="ELIMINAR"
                                />
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button type="button" onClick={eliminarCuenta}
                                        disabled={textoConfirm !== "ELIMINAR" || eliminando}
                                        style={{
                                            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                                            background: textoConfirm === "ELIMINAR" ? "#e53e3e" : "#cbd5e0",
                                            color: "#fff", fontSize: 14, fontWeight: 700,
                                            cursor: textoConfirm === "ELIMINAR" ? "pointer" : "not-allowed",
                                        }}>{eliminando ? "Eliminando..." : "Sí, eliminar todo"}</button>
                                    <button type="button" onClick={() => { setConfirmarEliminar(false); setTextoConfirm("") }} style={{
                                        flex: 1, padding: "12px 0", borderRadius: 12, border: `1.5px solid ${colorBorde}`,
                                        background: "transparent", color: colorSuave, fontSize: 14, fontWeight: 600, cursor: "pointer",
                                    }}>Cancelar</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}