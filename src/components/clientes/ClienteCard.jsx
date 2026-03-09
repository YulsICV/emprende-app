// src/components/clientes/ClienteCard.jsx
import HistorialPedidos from "./HistorialPedidos"

export default function ClienteCard({ 
    cliente, 
    expandido, 
    pedidos, 
    gastado, 
    onExpandir, 
    onEditar, 
    onEliminar 
}) {
    const esExpandido = expandido === cliente.id

    return (
        <div className="card" style={{ marginBottom: 10 }}>
            {/* Cabecera */}
            <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                onClick={() => onExpandir(esExpandido ? null : cliente.id)}
            >
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: 16 }}>{cliente.nombre}</strong>
                        {cliente.alergias && (
                            <span style={{ fontSize: 12, color: "#d97706", background: "#fef3c7", padding: "1px 7px", borderRadius: 10 }}>
                                ⚠️ Alergias
                            </span>
                        )}
                        <TipoBadge tipo={cliente.tipo} />
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {cliente.telefono && <span style={{ color: "var(--texto-suave)", fontSize: 14 }}>📱 {cliente.telefono}</span>}
                        {pedidos.length > 0 && (
                            <span style={{ color: "var(--texto-suave)", fontSize: 14 }}>
                                🛒 {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
                            </span>
                        )}
                        {gastado > 0 && (
                            <span style={{ color: "var(--acento)", fontSize: 14, fontWeight: 600 }}>
                                ₡{gastado.toLocaleString()} total
                            </span>
                        )}
                    </div>
                </div>
                <span style={{ fontSize: 18, color: "var(--texto-suave)" }}>
                    {esExpandido ? "▲" : "▼"}
                </span>
            </div>

            {/* Detalle expandible */}
            {esExpandido && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--borde)", paddingTop: 12 }}>
                    {cliente.correo && <p style={{ color: "var(--texto-suave)", fontSize: 14, marginBottom: 4 }}>✉️ {cliente.correo}</p>}
                    {cliente.direccion && <p style={{ color: "var(--texto-suave)", fontSize: 14, marginBottom: 4 }}>📍 {cliente.direccion}</p>}
                    
                    {cliente.notasAlergias && (
                        <NotaEstilizada 
                            icon="⚠️" 
                            color="#f59e0b" 
                            bg="#fef3c7"
                            text={cliente.notasAlergias} 
                        />
                    )}
                    
                    {cliente.nota && (
                        <NotaEstilizada 
                            icon="🔒" 
                            color="#6366f1" 
                            bg="#ede9fe"
                            text={cliente.nota}
                            italic
                        />
                    )}

                    <HistorialPedidos pedidos={pedidos} />

                    {/* Acciones */}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button className="btn-secundario" type="button" onClick={() => onEditar(cliente)}>
                            ✏️ Editar
                        </button>
                        {cliente.telefono && (
                            <a
                                href={`https://wa.me/506${cliente.telefono.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-secundario"
                                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                            >
                                💬 WhatsApp
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => onEliminar(cliente.id)}
                            style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function TipoBadge({ tipo }) {
    const estilos = {
        mayorista: { bg: "#ede9fe", color: "#7c3aed" },
        empresa: { bg: "#dbeafe", color: "#1d4ed8" },
        individual: { bg: "#f3f4f6", color: "#6b7280" }
    }
    const estilo = estilos[tipo] || estilos.individual

    return (
        <span style={{
            fontSize: 11, padding: "1px 8px", borderRadius: 10,
            background: estilo.bg,
            color: estilo.color
        }}>
            {tipo}
        </span>
    )
}

function NotaEstilizada({ icon, color, bg, text, italic }) {
    return (
        <div style={{ 
            background: bg, 
            padding: "10px 14px", 
            borderRadius: 10, 
            fontSize: 13, 
            marginBottom: 8,
            borderLeft: `3px solid ${color}`,
            fontStyle: italic ? "italic" : "normal",
            display: "flex",
            gap: 8,
            alignItems: "flex-start"
        }}>
            <span>{icon}</span>
            <span style={{ flex: 1 }}>{text}</span>
        </div>
    )
}