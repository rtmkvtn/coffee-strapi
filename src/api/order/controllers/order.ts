/**
 * order controller
 */
import { factories } from '@strapi/strapi'

export default factories.createCoreController(
  'api::order.order',
  ({ strapi }) => ({
    async create(ctx) {
      try {
        console.log(ctx.request.body)
        const { user } = ctx.state
        const { cartId } = ctx.request.body

        if (!user) {
          return ctx.unauthorized('You must be logged in to create an order')
        }

        if (!cartId) {
          return ctx.badRequest('Cart ID is required')
        }

        // Check for existing waitingForPayment order
        const existingOrder = await strapi.db
          .query('api::order.order')
          .findOne({
            where: {
              user: user.id,
              state: 'waitingForPayment',
            },
          })

        if (existingOrder) {
          return ctx.badRequest('You already have an order waiting for payment')
        }

        const cart = await strapi.db.query('api::cart.cart').findOne({
          where: { id: cartId, user: user.id },
          populate: ['user'],
        })

        if (!cart) {
          return ctx.notFound('Cart not found')
        }

        if (
          !cart.items ||
          !Array.isArray(cart.items) ||
          cart.items.length === 0
        ) {
          return ctx.badRequest('Cart is empty')
        }

        const amount = cart.items.reduce((total, item) => {
          const itemTotal = Number(item.price) * Number(item.quantity)
          return total + itemTotal
        }, 0)

        if (amount <= 0) {
          return ctx.badRequest('Invalid cart items')
        }

        const order = await strapi.entityService.create('api::order.order', {
          data: {
            user: user.id,
            items: cart.items,
            amount,
            state: 'waitingForPayment',
          },
        })

        await strapi.db.query('api::cart.cart').update({
          where: { id: cartId },
          data: { items: [] },
        })

        return this.sanitizeOutput(order, ctx)
      } catch (error) {
        return ctx.internalServerError('Error creating order')
      }
    },
    async my(ctx) {
      try {
        // Get the authenticated user
        const user = ctx.state.user

        if (!user) {
          return ctx.unauthorized('You must be logged in to view your orders')
        }

        // Find orders associated with the user
        const orders = await strapi.db.query('api::order.order').findMany({
          where: { user: user.id },
          populate: ['order_items', 'order_items.product'],
          orderBy: { createdAt: 'desc' },
        })

        // Return the orders
        return {
          data: orders,
        }
      } catch (err) {
        ctx.body = err
      }
    },
  })
)
