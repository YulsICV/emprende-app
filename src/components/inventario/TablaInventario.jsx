import { parsearNumero } from "../../utils/parsearNumero"

const CATEGORIAS = [
    { tipo: "ingrediente", label: "🧁 Ingredientes",        color: "#6366f1" },
    { tipo: "insumo",      label: "📦 Insumos de empaque",  color: "#10b981" },
]

export default function TablaInventario({ inventario, itemsFiltrados, bajoStock, busqueda, setBusqueda, onEditar, onEliminar }) {
    if (inventario.length === 0) {
        return (
            <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                <p style={{ fontSize: 40 }}>📦</p>
                <p>Tu inventario está vacío.</p>
                <p style={{ fontSize: 13 }}>Agrega ingredientes e insumos arriba.</p>
            </div>
        )
    }

    return (
        <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 className="seccion-titulo" style={{ margin: 0 }}>
                    Mi inventario ({inventario.length})
                </h3>
                {bajoStock.length > 0 && (
                    <span style={{
                        background: "#fef3c7", color: "#d97706",
                        padding: "3px 10px", borderRadius: 20,
                        fontSize: 13, fontWeight: 600
                    }}>
                        ⚠️ {bajoStock.length} bajo stock
                    </span>
                )}
            </div>

            {inventario.length > 5 && (
                <div className="form-grupo">
                    <input
                        type="text"
                        placeholder="🔍 Buscar producto..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
            )}

            {CATEGORIAS.map(({ tipo, label, color }) => {
                const items = itemsFiltrados.filter(i => (i.tipo || "ingrediente") === tipo)
                if (items.length === 0) return null
                return (
                    <div key={tipo} style={{ marginBottom: 20 }}>
                        <p style={{
                            fontWeight: 700, fontSize: 12, letterSpacing: 0.5,
                            color, marginBottom: 8,
                            paddingBottom: 6, borderBottom: `2px solid ${color}22`
                        }}>
                            {label} ({items.length})
                        </p>
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Paquetes</th>
                                        <th>Disponible</th>
                                        <th>Costo unitario</th>
                                        <th>Costo total</th>
                                        <th>Alerta</th>
                                        <th style={{ textAlign: "center" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(i => {
                                        const bajo = i.minimo && parsearNumero(i.cantidad) <= parsearNumero(i.minimo)
                                        return (
                                            <tr key={i.id} style={{ background: bajo ? "#fffbeb" : undefined }}>
                                                <td>
                                                    <strong>{i.nombre}</strong>
                                                    {bajo && (
                                                        <span style={{
                                                            marginLeft: 6, fontSize: 11,
                                                            color: "#d97706", background: "#fef3c7",
                                                            padding: "1px 6px", borderRadius: 10
                                                        }}>⚠️ bajo</span>
                                                    )}
                                                </td>
                                                <td style={{ color: "var(--texto-suave)" }}>
                                                    {i.cantidadPaquetes} × {i.tamañoPaquete}{i.unidad}
                                                </td>
                                                <td>
                                                    <strong style={{ color: bajo ? "#d97706" : color }}>
                                                        {parsearNumero(i.cantidad).toLocaleString("es-CR")}{i.unidad}
                                                    </strong>
                                                </td>
                                                <td style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                                    {i.costoTotal && i.cantidad
                                                        ? `₡${(parsearNumero(i.costoTotal) / parsearNumero(i.cantidad)).toFixed(2)}/${i.unidad}`
                                                        : "—"}
                                                </td>
                                                <td>
                                                    {i.costoTotal ? `₡${parsearNumero(i.costoTotal).toLocaleString("es-CR")}` : "—"}
                                                </td>
                                                <td style={{ color: "var(--texto-suave)" }}>
                                                    {i.minimo ? `${i.minimo}${i.unidad}` : "—"}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                                                        <button className="btn-secundario" type="button"
                                                            onClick={() => onEditar(i)}
                                                            style={{ padding: "4px 10px", fontSize: 13 }}>✏️</button>
                                                        <button className="btn-peligro" type="button"
                                                            onClick={() => onEliminar({ id: i.id, nombre: i.nombre })}>🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })}

            {itemsFiltrados.length === 0 && busqueda && (
                <p style={{ color: "var(--texto-suave)", textAlign: "center", padding: 20 }}>
                    No se encontró "{busqueda}"
                </p>
            )}
        </div>
    )
}