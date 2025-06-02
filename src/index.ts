import { initProducts } from './initScripts/initProducts'
import { initRolesPermissions } from './initScripts/initRolesPermissions'

export default {
  register({ strapi }) {
    strapi.server.router.post('/api/telegram/auth', (ctx) => {
      return strapi.controller('api::telegram.telegram').auth(ctx)
    })
  },
  async bootstrap({ strapi }) {
    try {
      await initProducts(strapi)
      await initRolesPermissions(strapi)
    } catch (e) {
      console.error('Error while bootstraping init data', e)
    }
  },
}
