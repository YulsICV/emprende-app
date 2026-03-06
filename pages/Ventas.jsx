import { useState } from "react"

export default function Ventas({ db, actualizarDb }) {
    const [form, setForm] = useState({
        recetaId: "",
        cantidad: "",
        tipo: "menudeo",
        cliente: "",
        nota: ""
    })

    const recetaSeleccionada = db.recetas.find(r => r.id === form.recetaId)
    const precio = recetaSeleccionada
        ? (form.tipo === "mayoreo" ? recetaSeleccionada.precioMayoreo : recetaSeleccionada.precioMenudeo)
        : 0
    const total = precio * (parseInt(form.cantidad) || 0)
    const ganancia = recetaSeleccionada
        ? (precio - recetaSeleccionada.costoPorUnidad) * (parseInt(form.cantidad) || 0)
        : 0

    const descontarInventario = (receta, cantidadVendida) => {
        const proporcion = cantidadVendida / receta.unidades

        const inventarioActualizado = db.inventario.map(item => {
            const ingrediente = receta.ingredientes.find(ing =>
                ing.nombre.toLowerCase() === item.nombre.toLowerCase()
            )
            if (!ingrediente) return item

            const cantidadUsada = parseFloat(ingrediente.cantidadUso) * proporcion
            const nuevaCantidad = parseFloat(item.cantidad) - cantidadUsada

            return { ...item, cantidad: nuevaCantidad < 0 ? 0 : parseFloat(nuevaCantidad.toFixed(2)) }
        })

        actualizarDb("inventario", inventarioActualizado)
    }

    const guardar = () => {
        if (!form.recetaId || !form.cantidad) return

        const nuevaVenta = {
            ...form,
            id: crypto.randomUUID(),
            precio,
            total,
            ganancia,
            recetaNombre: recetaSeleccionada.nombre,
            fecha: new Date().toISOString()
        }

        actualizarDb("ventas", [...db.ventas, nuevaVenta])
        descontarInventario(recetaSeleccionada, parseInt(form.cantidad))
        setForm({ recetaId: "", cantidad: "", tipo: "menudeo", cliente: "", nota: "" })
    }

    const eliminar = (id) => {
        actualizarDb("ventas", db.ventas.filter(v => v.id !== id))
    }

    return (
        <div>
            <h2 className="page-titulo">💰 Ventas</h2>

            <div className="card">
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
                        <label>Tipo de venta</label>
                        <select
                            value={form.tipo}
                            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                        >
                            <option value="menudeo">Menudeo</option>
                            <option value="mayoreo">Mayoreo</option>
                        </select>
                    </div>
                    <div className="form-grupo">
                        <label>Cantidad</label>
                        <input
                            type="number"
                            value={form.cantidad}
                            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                            placeholder="Ej: 10"
                        />
                    </div>
                    <div className="form-grupo">
                        <label>Cliente (opcional)</label>
                        <select
                            value={form.cliente}
                            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                        >
                            <option value="">Sin cliente</option>
                            {db.clientes.map(c => (
                                <option key={c.id} value={c.nombre}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-grupo">
                        <label>Nota (opcional)</label>
                        <input
                            type="text"
                            value={form.nota}
                            onChange={(e) => setForm({ ...form, nota: e.target.value })}
                            placeholder="Ej: Pedido especial..."
                        />
                    </div>
                </div>

                {recetaSeleccionada && form.cantidad > 0 && (
                    <div className="resumen-grid">
                        <div className="resumen-item">
                            <div className="valor">₡{precio}</div>
                            <div className="etiqueta">Precio por unidad</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{total}</div>
                            <div className="etiqueta">Total venta</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{ganancia.toFixed(0)}</div>
                            <div className="etiqueta">Ganancia</div>
                        </div>
                    </div>
                )}

                <button className="btn-primario" type="button" onClick={guardar}>
                    💾 Registrar venta
                </button>
            </div>

            {db.ventas.length > 0 && (
                <div className="card">
                    <h3 className="seccion-titulo">Historial de ventas</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Receta</th>
                                <th>Cantidad</th>
                                <th>Tipo</th>
                                <th>Total</th>
                                <th>Ganancia</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...db.ventas].reverse().map(v => (
                                <tr key={v.id}>
                                    <td>{v.recetaNombre}</td>
                                    <td>{v.cantidad}</td>
                                    <td>{v.tipo}</td>
                                    <td>₡{v.total}</td>
                                    <td>₡{parseFloat(v.ganancia).toFixed(0)}</td>
                                    <td>{v.cliente || "-"}</td>
                                    <td>{new Date(v.fecha).toLocaleDateString("es-CR")}</td>
                                    <td>
                                        <button className="btn-peligro" type="button" onClick={() => eliminar(v.id)}>🗑</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}