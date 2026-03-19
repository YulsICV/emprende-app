import { useState } from "react"

const CAMPOS_EXTRA = [
    { key: "tematica", label: "🎨 Temática" },
    { key: "colores", label: "🌈 Colores" },
    { key: "empaque", label: "📦 Empaque especial" },
    { key: "especificaciones", label: "📝 Especificaciones" },
    { key: "cambioUltimaMomento", label: "⚠️ Cambio de último momento" }
]

export default function FormularioPedido({
    form, setForm, esNuevoCliente, setEsNuevoCliente,
    clientes, recetas, editandoId,
    total, saldoPendiente, recetaSeleccionada,
    onGuardar, onCancelar
}) {
    const [alertaCliente, setAlertaCliente] = useState("")

    const toggleExtra = (campo) =>
        setForm(f => ({ ...f, camposExtra: { ...f.camposExtra, [campo]: !f.camposExtra[campo] } }))

    const verificarClienteExistente = (nombre) => {
        const existe = clientes?.find(c =>
            c.nombre.toLowerCase().includes(nombre.toLowerCase()) && nombre.length > 2
        )
        setAlertaCliente(existe ? `Ya existe "${existe.nombre}". ¿Es el mismo?` : "")
    }

    const usarClienteExistente = () => {
        const existe = clientes?.find(c =>
            c.nombre.toLowerCase().includes(form.clienteNuevo.toLowerCase())
        )
        if (existe) {
            setEsNuevoCliente(false)
            setForm(f => ({ ...f, cliente: existe.nombre, clienteId: existe._id, clienteNuevo: "" }))
            setAlertaCliente("")
        }
    }

    const clienteSeleccionado = clientes?.find(c => c.nombre === form.cliente)

    return (
        <div className="card">
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>
                {editandoId ? "✏️ Editar pedido" : "Nuevo pedido"}
            </h3>

            <div className="form-grupo">
                <label>Fecha de entrega *</label>
                <input type="date" value={form.fechaEntrega}
                    onChange={e => setForm(f => ({ ...f, fechaEntrega: e.target.value }))} />
            </div>

            {/* ── CLIENTE ── */}
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
                            onChange={e => {
                                const cli = clientes.find(c => c.nombre === e.target.value)
                                setForm(f => ({ ...f, cliente: e.target.value, clienteId: cli?._id || "" }))
                            }}>
                            <option value="">— Seleccionar cliente —</option>
                            {clientes.map(c => (
                                <option key={c._id} value={c.nombre}>{c.nombre}</option>
                            ))}
                        </select>
                        {clienteSeleccionado?.alergias && (
                            <div style={{
                                marginTop: 8, padding: "8px 12px",
                                background: "#fef3c7", border: "1.5px solid #f59e0b",
                                borderRadius: 8, fontSize: 13
                            }}>
                                <strong>⚠️ Alergias:</strong>{" "}
                                {clienteSeleccionado.notasAlergias || "Tiene alergias registradas"}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <input type="text" placeholder="Nombre *" value={form.clienteNuevo}
                            onChange={e => {
                                setForm(f => ({ ...f, clienteNuevo: e.target.value }))
                                verificarClienteExistente(e.target.value)
                            }} />
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
                            onChange={e => setForm(f => ({ ...f, telefonoNuevo: e.target.value }))}
                            style={{ marginTop: 6 }} />
                        <input type="email" placeholder="Correo (opcional)" value={form.correoNuevo}
                            onChange={e => setForm(f => ({ ...f, correoNuevo: e.target.value }))}
                            style={{ marginTop: 6 }} />
                        <input type="text" placeholder="Dirección (opcional)" value={form.direcNuevo}
                            onChange={e => setForm(f => ({ ...f, direcNuevo: e.target.value }))}
                            style={{ marginTop: 6 }} />
                        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer", fontSize: 14 }}>
                            <input type="checkbox" style={{ width: "auto" }}
                                checked={form.alergiasNuevo || false}
                                onChange={e => setForm(f => ({ ...f, alergiasNuevo: e.target.checked }))} />
                            ⚠️ ¿Tiene alergias?
                        </label>
                        {form.alergiasNuevo && (
                            <input type="text" placeholder="Ej: nueces, gluten, lácteos..."
                                value={form.notasAlergiasNuevo || ""}
                                onChange={e => setForm(f => ({ ...f, notasAlergiasNuevo: e.target.value }))}
                                style={{ marginTop: 6 }} />
                        )}
                    </>
                )}
            </div>

            {/* ── RECETA ── */}
            <div className="form-grupo">
                <label>Receta *</label>
                <select value={form.recetaId} onChange={e => {
                    const receta = recetas.find(r => r._id === e.target.value)
                    setForm(f => ({
                        ...f,
                        recetaId: e.target.value,
                        tipoEnvio: receta?.envioGratis ? "gratis" : f.tipoEnvio,
                        envio: receta?.envioGratis ? "" : f.envio
                    }))
                }}>
                    <option value="">— Seleccionar receta —</option>
                    {recetas.map(r => (
                        <option key={r._id} value={r._id}>
                            {r.nombre} — ₡{r.precioMenudeo?.toLocaleString()}/u
                        </option>
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
                    onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
            </div>

            {editandoId && (
                <div className="form-grupo">
                    <label>Estado</label>
                    <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                        <option value="pendiente">🕐 Pendiente</option>
                        <option value="en proceso">⚙️ En proceso</option>
                        <option value="entregado">✅ Entregado</option>
                    </select>
                </div>
            )}

            {/* ── ENVÍO ── */}
            <div className="form-grupo">
                <label>Tipo de envío</label>
                <select value={form.tipoEnvio}
                    onChange={e => setForm(f => ({ ...f, tipoEnvio: e.target.value, envio: "" }))}>
                    <option value="gratis">🚚 Envío gratis</option>
                    <option value="conCosto">💰 Envío con costo</option>
                    <option value="recogido">🏃 Recogido por el cliente</option>
                </select>
            </div>
            {form.tipoEnvio === "conCosto" && (
                <div className="form-grupo">
                    <label>Costo de envío (₡)</label>
                    <input type="number" placeholder="0" value={form.envio}
                        onChange={e => setForm(f => ({ ...f, envio: e.target.value }))} />
                </div>
            )}

            {/* ── PAGO ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-grupo">
                    <label>Anticipo (₡)</label>
                    <input type="number" placeholder="0" value={form.anticipo}
                        onChange={e => setForm(f => ({ ...f, anticipo: e.target.value }))} />
                </div>
                <div className="form-grupo">
                    <label>Método de pago</label>
                    <select value={form.metodoPago} onChange={e => setForm(f => ({ ...f, metodoPago: e.target.value }))}>
                        <option value="SINPE">SINPE</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Tarjeta">Tarjeta</option>
                    </select>
                </div>
            </div>

            {/* ── EXTRAS ── */}
            <div className="form-grupo">
                <label>Agregar detalles opcionales</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {CAMPOS_EXTRA.map(({ key, label }) => (
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
                            onChange={e => setForm(f => ({ ...f, tematica: e.target.value }))} />
                    </div>
                    <div className="form-grupo">
                        <label>Costo temática (₡)</label>
                        <input type="number" placeholder="0" value={form.costoTematica}
                            onChange={e => setForm(f => ({ ...f, costoTematica: e.target.value }))} />
                    </div>
                </div>
            )}
            {form.camposExtra.colores && (
                <div className="form-grupo">
                    <label>Colores</label>
                    <input type="text" placeholder="ej. Rosa, dorado, blanco" value={form.colores}
                        onChange={e => setForm(f => ({ ...f, colores: e.target.value }))} />
                </div>
            )}
            {form.camposExtra.empaque && (
                <div className="form-grupo">
                    <label>Costo de empaque especial (₡)</label>
                    <input type="number" placeholder="0" value={form.costoEmpaque}
                        onChange={e => setForm(f => ({ ...f, costoEmpaque: e.target.value }))} />
                </div>
            )}
            {form.camposExtra.especificaciones && (
                <div className="form-grupo">
                    <label>Especificaciones / notas del cliente</label>
                    <textarea rows={2} placeholder="Detalles adicionales..." value={form.especificaciones}
                        onChange={e => setForm(f => ({ ...f, especificaciones: e.target.value }))}
                        style={{ resize: "vertical" }} />
                </div>
            )}
            {form.camposExtra.cambioUltimaMomento && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-grupo">
                        <label>Cargo por cambio (₡)</label>
                        <input type="number" placeholder="0" value={form.cargoCambio}
                            onChange={e => setForm(f => ({ ...f, cargoCambio: e.target.value }))} />
                    </div>
                    <div className="form-grupo">
                        <label>Motivo del cambio</label>
                        <input type="text" placeholder="Describe el cambio..." value={form.motivoCambio}
                            onChange={e => setForm(f => ({ ...f, motivoCambio: e.target.value }))} />
                    </div>
                </div>
            )}

            <div className="form-grupo">
                <label>Notas internas</label>
                <textarea rows={2} placeholder="Solo tú puedes ver esto..." value={form.notasInternas}
                    onChange={e => setForm(f => ({ ...f, notasInternas: e.target.value }))}
                    style={{ resize: "vertical" }} />
            </div>

            {/* ── RESUMEN ── */}
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
                <button className="btn-primario" type="button" onClick={onGuardar}>
                    {editandoId ? "✏️ Actualizar pedido" : "💾 Guardar pedido"}
                </button>
                {editandoId && (
                    <button className="btn-secundario" type="button" onClick={onCancelar}>
                        ✕ Cancelar
                    </button>
                )}
            </div>
        </div>
    )
}