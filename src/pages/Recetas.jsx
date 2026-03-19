import { useEffect } from "react"
import { useRecetas } from "../hooks/useRecetas"
import FormularioRecetas from "../components/recetas/FormularioRecetas"
import FormularioIngrediente from "../components/recetas/FormularioIngrediente"
import TablaIngredientes from "../components/recetas/TablaIngredientes"
import ListaRecetas from "../components/recetas/ListaRecetas"

const FORM_INICIAL = {
    nombre: "", categoria: "Clásica",
    modoRendimiento: "porciones",
    unidades: "", pesoFinal: "", unidadPeso: "g", sugerenciasUso: "",
    ingredientes: [], insumos: [],
    margenMay: 35, margenMen: 70, envioGratis: false,
    fotoBase64: "", fotoUrl: "",
    equipo: [], temperatura: "", tiempoCoccion: "",
    pasos: [], recetarioId: null,
}

export default function Recetas() {
    const {
        form, setForm,
        ingForm, setIngForm,
        insumoForm, setInsumoForm,
        editandoId, setEditandoId,
        recetasCostos,
        recetario,
        inventario,
        cargando,
        costoIngredientes,
        costoInsumos,
        costoTotal,
        costoPorUnidad,
        costoPorGramo,
        costoPorKg,
        precioMayoreo,
        precioMenudeo,
        precioMayoreoPeso,
        precioMenudeoPeso,
        guardarReceta,
        eliminarReceta,
        editarReceta,
        agregarIngrediente,
        eliminarIngrediente,
        editarIngrediente,
        agregarInsumo,
        eliminarInsumo,
        editarInsumo,
        agregarAInventario,
        recargar,
    } = useRecetas()

    useEffect(() => {
        recargar()
    }, [recargar])

    if (cargando) return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--texto-suave)" }}>
            ⏳ Cargando recetas...
        </div>
    )

    const esPorciones = form.modoRendimiento === "porciones"
    const tieneItems = form.ingredientes.length > 0 || (form.insumos || []).length > 0
    const tieneRendimiento = esPorciones
        ? parseFloat(form.unidades) > 0
        : parseFloat(form.pesoFinal) > 0

    return (
        <div>
            <h2 className="page-titulo">🍩 Recetas & Costos</h2>

            <FormularioRecetas
                form={form}
                setForm={setForm}
                recetario={recetario}
                onJalarReceta={editarReceta}
                precioMayoreo={precioMayoreo}
                precioMenudeo={precioMenudeo}
                costoPorUnidad={costoPorUnidad}
                precioMayoreoPeso={precioMayoreoPeso}
                precioMenudeoPeso={precioMenudeoPeso}
                costoPorGramo={costoPorGramo}
                costoPorKg={costoPorKg}
            />

            <FormularioIngrediente
                ingForm={ingForm}
                setIngForm={setIngForm}
                onAgregar={agregarIngrediente}
                insumoForm={insumoForm}
                setInsumoForm={setInsumoForm}
                onAgregarInsumo={agregarInsumo}
                inventario={inventario}
                onAgregarAInventario={agregarAInventario}
            />

            <TablaIngredientes
                ingredientes={form.ingredientes}
                insumos={form.insumos || []}
                onEliminar={eliminarIngrediente}
                onEditar={editarIngrediente}
                onEliminarInsumo={eliminarInsumo}
                onEditarInsumo={editarInsumo}
            />

            {tieneItems && tieneRendimiento && (
                <div className="card">
                    <div className="resumen-grid">
                        <div className="resumen-item">
                            <div className="valor">₡{costoIngredientes.toFixed(0)}</div>
                            <div className="etiqueta">🧁 Costo ingredientes</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{costoInsumos.toFixed(0)}</div>
                            <div className="etiqueta">📦 Costo insumos</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{costoTotal.toFixed(0)}</div>
                            <div className="etiqueta">Total</div>
                        </div>
                        {esPorciones ? (
                            <>
                                <div className="resumen-item">
                                    <div className="valor">₡{costoPorUnidad.toFixed(0)}</div>
                                    <div className="etiqueta">Costo por unidad</div>
                                </div>
                                <div className="resumen-item" style={{ background: "var(--verde-claro)" }}>
                                    <div className="valor" style={{ color: "var(--verde-oscuro)" }}>₡{precioMayoreo}</div>
                                    <div className="etiqueta">Precio mayoreo/u</div>
                                </div>
                                <div className="resumen-item" style={{ background: "#fff8ee" }}>
                                    <div className="valor" style={{ color: "var(--canela)" }}>₡{precioMenudeo}</div>
                                    <div className="etiqueta">Precio menudeo/u</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="resumen-item">
                                    <div className="valor">₡{form.unidadPeso === "kg" ? costoPorKg.toFixed(2) : costoPorGramo.toFixed(4)}</div>
                                    <div className="etiqueta">Costo por {form.unidadPeso}</div>
                                </div>
                                <div className="resumen-item" style={{ background: "var(--verde-claro)" }}>
                                    <div className="valor" style={{ color: "var(--verde-oscuro)" }}>₡{precioMayoreoPeso}</div>
                                    <div className="etiqueta">Mayoreo/{form.unidadPeso}</div>
                                </div>
                                <div className="resumen-item" style={{ background: "#fff8ee" }}>
                                    <div className="valor" style={{ color: "var(--canela)" }}>₡{precioMenudeoPeso}</div>
                                    <div className="etiqueta">Menudeo/{form.unidadPeso}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <button className="btn-primario" type="button" onClick={guardarReceta}>
                {editandoId ? "✏️ Actualizar receta" : "💾 Guardar receta"}
            </button>

            {editandoId && (
                <button className="btn-secundario" type="button" style={{ marginLeft: 8 }}
                    onClick={() => { setEditandoId(null); setForm(FORM_INICIAL) }}>
                    ✕ Cancelar edición
                </button>
            )}

            <ListaRecetas
                recetas={recetasCostos}
                onEliminar={eliminarReceta}
                onEditar={editarReceta}
            />
        </div>
    )
}