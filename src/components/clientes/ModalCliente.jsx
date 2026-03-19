export default function ModalCliente({ form, setForm, editandoId, onGuardar, onCerrar }) {
    return (
        <div onClick={onCerrar} style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, overflowY: "auto"
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: "#fff", borderRadius: 18, width: "100%", maxWidth: 520,
                maxHeight: "90vh", overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
            }}>
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--borde)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: 17 }}>
                            {editandoId ? "✏️ Editar cliente" : "➕ Nuevo cliente"}
                        </h3>
                        <button type="button" onClick={onCerrar} style={{
                            all: "unset", cursor: "pointer", fontSize: 22,
                            color: "var(--texto-suave)", padding: "2px 8px"
                        }}>✕</button>
                    </div>
                </div>

                <div style={{ padding: "20px 24px" }}>
                    <div className="form-fila">
                        <div className="form-grupo">
                            <label>Nombre *</label>
                            <input type="text" value={form.nombre}
                                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                placeholder="Nombre del cliente" />
                        </div>
                        <div className="form-grupo">
                            <label>Tipo</label>
                            <select value={form.tipo}
                                onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                                <option value="individual">Individual</option>
                                <option value="mayorista">Mayorista</option>
                                <option value="frecuente">Frecuente</option>
                                <option value="empresa">Empresa</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-fila">
                        <div className="form-grupo">
                            <label>Teléfono</label>
                            <input type="text" value={form.telefono}
                                onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                                placeholder="8888-8888" />
                        </div>
                        <div className="form-grupo">
                            <label>Correo</label>
                            <input type="email" value={form.correo}
                                onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                                placeholder="mail@ejemplo.com" />
                        </div>
                    </div>

                    <div className="form-grupo">
                        <label>Dirección</label>
                        <input type="text" value={form.direccion}
                            onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                            placeholder="400 Norte de..." />
                    </div>

                    <div className="form-grupo">
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                            <input type="checkbox" style={{ width: "auto" }}
                                checked={form.alergias}
                                onChange={e => setForm(f => ({ ...f, alergias: e.target.checked }))} />
                            ⚠️ ¿Tiene alergias?
                        </label>
                    </div>

                    {form.alergias && (
                        <div className="form-grupo">
                            <label>¿Cuáles alergias?</label>
                            <input type="text" value={form.notasAlergias}
                                onChange={e => setForm(f => ({ ...f, notasAlergias: e.target.value }))}
                                placeholder="Ej: nueces, gluten, lácteos..." />
                        </div>
                    )}

                    <div className="form-grupo">
                        <label>Nota interna</label>
                        <input type="text" value={form.nota}
                            onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
                            placeholder="Preferencias, observaciones..." />
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button className="btn-primario" type="button" onClick={onGuardar}>
                            {editandoId ? "✏️ Actualizar" : "💾 Guardar cliente"}
                        </button>
                        <button className="btn-secundario" type="button" onClick={onCerrar}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}