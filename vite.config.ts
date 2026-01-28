import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { extname, relative, resolve } from "path";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { peerDependencies } from "./package.json";
import { glob } from "glob";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: resolve(process.cwd(), "lib/main.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies), "react/jsx-runtime"],
      input: Object.fromEntries(
        glob
          .sync("lib/**/*.{ts,tsx}", {
            ignore: ["lib/**/*.d.ts"],
          })
          .map((file) => [
            relative("lib", file.slice(0, file.length - extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url)),
          ]),
      ),
      output: {
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js",
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
    }),
  ],
});
