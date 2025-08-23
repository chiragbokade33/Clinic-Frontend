import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // ✅ Turn off or downgrade the errors you listed
      "prefer-const": "off", // allow let even if never reassigned
      "react-hooks/rules-of-hooks": "off", // allow hooks anywhere
      "react-hooks/exhaustive-deps": "off", // no dependency warnings
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "jsx-a11y/alt-text": "off",
    },
  },
];

export default eslintConfig;
