/**
 * product service
 */
import { factories } from '@strapi/strapi'

import {
  cache,
  CacheKeys,
  invalidateProductCache,
} from '../../../services/cache'

export default factories.createCoreService(
  'api::product.product',
  ({ strapi }) => ({
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

    async publish(documentId, params) {
      const result = await super.publish(documentId, params)
      invalidateProductCache()
      return result
    },

    async unpublish(documentId, params) {
      const result = await super.unpublish(documentId, params)
      invalidateProductCache()
      return result
    },

    async getAll() {
      // Check cache first
      const cacheKey = CacheKeys.PRODUCTS_ALL
      const cachedResult = cache.get(cacheKey)

      if (cachedResult) {
        return cachedResult
      }

      // Cache miss - fetch from database
      // Fetch all products
      const products = await strapi.documents('api::product.product').findMany({
        limit: 1000,
        populate: {
          category: {
            fields: ['id'],
          },
          subcategory: {
            fields: ['id'],
          },
        },
      })

      if (products.length === 0) {
        const emptyResult = { data: [] }
        cache.set(cacheKey, emptyResult, 60) // Cache empty result for 1 minute
        return emptyResult
      }

      // Extract all product IDs for batch queries
      const productIds = products.map((product) => Number(product.id))

      // Batch fetch all portions for all products (2 queries instead of N)
      const [allPortions, allIngredients] = await Promise.all([
        strapi.documents('api::product-toportion.product-toportion').findMany({
          filters: { product: { id: { $in: productIds } } },
          populate: ['portion', 'product'],
          limit: 10000,
        }),
        strapi
          .documents('api::product-toingredient.product-toingredient')
          .findMany({
            filters: { product: { id: { $in: productIds } } },
            populate: ['ingredient', 'product'],
            limit: 10000,
          }),
      ])

      // Group portions and ingredients by product ID for O(1) lookup
      const portionsByProductId = new Map()
      const ingredientsByProductId = new Map()

      allPortions.forEach((portion) => {
        const productId = portion.product?.id
        if (!portionsByProductId.has(productId)) {
          portionsByProductId.set(productId, [])
        }
        portionsByProductId.get(productId).push(portion)
      })

      allIngredients.forEach((ingredient) => {
        const productId = ingredient.product?.id
        if (!ingredientsByProductId.has(productId)) {
          ingredientsByProductId.set(productId, [])
        }
        ingredientsByProductId.get(productId).push(ingredient)
      })

      // Transform products with their related data
      const result = products.map((product) => {
        const productId = Number(product.id)

        // Get portions for this product
        const portions = portionsByProductId.get(productId) || []
        const prices = portions.map((ptp: any) => ({
          weight: ptp.portion?.name || '',
          price: ptp.price,
        }))

        // Get ingredients for this product
        const ingredients = ingredientsByProductId.get(productId) || []
        const additional_ingredients = ingredients.map((pti: any) => ({
          name: pti.ingredient?.name || '',
          weight: pti.ingredient?.weight || '',
          priceModifier: pti.priceModifier,
        }))

        return {
          ...product,
          prices,
          additionalIngredients: additional_ingredients,
        }
      })

      const response = {
        data: result,
      }

      // Cache the result for 5 minutes
      cache.set(cacheKey, response, 300)

      return response
    },
  })
)
