import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    "name": "OzoneBlock",
    "description": "Extensão para controle de tempo de uso e navegação.",
    "permissions": [
      "storage",
      "tabs",
      "webRequest",
      "webRequestBlocking",
      "webNavigation",
      "<all_urls>",
      "http://*/",
      "https://*/"
    ]
  },
});
