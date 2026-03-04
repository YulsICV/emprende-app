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
        setForm({ recetaId: "", cantidad: "", tipo: "menudeo", cliente: "", nota: "" })
    }

    const eliminar = (id) => {
        actualizarDb("ventas", db.ventas.filter(v => v.id !== id))
    }

    return (
        <div>
            <h2>💰 Ventas</h2>

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
                <label>Tipo de venta</label>
                <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                    <option value="menudeo">Menudeo</option>
                    <option value="mayoreo">Mayoreo</option>
                </select>
            </div>

            <div>
                <label>Cantidad de unidades</label>
                <input
                    type="number"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    placeholder="Ej: 10"
                />
            </div>

            <div>
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

            <div>
                <label>Nota (opcional)</label>
                <input
                    type="text"
                    value={form.nota}
                    onChange={(e) => setForm({ ...form, nota: e.target.value })}
                    placeholder="Ej: Pedido especial..."
                />
            </div>

            {recetaSeleccionada && form.cantidad > 0 && (
                <div>
                    <p>Precio por unidad: ₡{precio}</p>
                    <p>Total venta: ₡{total}</p>
                    <p>Ganancia: ₡{ganancia.toFixed(0)}</p>
                </div>
            )}

            <button type="button" onClick={guardar}>💾 Registrar venta</button>

            {db.ventas.length > 0 && (
                <div>
                    <h3>Historial de ventas</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Receta</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                                <th>Ganancia</th>
                                <th>Fecha</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...db.ventas].reverse().map(v => (
                                <tr key={v.id}>
                                    <td>{v.recetaNombre}</td>
                                    <td>{v.cantidad}</td>
                                    <td>₡{v.total}</td>
                                    <td>₡{parseFloat(v.ganancia).toFixed(0)}</td>
                                    <td>{new Date(v.fecha).toLocaleDateString("es-CR")}</td>
                                    <td>
                                        <button type="button" onClick={() => eliminar(v.id)}>🗑</button>
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

