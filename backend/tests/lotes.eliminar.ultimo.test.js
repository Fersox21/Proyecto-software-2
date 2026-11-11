import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/modules/lotes/lotes.repository.js', () => ({
  findById: vi.fn(),
  removeSiNoEsElUltimoLote: vi.fn(),
  remove: vi.fn()
}))

vi.mock('../src/modules/ordenesCompra/ordenesCompra.repository.js', () => ({
  findById: vi.fn()
}))

vi.mock('../src/modules/productos/productos.repository.js', () => ({
  findById: vi.fn()
}))

import * as repository from '../src/modules/lotes/lotes.repository.js'
import { eliminarLote } from '../src/modules/lotes/lotes.service.js'

describe('eliminarLote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rechaza la baja del único lote de la orden con 409', async () => {
    repository.findById.mockResolvedValue({ id: 10, ordenCompra: { id: 3 } })
    repository.removeSiNoEsElUltimoLote.mockResolvedValue(0)

    await expect(eliminarLote(10)).rejects.toMatchObject({
      message: 'No se puede eliminar el único lote de la orden de compra',
      status: 409
    })
  })

  it('da de baja el lote cuando la orden tiene más de uno', async () => {
    repository.findById.mockResolvedValue({ id: 10, ordenCompra: { id: 3 } })
    repository.removeSiNoEsElUltimoLote.mockResolvedValue(1)

    await expect(eliminarLote(10)).resolves.toBe(true)
    expect(repository.removeSiNoEsElUltimoLote).toHaveBeenCalledWith(10)
  })

  it('responde 404 y no intenta la baja si el lote no existe', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(eliminarLote(10)).rejects.toMatchObject({ status: 404 })
    expect(repository.removeSiNoEsElUltimoLote).not.toHaveBeenCalled()
  })

  it('rechaza ids inválidos antes de tocar el repositorio', async () => {
    await expect(eliminarLote('abc')).rejects.toMatchObject({ status: 400 })
    expect(repository.findById).not.toHaveBeenCalled()
  })
})
