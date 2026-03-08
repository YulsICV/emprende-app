export default function FormularioRecetas({ form, setForm }) {
    return (
        <div className="card">
            <div className="form-fila">
                <div className="form-grupo">
                    <label>Nombre de la receta</label>
                    <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej: Minidonas San Valentín"
                    />
                </div>
                <div className="form-grupo">
                    <label>Categoría</label>
                    <select
                        value={form.categoria}
                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    >
                        <option>Sencilla</option>
                        <option>Clásica</option>
                        <option>Especial</option>
                        <option>Premium</option>
                    </select>
                </div>
                <div className="form-grupo">
                    <label>Unidades producidas</label>
                    <input
                        type="number"
                        value={form.unidades}
                        onChange={(e) => setForm({ ...form, unidades: e.target.value })}
                        placeholder="Ej: 45"
                    />
                </div>
            </div>

            {/* Envío gratis */}
            <div style={{ marginTop: 8 }}>
                <label
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        userSelect: "none",
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${form.envioGratis ? "#10b981" : "var(--borde)"}`,
                        background: form.envioGratis ? "#f0fdf4" : "transparent",
                        transition: "all 0.2s"
                    }}
                >
                    <div
                        style={{
                            width: 40, height: 22, borderRadius: 11,
                            background: form.envioGratis ? "#10b981" : "var(--borde)",
                            position: "relative", transition: "background 0.2s", flexShrink: 0
                        }}
                    >
                        <div style={{
                            position: "absolute",
                            top: 3, left: form.envioGratis ? 21 : 3,
                            width: 16, height: 16, borderRadius: "50%",
                            background: "#fff", transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                        }} />
                        <input
                            type="checkbox"
                            checked={!!form.envioGratis}
                            onChange={e => setForm({ ...form, envioGratis: e.target.checked })}
                            style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                        />
                    </div>
                    <span style={{ fontSize: 14, color: form.envioGratis ? "#059669" : "var(--texto-suave)", fontWeight: form.envioGratis ? 600 : 400 }}>
                        🚚 Esta receta incluye envío gratis
                    </span>
                </label>
                {form.envioGratis && (
                    <p style={{ fontSize: 12, color: "#059669", marginTop: 5, marginLeft: 4 }}>
                        ✅ Al crear un pedido con esta receta, el envío se marcará como gratis automáticamente (podés cambiarlo manualmente).
                    </p>
                )}
            </div>
        </div>
    )
}