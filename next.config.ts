import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["firebase-admin"],
  turbopack: {
    resolveAlias: {
      "@firebase/app": "./node_modules/@firebase/app",
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  webpack: (config) => {
    // Single @firebase/app instance so Auth can register (avoids "Component auth has not been registered")
    config.resolve.alias = {
      ...config.resolve.alias,
      "@firebase/app": path.resolve(rootDir, "node_modules/@firebase/app"),
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
