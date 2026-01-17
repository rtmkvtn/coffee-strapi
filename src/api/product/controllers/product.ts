/**
 * product controller
 */
import { factories } from '@strapi/strapi'

import { cache, CacheKeys } from '../../../services/cache'

export default factories.createCoreController(
  'api::product.product',
  ({ strapi }) => ({
    async getAll(ctx) {
      try {
        // Check cache first for cache headers
        const cacheKey = CacheKeys.PRODUCTS_ALL
        const cachedResult = cache.get(cacheKey)

        if (cachedResult) {
          ctx.set('X-Cache', 'HIT')
        } else {
          ctx.set('X-Cache', 'MISS')
        }

        // Call service method
        return await strapi.service('api::product.product').getAll()
      } catch (err) {
        ctx.body = err
      }
    },
  })
)
