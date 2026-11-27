import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    "name": "OzoneBlock",
    "description": "Extensão para controle de tempo de uso e navegação.",
    "version":"1.0.0",
    "version_name": "1.0",
    "permissions": [
      "storage",
      "tabs",
      "webRequest",
      "webRequestBlocking",
      "webNavigation",
      "data_collection_permissions",
      "<all_urls>",
      "http://*/",
      "https://*/"
    ]
  },
});
