/**
 * product-toportion service
 */
import { factories } from '@strapi/strapi'

import { invalidateProductCache } from '../../../services/cache'

export default factories.createCoreService(
  'api::product-toportion.product-toportion',
  () => ({
    async create(params) {
      const result = await super.create(params)
      invalidateProductCache()
      return result
    },

    async update(documentId, params) {
      const result = await super.update(documentId, params)
      invalidateProductCache()
      return result
    },

    async delete(documentId) {
      const result = await super.delete(documentId)
      invalidateProductCache()
      return result
    },
  })
)
