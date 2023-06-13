import { addMessages, init } from 'svelte-i18n';
import en from '../i18n/en.json';

beforeEach(() => {
  addMessages('en', en);
  init({
    initialLocale: 'en',
    fallbackLocale: 'en',
  });
});
