import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "golden-face",
  brand: {
    displayName: "금빛관상",
    primaryColor: "#F5C842",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 8081,
    commands: {
      dev: "npm run dev",
      build: "npm run build",
    },
  },
  permissions: ["IAP", "Storage", "Notification"],
  webViewProps: {
    type: "partner",
  },
});
