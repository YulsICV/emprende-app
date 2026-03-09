import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../AuthContext"
import { apiAuth } from "../hooks/useApi"

export default function LoginPage() {
    const { login } = useAuth()
    const [modo, setModo] = useState("login") // "login" | "registro" | "recuperar" | "recuperarOk"
    const [form, setForm] = useState({ email: "", password: "", nombre: "", nombreNegocio: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [verPass, setVerPass] = useState(false)

    // Cargar Google SDK
    useEffect(() => {
        if (!window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
            const script = document.createElement("script")
            script.src = "https://accounts.google.com/gsi/client"
            script.async = true
            document.head.appendChild(script)
        }
    }, [])

    const handleGoogle = useCallback(async (response) => {
        setError("")
        setLoading(true)
        try {
            const data = await apiAuth.google(response.credential)
            if (data.error) { setError(data.error); return }
            login(data.token, data.usuario)
        } catch {
            setError("Error al iniciar con Google.")
        } finally {
            setLoading(false)
        }
    }, [login])
    useEffect(() => {
        if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return
        const init = () => {
            if (!window.google) return
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogle,
            })
            window.google.accounts.id.renderButton(
                document.getElementById("google-btn"),
                { theme: "outline", size: "large", width: 340, text: "continue_with" }
            )
        }
        if (window.google) init()
        else {
            const interval = setInterval(() => {
                if (window.google) { init(); clearInterval(interval) }
            }, 300)
            return () => clearInterval(interval)
        }
    }, [modo, handleGoogle])

    const handleSubmit = async () => {
        setError("")
        if (!form.email) { setError("El email es requerido."); return }

        if (modo === "recuperar") {
            setLoading(true)
            try {
                await apiAuth.recuperar(form.email)
                setModo("recuperarOk")
            } catch {
                setError("Error al enviar el email.")
            } finally {
                setLoading(false)
            }
            return
        }

        if (!form.password) { setError("La contraseña es requerida."); return }
        if (modo === "registro" && !form.nombre) { setError("Tu nombre es requerido."); return }
        if (modo === "registro" && form.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres."); return
        }

        setLoading(true)
        try {
            const data = modo === "login"
                ? await apiAuth.login({ email: form.email, password: form.password })
                : await apiAuth.registro({ email: form.email, password: form.password, nombre: form.nombre, nombreNegocio: form.nombreNegocio || form.nombre })

            if (data.error) { setError(data.error); return }
            login(data.token, data.usuario)
        } catch {
            setError("Error de conexión. Intentá de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        padding: "12px 14px", border: "1.5px solid #e2e8f0",
        borderRadius: 10, fontSize: 14.5, fontFamily: "inherit",
        color: "#2d3748", background: "#f9fafb", outline: "none",
        width: "100%", boxSizing: "border-box",
    }
    const labelStyle = {
        fontSize: 11.5, fontWeight: 700, color: "#718096",
        textTransform: "uppercase", letterSpacing: "0.5px",
    }

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(145deg, #0d7a68 0%, #1a9e87 40%, #2ec4a9 75%, #a8f0e6 100%)",
            padding: "24px 16px", boxSizing: "border-box",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}>
            <div style={{
                background: "#fff", borderRadius: 20,
                boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
                width: "100%", maxWidth: 420,
                padding: "40px 36px 32px",
                display: "flex", flexDirection: "column", gap: 24,
                boxSizing: "border-box",
            }}>
                {/* Logo */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                    <img src="/logo-transparente.png" style={{ height: 60, objectFit: "contain" }} alt="logo" />
                    <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, color: "#1a9e87", margin: 0 }}>
                        Emprende App
                    </h1>
                    <p style={{ fontSize: 13.5, color: "#718096", margin: 0 }}>
                        {modo === "login"      && "Bienvenida de vuelta 👋"}
                        {modo === "registro"   && "Creá tu cuenta gratis"}
                        {modo === "recuperar"  && "Recuperar contraseña"}
                        {modo === "recuperarOk"&& "¡Revisá tu email!"}
                    </p>
                </div>

                {/* Pantalla recuperarOk */}
                {modo === "recuperarOk" && (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 48, margin: "0 0 12px" }}>📬</p>
                        <p style={{ color: "#4a5568", fontSize: 15 }}>
                            Te enviamos un link para restablecer tu contraseña a <strong>{form.email}</strong>.
                        </p>
                        <button type="button" onClick={() => setModo("login")} style={{
                            all: "unset", cursor: "pointer", color: "#1a9e87", fontWeight: 700, fontSize: 14,
                        }}>← Volver al login</button>
                    </div>
                )}

                {/* Formulario */}
                {modo !== "recuperarOk" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Nombre (solo registro) */}
                        {modo === "registro" && (
                            <>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={labelStyle}>Tu nombre</label>
                                    <input type="text" placeholder="Ej: María García"
                                        value={form.nombre}
                                        onChange={e => { setForm(f => ({ ...f, nombre: e.target.value })); setError("") }}
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = "#2ec4a9"; e.target.style.background = "#fff" }}
                                        onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f9fafb" }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={labelStyle}>Nombre de tu negocio</label>
                                    <input type="text" placeholder="Ej: Dulces María"
                                        value={form.nombreNegocio}
                                        onChange={e => { setForm(f => ({ ...f, nombreNegocio: e.target.value })); setError("") }}
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = "#2ec4a9"; e.target.style.background = "#fff" }}
                                        onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f9fafb" }}
                                    />
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={labelStyle}>Correo electrónico</label>
                            <input type="email" placeholder="tu@correo.com"
                                value={form.email}
                                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError("") }}
                                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                autoFocus
                                style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = "#2ec4a9"; e.target.style.background = "#fff" }}
                                onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f9fafb" }}
                            />
                        </div>

                        {/* Contraseña (no en recuperar) */}
                        {modo !== "recuperar" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <label style={labelStyle}>Contraseña</label>
                                    {modo === "login" && (
                                        <button type="button" onClick={() => setModo("recuperar")} style={{
                                            all: "unset", cursor: "pointer",
                                            fontSize: 12, color: "#1a9e87", fontWeight: 600,
                                        }}>¿Olvidaste tu contraseña?</button>
                                    )}
                                </div>
                                <div style={{ position: "relative" }}>
                                    <input type={verPass ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError("") }}
                                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                        style={{ ...inputStyle, paddingRight: 44 }}
                                        onFocus={e => { e.target.style.borderColor = "#2ec4a9"; e.target.style.background = "#fff" }}
                                        onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f9fafb" }}
                                    />
                                    <button type="button" onClick={() => setVerPass(v => !v)} style={{
                                        all: "unset", cursor: "pointer",
                                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                                        fontSize: 17, opacity: 0.55,
                                    }}>{verPass ? "🙈" : "👁️"}</button>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <p style={{
                                fontSize: 13, color: "#e53e3e",
                                background: "#fff5f5", border: "1px solid #fed7d7",
                                borderRadius: 8, padding: "10px 13px", margin: 0,
                            }}>⚠️ {error}</p>
                        )}

                        {/* Botón principal */}
                        <button type="button" onClick={handleSubmit} disabled={loading} style={{
                            all: "unset", cursor: loading ? "not-allowed" : "pointer",
                            display: "block", width: "100%", textAlign: "center",
                            background: "linear-gradient(135deg, #1a9e87, #2ec4a9)",
                            color: "#fff", fontFamily: "inherit",
                            fontSize: 15, fontWeight: 700,
                            padding: "13px", borderRadius: 11,
                            boxShadow: "0 4px 14px rgba(46,196,169,0.4)",
                            opacity: loading ? 0.65 : 1,
                            boxSizing: "border-box",
                        }}>
                            {loading ? "Un momento…" :
                                modo === "login"     ? "Iniciar sesión" :
                                modo === "registro"  ? "Crear cuenta" :
                                "Enviar link de recuperación"}
                        </button>

                        {/* Divisor Google */}
                        {modo !== "recuperar" && import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                                    <span style={{ fontSize: 12, color: "#a0aec0", whiteSpace: "nowrap" }}>o continuá con</span>
                                    <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                                </div>
                                <div id="google-btn" style={{ display: "flex", justifyContent: "center" }} />
                            </>
                        )}

                        {/* Toggle login/registro */}
                        <p style={{ textAlign: "center", fontSize: 13.5, color: "#718096", margin: 0 }}>
                            {modo === "login" ? (
                                <>¿No tenés cuenta?{" "}
                                    <button type="button" onClick={() => { setModo("registro"); setError("") }} style={{
                                        all: "unset", cursor: "pointer", color: "#1a9e87", fontWeight: 700,
                                    }}>Registrate gratis</button>
                                </>
                            ) : modo === "registro" ? (
                                <>¿Ya tenés cuenta?{" "}
                                    <button type="button" onClick={() => { setModo("login"); setError("") }} style={{
                                        all: "unset", cursor: "pointer", color: "#1a9e87", fontWeight: 700,
                                    }}>Iniciá sesión</button>
                                </>
                            ) : (
                                <button type="button" onClick={() => { setModo("login"); setError("") }} style={{
                                    all: "unset", cursor: "pointer", color: "#1a9e87", fontWeight: 700, fontSize: 14,
                                }}>← Volver al login</button>
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}