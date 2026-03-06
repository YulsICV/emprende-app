import { useState } from "react"

export default function Pedidos({ db, actualizarDb }) {
    const [esNuevoCliente, setEsNuevoCliente] = useState(false)
    const [alertaCliente, setAlertaCliente] = useState("")

    const [form, setForm] = useState({
        fechaEntrega: "",
        cliente: "",
        clienteNuevo: "",
        telefonoNuevo: "",
        correoNuevo: "",
        recetaId: "",
        cantidad: "",
        anticipo: "",
        estado: "pendiente",
        metodoPago: "SINPE",
        notasInternas: "",
        tematica: "",
        costoTematica: "",
        colores: "",
        envio: "",
        costoEmpaque: "",
        especificaciones: "",
        cargoCambio: "",
        motivoCambio: "",
        camposExtra: {
            tematica: false,
            colores: false,
            envio: false,
            empaque: false,
            especificaciones: false,
            cambioUltimaMomento: false
        }
    })

    const recetaSeleccionada = db.recetas.find(r => r.id === form.recetaId)
    const nombreCliente = esNuevoCliente ? form.clienteNuevo : form.cliente
    const total = recetaSeleccionada
        ? recetaSeleccionada.precioMenudeo * (parseInt(form.cantidad) || 0)
            + parseFloat(form.envio || 0)
            + parseFloat(form.costoTematica || 0)
            + parseFloat(form.costoEmpaque || 0)
            + parseFloat(form.cargoCambio || 0)
        : 0
    const saldoPendiente = total - parseFloat(form.anticipo || 0)

    const verificarClienteExistente = (nombre) => {
        const existe = db.clientes.find(c =>
            c.nombre.toLowerCase().includes(nombre.toLowerCase()) && nombre.length > 2
        )
        if (existe) {
            setAlertaCliente(`⚠️ Ya existe un cliente llamado "${existe.nombre}". ¿Es el mismo?`)
        } else {
            setAlertaCliente("")
        }
    }

    const usarClienteExistente = () => {
        const existe = db.clientes.find(c =>
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

        const nuevoPedido = {
            ...form,
            cliente: nombreCliente,
            telefono: esNuevoCliente
                ? form.telefonoNuevo
                : db.clientes.find(c => c.nombre === form.cliente)?.telefono || "",
            correo: esNuevoCliente
                ? form.correoNuevo
                : db.clientes.find(c => c.nombre === form.cliente)?.correo || "",
            id: crypto.randomUUID(),
            total,
            saldoPendiente,
            recetaNombre: recetaSeleccionada.nombre,
            fecha: new Date().toISOString()
        }

        actualizarDb("pedidos", [...db.pedidos, nuevoPedido])
        setForm({
            fechaEntrega: "", cliente: "", clienteNuevo: "", telefonoNuevo: "", correoNuevo: "",
            recetaId: "", cantidad: "", anticipo: "", estado: "pendiente", metodoPago: "SINPE",
            notasInternas: "", tematica: "", costoTematica: "", colores: "", envio: "",
            costoEmpaque: "", especificaciones: "", cargoCambio: "", motivoCambio: "",
            camposExtra: { tematica: false, colores: false, envio: false, empaque: false, especificaciones: false, cambioUltimaMomento: false }
        })
        setEsNuevoCliente(false)
        setAlertaCliente("")
    }

    const cambiarEstado = (id, nuevoEstado) => {
        actualizarDb("pedidos", db.pedidos.map(p =>
            p.id === id ? { ...p, estado: nuevoEstado } : p
        ))
    }

    const eliminar = (id) => {
        actualizarDb("pedidos", db.pedidos.filter(p => p.id !== id))
    }

    const badgeEstado = (estado) => {
        if (estado === "pendiente") return "badge badge-pendiente"
        if (estado === "en proceso") return "badge badge-proceso"
        return "badge badge-entregado"
    }

    return (
        <div>
            <h2 className="page-titulo">📋 Pedidos</h2>

            <div className="card">

                <div className="form-fila">
                    <div className="form-grupo">
                        <label>📅 Fecha de entrega</label>
                        <input
                            type="date"
                            value={form.fechaEntrega}
                            onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                        />
                    </div>
                    <div className="form-grupo">
                        <label>Método de pago</label>
                        <select
                            value={form.metodoPago}
                            onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
                        >
                            <option value="SINPE">SINPE</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>
                </div>

                <div className="form-grupo">
                    <p style={{ fontWeight: 500, marginBottom: 8 }}>Cliente</p>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <button
                            type="button"
                            className={!esNuevoCliente ? "btn-primario" : "btn-secundario"}
                            style={{ width: "auto", padding: "8px 16px" }}
                            onClick={() => { setEsNuevoCliente(false); setAlertaCliente("") }}
                        >
                            Cliente existente
                        </button>
                        <button
                            type="button"
                            className={esNuevoCliente ? "btn-primario" : "btn-secundario"}
                            style={{ width: "auto", padding: "8px 16px" }}
                            onClick={() => { setEsNuevoCliente(true); setAlertaCliente("") }}
                        >
                            + Nuevo cliente
                        </button>
                    </div>

                    {!esNuevoCliente ? (
                        <select
                            value={form.cliente}
                            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                        >
                            <option value="">Seleccionar cliente...</option>
                            {db.clientes.map(c => (
                                <option key={c.id} value={c.nombre}>{c.nombre}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="form-fila">
                            <div className="form-grupo">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={form.clienteNuevo}
                                    onChange={(e) => {
                                        setForm({ ...form, clienteNuevo: e.target.value })
                                        verificarClienteExistente(e.target.value)
                                    }}
                                    placeholder="Nombre del cliente"
                                />
                            </div>
                            <div className="form-grupo">
                                <label>Teléfono * (obligatorio)</label>
                                <input
                                    type="text"
                                    value={form.telefonoNuevo}
                                    onChange={(e) => setForm({ ...form, telefonoNuevo: e.target.value })}
                                    placeholder="8888-8888"
                                />
                            </div>
                            <div className="form-grupo">
                                <label>Correo (opcional)</label>
                                <input
                                    type="email"
                                    value={form.correoNuevo}
                                    onChange={(e) => setForm({ ...form, correoNuevo: e.target.value })}
                                    placeholder="cliente@correo.com"
                                />
                            </div>
                        </div>
                    )}

                    {alertaCliente && (
                        <div className="alerta" style={{ marginTop: 8 }}>
                            {alertaCliente}
                            <button
                                type="button"
                                className="btn-secundario"
                                style={{ marginLeft: 12, padding: "4px 10px" }}
                                onClick={usarClienteExistente}
                            >
                                Sí, usar ese cliente
                            </button>
                        </div>
                    )}
                </div>

                <div className="form-fila">
                    <div className="form-grupo">
                        <label>Receta</label>
                        <select
                            value={form.recetaId}
                            onChange={(e) => setForm({ ...form, recetaId: e.target.value })}
                        >
                            <option value="">Seleccionar receta...</option>
                            {db.recetas.map(r => (
                                <option key={r.id} value={r.id}>{r.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-grupo">
                        <label>Cantidad</label>
                        <input
                            type="number"
                            value={form.cantidad}
                            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                            placeholder="Ej: 50"
                        />
                    </div>
                    <div className="form-grupo">
                        <label>Anticipo (₡)</label>
                        <input
                            type="number"
                            value={form.anticipo}
                            onChange={(e) => setForm({ ...form, anticipo: e.target.value })}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="form-grupo">
                    <p style={{ fontWeight: 500, marginBottom: 8 }}>¿Campos extra?</p>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {["tematica", "colores", "envio", "empaque", "especificaciones", "cambioUltimaMomento"].map(campo => (
                            <label key={campo} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    style={{ width: "auto" }}
                                    checked={form.camposExtra[campo]}
                                    onChange={(e) => setForm({
                                        ...form,
                                        camposExtra: { ...form.camposExtra, [campo]: e.target.checked }
                                    })}
                                />
                                {campo === "cambioUltimaMomento" ? "Cambio último momento"
                                    : campo === "empaque" ? "Empaque/Envoltorio"
                                    : campo.charAt(0).toUpperCase() + campo.slice(1)}
                            </label>
                        ))}
                    </div>
                </div>

                {(form.camposExtra.tematica || form.camposExtra.colores || form.camposExtra.envio || form.camposExtra.empaque || form.camposExtra.especificaciones || form.camposExtra.cambioUltimaMomento) && (
                    <div className="form-fila">
                        {form.camposExtra.tematica && (
                            <>
                                <div className="form-grupo">
                                    <label>Temática</label>
                                    <input type="text" value={form.tematica}
                                        onChange={(e) => setForm({ ...form, tematica: e.target.value })}
                                        placeholder="Ej: Frozen, San Valentín..." />
                                </div>
                                <div className="form-grupo">
                                    <label>Costo extra temática (₡)</label>
                                    <input type="number" value={form.costoTematica}
                                        onChange={(e) => setForm({ ...form, costoTematica: e.target.value })}
                                        placeholder="0" />
                                </div>
                            </>
                        )}
                        {form.camposExtra.colores && (
                            <div className="form-grupo">
                                <label>Colores</label>
                                <input type="text" value={form.colores}
                                    onChange={(e) => setForm({ ...form, colores: e.target.value })}
                                    placeholder="Ej: rosa, blanco, dorado..." />
                            </div>
                        )}
                        {form.camposExtra.envio && (
                            <div className="form-grupo">
                                <label>Costo de envío (₡)</label>
                                <input type="number" value={form.envio}
                                    onChange={(e) => setForm({ ...form, envio: e.target.value })}
                                    placeholder="0" />
                            </div>
                        )}
                        {form.camposExtra.empaque && (
                            <div className="form-grupo">
                                <label>Costo empaque/envoltorio (₡)</label>
                                <input type="number" value={form.costoEmpaque}
                                    onChange={(e) => setForm({ ...form, costoEmpaque: e.target.value })}
                                    placeholder="0" />
                            </div>
                        )}
                        {form.camposExtra.especificaciones && (
                            <div className="form-grupo">
                                <label>Especificaciones</label>
                                <input type="text" value={form.especificaciones}
                                    onChange={(e) => setForm({ ...form, especificaciones: e.target.value })}
                                    placeholder="Detalles especiales..." />
                            </div>
                        )}
                        {form.camposExtra.cambioUltimaMomento && (
                            <>
                                <div className="form-grupo">
                                    <label>Cargo por cambio (₡)</label>
                                    <input type="number" value={form.cargoCambio}
                                        onChange={(e) => setForm({ ...form, cargoCambio: e.target.value })}
                                        placeholder="0" />
                                </div>
                                <div className="form-grupo">
                                    <label>Motivo del cambio</label>
                                    <input type="text" value={form.motivoCambio}
                                        onChange={(e) => setForm({ ...form, motivoCambio: e.target.value })}
                                        placeholder="Ej: cambió colores..." />
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="form-grupo">
                    <label>🔒 Notas internas (el cliente no ve esto)</label>
                    <input
                        type="text"
                        value={form.notasInternas}
                        onChange={(e) => setForm({ ...form, notasInternas: e.target.value })}
                        placeholder="Ej: cliente es detallista, revisar bien decoración..."
                    />
                </div>

                {recetaSeleccionada && form.cantidad > 0 && (
                    <div className="resumen-grid">
                        <div className="resumen-item">
                            <div className="valor">₡{total.toFixed(0)}</div>
                            <div className="etiqueta">Total</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{parseFloat(form.anticipo || 0).toFixed(0)}</div>
                            <div className="etiqueta">Anticipo</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{saldoPendiente.toFixed(0)}</div>
                            <div className="etiqueta">Saldo pendiente</div>
                        </div>
                    </div>
                )}

                <button className="btn-primario" type="button" onClick={guardar}>
                    💾 Guardar pedido
                </button>
            </div>

            {db.pedidos.length > 0 && (
                <div>
                    <h3 className="seccion-titulo">Mis pedidos</h3>
                    {["pendiente", "en proceso", "entregado"].map(estado => {
                        const pedidosEstado = db.pedidos.filter(p => p.estado === estado)
                        if (pedidosEstado.length === 0) return null
                        return (
                            <div key={estado}>
                                <h4 style={{ margin: "16px 0 8px", color: "var(--texto-suave)" }}>
                                    {estado.toUpperCase()}
                                </h4>
                                {pedidosEstado.map(p => (
                                    <div className="card" key={p.id}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <p><strong>{p.cliente}</strong> {p.telefono ? `· 📞 ${p.telefono}` : ""} {p.correo ? `· ✉️ ${p.correo}` : ""}</p>
                                                <p>🍩 {p.recetaNombre} · {p.cantidad} unidades</p>
                                                <p>📅 Entrega: {new Date(p.fechaEntrega).toLocaleDateString("es-CR")} · 💳 {p.metodoPago}</p>
                                            </div>
                                            <span className={badgeEstado(p.estado)}>{p.estado}</span>
                                        </div>
                                        <div className="resumen-grid" style={{ marginTop: 12 }}>
                                            <div className="resumen-item">
                                                <div className="valor">₡{p.total.toFixed(0)}</div>
                                                <div className="etiqueta">Total</div>
                                            </div>
                                            <div className="resumen-item">
                                                <div className="valor">₡{p.saldoPendiente.toFixed(0)}</div>
                                                <div className="etiqueta">Saldo</div>
                                            </div>
                                        </div>
                                        {p.tematica && <p style={{ marginTop: 8 }}>🎨 {p.tematica} {p.costoTematica ? `· ₡${p.costoTematica}` : ""}</p>}
                                        {p.colores && <p>🎨 Colores: {p.colores}</p>}
                                        {p.costoEmpaque && <p>📦 Empaque: ₡{p.costoEmpaque}</p>}
                                        {p.especificaciones && <p>📝 {p.especificaciones}</p>}
                                        {p.motivoCambio && <p>⚠️ {p.motivoCambio} {p.cargoCambio ? `· ₡${p.cargoCambio}` : ""}</p>}
                                        {p.notasInternas && <p style={{ color: "var(--texto-suave)", fontStyle: "italic" }}>🔒 {p.notasInternas}</p>}
                                        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                                            <select
                                                value={p.estado}
                                                onChange={(e) => cambiarEstado(p.id, e.target.value)}
                                                style={{ width: "auto" }}
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="en proceso">En proceso</option>
                                                <option value="entregado">Entregado</option>
                                            </select>
                                            <button className="btn-peligro" type="button" onClick={() => eliminar(p.id)}>🗑</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}