import { useMemo } from "react"
import { parsearNumero } from "../utils/parsearNumero"

export function useMetricasInventario(db) {
    const inventario = useMemo(() => db.inventario || [], [db.inventario])
    const pedidos    = useMemo(() => db.pedidos    || [], [db.pedidos])
    const recetas    = useMemo(() => db.recetas    || [], [db.recetas])

    // FIX: era (costoTotal / cantidad) * cantidad = costoTotal, simplificado directo
    const valorInventarioActual = useMemo(() =>
        inventario.reduce((s, i) => s + parsearNumero(i.costoTotal), 0),
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
                    if (!item?.costoTotal || !item?.cantidad) return s
                    const costoPorUnidad = parsearNumero(item.costoTotal) / parsearNumero(item.cantidad)
                    return s + costoPorUnidad * (parseFloat(ing.cantidadUso) || 0) * factor
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
                    consumo[ing.nombre] = (consumo[ing.nombre] || 0) +
                        (parseFloat(ing.cantidadUso) || 0) * factor
                })
            })
        return Object.entries(consumo).sort((a, b) => b[1] - a[1]).slice(0, 5)
    }, [pedidos, recetas])

    return { valorInventarioActual, totalInvertido, costoConsumidoPedidos, topConsumo }
}