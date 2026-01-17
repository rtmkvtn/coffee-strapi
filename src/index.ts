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
      // Check if we should clean tables before bootstrap
      const cleanTables = process.env.CLEAN_TABLES === 'true'
      if (cleanTables) {
        console.log(
          'CLEAN_TABLES=true detected, will clean all tables before bootstrap'
        )
      }

      await initProducts(strapi, cleanTables)
      await initRolesPermissions(strapi)
    } catch (e) {
      console.error('Error while bootstraping init data', e)
    }
  },
}
