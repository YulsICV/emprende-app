import { useState } from "react"

export default function ListaClientes({ db, ventasDelCliente, eliminar, onEditar }) {
    const [expandido, setExpandido] = useState(null)
    const [busqueda, setBusqueda] = useState("")

    const clientes = db.clientes || []
    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.telefono || "").includes(busqueda)
    )

    if (clientes.length === 0) return null

    return (
        <div className="card">
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>
                👥 Mis clientes ({clientes.length})
            </h3>

            {clientes.length > 4 && (
                <div className="form-grupo">
                    <input type="text" placeholder="🔍 Buscar por nombre o teléfono..."
                        value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </div>
            )}

            {filtrados.map(c => {
                const historial = ventasDelCliente(c.nombre)
                const totalComprado = historial.reduce((s, v) => s + parseFloat(v.total || 0), 0)
                const abierto = expandido === c.id

                return (
                    <div key={c.id} style={{
                        borderBottom: "1px solid var(--borde)",
                        paddingBottom: 12, marginBottom: 12
                    }}>
                        {/* Fila principal */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                            onClick={() => setExpandido(abierto ? null : c.id)}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <strong>{c.nombre}</strong>
                                    <span style={{
                                        fontSize: 11, padding: "1px 7px", borderRadius: 10,
                                        background: "var(--fondo)", color: "var(--texto-suave)", fontWeight: 600
                                    }}>{c.tipo}</span>
                                    {c.alergias && (
                                        <span style={{
                                            fontSize: 11, padding: "1px 7px", borderRadius: 10,
                                            background: "#fef3c7", color: "#d97706", fontWeight: 600
                                        }}>⚠️ Alergias</span>
                                    )}
                                </div>
                                <p style={{ fontSize: 13, color: "var(--texto-suave)", marginTop: 2 }}>
                                    {c.telefono && `📞 ${c.telefono}`}
                                    {c.telefono && c.correo && " · "}
                                    {c.correo && `✉️ ${c.correo}`}
                                </p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontWeight: 700, fontSize: 14 }}>₡{totalComprado.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</p>
                                    <p style={{ fontSize: 12, color: "var(--texto-suave)" }}>{historial.length} pedido{historial.length !== 1 ? "s" : ""}</p>
                                </div>
                                <span style={{ fontSize: 16 }}>{abierto ? "▲" : "▼"}</span>
                            </div>
                        </div>

                        {/* Detalle expandible */}
                        {abierto && (
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--borde)" }}>
                                {c.alergias && c.notasAlergias && (
                                    <div style={{
                                        padding: "6px 10px", background: "#fef3c7",
                                        border: "1px solid #f59e0b", borderRadius: 8,
                                        fontSize: 13, marginBottom: 8
                                    }}>
                                        <strong>⚠️ Alergias:</strong> {c.notasAlergias}
                                    </div>
                                )}
                                {c.nota && (
                                    <p style={{ fontSize: 13, color: "var(--texto-suave)", marginBottom: 8 }}>
                                        📝 {c.nota}
                                    </p>
                                )}
                                {c.direccion && (
                                    <p style={{ fontSize: 13, color: "var(--texto-suave)", marginBottom: 8 }}>
                                        📍 {c.direccion}
                                    </p>
                                )}

                                {/* Últimos pedidos */}
                                {historial.length > 0 && (
                                    <div style={{ marginBottom: 10 }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--texto-suave)", marginBottom: 6, letterSpacing: 0.5 }}>
                                            ÚLTIMOS PEDIDOS
                                        </p>
                                        {historial.slice(0, 5).map((v, i) => (
                                            <div key={i} style={{
                                                display: "flex", justifyContent: "space-between",
                                                fontSize: 13, padding: "3px 0",
                                                borderBottom: "1px solid var(--borde)"
                                            }}>
                                                <span>{v.recetaNombre || v.descripcion || "Venta"}</span>
                                                <span style={{ fontWeight: 600 }}>₡{parseFloat(v.total || 0).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: 8 }}>
                                    {c.telefono && (
                                        <a href={`https://wa.me/506${c.telefono.replace(/\D/g, "")}`}
                                            target="_blank" rel="noreferrer"
                                            style={{
                                                padding: "5px 12px", borderRadius: 8, fontSize: 13,
                                                background: "#25d366", color: "#fff",
                                                textDecoration: "none", fontWeight: 600
                                            }}>
                                            💬 WhatsApp
                                        </a>
                                    )}
                                    <button className="btn-secundario" type="button"
                                        onClick={() => onEditar(c)}
                                        style={{ fontSize: 13 }}>
                                        ✏️ Editar
                                    </button>
                                    <button type="button" onClick={() => eliminar(c.id)}
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}