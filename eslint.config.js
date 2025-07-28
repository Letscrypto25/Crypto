import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";  // Added import

export default tseslint.config(
  { ignores: ["dist", "./worker-configuration.d.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {                  // Added parserOptions
        ecmaFeatures: { jsx: true }     // Enable JSX parsing
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "react": reactPlugin,             // Added plugin
    },
    settings: {                         // Added settings
      react: {
        version: "detect"               // Auto-detect React version
      }
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,    // Added React recommended rules
      ...reactPlugin.configs.typescript.rules,     // Added TypeScript-specific rules
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  }
);