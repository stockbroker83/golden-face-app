import { defineConfig } from '@apps-in-toss/web-framework/config';
export default defineConfig({
  appName: 'tarot-ai-master',
  brand: {
    displayName: '타로 AI 마스터',
    primaryColor: '#F5C842',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  webViewProps: {
    type: 'partner',
  },
});
