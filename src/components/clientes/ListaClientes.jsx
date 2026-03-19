import { useState } from "react"

const TIPO_ESTILOS = {
    mayorista: { bg: "#ede9fe", color: "#7c3aed" },
    empresa:   { bg: "#dbeafe", color: "#1d4ed8" },
    frecuente: { bg: "#dcfce7", color: "#16a34a" },
    individual:{ bg: "#f3f4f6", color: "#6b7280" },
}

export default function ListaClientes({ clientes, pedidosDelCliente, onEditar, onEliminar }) {
    const [expandido, setExpandido] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [confirmarId, setConfirmarId] = useState(null)

    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.telefono || "").includes(busqueda)
    )

    if (clientes.length === 0) return null

    const handleEliminar = (id) => {
        if (confirmarId === id) {
            onEliminar(id)
            setConfirmarId(null)
        } else {
            setConfirmarId(id)
        }
    }

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
                const historial = pedidosDelCliente(c.nombre)
                const totalComprado = historial.reduce((s, p) => s + parseFloat(p.total || 0), 0)
                const abierto = expandido === c._id
                const tipoEstilo = TIPO_ESTILOS[c.tipo] || TIPO_ESTILOS.individual
                const confirmando = confirmarId === c._id

                return (
                    <div key={c._id} style={{
                        borderBottom: "1px solid var(--borde)",
                        paddingBottom: 12, marginBottom: 12
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                            onClick={() => setExpandido(abierto ? null : c._id)}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <strong>{c.nombre}</strong>
                                    <span style={{
                                        fontSize: 11, padding: "1px 8px", borderRadius: 10,
                                        background: tipoEstilo.bg, color: tipoEstilo.color, fontWeight: 600
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
                                    <p style={{ fontWeight: 700, fontSize: 14 }}>
                                        ₡{totalComprado.toLocaleString("es-CR", { maximumFractionDigits: 0 })}
                                    </p>
                                    <p style={{ fontSize: 12, color: "var(--texto-suave)" }}>
                                        {historial.length} pedido{historial.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <span style={{ fontSize: 16 }}>{abierto ? "▲" : "▼"}</span>
                            </div>
                        </div>

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

                                {historial.length > 0 && (
                                    <div style={{ marginBottom: 10 }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--texto-suave)", marginBottom: 6, letterSpacing: 0.5 }}>
                                            ÚLTIMOS PEDIDOS
                                        </p>
                                        {historial.slice(0, 5).map((p, i) => (
                                            <div key={p._id || i} style={{
                                                display: "flex", justifyContent: "space-between",
                                                fontSize: 13, padding: "3px 0",
                                                borderBottom: "1px solid var(--borde)"
                                            }}>
                                                <span>{p.recetaNombre} × {p.cantidad}</span>
                                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                    <span>₡{parseFloat(p.total || 0).toLocaleString()}</span>
                                                    <span style={{
                                                        fontSize: 11, padding: "1px 7px", borderRadius: 10,
                                                        background: p.estado === "entregado" ? "#dcfce7" : p.estado === "en proceso" ? "#dbeafe" : "#fef3c7",
                                                        color: p.estado === "entregado" ? "#16a34a" : p.estado === "en proceso" ? "#1d4ed8" : "#d97706",
                                                        fontWeight: 600
                                                    }}>{p.estado}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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
                                        onClick={e => { e.stopPropagation(); onEditar(c) }}
                                        style={{ fontSize: 13 }}>
                                        ✏️ Editar
                                    </button>
                                    {confirmando ? (
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: 5,
                                            background: "#fff5f5", border: "1.5px solid #fecaca",
                                            borderRadius: 8, padding: "4px 8px"
                                        }}>
                                            <span style={{ fontSize: 12, color: "#e53e3e", fontWeight: 600 }}>¿Eliminar?</span>
                                            <button type="button" onClick={e => { e.stopPropagation(); handleEliminar(c._id) }}
                                                style={{ all: "unset", cursor: "pointer", background: "#e53e3e", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>
                                                Sí
                                            </button>
                                            <button type="button" onClick={e => { e.stopPropagation(); setConfirmarId(null) }}
                                                style={{ all: "unset", cursor: "pointer", background: "#e2e8f0", color: "#2d3748", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6 }}>
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button type="button"
                                            onClick={e => { e.stopPropagation(); setConfirmarId(c._id) }}
                                            style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}