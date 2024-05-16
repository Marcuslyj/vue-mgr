export default [
  { path: '/', redirect: '/home' },
  { path: '/:pathMatch(.*)', redirect: '/404' }
]