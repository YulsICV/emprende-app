import { useState } from "react"

export default function HistorialProduccion({ historial, onEliminar }) {
    const [confirmando, setConfirmando] = useState(null)

    if (Object.keys(historial).length === 0) return null

    const handleEliminar = (id) => {
        if (confirmando === id) {
            onEliminar(id)
            setConfirmando(null)
        } else {
            setConfirmando(id)
        }
    }

    return (
        <div className="card">
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>📋 Historial</h3>
            {Object.entries(historial).map(([fecha, items]) => (
                <div key={fecha} style={{ marginBottom: 16 }}>
                    <p style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                        color: "var(--texto-suave)", marginBottom: 8
                    }}>
                        📅 {new Date(fecha + "T12:00:00").toLocaleDateString("es-CR", {
                            weekday: "long", day: "numeric", month: "long"
                        }).toUpperCase()}
                    </p>
                    {items.map(item => (
                        <div key={item._id} style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", padding: "8px 0",
                            borderBottom: "1px solid var(--borde)", fontSize: 14
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span>{item.tipo === "perdida" ? "⚠️" : "🍩"}</span>
                                <strong>{item.recetaNombre}</strong>
                                <span style={{
                                    background: item.tipo === "perdida" ? "#fef2f2" : "var(--fondo)",
                                    color: item.tipo === "perdida" ? "#dc2626" : "var(--texto-suave)",
                                    padding: "1px 8px", borderRadius: 10, fontSize: 12
                                }}>
                                    {item.tipo === "perdida" ? "-" : "+"}{item.cantidad} unid.
                                </span>
                                {item.notas && (
                                    <span style={{ fontSize: 12, color: "var(--texto-suave)", fontStyle: "italic" }}>
                                        — {item.notas}
                                    </span>
                                )}
                            </div>

                            {confirmando === item._id ? (
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <span style={{ fontSize: 12, color: "#ef4444" }}>¿Eliminar?</span>
                                    <button type="button" onClick={() => handleEliminar(item._id)}
                                        style={{ padding: "3px 10px", borderRadius: 6, border: "none",
                                            background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 12 }}>
                                        Sí
                                    </button>
                                    <button type="button" onClick={() => setConfirmando(null)}
                                        style={{ padding: "3px 10px", borderRadius: 6,
                                            border: "1px solid var(--borde)", background: "none",
                                            cursor: "pointer", fontSize: 12 }}>
                                        No
                                    </button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => handleEliminar(item._id)}
                                    style={{ background: "none", border: "none", color: "#ef4444",
                                        cursor: "pointer", fontSize: 16 }}>
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}