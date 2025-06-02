/**
 * cart controller
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::cart.cart', ({ strapi }) => ({
  async my(ctx) {
    try {
      // Get the authenticated user
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in to get your cart');
      }

      // Find orders associated with the user
      const cartsRes = await strapi.db.query('api::cart.cart').findMany({
        where: { user: user.id },
        limit: 1,
      });

      const cart = cartsRes[0];

      if (!cart) {
        return ctx.notFound('Cart not found');
      }

      // Return the orders
      return {
        data: cart,
      };
    } catch (err) {
      ctx.body = err;
    }
  },
}));
