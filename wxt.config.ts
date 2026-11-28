import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    "name": "OzoneBlock",
    "description": "Extensão para controle de tempo de uso e navegação.",
    "version":"1.0.1",
    "version_name": "1.0",
    "permissions": [
      "storage",
      "tabs",
      "webRequest",
      "webRequestBlocking",
      "webNavigation",
      "<all_urls>",
      "http://*/",
      "https://*/"
    ],
    "browser_specific_settings":{
      "gecko":{
        "data_collection_permissions": {
          "required":['none'],
          
        }
      }
    }
  },
});
