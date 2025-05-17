import { Strapi } from '@strapi/types/dist/core'

export const initRolesPermissions = async (strapi: Strapi) => {
  const roleRepo = strapi.db.query('plugin::users-permissions.role')
  const permissionRepo = strapi.db.query('plugin::users-permissions.permission')

  const roles = await roleRepo.findMany()
  const publicRole = roles.find((r) => r.type === 'public')
  const authenticatedRole = roles.find((r) => r.type === 'authenticated')

  if (!authenticatedRole || !publicRole) {
    strapi.log.error('❌ Required roles not found')
    return
  }

  const newPermissions = [
    // Authenticated permissions
    { role: authenticatedRole.id, action: 'api::cart.cart.my' },
    { role: authenticatedRole.id, action: 'api::cart.cart.find' },
    { role: authenticatedRole.id, action: 'api::cart.cart.findOne' },
    { role: authenticatedRole.id, action: 'api::cart.cart.update' },
    { role: authenticatedRole.id, action: 'api::category.category.find' },
    { role: authenticatedRole.id, action: 'api::category.category.findOne' },
    { role: authenticatedRole.id, action: 'api::order.order.create' },
    { role: authenticatedRole.id, action: 'api::order.order.my' },
    { role: authenticatedRole.id, action: 'api::order.order.find' },
    { role: authenticatedRole.id, action: 'api::order.order.findOne' },
    { role: authenticatedRole.id, action: 'api::order.order.update' },
    { role: authenticatedRole.id, action: 'api::product.product.find' },
    { role: authenticatedRole.id, action: 'api::product.product.findOne' },
    { role: authenticatedRole.id, action: 'api::subcategory.subcategory.find' },
    {
      role: authenticatedRole.id,
      action: 'api::subcategory.subcategory.findOne',
    },
    { role: authenticatedRole.id, action: 'api::telegram.telegram.auth' },
    { role: authenticatedRole.id, action: 'plugin::users-permissions.user.me' },

    // Public permissions
    { role: publicRole.id, action: 'api::telegram.telegram.auth' },
  ]

  for (const perm of newPermissions) {
    const exists = await permissionRepo.findOne({
      where: { role: perm.role, action: perm.action },
    })

    if (!exists) {
      await permissionRepo.create({
        data: {
          action: perm.action,
          role: perm.role,
          enabled: true,
        },
      })

      strapi.log.info(`✅ Permission granted: ${perm.action}`)
    }
  }

  strapi.log.info('✅ Role permissions bootstrapped')
}
