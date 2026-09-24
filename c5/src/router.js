import { createRouter, createWebHistory } from 'vue-router';
import manifest from './variants.json';
import ScreenHost from './screens/ScreenHost.vue';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: `/${manifest.defaultPreset}/${manifest.entryScreen}` },
    { path: '/:presetId/:screenId', component: ScreenHost, props: true },
  ],
});
