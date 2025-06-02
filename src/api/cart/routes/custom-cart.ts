module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/cart',
      handler: 'cart.my', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
    },
  ],
};
