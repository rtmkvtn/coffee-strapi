/**
 * cache controller for cache management
 */
import {
  cache,
  invalidateProductCache,
  invalidateRelatedCaches,
} from '../../../services/cache'

export default {
  async getStats(ctx) {
    try {
      const stats = cache.getStats()
      ctx.body = {
        success: true,
        data: stats,
      }
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message,
      }
    }
  },

  async clear(ctx) {
    try {
      const { type } = ctx.query

      switch (type) {
        case 'products':
          invalidateProductCache()
          break
        case 'all':
          invalidateRelatedCaches()
          break
        default:
          cache.clear()
      }

      ctx.body = {
        success: true,
        message: `Cache cleared: ${type || 'all'}`,
      }
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message,
      }
    }
  },

  async warmup(ctx) {
    try {
      // Warm up the cache by making requests to key endpoints
      const startTime = Date.now()

      // Warm up products cache - use the service method to populate proper cache
      await strapi.service('api::product.product').getAll()

      const endTime = Date.now()

      ctx.body = {
        success: true,
        message: 'Cache warmed up successfully',
        duration: `${endTime - startTime}ms`,
      }
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message,
      }
    }
  },
}
