import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "tarot-ai-master",
  brand: {
    displayName: "금빛관상",
    primaryColor: "#F5C842",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "npm run dev",
      build: "npm run build",
    },
  },
  permissions: [],
  webViewProps: {
    type: "partner",
  },
});
