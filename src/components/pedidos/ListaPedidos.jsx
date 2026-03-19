import { useState } from "react"
import TarjetaPedido from "./TarjetaPedido"

const ESTADOS = [
    { key: "pendiente", label: "🕐", color: "#f59e0b" },
    { key: "en proceso", label: "⚙️", color: "#3b82f6" },
    { key: "entregado", label: "✅", color: "#10b981" },
]

export default function ListaPedidos({ pedidos, onCambiarEstado, onEditar, onEliminar }) {
    const [expandido, setExpandido] = useState(null)

    if (pedidos.length === 0) {
        return (
            <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                <p style={{ fontSize: 40 }}>🛒</p>
                <p>Aún no tienes pedidos registrados.</p>
            </div>
        )
    }

    return (
        <div>
            <h3 className="seccion-titulo">Mis pedidos</h3>
            {ESTADOS.map(({ key, label, color }) => {
                const lista = pedidos.filter(p => p.estado === key)
                if (lista.length === 0) return null
                return (
                    <div key={key}>
                        <h4 style={{ margin: "20px 0 10px", color, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
                            {label} {key.toUpperCase()} ({lista.length})
                        </h4>
                        {lista.map(p => (
                            <TarjetaPedido
                                key={p._id}
                                pedido={p}
                                expandido={expandido === p._id}
                                onToggle={() => setExpandido(expandido === p._id ? null : p._id)}
                                onCambiarEstado={onCambiarEstado}
                                onEditar={onEditar}
                                onEliminar={onEliminar}
                            />
                        ))}
                    </div>
                )
            })}
        </div>
    )
}