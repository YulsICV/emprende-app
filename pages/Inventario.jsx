import { useState } from "react"

export default function Inventario({ db, actualizarDb }) {
    const [form, setForm] = useState({
        nombre: "",
        cantidadPaquetes: "",
        tamañoPaquete: "",
        unidad: "g",
        costoPorPaquete: "",
        minimo: ""
    })

    const totalInventario = (parseFloat(form.cantidadPaquetes) || 0) * (parseFloat(form.tamañoPaquete) || 0)
    const costoTotal = (parseFloat(form.cantidadPaquetes) || 0) * (parseFloat(form.costoPorPaquete) || 0)

    const guardar = () => {
        if (!form.nombre || !form.cantidadPaquetes || !form.tamañoPaquete) return

        const nuevoItem = {
            ...form,
            id: crypto.randomUUID(),
            cantidad: totalInventario,
            costoTotal,
            fecha: new Date().toISOString()
        }

        actualizarDb("inventario", [...db.inventario, nuevoItem])
        setForm({ nombre: "", cantidadPaquetes: "", tamañoPaquete: "", unidad: "g", costoPorPaquete: "", minimo: "" })
    }

    const eliminar = (id) => {
        actualizarDb("inventario", db.inventario.filter(i => i.id !== id))
    }

    const bajoStock = db.inventario.filter(i => i.minimo && parseFloat(i.cantidad) <= parseFloat(i.minimo))

    return (
        <div>
            <h2 className="page-titulo">📦 Inventario</h2>

            {bajoStock.length > 0 && (
                <div className="alerta">
                    <p>⚠️ Productos con stock bajo:</p>
                    {bajoStock.map(i => (
                        <p key={i.id}>• {i.nombre}: {i.cantidad}{i.unidad}</p>
                    ))}
                </div>
            )}

            <div className="card">
                <div className="form-fila">
                    <div className="form-grupo">
                        <label>Producto</label>
                        <input
                            type="text"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            placeholder="Ej: Harina"
                        />
                    </div>
                    <div className="form-grupo">
                        <label>¿Cuántos paquetes compraste?</label>
                        <input
                            type="number"
                            value={form.cantidadPaquetes}
                            onChange={(e) => setForm({ ...form, cantidadPaquetes: e.target.value })}
                            placeholder="Ej: 2"
                        />
                    </div>
                    <div className="form-grupo">
                        <label>¿Cuánto trae cada paquete?</label>
                        <input
                            type="number"
                            value={form.tamañoPaquete}
                            onChange={(e) => setForm({ ...form, tamañoPaquete: e.target.value })}
                            placeholder="Ej: 1000"
                        />
                    </div>
                    <div className="form-grupo">
                        <label>Unidad</label>
                        <select
                            value={form.unidad}
                            onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                        >
                            {["g", "kg", "ml", "L", "unidad", "paquete"].map(u => <option key={u}>{u}</option>)}
                        </select>
                    </div>
                    <div className="form-grupo">
                        <label>Costo por paquete (₡)</label>
                        <input
                            type="number"
                            value={form.costoPorPaquete}
                            onChange={(e) => setForm({ ...form, costoPorPaquete: e.target.value })}
                            placeholder="Ej: 2000"
                        />
                    </div>
                    <div className="form-grupo">
                        <label>Mínimo para alerta</label>
                        <input
                            type="number"
                            value={form.minimo}
                            onChange={(e) => setForm({ ...form, minimo: e.target.value })}
                            placeholder="Ej: 200"
                        />
                    </div>
                </div>

                {form.cantidadPaquetes > 0 && form.tamañoPaquete > 0 && (
                    <div className="resumen-grid">
                        <div className="resumen-item">
                            <div className="valor">{totalInventario}{form.unidad}</div>
                            <div className="etiqueta">Total en inventario</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{costoTotal.toFixed(0)}</div>
                            <div className="etiqueta">Costo total</div>
                        </div>
                    </div>
                )}

                <button className="btn-primario" type="button" onClick={guardar}>
                    + Agregar al inventario
                </button>
            </div>

            {db.inventario.length > 0 && (
                <div className="card">
                    <h3 className="seccion-titulo">Mi inventario</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Paquetes</th>
                                <th>Total</th>
                                <th>Costo total</th>
                                <th>Alerta</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {db.inventario.map(i => (
                                <tr key={i.id}>
                                    <td>{i.nombre}</td>
                                    <td>{i.cantidadPaquetes} x {i.tamañoPaquete}{i.unidad}</td>
                                    <td>{i.cantidad}{i.unidad}</td>
                                    <td>{i.costoTotal ? `₡${i.costoTotal}` : "-"}</td>
                                    <td>{i.minimo ? i.minimo : "-"}</td>
                                    <td>
                                        <button className="btn-peligro" type="button" onClick={() => eliminar(i.id)}>🗑</button>
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