import { useState } from "react"

const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #recetario-print, #recetario-print * { visibility: visible !important; }
  #recetario-print {
    position: fixed; inset: 0; z-index: 9999;
    background: #fff; padding: 32px;
    overflow: visible;
  }
  .receta-print-pagina { page-break-after: always; }
  .receta-print-pagina:last-child { page-break-after: avoid; }
}
`

function inyectarEstiloImpresion() {
  if (document.getElementById("recetario-print-style")) return
  const style = document.createElement("style")
  style.id = "recetario-print-style"
  style.textContent = PRINT_STYLE
  document.head.appendChild(style)
}

function TarjetaReceta({ receta, onVerDetalle }) {
  const foto = receta.fotoBase64 || receta.fotoUrl
  return (
    <div
      onClick={() => onVerDetalle(receta)}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        border: "1px solid var(--gris-borde)",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.13)" }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)" }}
    >
      <div style={{
        width: "100%", height: 180,
        background: foto ? "transparent" : "linear-gradient(135deg, var(--verde-claro), #d0f0ea)",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        {foto
          ? <img src={foto} alt={receta.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none" }} />
          : <span style={{ fontSize: 52 }}>🍩</span>
        }
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <h4 style={{ margin: 0, fontSize: 15, lineHeight: 1.3 }}>{receta.nombre}</h4>
          <span style={{
            fontSize: 11, background: "var(--verde-claro)", color: "var(--verde-oscuro)",
            padding: "3px 8px", borderRadius: 8, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
          }}>{receta.categoria}</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--texto-suave)", marginTop: 6 }}>
          {receta.unidades} unidades
          {receta.equipo ? ` · ${receta.equipo}` : ""}
          {receta.tiempoCoccion ? ` · ${receta.tiempoCoccion} min` : ""}
        </p>
        {receta.pasos?.length > 0 && (
          <p style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 4 }}>
            📋 {receta.pasos.length} paso{receta.pasos.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  )
}

function ModalDetalle({ receta, onCerrar, onImprimir }) {
  const foto = receta.fotoBase64 || receta.fotoUrl
  return (
    <div onClick={onCerrar} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "24px 16px", overflowY: "auto",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 600,
        overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        {foto && (
          <img src={foto} alt={receta.nombre}
            style={{ width: "100%", maxHeight: 280, objectFit: "cover" }}
            onError={e => { e.target.style.display = "none" }}
          />
        )}
        <div style={{ padding: "20px 24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 20 }}>{receta.nombre}</h3>
              <p style={{ color: "var(--texto-suave)", fontSize: 13, marginTop: 4 }}>
                {receta.categoria} · {receta.unidades} unidades
              </p>
            </div>
            <button type="button" onClick={onCerrar} style={{
              all: "unset", cursor: "pointer", fontSize: 20,
              color: "var(--texto-suave)", lineHeight: 1, padding: "4px 8px",
            }}>✕</button>
          </div>

          {(receta.equipo || receta.temperatura || receta.tiempoCoccion) && (
            <div style={{
              display: "flex", gap: 16, flexWrap: "wrap",
              background: "var(--gris)", borderRadius: 10,
              padding: "12px 16px", marginBottom: 20,
            }}>
              {receta.equipo && <span style={{ fontSize: 13 }}>🔧 <strong>{receta.equipo}</strong></span>}
              {receta.temperatura && <span style={{ fontSize: 13 }}>🌡️ <strong>{receta.temperatura}°C</strong></span>}
              {receta.tiempoCoccion && <span style={{ fontSize: 13 }}>⏱️ <strong>{receta.tiempoCoccion} min</strong></span>}
            </div>
          )}

          {(receta.ingredientes || []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", letterSpacing: 0.5, marginBottom: 10 }}>🧁 INGREDIENTES</p>
              {receta.ingredientes.map(ing => (
                <div key={ing.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--gris-borde)", fontSize: 14 }}>
                  <span>{ing.nombre}</span>
                  <span style={{ color: "var(--texto-suave)" }}>{ing.cantidadUso} {ing.unidadUso}</span>
                </div>
              ))}
            </div>
          )}

          {(receta.insumos || []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", letterSpacing: 0.5, marginBottom: 10 }}>📦 INSUMOS DE EMPAQUE</p>
              {receta.insumos.map(ins => (
                <div key={ins.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--gris-borde)", fontSize: 14 }}>
                  <span>{ins.nombre}</span>
                  <span style={{ color: "var(--texto-suave)" }}>{ins.cantidadUso} {ins.unidadUso}</span>
                </div>
              ))}
            </div>
          )}

          {(receta.pasos || []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", letterSpacing: 0.5, marginBottom: 10 }}>📋 ELABORACIÓN</p>
              {receta.pasos.map((paso, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: "var(--verde-claro)", color: "var(--verde-oscuro)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 12,
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 14, margin: 0, lineHeight: 1.6, paddingTop: 2 }}>{paso}</p>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={() => onImprimir([receta])} style={{
            all: "unset", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--verde-oscuro)", color: "#fff",
            padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
          }}>
            🖨️ Imprimir esta receta
          </button>
        </div>
      </div>
    </div>
  )
}

function VistaPrint({ recetas }) {
  return (
    <div id="recetario-print" style={{ display: "none" }}>
      {recetas.map((receta) => {
        const foto = receta.fotoBase64 || receta.fotoUrl
        return (
          <div key={receta.id} className="receta-print-pagina" style={{ padding: "24px 32px", fontFamily: "sans-serif" }}>
            <div style={{ borderBottom: "3px solid #1a9e87", paddingBottom: 12, marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 26, color: "#1a9e87" }}>{receta.nombre}</h1>
              <p style={{ margin: "4px 0 0", color: "#718096", fontSize: 13 }}>
                {receta.categoria} · {receta.unidades} unidades
              </p>
            </div>
            {foto && (
              <img src={foto} alt={receta.nombre}
                style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 10, marginBottom: 20 }}
              />
            )}
            {(receta.equipo || receta.temperatura || receta.tiempoCoccion) && (
              <div style={{ display: "flex", gap: 24, background: "#f4f6f8", padding: "10px 16px", borderRadius: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {receta.equipo && <span style={{ fontSize: 13 }}>🔧 <strong>{receta.equipo}</strong></span>}
                {receta.temperatura && <span style={{ fontSize: 13 }}>🌡️ <strong>{receta.temperatura}°C</strong></span>}
                {receta.tiempoCoccion && <span style={{ fontSize: 13 }}>⏱️ <strong>{receta.tiempoCoccion} min</strong></span>}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: (receta.pasos || []).length > 0 ? "1fr 1fr" : "1fr", gap: 24 }}>
              <div>
                {(receta.ingredientes || []).length > 0 && (
                  <>
                    <p style={{ fontWeight: 700, fontSize: 11, color: "#718096", letterSpacing: 0.5, marginBottom: 8 }}>🧁 INGREDIENTES</p>
                    {receta.ingredientes.map(ing => (
                      <div key={ing.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #e2e8f0", fontSize: 13 }}>
                        <span>{ing.nombre}</span>
                        <span style={{ color: "#718096" }}>{ing.cantidadUso} {ing.unidadUso}</span>
                      </div>
                    ))}
                  </>
                )}
                {(receta.insumos || []).length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: 11, color: "#718096", letterSpacing: 0.5, marginBottom: 8 }}>📦 INSUMOS</p>
                    {receta.insumos.map(ins => (
                      <div key={ins.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #e2e8f0", fontSize: 13 }}>
                        <span>{ins.nombre}</span>
                        <span style={{ color: "#718096" }}>{ins.cantidadUso} {ins.unidadUso}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {(receta.pasos || []).length > 0 && (
                <div>
                  <p style={{ fontWeight: 700, fontSize: 11, color: "#718096", letterSpacing: 0.5, marginBottom: 8 }}>📋 ELABORACIÓN</p>
                  {receta.pasos.map((paso, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        background: "#e8f8f5", color: "#1a9e87",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 11,
                      }}>{i + 1}</div>
                      <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, paddingTop: 2 }}>{paso}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Recetario({ db }) {
  const [detalle, setDetalle] = useState(null)
  const [recetasParaImprimir, setRecetasParaImprimir] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("Todas")

  const recetas = db.recetas || []   // ← siempre array seguro

  const categorias = ["Todas", ...new Set(recetas.map(r => r.categoria).filter(Boolean))]

  const recetasFiltradas = recetas.filter(r => {
    const coincideBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = filtroCategoria === "Todas" || r.categoria === filtroCategoria
    return coincideBusqueda && coincideCategoria
  })

  const imprimir = (lista) => {
    inyectarEstiloImpresion()
    setRecetasParaImprimir(lista)
    setDetalle(null)
    setTimeout(() => {
      const el = document.getElementById("recetario-print")
      if (el) el.style.display = "block"
      window.print()
      if (el) el.style.display = "none"
    }, 100)
  }

  if (recetas.length === 0) {
    return (
      <div>
        <h2 className="page-titulo">📖 Recetario</h2>
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🍩</div>
          <h3 style={{ color: "var(--texto-suave)" }}>Sin recetas todavía</h3>
          <p style={{ color: "var(--texto-suave)", fontSize: 14 }}>
            Creá tus recetas en el módulo <strong>Recetas & Costos</strong> y aparecerán acá.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h2 className="page-titulo" style={{ margin: 0 }}>📖 Recetario</h2>
        <button type="button" onClick={() => imprimir(recetasFiltradas)} style={{
          all: "unset", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--verde-oscuro)", color: "#fff",
          padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
        }}>
          🖨️ Imprimir todo ({recetasFiltradas.length})
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Buscar receta..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: 180, maxWidth: 280 }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categorias.map(cat => (
            <button key={cat} type="button" onClick={() => setFiltroCategoria(cat)} style={{
              all: "unset", cursor: "pointer",
              padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
              background: filtroCategoria === cat ? "var(--verde-oscuro)" : "var(--gris)",
              color: filtroCategoria === cat ? "#fff" : "var(--texto)",
              border: "1.5px solid " + (filtroCategoria === cat ? "var(--verde-oscuro)" : "transparent"),
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {recetasFiltradas.length === 0 ? (
        <p style={{ color: "var(--texto-suave)", textAlign: "center", padding: 32 }}>
          No hay recetas que coincidan con la búsqueda.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {recetasFiltradas.map(receta => (
            <TarjetaReceta key={receta.id} receta={receta} onVerDetalle={setDetalle} />
          ))}
        </div>
      )}

      {detalle && (
        <ModalDetalle receta={detalle} onCerrar={() => setDetalle(null)} onImprimir={imprimir} />
      )}

      {recetasParaImprimir.length > 0 && (
        <VistaPrint recetas={recetasParaImprimir} />
      )}
    </div>
  )
}