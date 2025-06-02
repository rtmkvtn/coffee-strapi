/**
 * product controller
 */
import { factories } from '@strapi/strapi'

export default factories.createCoreController(
  'api::product.product',
  ({ strapi }) => ({
    async getAll(ctx) {
      try {
        // await strapi.documents('api::restaurant.restaurant').findOne({
        // documentId: 'a1b2c3d4e5f6g7h8i9j0klm'
        // })

        // Fetch all products
        const products = await strapi
          .documents('api::product.product')
          .findMany({
            limit: 1000,
          })

        // For each product, fetch related portions and ingredients
        const result = await Promise.all(
          products.map(async (product) => {
            // Fetch related portions
            const portions = await strapi
              .documents('api::product-toportion.product-toportion')
              .findMany({
                filters: { product: { id: Number(product.id) } },
                populate: ['portion'],
                limit: 1000,
              })

            const prices = portions.map((ptp) => ({
              weight: ptp.portion?.name || '',
              price: ptp.price,
            }))

            // Fetch related ingredients
            const ingredients = await strapi
              .documents('api::product-toingredient.product-toingredient')
              .findMany({
                filters: { product: { id: Number(product.id) } },
                populate: ['ingredient'],
                limit: 1000,
              })

            const additional_ingredients = ingredients.map((pti) => ({
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
        )

        return {
          data: result,
        }
      } catch (err) {
        ctx.body = err
      }
    },
  })
)
