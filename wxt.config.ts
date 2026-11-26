import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    "name": "OzoneBlock",
    "description": "Extensão para controle de tempo de uso e navegação.",
    "permissions": [
      "storage",
      "tabs",
      "windows",
      "webRequest",
      "webRequestBlocking",
      "webNavigation",
      "<all_urls>",
      "http://*/",
      "https://*/"
    ]
  },
});
