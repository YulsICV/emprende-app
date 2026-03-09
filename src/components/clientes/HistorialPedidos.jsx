// src/components/clientes/HistorialPedidos.jsx
export default function HistorialPedidos({ pedidos }) {
    if (pedidos.length === 0) return null

    const badgeEstado = (estado) => {
        if (estado === "pendiente") return "badge badge-pendiente"
        if (estado === "en proceso") return "badge badge-proceso"
        return "badge badge-entregado"
    }

    return (
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
    )
}