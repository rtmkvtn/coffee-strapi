module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/products/all',
      handler: 'product.getAll',
    },
  ],
}
