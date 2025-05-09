import { errors } from '@strapi/utils';

export default {
  async auth(ctx) {
    try {
      const { initData } = ctx.request.body;
      const result = await strapi
        .service('api::telegram.telegram')
        .createOrUpdateUser(initData);

      return ctx.send(result);
    } catch (err) {
      if (err instanceof errors.UnauthorizedError) {
        return ctx.unauthorized(err.message);
      }
      strapi.log.error('Telegram auth error', err);
      return ctx.internalServerError('Authentication failed');
    }
  }
};
