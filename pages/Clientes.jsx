import { useState } from "react"

const FORM_INICIAL = {
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
    tipo: "individual",
    alergias: false,
    notasAlergias: "",
    nota: ""
}

export default function Clientes({ db, actualizarDb }) {
    const [form, setForm] = useState(FORM_INICIAL)
    const [editandoId, setEditandoId] = useState(null)
    const [expandido, setExpandido] = useState(null)
    const [busqueda, setBusqueda] = useState("")

    const clientes = db.clientes || []

    const clientesFiltrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.telefono || "").includes(busqueda)
    )

    const pedidosDelCliente = (nombre) =>
        (db.pedidos || []).filter(p => p.cliente === nombre)

    const ventasDelCliente = (nombre) =>
        (db.ventas || []).filter(v => v.cliente === nombre)

    const totalGastado = (nombre) => {
        const totalPedidos = pedidosDelCliente(nombre).reduce((s, p) => s + (parseFloat(p.total) || 0), 0)
        const totalVentas = ventasDelCliente(nombre).reduce((s, v) => s + (parseFloat(v.total) || 0), 0)
        return totalPedidos + totalVentas
    }

    const guardar = () => {
        if (!form.nombre) return

        if (editandoId) {
            actualizarDb("clientes", clientes.map(c =>
                c.id === editandoId ? { ...form, id: editandoId } : c
            ))
            setEditandoId(null)
        } else {
            const nuevoCliente = {
                ...form,
                id: crypto.randomUUID(),
                fecha: new Date().toISOString()
            }
            actualizarDb("clientes", [...clientes, nuevoCliente])
        }
        setForm(FORM_INICIAL)
    }

    const editar = (cliente) => {
        setForm({
            nombre: cliente.nombre,
            telefono: cliente.telefono || "",
            correo: cliente.correo || "",
            direccion: cliente.direccion || "",
            tipo: cliente.tipo || "individual",
            alergias: cliente.alergias || false,
            notasAlergias: cliente.notasAlergias || "",
            nota: cliente.nota || ""
        })
        setEditandoId(cliente.id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const cancelar = () => {
        setEditandoId(null)
        setForm(FORM_INICIAL)
    }

    const eliminar = (id) => {
        if (!window.confirm("¿Eliminar este cliente?")) return
        actualizarDb("clientes", clientes.filter(c => c.id !== id))
    }

    const badgeEstado = (estado) => {
        if (estado === "pendiente") return "badge badge-pendiente"
        if (estado === "en proceso") return "badge badge-proceso"
        return "badge badge-entregado"
    }

    return (
        <div>
            <h2 className="page-titulo">👥 Clientes</h2>

            {/* ── FORMULARIO ── */}
            <div className="card">
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>
                    {editandoId ? "✏️ Editar cliente" : "Nuevo cliente"}
                </h3>

                <div className="form-grupo">
                    <label>Nombre *</label>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-grupo">
                        <label>Teléfono</label>
                        <input
                            type="tel"
                            placeholder="8888-8888"
                            value={form.telefono}
                            onChange={e => setForm({ ...form, telefono: e.target.value })}
                        />
                    </div>
                    <div className="form-grupo">
                        <label>Tipo de cliente</label>
                        <select
                            value={form.tipo}
                            onChange={e => setForm({ ...form, tipo: e.target.value })}
                        >
                            <option value="individual">Individual</option>
                            <option value="empresa">Empresa</option>
                            <option value="mayorista">Mayorista</option>
                        </select>
                    </div>
                </div>

                <div className="form-grupo">
                    <label>Correo</label>
                    <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={form.correo}
                        onChange={e => setForm({ ...form, correo: e.target.value })}
                    />
                </div>

                <div className="form-grupo">
                    <label>Dirección</label>
                    <input
                        type="text"
                        placeholder="Dirección de entrega"
                        value={form.direccion}
                        onChange={e => setForm({ ...form, direccion: e.target.value })}
                    />
                </div>

                {/* Alergias */}
                <div className="form-grupo">
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={form.alergias}
                            onChange={e => setForm({ ...form, alergias: e.target.checked })}
                        />
                        ⚠️ Tiene alergias o restricciones alimentarias
                    </label>
                </div>

                {form.alergias && (
                    <div className="form-grupo">
                        <label>Detalle de alergias</label>
                        <textarea
                            rows={2}
                            placeholder="ej. Alérgica al gluten, no nueces..."
                            value={form.notasAlergias}
                            onChange={e => setForm({ ...form, notasAlergias: e.target.value })}
                            style={{ resize: "vertical" }}
                        />
                    </div>
                )}

                <div className="form-grupo">
                    <label>Nota interna</label>
                    <textarea
                        rows={2}
                        placeholder="Solo tú puedes ver esto..."
                        value={form.nota}
                        onChange={e => setForm({ ...form, nota: e.target.value })}
                        style={{ resize: "vertical" }}
                    />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primario" type="button" onClick={guardar}>
                        {editandoId ? "✏️ Actualizar cliente" : "💾 Guardar cliente"}
                    </button>
                    {editandoId && (
                        <button className="btn-secundario" type="button" onClick={cancelar}>
                            ✕ Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* ── LISTA ── */}
            {clientes.length > 0 && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
                        <h3 className="seccion-titulo" style={{ margin: 0 }}>
                            Mis clientes ({clientes.length})
                        </h3>
                    </div>

                    {clientes.length > 4 && (
                        <div className="form-grupo">
                            <input
                                type="text"
                                placeholder="🔍 Buscar por nombre o teléfono..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                            />
                        </div>
                    )}

                    {clientesFiltrados.map(c => {
                        const pedidos = pedidosDelCliente(c.nombre)
                        const gastado = totalGastado(c.nombre)

                        return (
                            <div className="card" key={c.id} style={{ marginBottom: 10 }}>
                                {/* Cabecera */}
                                <div
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                                    onClick={() => setExpandido(expandido === c.id ? null : c.id)}
                                >
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                            <strong style={{ fontSize: 16 }}>{c.nombre}</strong>
                                            {c.alergias && (
                                                <span style={{ fontSize: 12, color: "#d97706", background: "#fef3c7", padding: "1px 7px", borderRadius: 10 }}>
                                                    ⚠️ Alergias
                                                </span>
                                            )}
                                            <span style={{
                                                fontSize: 11, padding: "1px 8px", borderRadius: 10,
                                                background: c.tipo === "mayorista" ? "#ede9fe" : c.tipo === "empresa" ? "#dbeafe" : "#f3f4f6",
                                                color: c.tipo === "mayorista" ? "#7c3aed" : c.tipo === "empresa" ? "#1d4ed8" : "#6b7280"
                                            }}>
                                                {c.tipo}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                            {c.telefono && <span style={{ color: "var(--texto-suave)", fontSize: 14 }}>📱 {c.telefono}</span>}
                                            {pedidos.length > 0 && (
                                                <span style={{ color: "var(--texto-suave)", fontSize: 14 }}>
                                                    🛒 {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
                                                </span>
                                            )}
                                            {gastado > 0 && (
                                                <span style={{ color: "var(--acento)", fontSize: 14, fontWeight: 600 }}>
                                                    ₡{gastado.toLocaleString()} total
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 18, color: "var(--texto-suave)" }}>
                                        {expandido === c.id ? "▲" : "▼"}
                                    </span>
                                </div>

                                {/* Detalle expandible */}
                                {expandido === c.id && (
                                    <div style={{ marginTop: 12, borderTop: "1px solid var(--borde)", paddingTop: 12 }}>
                                        {c.correo && <p style={{ color: "var(--texto-suave)", fontSize: 14, marginBottom: 4 }}>✉️ {c.correo}</p>}
                                        {c.direccion && <p style={{ color: "var(--texto-suave)", fontSize: 14, marginBottom: 4 }}>📍 {c.direccion}</p>}
                                        {c.notasAlergias && (
                                            <p style={{ background: "#fef3c7", padding: "6px 10px", borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
                                                ⚠️ {c.notasAlergias}
                                            </p>
                                        )}
                                        {c.nota && (
                                            <p style={{ background: "var(--fondo)", padding: "6px 10px", borderRadius: 8, fontSize: 13, fontStyle: "italic", marginBottom: 8 }}>
                                                🔒 {c.nota}
                                            </p>
                                        )}

                                        {/* Historial de pedidos */}
                                        {pedidos.length > 0 && (
                                            <div style={{ marginTop: 10 }}>
                                                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "var(--texto-suave)" }}>
                                                    HISTORIAL DE PEDIDOS
                                                </p>
                                                {pedidos.slice(-5).reverse().map(p => (
                                                    <div key={p.id} style={{
                                                        display: "flex", justifyContent: "space-between",
                                                        padding: "6px 0", borderBottom: "1px solid var(--borde)",
                                                        fontSize: 13
                                                    }}>
                                                        <span>{p.recetaNombre} × {p.cantidad}</span>
                                                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                            <span>₡{parseInt(p.total || 0).toLocaleString()}</span>
                                                            <span className={badgeEstado(p.estado)} style={{ fontSize: 11 }}>{p.estado}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Acciones */}
                                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                            <button className="btn-secundario" type="button" onClick={() => editar(c)}>
                                                ✏️ Editar
                                            </button>
                                            {c.telefono && (
                                                <a
                                                    href={`https://wa.me/506${c.telefono.replace(/\D/g, "")}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn-secundario"
                                                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                                                >
                                                    💬 WhatsApp
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => eliminar(c.id)}
                                                style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {clientesFiltrados.length === 0 && busqueda && (
                        <p style={{ color: "var(--texto-suave)", textAlign: "center", padding: 20 }}>
                            No se encontró "{busqueda}"
                        </p>
                    )}
                </div>
            )}

            {clientes.length === 0 && (
                <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                    <p style={{ fontSize: 40 }}>👥</p>
                    <p>Aún no tienes clientes registrados.</p>
                </div>
            )}
        </div>
    )
}