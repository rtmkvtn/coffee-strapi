export default {
  routes: [
    {
      method: 'GET',
      path: '/cache/stats',
      handler: 'cache.getStats',
      config: {
        auth: false, // Set to true if you want authentication
      },
    },
    {
      method: 'POST',
      path: '/cache/clear',
      handler: 'cache.clear',
      config: {
        auth: false, // Set to true if you want authentication
      },
    },
    {
      method: 'POST',
      path: '/cache/warmup',
      handler: 'cache.warmup',
      config: {
        auth: false, // Set to true if you want authentication
      },
    },
  ],
}
