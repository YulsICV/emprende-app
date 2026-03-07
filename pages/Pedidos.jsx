import { useState, useEffect, useRef } from "react"

const FORM_INICIAL = {
    fechaEntrega: "",
    cliente: "",
    clienteNuevo: "",
    telefonoNuevo: "",
    correoNuevo: "",
    direcNuevo: "",
    recetaId: "",
    cantidad: "",
    anticipo: "",
    estado: "pendiente",
    metodoPago: "SINPE",
    notasInternas: "",
    alergiasNuevo: false,
    notasAlergiasNuevo: "",
    tematica: "",
    costoTematica: "",
    colores: "",
    tipoEnvio: "recogido",
    envio: "",
    costoEmpaque: "",
    especificaciones: "",
    cargoCambio: "",
    motivoCambio: "",
    camposExtra: {
        tematica: false,
        colores: false,
        empaque: false,
        especificaciones: false,
        cambioUltimaMomento: false
    }
}

export default function Pedidos({ db, actualizarDb }) {
    const [esNuevoCliente, setEsNuevoCliente] = useState(false)
    const [alertaCliente, setAlertaCliente] = useState("")
    const [expandido, setExpandido] = useState(null)
    const [form, setForm] = useState(FORM_INICIAL)
    const [editandoId, setEditandoId] = useState(null)

    const recetaSeleccionada = db.recetas.find(r => r.id === form.recetaId)
    const nombreCliente = esNuevoCliente ? form.clienteNuevo : form.cliente

    const calcularTotal = (f, receta) => {
        if (!receta) return 0
        return receta.precioMenudeo * (parseInt(f.cantidad) || 0)
            + (f.tipoEnvio === "conCosto" ? parseFloat(f.envio || 0) : 0)
            + parseFloat(f.costoTematica || 0)
            + parseFloat(f.costoEmpaque || 0)
            + parseFloat(f.cargoCambio || 0)
    }

    const total = calcularTotal(form, recetaSeleccionada)
    const saldoPendiente = total - parseFloat(form.anticipo || 0)

    const ultimaRecetaId = useRef(null)
    useEffect(() => {
        if (form.recetaId === ultimaRecetaId.current) return
        ultimaRecetaId.current = form.recetaId
        if (recetaSeleccionada?.envioGratis) {
            setForm(f => ({ ...f, tipoEnvio: "gratis", envio: "" }))
        }
    }, [form.recetaId, recetaSeleccionada?.envioGratis])

    const verificarClienteExistente = (nombre) => {
        const existe = db.clientes?.find(c =>
            c.nombre.toLowerCase().includes(nombre.toLowerCase()) && nombre.length > 2
        )
        setAlertaCliente(existe ? `Ya existe "${existe.nombre}". ¿Es el mismo?` : "")
    }

    const usarClienteExistente = () => {
        const existe = db.clientes?.find(c =>
            c.nombre.toLowerCase().includes(form.clienteNuevo.toLowerCase())
        )
        if (existe) {
            setEsNuevoCliente(false)
            setForm({ ...form, cliente: existe.nombre, clienteNuevo: "" })
            setAlertaCliente("")
        }
    }

    const guardar = () => {
        if (!nombreCliente || !form.recetaId || !form.cantidad || !form.fechaEntrega) return
        if (esNuevoCliente && !form.telefonoNuevo) return

        const clienteExistente = db.clientes?.find(c => c.nombre === form.cliente)
        const receta = db.recetas.find(r => r.id === form.recetaId)
        const totalCalculado = calcularTotal(form, receta)
        const saldo = totalCalculado - parseFloat(form.anticipo || 0)

        const datosPedido = {
            ...form,
            cliente: nombreCliente,
            telefono: esNuevoCliente ? form.telefonoNuevo : clienteExistente?.telefono || "",
            correo: esNuevoCliente ? form.correoNuevo : clienteExistente?.correo || "",
            total: totalCalculado,
            saldoPendiente: saldo,
            recetaNombre: receta.nombre,
            recetaUnidades: receta.unidades,
            fecha: new Date().toISOString()
        }

        if (editandoId) {
            actualizarDb("pedidos", db.pedidos.map(p =>
                p.id === editandoId ? { ...datosPedido, id: editandoId } : p
            ))
            setEditandoId(null)
        } else {
            const nuevoPedido = { ...datosPedido, id: crypto.randomUUID() }
            if (esNuevoCliente && form.clienteNuevo) {
                const nuevoCliente = {
                    id: crypto.randomUUID(),
                    nombre: form.clienteNuevo,
                    telefono: form.telefonoNuevo,
                    correo: form.correoNuevo,
                    direccion: form.direcNuevo,
                    tipo: "individual",
                    alergias: form.alergiasNuevo || false,
                    notasAlergias: form.notasAlergiasNuevo || "",
                    nota: "",
                    fecha: new Date().toISOString()
                }
                // FIX: capturar los arrays ANTES de cualquier setState
                const clientesNuevos = [...(db.clientes || []), nuevoCliente]
                const pedidosNuevos = [...(db.pedidos || []), nuevoPedido]
                actualizarDb("clientes", clientesNuevos)
                actualizarDb("pedidos", pedidosNuevos)
            } else {
                actualizarDb("pedidos", [...(db.pedidos || []), nuevoPedido])
            }
        }

        setForm(FORM_INICIAL)
        setEsNuevoCliente(false)
        setAlertaCliente("")
    }

    const editarPedido = (p) => {
        const receta = db.recetas.find(r => r.nombre === p.recetaNombre)
        setForm({
            fechaEntrega: p.fechaEntrega || "",
            cliente: p.cliente || "",
            clienteNuevo: "",
            telefonoNuevo: p.telefono || "",
            correoNuevo: p.correo || "",
            direcNuevo: "",
            recetaId: receta?.id || "",
            cantidad: p.cantidad || "",
            anticipo: p.anticipo || "",
            estado: p.estado || "pendiente",
            metodoPago: p.metodoPago || "SINPE",
            notasInternas: p.notasInternas || "",
            tematica: p.tematica || "",
            costoTematica: p.costoTematica || "",
            colores: p.colores || "",
            tipoEnvio: p.tipoEnvio || "recogido",
            envio: p.envio || "",
            costoEmpaque: p.costoEmpaque || "",
            especificaciones: p.especificaciones || "",
            cargoCambio: p.cargoCambio || "",
            motivoCambio: p.motivoCambio || "",
            camposExtra: {
                tematica: !!p.tematica,
                colores: !!p.colores,
                empaque: !!p.costoEmpaque,
                especificaciones: !!p.especificaciones,
                cambioUltimaMomento: !!p.motivoCambio
            }
        })
        setEditandoId(p.id)
        setEsNuevoCliente(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const cambiarEstado = (id, nuevoEstado) => {
        const pedido = db.pedidos.find(p => p.id === id)
        if (!pedido) return

        if (nuevoEstado === "entregado" && pedido.estado !== "entregado") {
            const receta = db.recetas.find(r => r.nombre === pedido.recetaNombre)

            // Descontar inventario
            if (receta && (db.inventario || []).length > 0) {
                const factor = (parseInt(pedido.cantidad) || 0) / (parseInt(receta.unidades) || 1)
                const todosLosItems = [...(receta.ingredientes || []), ...(receta.insumos || [])]
                actualizarDb("inventario", (db.inventario || []).map(item => {
                    const usado = todosLosItems.find(i =>
                        i.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim()
                    )
                    if (!usado) return item
                    const consumo = (parseFloat(usado.cantidadUso) || 0) * factor
                    return { ...item, cantidad: parseFloat(Math.max(0, (parseFloat(item.cantidad) || 0) - consumo).toFixed(2)) }
                }))
            }

            // Registrar venta automática — junto con el cambio de estado en una sola operación
            const ventaExiste = (db.ventas || []).some(v => v.pedidoId === id)
            const ventasNuevas = ventaExiste ? (db.ventas || []) : [...(db.ventas || []), {
                id: crypto.randomUUID(),
                pedidoId: id,
                cliente: pedido.cliente,
                recetaNombre: pedido.recetaNombre,
                cantidad: pedido.cantidad,
                total: pedido.total,
                metodoPago: pedido.metodoPago,
                fecha: new Date().toISOString(),
                tipo: "pedido"
            }]
            actualizarDb("pedidos", db.pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p), { ventas: ventasNuevas })
            return
        }

        // Revertir: eliminar venta automática junto con cambio de estado
        if (pedido.estado === "entregado" && nuevoEstado !== "entregado") {
            actualizarDb("pedidos", db.pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p), {
                ventas: (db.ventas || []).filter(v => v.pedidoId !== id)
            })
            return
        }

        actualizarDb("pedidos", db.pedidos.map(p =>
            p.id === id ? { ...p, estado: nuevoEstado } : p
        ))
    }

    const eliminar = (id) => {
        actualizarDb("pedidos", db.pedidos.filter(p => p.id !== id), {
            ventas: (db.ventas || []).filter(v => v.pedidoId !== id)
        })
    }

    const badgeEstado = (estado) => {
        if (estado === "pendiente") return "badge badge-pendiente"
        if (estado === "en proceso") return "badge badge-proceso"
        return "badge badge-entregado"
    }

    const labelEnvio = (p) => {
        if (p.tipoEnvio === "gratis") return "🚚 Envío gratis"
        if (p.tipoEnvio === "conCosto") return `🚚 Envío ₡${parseInt(p.envio || 0).toLocaleString()}`
        return "🏃 Recoge el cliente"
    }

    const toggleExtra = (campo) => {
        setForm(f => ({ ...f, camposExtra: { ...f.camposExtra, [campo]: !f.camposExtra[campo] } }))
    }

    return (
        <div>
            <h2 className="page-titulo">🛒 Pedidos</h2>

            {/* ── FORMULARIO ── */}
            <div className="card">
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>
                    {editandoId ? "✏️ Editar pedido" : "Nuevo pedido"}
                </h3>

                <div className="form-grupo">
                    <label>Fecha de entrega *</label>
                    <input type="date" value={form.fechaEntrega}
                        onChange={e => setForm({ ...form, fechaEntrega: e.target.value })} />
                </div>

                <div className="form-grupo">
                    <label>Cliente *</label>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <button type="button"
                            className={!esNuevoCliente ? "btn-primario" : "btn-secundario"}
                            style={{ flex: 1, padding: "6px 0" }}
                            onClick={() => { setEsNuevoCliente(false); setAlertaCliente("") }}>
                            Cliente existente
                        </button>
                        <button type="button"
                            className={esNuevoCliente ? "btn-primario" : "btn-secundario"}
                            style={{ flex: 1, padding: "6px 0" }}
                            onClick={() => setEsNuevoCliente(true)}>
                            + Nuevo cliente
                        </button>
                    </div>
                    {!esNuevoCliente ? (
                        <>
                            <select value={form.cliente}
                                onChange={e => setForm({ ...form, cliente: e.target.value })}>
                                <option value="">— Seleccionar cliente —</option>
                                {(db.clientes || []).map(c => (
                                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                                ))}
                            </select>
                            {(() => {
                                const cli = (db.clientes || []).find(c => c.nombre === form.cliente)
                                if (!cli?.alergias) return null
                                return (
                                    <div style={{
                                        marginTop: 8, padding: "8px 12px",
                                        background: "#fef3c7", border: "1.5px solid #f59e0b",
                                        borderRadius: 8, fontSize: 13
                                    }}>
                                        <strong>⚠️ Alergias:</strong>{" "}
                                        {cli.alergias ? "Tiene alergias registradas" : ""}{" "}
                                        {cli.notasAlergias ? `— ${cli.notasAlergias}` : ""}
                                    </div>
                                )
                            })()}
                        </>
                    ) : (
                        <>
                            <input type="text" placeholder="Nombre *" value={form.clienteNuevo}
                                onChange={e => { setForm({ ...form, clienteNuevo: e.target.value }); verificarClienteExistente(e.target.value) }} />
                            {alertaCliente && (
                                <div className="alerta-warning" style={{ marginTop: 6 }}>
                                    ⚠️ {alertaCliente}
                                    <button type="button" onClick={usarClienteExistente}
                                        style={{ marginLeft: 8, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "var(--acento)" }}>
                                        Usar ese cliente
                                    </button>
                                </div>
                            )}
                            <input type="tel" placeholder="Teléfono *" value={form.telefonoNuevo}
                                onChange={e => setForm({ ...form, telefonoNuevo: e.target.value })} style={{ marginTop: 6 }} />
                            <input type="email" placeholder="Correo (opcional)" value={form.correoNuevo}
                                onChange={e => setForm({ ...form, correoNuevo: e.target.value })} style={{ marginTop: 6 }} />
                            <input type="text" placeholder="Dirección (opcional)" value={form.direcNuevo}
                                onChange={e => setForm({ ...form, direcNuevo: e.target.value })} style={{ marginTop: 6 }} />
                            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer", fontSize: 14 }}>
                                <input type="checkbox" style={{ width: "auto" }}
                                    checked={form.alergiasNuevo || false}
                                    onChange={e => setForm({ ...form, alergiasNuevo: e.target.checked })} />
                                ⚠️ ¿Tiene alergias?
                            </label>
                            {form.alergiasNuevo && (
                                <input type="text" placeholder="Ej: nueces, gluten, lácteos..."
                                    value={form.notasAlergiasNuevo || ""}
                                    onChange={e => setForm({ ...form, notasAlergiasNuevo: e.target.value })}
                                    style={{ marginTop: 6 }} />
                            )}
                        </>
                    )}
                </div>

                <div className="form-grupo">
                    <label>Receta *</label>
                    <select value={form.recetaId} onChange={e => setForm({ ...form, recetaId: e.target.value })}>
                        <option value="">— Seleccionar receta —</option>
                        {(db.recetas || []).map(r => (
                            <option key={r.id} value={r.id}>{r.nombre} — ₡{r.precioMenudeo?.toLocaleString()}/u</option>
                        ))}
                    </select>
                    {recetaSeleccionada && (
                        <small style={{ color: "var(--texto-suave)", marginTop: 4, display: "block" }}>
                            Rinde {recetaSeleccionada.unidades} unidades · Costo ₡{recetaSeleccionada.costoPorUnidad?.toFixed(0)}/u
                        </small>
                    )}
                </div>

                <div className="form-grupo">
                    <label>Cantidad *</label>
                    <input type="number" min="1" placeholder="0" value={form.cantidad}
                        onChange={e => setForm({ ...form, cantidad: e.target.value })} />
                </div>

                {editandoId && (
                    <div className="form-grupo">
                        <label>Estado</label>
                        <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                            <option value="pendiente">🕐 Pendiente</option>
                            <option value="en proceso">⚙️ En proceso</option>
                            <option value="entregado">✅ Entregado</option>
                        </select>
                    </div>
                )}

                <div className="form-grupo">
                    <label>Tipo de envío</label>
                    <select value={form.tipoEnvio}
                        onChange={e => setForm({ ...form, tipoEnvio: e.target.value, envio: "" })}>
                        <option value="gratis">🚚 Envío gratis</option>
                        <option value="conCosto">💰 Envío con costo</option>
                        <option value="recogido">🏃 Recogido por el cliente</option>
                    </select>
                </div>

                {form.tipoEnvio === "conCosto" && (
                    <div className="form-grupo">
                        <label>Costo de envío (₡)</label>
                        <input type="number" placeholder="0" value={form.envio}
                            onChange={e => setForm({ ...form, envio: e.target.value })} />
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-grupo">
                        <label>Anticipo (₡)</label>
                        <input type="number" placeholder="0" value={form.anticipo}
                            onChange={e => setForm({ ...form, anticipo: e.target.value })} />
                    </div>
                    <div className="form-grupo">
                        <label>Método de pago</label>
                        <select value={form.metodoPago} onChange={e => setForm({ ...form, metodoPago: e.target.value })}>
                            <option value="SINPE">SINPE</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta">Tarjeta</option>
                        </select>
                    </div>
                </div>

                <div className="form-grupo">
                    <label>Agregar detalles opcionales</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {[
                            { key: "tematica", label: "🎨 Temática" },
                            { key: "colores", label: "🌈 Colores" },
                            { key: "empaque", label: "📦 Empaque especial" },
                            { key: "especificaciones", label: "📝 Especificaciones" },
                            { key: "cambioUltimaMomento", label: "⚠️ Cambio de último momento" }
                        ].map(({ key, label }) => (
                            <button key={key} type="button" onClick={() => toggleExtra(key)}
                                style={{
                                    padding: "4px 10px", borderRadius: 20,
                                    border: "1.5px solid var(--borde)",
                                    background: form.camposExtra[key] ? "var(--acento)" : "transparent",
                                    color: form.camposExtra[key] ? "#fff" : "var(--texto)",
                                    cursor: "pointer", fontSize: 13
                                }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {form.camposExtra.tematica && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div className="form-grupo">
                            <label>Temática</label>
                            <input type="text" placeholder="ej. Unicornio, Fútbol..." value={form.tematica}
                                onChange={e => setForm({ ...form, tematica: e.target.value })} />
                        </div>
                        <div className="form-grupo">
                            <label>Costo temática (₡)</label>
                            <input type="number" placeholder="0" value={form.costoTematica}
                                onChange={e => setForm({ ...form, costoTematica: e.target.value })} />
                        </div>
                    </div>
                )}

                {form.camposExtra.colores && (
                    <div className="form-grupo">
                        <label>Colores</label>
                        <input type="text" placeholder="ej. Rosa, dorado, blanco" value={form.colores}
                            onChange={e => setForm({ ...form, colores: e.target.value })} />
                    </div>
                )}

                {form.camposExtra.empaque && (
                    <div className="form-grupo">
                        <label>Costo de empaque especial (₡)</label>
                        <input type="number" placeholder="0" value={form.costoEmpaque}
                            onChange={e => setForm({ ...form, costoEmpaque: e.target.value })} />
                    </div>
                )}

                {form.camposExtra.especificaciones && (
                    <div className="form-grupo">
                        <label>Especificaciones / notas del cliente</label>
                        <textarea rows={2} placeholder="Detalles adicionales..." value={form.especificaciones}
                            onChange={e => setForm({ ...form, especificaciones: e.target.value })}
                            style={{ resize: "vertical" }} />
                    </div>
                )}

                {form.camposExtra.cambioUltimaMomento && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div className="form-grupo">
                            <label>Cargo por cambio (₡)</label>
                            <input type="number" placeholder="0" value={form.cargoCambio}
                                onChange={e => setForm({ ...form, cargoCambio: e.target.value })} />
                        </div>
                        <div className="form-grupo">
                            <label>Motivo del cambio</label>
                            <input type="text" placeholder="Describe el cambio..." value={form.motivoCambio}
                                onChange={e => setForm({ ...form, motivoCambio: e.target.value })} />
                        </div>
                    </div>
                )}

                <div className="form-grupo">
                    <label>Notas internas</label>
                    <textarea rows={2} placeholder="Solo tú puedes ver esto..." value={form.notasInternas}
                        onChange={e => setForm({ ...form, notasInternas: e.target.value })}
                        style={{ resize: "vertical" }} />
                </div>

                {recetaSeleccionada && parseInt(form.cantidad) > 0 && (
                    <div className="resumen-grid">
                        <div className="resumen-item">
                            <div className="valor">₡{total.toLocaleString()}</div>
                            <div className="etiqueta">Total</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{parseFloat(form.anticipo || 0).toLocaleString()}</div>
                            <div className="etiqueta">Anticipo</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor" style={{ color: saldoPendiente > 0 ? "var(--acento)" : "var(--verde)" }}>
                                ₡{saldoPendiente.toLocaleString()}
                            </div>
                            <div className="etiqueta">Saldo pendiente</div>
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primario" type="button" onClick={guardar}>
                        {editandoId ? "✏️ Actualizar pedido" : "💾 Guardar pedido"}
                    </button>
                    {editandoId && (
                        <button className="btn-secundario" type="button"
                            onClick={() => { setEditandoId(null); setForm(FORM_INICIAL) }}>
                            ✕ Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* ── LISTA DE PEDIDOS ── */}
            {(db.pedidos || []).length > 0 && (
                <div>
                    <h3 className="seccion-titulo">Mis pedidos</h3>
                    {["pendiente", "en proceso", "entregado"].map(estado => {
                        const pedidosEstado = (db.pedidos || []).filter(p => p.estado === estado)
                        if (pedidosEstado.length === 0) return null
                        const colorTitulo = estado === "pendiente" ? "#f59e0b" : estado === "en proceso" ? "#3b82f6" : "#10b981"
                        return (
                            <div key={estado}>
                                <h4 style={{ margin: "20px 0 10px", color: colorTitulo, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
                                    {estado === "pendiente" ? "🕐" : estado === "en proceso" ? "⚙️" : "✅"} {estado.toUpperCase()} ({pedidosEstado.length})
                                </h4>
                                {pedidosEstado.map(p => (
                                    <div className="card" key={p.id} style={{ marginBottom: 10 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                                            onClick={() => setExpandido(expandido === p.id ? null : p.id)}>
                                            <div>
                                                <p style={{ fontWeight: 700, marginBottom: 2 }}>{p.cliente}</p>
                                                <p style={{ color: "var(--texto-suave)", fontSize: 14 }}>
                                                    {p.recetaNombre} · {p.cantidad} unid. · {labelEnvio(p)}
                                                </p>
                                                <p style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                                    📅 {new Date(p.fechaEntrega + "T12:00:00").toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                                <span className={badgeEstado(p.estado)}>{p.estado}</span>
                                                <span style={{ fontSize: 18 }}>{expandido === p.id ? "▲" : "▼"}</span>
                                            </div>
                                        </div>

                                        {expandido === p.id && (
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
                                                    {p.tematica && <div><small style={{ color: "var(--texto-suave)" }}>Temática</small><p>{p.tematica} {p.costoTematica ? `(₡${parseInt(p.costoTematica).toLocaleString()})` : ""}</p></div>}
                                                    {p.colores && <div><small style={{ color: "var(--texto-suave)" }}>Colores</small><p>{p.colores}</p></div>}
                                                    {p.especificaciones && <div style={{ gridColumn: "1/-1" }}><small style={{ color: "var(--texto-suave)" }}>Especificaciones</small><p>{p.especificaciones}</p></div>}
                                                    {p.notasInternas && <div style={{ gridColumn: "1/-1" }}><small style={{ color: "var(--texto-suave)" }}>🔒 Notas internas</small><p style={{ fontStyle: "italic" }}>{p.notasInternas}</p></div>}
                                                    {p.motivoCambio && <div style={{ gridColumn: "1/-1" }}><small style={{ color: "var(--texto-suave)" }}>⚠️ Cambio: {p.motivoCambio}</small>{p.cargoCambio && <p>Cargo: ₡{parseInt(p.cargoCambio).toLocaleString()}</p>}</div>}
                                                </div>

                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                    {p.estado !== "en proceso" && p.estado !== "entregado" && (
                                                        <button className="btn-secundario" type="button"
                                                            onClick={(e) => { e.stopPropagation(); cambiarEstado(p.id, "en proceso") }}>
                                                            ⚙️ En proceso
                                                        </button>
                                                    )}
                                                    {p.estado !== "entregado" && (
                                                        <button className="btn-secundario" type="button"
                                                            onClick={(e) => { e.stopPropagation(); cambiarEstado(p.id, "entregado") }}
                                                            style={{ borderColor: "#10b981", color: "#10b981" }}>
                                                            ✅ Marcar entregado
                                                        </button>
                                                    )}
                                                    {p.estado === "entregado" && (
                                                        <button className="btn-secundario" type="button"
                                                            onClick={(e) => { e.stopPropagation(); cambiarEstado(p.id, "pendiente") }}>
                                                            ↩️ Revertir
                                                        </button>
                                                    )}
                                                    <button className="btn-secundario" type="button"
                                                        onClick={(e) => { e.stopPropagation(); editarPedido(p) }}
                                                        style={{ borderColor: "#6366f1", color: "#6366f1" }}>
                                                        ✏️ Editar
                                                    </button>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); eliminar(p.id) }}
                                                        style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            )}

            {(db.pedidos || []).length === 0 && (
                <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                    <p style={{ fontSize: 40 }}>🛒</p>
                    <p>Aún no tienes pedidos registrados.</p>
                </div>
            )}
        </div>
    )
}