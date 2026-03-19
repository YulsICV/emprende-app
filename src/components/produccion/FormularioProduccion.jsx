export default function FormularioProduccion({
    form, setForm, recetas,
    previewDescuento, hayStockInsuficiente,
    onGuardar
}) {
    return (
        <div className="card">
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>➕ Registrar</h3>

            <div className="form-grupo">
                <div style={{ display: "flex", gap: 8 }}>
                    {[
                        { valor: "produccion", label: "🍩 Producción", color: "#10b981" },
                        { valor: "perdida", label: "⚠️ Pérdida / Dañado", color: "#ef4444" }
                    ].map(({ valor, label, color }) => (
                        <button key={valor} type="button"
                            onClick={() => setForm(f => ({ ...f, tipo: valor }))}
                            style={{
                                flex: 1, padding: "8px 0", borderRadius: 8,
                                border: `2px solid ${form.tipo === valor ? color : "var(--borde)"}`,
                                background: form.tipo === valor ? color : "transparent",
                                color: form.tipo === valor ? "#fff" : "var(--texto-suave)",
                                cursor: "pointer", fontSize: 13, fontWeight: 600,
                                transition: "all 0.15s"
                            }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-grupo">
                    <label>Fecha</label>
                    <input type="date" value={form.fecha}
                        onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                </div>
                <div className="form-grupo">
                    <label>Cantidad *</label>
                    <input type="number" min="1" placeholder="Ej: 24"
                        value={form.cantidad}
                        onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
                </div>
            </div>

            <div className="form-grupo">
                <label>Producto (receta) *</label>
                <select value={form.recetaId}
                    onChange={e => setForm(f => ({ ...f, recetaId: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {recetas.map(r => (
                        <option key={r._id} value={r._id}>{r.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="form-grupo">
                <label>Notas (opcional)</label>
                <input type="text"
                    placeholder={form.tipo === "perdida" ? "Ej: Se cayeron, horno muy caliente..." : "Ej: Para feria del sábado..."}
                    value={form.notas}
                    onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
            </div>

            {form.tipo === "produccion" && previewDescuento.length > 0 && (
                <div style={{
                    padding: "10px 12px", borderRadius: 8, marginBottom: 12,
                    background: hayStockInsuficiente ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${hayStockInsuficiente ? "#fca5a5" : "#86efac"}`
                }}>
                    <p style={{
                        fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5,
                        color: hayStockInsuficiente ? "#dc2626" : "#16a34a"
                    }}>
                        {hayStockInsuficiente ? "⚠️ STOCK INSUFICIENTE" : "✅ SE DESCONTARÁ DEL INVENTARIO"}
                    </p>
                    {previewDescuento.map((i, idx) => (
                        <div key={idx} style={{
                            display: "flex", justifyContent: "space-between",
                            fontSize: 13, padding: "2px 0",
                            color: i.alcanza ? "var(--texto-suave)" : "#dc2626"
                        }}>
                            <span>{i.nombre}</span>
                            <span>
                                {i.consumo.toFixed(1)}{i.unidad}
                                {!i.alcanza && ` (solo hay ${i.stockActual.toFixed(1)})`}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <button className="btn-primario" type="button" onClick={onGuardar}
                style={{ background: form.tipo === "perdida" ? "#ef4444" : undefined }}>
                {form.tipo === "perdida" ? "⚠️ Registrar pérdida" : "💾 Registrar producción"}
            </button>
        </div>
    )
}