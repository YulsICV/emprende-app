import { useState } from "react"

export default function Pedidos({ db, actualizarDb }) {
    const [form, setForm] = useState({
        cliente: "",
        clienteNuevo: "",
        telefonoNuevo: "",
        recetaId: "",
        cantidad: "",
        fechaEntrega: "",
        anticipo: "",
        estado: "pendiente",
        tematica: "",
        costoTematica: "",
        colores: "",
        envio: "",
        especificaciones: "",
        cargoCambio: "",
        motivoCambio: "",
        camposExtra: {
            tematica: false,
            colores: false,
            envio: false,
            especificaciones: false,
            cambioUltimaMomento: false
        }
    })

    const recetaSeleccionada = db.recetas.find(r => r.id === form.recetaId)
    const nombreCliente = form.cliente || form.clienteNuevo
    const total = recetaSeleccionada
        ? recetaSeleccionada.precioMenudeo * (parseInt(form.cantidad) || 0)
            + parseFloat(form.envio || 0)
            + parseFloat(form.costoTematica || 0)
            + parseFloat(form.cargoCambio || 0)
        : 0
    const saldoPendiente = total - parseFloat(form.anticipo || 0)

    const guardar = () => {
        if (!nombreCliente || !form.recetaId || !form.cantidad || !form.fechaEntrega) return

        const nuevoPedido = {
            ...form,
            cliente: nombreCliente,
            telefono: form.telefonoNuevo || db.clientes.find(c => c.nombre === form.cliente)?.telefono || "",
            id: crypto.randomUUID(),
            total,
            saldoPendiente,
            recetaNombre: recetaSeleccionada.nombre,
            fecha: new Date().toISOString()
        }

        actualizarDb("pedidos", [...db.pedidos, nuevoPedido])
        setForm({
            cliente: "", clienteNuevo: "", telefonoNuevo: "", recetaId: "", cantidad: "",
            fechaEntrega: "", anticipo: "", estado: "pendiente", tematica: "", costoTematica: "",
            colores: "", envio: "", especificaciones: "", cargoCambio: "", motivoCambio: "",
            camposExtra: { tematica: false, colores: false, envio: false, especificaciones: false, cambioUltimaMomento: false }
        })
    }

    const cambiarEstado = (id, nuevoEstado) => {
        actualizarDb("pedidos", db.pedidos.map(p =>
            p.id === id ? { ...p, estado: nuevoEstado } : p
        ))
    }

    const eliminar = (id) => {
        actualizarDb("pedidos", db.pedidos.filter(p => p.id !== id))
    }

    return (
        <div>
            <h2>📋 Pedidos</h2>

            <div>
                <label>Cliente</label>
                <select
                    value={form.cliente}
                    onChange={(e) => setForm({ ...form, cliente: e.target.value, clienteNuevo: "", telefonoNuevo: "" })}
                >
                    <option value="">Seleccionar cliente registrado...</option>
                    {db.clientes.map(c => (
                        <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                </select>

                {!form.cliente && (
                    <div>
                        <label>Nombre de nuevo cliente</label>
                        <input
                            type="text"
                            value={form.clienteNuevo}
                            onChange={(e) => setForm({ ...form, clienteNuevo: e.target.value })}
                            placeholder="O escribí el nombre del cliente aquí"
                        />
                        <label>Teléfono</label>
                        <input
                            type="text"
                            value={form.telefonoNuevo}
                            onChange={(e) => setForm({ ...form, telefonoNuevo: e.target.value })}
                            placeholder="Teléfono (opcional)"
                        />
                    </div>
                )}
            </div>

            <div>
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

            <div>
                <label>Cantidad</label>
                <input
                    type="number"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    placeholder="Ej: 50"
                />
            </div>

            <div>
                <label>Fecha de entrega</label>
                <input
                    type="date"
                    value={form.fechaEntrega}
                    onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                />
            </div>

            <div>
                <label>Anticipo (₡)</label>
                <input
                    type="number"
                    value={form.anticipo}
                    onChange={(e) => setForm({ ...form, anticipo: e.target.value })}
                    placeholder="0"
                />
            </div>

            <div>
                <p>¿Campos extra para este pedido?</p>
                {["tematica", "colores", "envio", "especificaciones", "cambioUltimaMomento"].map(campo => (
                    <label key={campo}>
                        <input
                            type="checkbox"
                            checked={form.camposExtra[campo]}
                            onChange={(e) => setForm({
                                ...form,
                                camposExtra: { ...form.camposExtra, [campo]: e.target.checked }
                            })}
                        />
                        {campo === "cambioUltimaMomento" ? "Cambio último momento" : campo.charAt(0).toUpperCase() + campo.slice(1)}
                    </label>
                ))}
            </div>

            {form.camposExtra.tematica && (
                <div>
                    <label>Temática</label>
                    <input
                        type="text"
                        value={form.tematica}
                        onChange={(e) => setForm({ ...form, tematica: e.target.value })}
                        placeholder="Ej: Frozen, San Valentín..."
                    />
                    <label>Costo extra por temática (₡)</label>
                    <input
                        type="number"
                        value={form.costoTematica}
                        onChange={(e) => setForm({ ...form, costoTematica: e.target.value })}
                        placeholder="0"
                    />
                </div>
            )}

            {form.camposExtra.colores && (
                <div>
                    <label>Colores</label>
                    <input
                        type="text"
                        value={form.colores}
                        onChange={(e) => setForm({ ...form, colores: e.target.value })}
                        placeholder="Ej: rosa, blanco, dorado..."
                    />
                </div>
            )}

            {form.camposExtra.envio && (
                <div>
                    <label>Costo de envío (₡)</label>
                    <input
                        type="number"
                        value={form.envio}
                        onChange={(e) => setForm({ ...form, envio: e.target.value })}
                        placeholder="0"
                    />
                </div>
            )}

            {form.camposExtra.especificaciones && (
                <div>
                    <label>Especificaciones</label>
                    <input
                        type="text"
                        value={form.especificaciones}
                        onChange={(e) => setForm({ ...form, especificaciones: e.target.value })}
                        placeholder="Detalles especiales del pedido..."
                    />
                </div>
            )}

            {form.camposExtra.cambioUltimaMomento && (
                <div>
                    <label>Cargo por cambio (₡)</label>
                    <input
                        type="number"
                        value={form.cargoCambio}
                        onChange={(e) => setForm({ ...form, cargoCambio: e.target.value })}
                        placeholder="0"
                    />
                    <label>Motivo del cambio</label>
                    <input
                        type="text"
                        value={form.motivoCambio}
                        onChange={(e) => setForm({ ...form, motivoCambio: e.target.value })}
                        placeholder="Ej: cambió colores, agregó más unidades..."
                    />
                </div>
            )}

            {recetaSeleccionada && form.cantidad > 0 && (
                <div>
                    <p>Total: ₡{total.toFixed(0)}</p>
                    <p>Anticipo: ₡{parseFloat(form.anticipo || 0).toFixed(0)}</p>
                    <p>Saldo pendiente: ₡{saldoPendiente.toFixed(0)}</p>
                </div>
            )}

            <button type="button" onClick={guardar}>💾 Guardar pedido</button>

            {db.pedidos.length > 0 && (
                <div>
                    <h3>Mis pedidos</h3>
                    {["pendiente", "en proceso", "entregado"].map(estado => {
                        const pedidosEstado = db.pedidos.filter(p => p.estado === estado)
                        if (pedidosEstado.length === 0) return null
                        return (
                            <div key={estado}>
                                <h4>{estado.toUpperCase()}</h4>
                                {pedidosEstado.map(p => (
                                    <div key={p.id}>
                                        <p><strong>{p.cliente}</strong> {p.telefono ? `· 📞 ${p.telefono}` : ""}</p>
                                        <p>🍩 {p.recetaNombre} · {p.cantidad} unidades</p>
                                        <p>📅 Entrega: {new Date(p.fechaEntrega).toLocaleDateString("es-CR")}</p>
                                        <p>💰 Total: ₡{p.total.toFixed(0)} · Saldo: ₡{p.saldoPendiente.toFixed(0)}</p>
                                        {p.tematica && <p>🎨 Temática: {p.tematica} {p.costoTematica ? `· ₡${p.costoTematica}` : ""}</p>}
                                        {p.colores && <p>🎨 Colores: {p.colores}</p>}
                                        {p.especificaciones && <p>📝 {p.especificaciones}</p>}
                                        {p.motivoCambio && <p>⚠️ Cambio: {p.motivoCambio} {p.cargoCambio ? `· ₡${p.cargoCambio}` : ""}</p>}
                                        <select
                                            value={p.estado}
                                            onChange={(e) => cambiarEstado(p.id, e.target.value)}
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="en proceso">En proceso</option>
                                            <option value="entregado">Entregado</option>
                                        </select>
                                        <button type="button" onClick={() => eliminar(p.id)}>🗑</button>
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