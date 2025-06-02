module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/telegram/auth',
      handler: 'telegram.auth',
    },
  ],
}
