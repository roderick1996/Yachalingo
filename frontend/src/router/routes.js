export default [
  { path: '/', component: () => import('pages/LearnPage.vue') },
  { path: '/play', component: () => import('pages/PlayPage.vue') },
  { path: '/admin', component: () => import('pages/AdminDashboard.vue') },
  { path: '/:catchAll(.*)*', redirect: '/' },
];
