import { useState } from "react"

export default function Inventario({ db, actualizarDb }) {
    const [form, setForm] = useState({
        nombre: "",
        cantidad: "",
        unidad: "g",
        costo: "",
        minimo: ""
    })

    const guardar = () => {
        if (!form.nombre || !form.cantidad) return

        const nuevoItem = {
            ...form,
            id: crypto.randomUUID(),
            fecha: new Date().toISOString()
        }

        actualizarDb("inventario", [...db.inventario, nuevoItem])
        setForm({ nombre: "", cantidad: "", unidad: "g", costo: "", minimo: "" })
    }

    const eliminar = (id) => {
        actualizarDb("inventario", db.inventario.filter(i => i.id !== id))
    }

    const bajoStock = db.inventario.filter(i => i.minimo && parseFloat(i.cantidad) <= parseFloat(i.minimo))

    return (
        <div>
            <h2>📦 Inventario</h2>

            {bajoStock.length > 0 && (
                <div>
                    <p>⚠️ Productos con stock bajo:</p>
                    {bajoStock.map(i => (
                        <p key={i.id}>• {i.nombre}: {i.cantidad}{i.unidad}</p>
                    ))}
                </div>
            )}

            <div>
                <label>Producto</label>
                <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Harina"
                />
            </div>
            <div>
                <label>Cantidad</label>
                <input
                    type="number"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    placeholder="1000"
                />
                <select
                    value={form.unidad}
                    onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                >
                    {["g", "kg", "ml", "L", "unidad", "paquete"].map(u => <option key={u}>{u}</option>)}
                </select>
            </div>
            <div>
                <label>Costo (₡)</label>
                <input
                    type="number"
                    value={form.costo}
                    onChange={(e) => setForm({ ...form, costo: e.target.value })}
                    placeholder="2000"
                />
            </div>
            <div>
                <label>Mínimo para alerta</label>
                <input
                    type="number"
                    value={form.minimo}
                    onChange={(e) => setForm({ ...form, minimo: e.target.value })}
                    placeholder="200"
                />
            </div>

            <button type="button" onClick={guardar}>+ Agregar al inventario</button>

            {db.inventario.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Costo</th>
                            <th>Alerta</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {db.inventario.map(i => (
                            <tr key={i.id}>
                                <td>{i.nombre}</td>
                                <td>{i.cantidad}{i.unidad}</td>
                                <td>{i.costo ? `₡${i.costo}` : "-"}</td>
                                <td>{i.minimo ? i.minimo : "-"}</td>
                                <td>
                                    <button type="button" onClick={() => eliminar(i.id)}>🗑</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}