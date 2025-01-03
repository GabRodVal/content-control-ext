import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    "name": "Entensão de Controle de Conteudo (temp)",
    "description": "Uma extensão que permite diferentes formas de bloqueio e geração de relatórios",
    "permissions": [
      "storage",
      "tabs",
      "webRequest",
      "webRequestBlocking",
      "<all_urls>",
      "http://*/",
      "https://*/"
    ]
  },
});
