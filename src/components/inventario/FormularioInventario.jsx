import { parsearNumero, sugerirConversion } from "../../utils/parsearNumero"
import { unidadBase } from "../../hooks/useInventario"

const UNIDADES = ["g", "kg", "ml", "L", "unidad", "paquete", "taza", "sobre", "caja"]

function InputMoneda({ label, value, onChange, placeholder }) {
    return (
        <div className="form-grupo">
            <label>{label}</label>
            <div style={{ position: "relative" }}>
                <span style={{
                    position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                    color: "var(--texto-suave)", fontWeight: 600, pointerEvents: "none"
                }}>₡</span>
                <input type="text" inputMode="decimal" placeholder={placeholder || "0"}
                    value={value} onChange={e => onChange(e.target.value)} style={{ paddingLeft: 24 }} />
            </div>
            {value && parsearNumero(value) > 0 && (
                <small style={{ color: "var(--texto-suave)", marginTop: 2, display: "block" }}>
                    = ₡{parsearNumero(value).toLocaleString("es-CR")}
                </small>
            )}
        </div>
    )
}

function InputNumero({ label, value, onChange, placeholder, hint }) {
    return (
        <div className="form-grupo">
            <label>{label}</label>
            <input type="text" inputMode="decimal" placeholder={placeholder || "0"}
                value={value} onChange={e => onChange(e.target.value)} />
            {hint && (
                <small style={{ color: "var(--texto-suave)", marginTop: 2, display: "block" }}>
                    {hint}
                </small>
            )}
        </div>
    )
}

export default function FormularioInventario({ form, setForm, editandoId, totalInventario, costoTotal, onGuardar, onCancelar }) {
    const sugerencia = sugerirConversion(form.tamañoPaquete, form.unidad)
    const uBase = unidadBase(form.unidad)

    const aplicarSugerencia = () => {
        if (!sugerencia) return
        setForm(f => ({ ...f, tamañoPaquete: String(sugerencia.valor), unidad: sugerencia.unidad }))
    }

    return (
        <div className="card" style={{ order: 1 }}>
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>
                {editandoId ? "✏️ Editar item" : "➕ Agregar al inventario"}
            </h3>

            <div className="form-grupo">
                <label>Producto *</label>
                <input type="text" placeholder="Ej: Harina, Fondant, Bolsas..."
                    value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>

            <div className="form-grupo">
                <label>Tipo</label>
                <div style={{ display: "flex", gap: 8 }}>
                    {[
                        { valor: "ingrediente", label: "🧁 Ingrediente", color: "#6366f1" },
                        { valor: "insumo", label: "📦 Insumo de empaque", color: "#10b981" }
                    ].map(({ valor, label, color }) => (
                        <button key={valor} type="button" onClick={() => setForm({ ...form, tipo: valor })} style={{
                            flex: 1, padding: "8px 0", borderRadius: 8,
                            border: `2px solid ${form.tipo === valor ? color : "var(--borde)"}`,
                            background: form.tipo === valor ? color : "transparent",
                            color: form.tipo === valor ? "#fff" : "var(--texto-suave)",
                            cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s"
                        }}>{label}</button>
                    ))}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <InputNumero label="¿Cuántos paquetes? *" value={form.cantidadPaquetes}
                    onChange={v => setForm({ ...form, cantidadPaquetes: v })} placeholder="Ej: 2" />
                <div className="form-grupo">
                    <label style={{ textTransform: "none", fontSize: 12 }}>Cantidad por paquete *</label>
                    <div style={{ display: "flex", gap: 6 }}>
                        <input type="text" inputMode="decimal" placeholder="Ej: 910 ó 1/2"
                            value={form.tamañoPaquete}
                            onChange={e => setForm({ ...form, tamañoPaquete: e.target.value })}
                            style={{ flex: 1, minWidth: 0 }} />
                        <select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}
                            style={{ width: 72, flexShrink: 0 }}>
                            {UNIDADES.map(u => <option key={u}>{u}</option>)}
                        </select>
                    </div>
                    {form.tamañoPaquete && parsearNumero(form.tamañoPaquete) > 0 && form.tamañoPaquete.includes("/") && (
                        <small style={{ color: "var(--acento)", marginTop: 3, display: "block", fontWeight: 600 }}>
                            = {parsearNumero(form.tamañoPaquete)} {form.unidad}
                        </small>
                    )}
                    {sugerencia && (
                        <div style={{
                            marginTop: 6, padding: "7px 10px", borderRadius: 8,
                            background: "#fffbeb", border: "1.5px solid #fcd34d",
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                        }}>
                            <span style={{ color: "#92400e", fontSize: 12, lineHeight: 1.3 }}>
                                💡 <strong>{sugerencia.valor} {sugerencia.unidad}</strong> es más exacto
                            </span>
                            <button type="button" onClick={aplicarSugerencia} style={{
                                all: "unset", cursor: "pointer", whiteSpace: "nowrap",
                                color: "#fff", background: "#f59e0b",
                                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, flexShrink: 0,
                            }}>Usar {sugerencia.valor}{sugerencia.unidad}</button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <InputMoneda label="₡ Costo por paquete" value={form.costoPorPaquete}
                    onChange={v => setForm({ ...form, costoPorPaquete: v })} placeholder="Ej: 7,140" />
                <InputNumero
                    label={`Mínimo para alerta (${uBase})`}
                    value={form.minimo}
                    onChange={v => setForm({ ...form, minimo: v })}
                    placeholder={`Ej: 200 ${uBase}`}
                    hint={uBase !== form.unidad ? `Ingresá en ${uBase}, no en ${form.unidad}` : null}
                />
            </div>

            {totalInventario > 0 && (
                <div className="resumen-grid">
                    <div className="resumen-item">
                        <div className="valor">{totalInventario.toLocaleString("es-CR")}{form.unidad}</div>
                        <div className="etiqueta">Total en inventario</div>
                    </div>
                    {costoTotal > 0 && (
                        <div className="resumen-item">
                            <div className="valor">₡{costoTotal.toLocaleString("es-CR")}</div>
                            <div className="etiqueta">Costo total</div>
                        </div>
                    )}
                    {costoTotal > 0 && totalInventario > 0 && (
                        <div className="resumen-item">
                            <div className="valor">₡{(costoTotal / totalInventario).toFixed(2)}</div>
                            <div className="etiqueta">Costo por {form.unidad}</div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn-primario" type="button" onClick={onGuardar}>
                    {editandoId ? "✏️ Actualizar" : "💾 Agregar al inventario"}
                </button>
                {editandoId && (
                    <button className="btn-secundario" type="button" onClick={onCancelar}>✕ Cancelar</button>
                )}
            </div>
        </div>
    )
}