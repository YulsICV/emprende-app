export default function ModalEliminar({ item, onConfirmar, onCancelar }) {
    if (!item) return null

    return (
        <div
            onClick={onCancelar}
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 20,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "#fff", borderRadius: 20, padding: "32px 28px",
                    width: "100%", maxWidth: 400, textAlign: "center",
                    boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
                }}
            >
                <div style={{ fontSize: 52, marginBottom: 12 }}>🗑️</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 20, color: "#1a202c" }}>
                    ¿Eliminar producto?
                </h3>
                <p style={{ color: "#718096", fontSize: 15, marginBottom: 28 }}>
                    Vas a eliminar <strong style={{ color: "#2d3748" }}>"{item.nombre}"</strong> del inventario.
                    <br />Esta acción no se puede deshacer.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                    <button type="button" onClick={onCancelar} style={{
                        flex: 1, padding: "12px 0", borderRadius: 12,
                        background: "#e2e8f0", color: "#4a5568",
                        border: "none", cursor: "pointer",
                        fontSize: 15, fontWeight: 600,
                    }}>Cancelar</button>
                    <button type="button" onClick={() => onConfirmar(item.id)} style={{
                        flex: 1, padding: "12px 0", borderRadius: 12,
                        background: "#e53e3e", color: "#fff",
                        border: "none", cursor: "pointer",
                        fontSize: 15, fontWeight: 700,
                    }}>Sí, eliminar</button>
                </div>
            </div>
        </div>
    )
}