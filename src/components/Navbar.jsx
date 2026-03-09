import { useState, useEffect } from "react"

export default function Navbar({ activo, setActivo, usuario, onCerrarSesion, modulos = [] }) {
  const [abierto, setAbierto] = useState(false)
  const [esMobil, setEsMobil] = useState(
    () => window.matchMedia("(max-width: 768px)").matches
  )

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const handler = (e) => setEsMobil(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const navegar = (id) => { setActivo(id); setAbierto(false) }
  const cerrar  = () => { onCerrarSesion?.(); setAbierto(false) }

  if (esMobil) {
    return (
      <>
        <button
          onClick={() => setAbierto(v => !v)}
          style={{
            marginLeft: "auto",
            fontSize: 22, background: "rgba(255,255,255,0.2)", color: "#fff",
            border: "none", borderRadius: 8, padding: "6px 13px",
            cursor: "pointer", lineHeight: 1, minHeight: "unset",
          }}
        >
          {abierto ? "✕" : "☰"}
        </button>

        {abierto && (
          <div onClick={() => setAbierto(false)} style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)", zIndex: 200,
            backdropFilter: "blur(2px)",
          }} />
        )}

        {abierto && (
          <div style={{
            position: "fixed", top: 0, right: 0,
            height: "100%", width: "72%", maxWidth: 280,
            background: "#fff", zIndex: 201,
            display: "flex", flexDirection: "column",
            padding: "24px 16px", gap: 4,
            boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "#718096",
              textTransform: "uppercase", letterSpacing: 1,
              padding: "0 8px", margin: "0 0 8px",
            }}>Menú</p>

            {modulos.map(id => (
              <button key={id} onClick={() => navegar(id)} style={{
                padding: "13px 16px", borderRadius: 10,
                fontSize: 15, fontWeight: activo === id ? 700 : 500,
                color: activo === id ? "#1a9e87" : "#2d3748",
                background: activo === id ? "#e8f8f5" : "transparent",
                borderLeft: activo === id ? "3px solid #2ec4a9" : "3px solid transparent",
                border: "none", cursor: "pointer",
                textAlign: "left", fontFamily: "inherit",
              }}>
                {id}
              </button>
            ))}

            {usuario && (
              <div style={{
                marginTop: "auto", paddingTop: 16,
                borderTop: "1px solid #e2e8f0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#e8f8f5", border: "2px solid #2ec4a9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, color: "#1a9e87", fontSize: 15, flexShrink: 0,
                  }}>{usuario.inicial}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{usuario.nombre}</p>
                    <p style={{ fontSize: 12, color: "#718096", margin: 0 }}>{usuario.email}</p>
                  </div>
                </div>
                <button onClick={cerrar} style={{
                  width: "100%", padding: "11px", borderRadius: 9,
                  background: "#fff0f0", color: "#e53e3e",
                  border: "1px solid #feb2b2", cursor: "pointer",
                  fontWeight: 600, fontSize: 14, fontFamily: "inherit",
                }}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  // Desktop
  return (
    <nav className="navbar-inner">
      {modulos.map(id => (
        <button
          key={id}
          onClick={() => navegar(id)}
          className={activo === id ? "activo" : ""}
        >
          {id}
        </button>
      ))}
    </nav>
  )
}
