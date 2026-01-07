/**
 * product service
 */
import { factories } from '@strapi/strapi'

import {
  cache,
  CacheKeys,
  invalidateProductCache,
} from '../../../services/cache'
import {
  ProductToPortionWithRelations,
  ProductToIngredientWithRelations,
  ProductToTemperatureWithRelations,
  ProductPrice,
  ProductAdditionalIngredient,
} from '../../../types/localization'
import { validateLocalizedString } from '../../../utils/localization'

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

      const [allPortions, allIngredients, allTemperatures] = await Promise.all([
        strapi.documents('api::product-toportion.product-toportion').findMany({
          filters: { product: { id: { $in: productIds } } },
          populate: ['portion', 'product'],
          limit: 10000,
        }) as unknown as ProductToPortionWithRelations[],
        strapi
          .documents('api::product-toingredient.product-toingredient')
          .findMany({
            filters: { product: { id: { $in: productIds } } },
            populate: ['ingredient', 'product'],
            limit: 10000,
          }) as unknown as ProductToIngredientWithRelations[],
        strapi
          .documents('api::product-totemperature.product-totemperature')
          .findMany({
            filters: { product: { id: { $in: productIds } } },
            populate: ['temperature', 'product'],
            limit: 10000,
          }) as unknown as ProductToTemperatureWithRelations[],
      ])

      // Group portions, ingredients, and temperatures by product ID for O(1) lookup
      // This prevents N+1 query problem when mapping products to their relations
      const portionsByProductId = new Map<
        number,
        ProductToPortionWithRelations[]
      >()
      const ingredientsByProductId = new Map<
        number,
        ProductToIngredientWithRelations[]
      >()
      const temperaturesByProductId = new Map<
        number,
        ProductToTemperatureWithRelations[]
      >()

      allPortions.forEach((portion) => {
        const productId = portion.product?.id

        if (!productId) {
          strapi.log.warn(
            'Found product-toportion entry with missing product relation',
            {
              portionId: portion.id,
              portionDocumentId: portion.documentId,
            }
          )
          return
        }

        if (!portionsByProductId.has(productId)) {
          portionsByProductId.set(productId, [])
        }
        portionsByProductId.get(productId)!.push(portion)
      })

      allIngredients.forEach((ingredient) => {
        const productId = ingredient.product?.id

        if (!productId) {
          strapi.log.warn(
            'Found product-toingredient entry with missing product relation',
            {
              ingredientId: ingredient.id,
              ingredientDocumentId: ingredient.documentId,
            }
          )
          return
        }

        if (!ingredientsByProductId.has(productId)) {
          ingredientsByProductId.set(productId, [])
        }
        ingredientsByProductId.get(productId)!.push(ingredient)
      })

      allTemperatures.forEach((temperature) => {
        const productId = temperature.product?.id

        if (!productId) {
          strapi.log.warn(
            'Found product-totemperature entry with missing product relation',
            {
              temperatureId: temperature.id,
              temperatureDocumentId: temperature.documentId,
            }
          )
          return
        }

        if (!temperaturesByProductId.has(productId)) {
          temperaturesByProductId.set(productId, [])
        }
        temperaturesByProductId.get(productId)!.push(temperature)
      })

      // Transform products with their related data and filter out products without prices
      const result = products
        .map((product) => {
          const productId = Number(product.id)

          // Get portions for this product
          const portions = portionsByProductId.get(productId) || []
          const prices: ProductPrice[] = portions.map((ptp) => ({
            weight: validateLocalizedString(ptp.portion?.name_by_locale),
            price: ptp.price,
          }))

          // Get ingredients for this product
          const ingredients = ingredientsByProductId.get(productId) || []
          const additional_ingredients: ProductAdditionalIngredient[] =
            ingredients.map((pti) => ({
              name: validateLocalizedString(pti.ingredient?.name_by_locale),
              weight: pti.ingredient?.weight || '',
              priceModifier: pti.priceModifier,
            }))

          // Get temperatures for this product
          const temperatures = temperaturesByProductId.get(productId) || []
          const temperatureTypes = temperatures.map(
            (ptt) => ptt.temperature?.type || ''
          )

          return {
            ...product,
            prices,
            additionalIngredients: additional_ingredients,
            temperatures: temperatureTypes,
          }
        })
        .filter((product) => product.prices.length > 0)

      const response = {
        data: result,
      }

      // Cache the result for 5 minutes
      cache.set(cacheKey, response, 300)

      return response
    },
  })
)
