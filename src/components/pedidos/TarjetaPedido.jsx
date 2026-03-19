const labelEnvio = (p) => {
    if (p.tipoEnvio === "gratis") return "🚚 Envío gratis"
    if (p.tipoEnvio === "conCosto") return `🚚 Envío ₡${parseInt(p.envio || 0).toLocaleString()}`
    return "🏃 Recoge el cliente"
}

const badgeEstado = (estado) => {
    if (estado === "pendiente") return "badge badge-pendiente"
    if (estado === "en proceso") return "badge badge-proceso"
    return "badge badge-entregado"
}

export default function TarjetaPedido({ pedido: p, expandido, onToggle, onCambiarEstado, onEditar, onEliminar }) {
    return (
        <div className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                onClick={onToggle}>
                <div>
                    <p style={{ fontWeight: 700, marginBottom: 2 }}>{p.cliente}</p>
                    <p style={{ color: "var(--texto-suave)", fontSize: 14 }}>
                        {p.recetaNombre} · {p.cantidad} unid. · {labelEnvio(p)}
                    </p>
                    <p style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                        📅 {new Date(p.fechaEntrega + "T12:00:00").toLocaleDateString("es-CR", {
                            day: "numeric", month: "short", year: "numeric"
                        })}
                    </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span className={badgeEstado(p.estado)}>{p.estado}</span>
                    <span style={{ fontSize: 18 }}>{expandido ? "▲" : "▼"}</span>
                </div>
            </div>

            {expandido && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--borde)", paddingTop: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        <div>
                            <small style={{ color: "var(--texto-suave)" }}>Total</small>
                            <p style={{ fontWeight: 700 }}>₡{parseInt(p.total || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <small style={{ color: "var(--texto-suave)" }}>Saldo pendiente</small>
                            <p style={{ fontWeight: 700, color: p.saldoPendiente > 0 ? "var(--acento)" : "var(--verde)" }}>
                                ₡{parseInt(p.saldoPendiente || 0).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <small style={{ color: "var(--texto-suave)" }}>Anticipo · Método</small>
                            <p>₡{parseInt(p.anticipo || 0).toLocaleString()} · {p.metodoPago}</p>
                        </div>
                        <div>
                            <small style={{ color: "var(--texto-suave)" }}>Teléfono</small>
                            <p>{p.telefono || "—"}</p>
                        </div>
                        {p.tematica && (
                            <div>
                                <small style={{ color: "var(--texto-suave)" }}>Temática</small>
                                <p>{p.tematica} {p.costoTematica ? `(₡${parseInt(p.costoTematica).toLocaleString()})` : ""}</p>
                            </div>
                        )}
                        {p.colores && (
                            <div>
                                <small style={{ color: "var(--texto-suave)" }}>Colores</small>
                                <p>{p.colores}</p>
                            </div>
                        )}
                        {p.especificaciones && (
                            <div style={{ gridColumn: "1/-1" }}>
                                <small style={{ color: "var(--texto-suave)" }}>Especificaciones</small>
                                <p>{p.especificaciones}</p>
                            </div>
                        )}
                        {p.notasInternas && (
                            <div style={{ gridColumn: "1/-1" }}>
                                <small style={{ color: "var(--texto-suave)" }}>🔒 Notas internas</small>
                                <p style={{ fontStyle: "italic" }}>{p.notasInternas}</p>
                            </div>
                        )}
                        {p.motivoCambio && (
                            <div style={{ gridColumn: "1/-1" }}>
                                <small style={{ color: "var(--texto-suave)" }}>⚠️ Cambio: {p.motivoCambio}</small>
                                {p.cargoCambio && <p>Cargo: ₡{parseInt(p.cargoCambio).toLocaleString()}</p>}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {p.estado !== "en proceso" && p.estado !== "entregado" && (
                            <button className="btn-secundario" type="button"
                                onClick={e => { e.stopPropagation(); onCambiarEstado(p._id, "en proceso") }}>
                                ⚙️ En proceso
                            </button>
                        )}
                        {p.estado !== "entregado" && (
                            <button className="btn-secundario" type="button"
                                onClick={e => { e.stopPropagation(); onCambiarEstado(p._id, "entregado") }}
                                style={{ borderColor: "#10b981", color: "#10b981" }}>
                                ✅ Marcar entregado
                            </button>
                        )}
                        {p.estado === "entregado" && (
                            <button className="btn-secundario" type="button"
                                onClick={e => { e.stopPropagation(); onCambiarEstado(p._id, "pendiente") }}>
                                ↩️ Revertir
                            </button>
                        )}
                        <button className="btn-secundario" type="button"
                            onClick={e => { e.stopPropagation(); onEditar(p) }}
                            style={{ borderColor: "#6366f1", color: "#6366f1" }}>
                            ✏️ Editar
                        </button>
                        <button type="button"
                            onClick={e => { e.stopPropagation(); onEliminar(p._id) }}
                            style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>
                            🗑️
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}