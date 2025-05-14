module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/orders/my',
      handler: 'order.my', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
    },
  ],
}
