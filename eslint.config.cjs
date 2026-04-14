const nextConfigs = require("eslint-config-next");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

// eslint-config-next exports an array of flat config objects. Use the 'core-web-vitals' profile (index 0/1/2 depends on package)
// We'll include all exported configs from eslint-config-next to be safe, then add TypeScript plugin/parser
// eslint-config-next exports multiple profiles including a TypeScript profile which sets
// parserOptions.project. That causes the parser to attempt type-aware checks on non-TS
// files. Exclude the 'next/typescript' profile and use only the core configs.
const filteredNextConfigs = nextConfigs.filter((c) => c.name !== "next/typescript");

// Register TypeScript plugin first to ensure rule definitions are available
module.exports = [
  {
    plugins: { "@typescript-eslint": require("@typescript-eslint/eslint-plugin") },
  },
  ...filteredNextConfigs,
  // global ignores
  { ignores: ["node_modules/**", ".next/**"] },

  // Add TypeScript parser + plugin for TS/TSX files only (type-aware rules require project)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        parser: tsParser,
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {},
  },
];
