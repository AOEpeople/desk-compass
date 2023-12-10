import './desk-compass.postcss';
import './i18n/i18n';
import App from './views/App.svelte';

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
