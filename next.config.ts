import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // firebase-admin/auth → jwks-rsa does require("jose"). jose 6 is ESM-only and
  // throws ERR_REQUIRE_ESM on Vercel. The override pins jwks-rsa to jose 5
  // (CJS). Keep all three external so the server require() uses that CJS build
  // instead of a bundled browser/ESM entry.
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
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
