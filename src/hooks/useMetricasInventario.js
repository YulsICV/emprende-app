import { useMemo } from "react"
import { parsearNumero } from "../utils/parsearNumero"
import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"

function aGramos(cantidad, unidad) {
    const n = parsearNumero(cantidad)
    const factor = CONVERSIONES_A_GRAMOS[unidad]
    if (!factor) return n
    return n * factor
}

export function useMetricasInventario(db) {
    const inventario = useMemo(() => db.inventario || [], [db.inventario])
    const pedidos    = useMemo(() => db.pedidos    || [], [db.pedidos])
    const recetas    = useMemo(() => db.recetas    || [], [db.recetas])

    const valorInventarioActual = useMemo(() =>
        inventario.reduce((s, i) => {
            if (i.cantidadBase != null && i.costoPorGramo != null) {
                return s + i.cantidadBase * i.costoPorGramo
            }
            return s + parsearNumero(i.costoTotal)
        }, 0),
        [inventario]
    )

    const totalInvertido = useMemo(() =>
        inventario.reduce((s, i) => s + parsearNumero(i.costoTotal), 0),
        [inventario]
    )

    const costoConsumidoPedidos = useMemo(() =>
        pedidos
            .filter(p => p.estado === "entregado")
            .reduce((total, pedido) => {
                const receta = recetas.find(r => r.nombre === pedido.recetaNombre)
                if (!receta) return total
                const factor = (parseInt(pedido.cantidad) || 0) / (parseInt(receta.unidades) || 1)
                const todosItems = [...(receta.ingredientes || []), ...(receta.insumos || [])]
                return total + todosItems.reduce((s, ing) => {
                    const item = inventario.find(i =>
                        i.nombre.toLowerCase().trim() === ing.nombre.toLowerCase().trim()
                    )
                    if (!item) return s
                    const costoPorGramo = item.costoPorGramo
                        ?? (parsearNumero(item.costoTotal) / aGramos(item.cantidad, item.unidad))
                    const usoEnGramos = aGramos(ing.cantidadUso, ing.unidadUso)
                    return s + costoPorGramo * usoEnGramos * factor
                }, 0)
            }, 0),
        [pedidos, recetas, inventario]
    )

    const topConsumo = useMemo(() => {
        const consumo = {}
        pedidos
            .filter(p => p.estado === "entregado")
            .forEach(pedido => {
                const receta = recetas.find(r => r.nombre === pedido.recetaNombre)
                if (!receta?.ingredientes) return
                const factor = (parseInt(pedido.cantidad) || 0) / (parseInt(receta.unidades) || 1)
                receta.ingredientes.forEach(ing => {
                    const usoEnGramos = aGramos(ing.cantidadUso, ing.unidadUso)
                    consumo[ing.nombre] = (consumo[ing.nombre] || 0) + usoEnGramos * factor
                })
            })
        return Object.entries(consumo).sort((a, b) => b[1] - a[1]).slice(0, 5)
    }, [pedidos, recetas])

    return { valorInventarioActual, totalInvertido, costoConsumidoPedidos, topConsumo }
}