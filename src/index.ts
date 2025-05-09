export default {
  register({ strapi }) {
    strapi.server.router.post('/api/telegram/auth', (ctx) => {
      return strapi.controller('api::telegram.telegram').auth(ctx);
    });
  }
};
