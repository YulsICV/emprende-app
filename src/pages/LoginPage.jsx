import { useState } from "react"

const USUARIOS_DEMO = [
  { email: "admin@emprendeapp.com", password: "1234", nombre: "Mi Negocio",   inicial: "M" },
  { email: "demo@demo.com",         password: "demo", nombre: "Usuario Demo", inicial: "U" },
]

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [verPass,  setVerPass]  = useState(false)

  const handleSubmit = () => {
    setError("")
    if (!email || !password) { setError("Completa todos los campos."); return }
    setLoading(true)
    setTimeout(() => {
      const u = USUARIOS_DEMO.find(
        u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
      )
      if (u) { onLogin({ nombre: u.nombre, inicial: u.inicial, email: u.email }) }
      else   { setError("Email o contraseña incorrectos.") }
      setLoading(false)
    }, 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
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
        display: "flex", flexDirection: "column", gap: 28,
        boxSizing: "border-box",
      }}>

        {/* Logo + título */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
          <img src="../../src/assets/logo-transparente.png" alt="logo" style={{ height: 60, objectFit: "contain", marginBottom: 4 }} />
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 26, fontWeight: 700, color: "#1a9e87", margin: 0,
          }}>Emprende App</h1>
          <p style={{ fontSize: 13.5, color: "#718096", margin: 0 }}>
            Gestiona tu negocio desde un solo lugar
          </p>
        </div>

        {/* Campos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
              fontSize: 11.5, fontWeight: 700, color: "#718096",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError("") }}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                padding: "12px 14px", border: "1.5px solid #e2e8f0",
                borderRadius: 10, fontSize: 14.5, fontFamily: "inherit",
                color: "#2d3748", background: "#f9fafb", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = "#2ec4a9"; e.target.style.background = "#fff" }}
              onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f9fafb" }}
            />
          </div>

          {/* Contraseña */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
              fontSize: 11.5, fontWeight: 700, color: "#718096",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={verPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError("") }}
                onKeyDown={handleKeyDown}
                style={{
                  padding: "12px 44px 12px 14px", border: "1.5px solid #e2e8f0",
                  borderRadius: 10, fontSize: 14.5, fontFamily: "inherit",
                  color: "#2d3748", background: "#f9fafb", outline: "none",
                  width: "100%", boxSizing: "border-box",
                }}
                onFocus={e => { e.target.style.borderColor = "#2ec4a9"; e.target.style.background = "#fff" }}
                onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f9fafb" }}
              />
              <button
                type="button"
                onClick={() => setVerPass(v => !v)}
                style={{
                  all: "unset", cursor: "pointer",
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  fontSize: 17, opacity: 0.55,
                }}
              >{verPass ? "🙈" : "👁️"}</button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{
              fontSize: 13, color: "#e53e3e",
              background: "#fff5f5", border: "1px solid #fed7d7",
              borderRadius: 8, padding: "10px 13px", margin: 0,
            }}>⚠️ {error}</p>
          )}

          {/* Botón — type="button" para que nunca haga submit automático */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              all: "unset", cursor: loading ? "not-allowed" : "pointer",
              display: "block", width: "100%", textAlign: "center",
              background: "linear-gradient(135deg, #1a9e87, #2ec4a9)",
              color: "#fff", fontFamily: "inherit",
              fontSize: 15, fontWeight: 700,
              padding: "13px", borderRadius: 11,
              boxShadow: "0 4px 14px rgba(46,196,169,0.4)",
              opacity: loading ? 0.65 : 1,
              boxSizing: "border-box", marginTop: 4,
            }}
          >
            {loading ? "Entrando…" : "Iniciar sesión"}
          </button>
        </div>

        {/* Credenciales demo */}
        <div style={{
          background: "#f0fdfb", border: "1px solid #b2f0e8",
          borderRadius: 10, padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#1a9e87", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>
            🔑 Credenciales de prueba
          </p>
          <p style={{ fontSize: 12.5, color: "#4a5568", margin: 0 }}>
            <strong>admin@emprendeapp.com</strong> / <code style={{ background: "#e8f8f5", color: "#1a9e87", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>1234</code>
          </p>
          <p style={{ fontSize: 12.5, color: "#4a5568", margin: 0 }}>
            <strong>demo@demo.com</strong> / <code style={{ background: "#e8f8f5", color: "#1a9e87", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>demo</code>
          </p>
        </div>

      </div>
    </div>
  )
}