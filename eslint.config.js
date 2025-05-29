const {
    defineConfig,
} = require("eslint/config");

const globals = require("globals");
const security = require("eslint-plugin-security");
const cypress = require("eslint-plugin-cypress");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.amd,
            ...globals.jquery,
            ...cypress.environments.globals.globals,
        },
    },

    plugins: {
        security,
        cypress,
        "@typescript-eslint": typescriptEslint,
    },

    extends: compat.extends(
        "eslint:recommended",
        "plugin:security/recommended-legacy",
        "plugin:react/recommended",
    ),

    "rules": {
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],

        "no-unused-vars": ["error", {
            "vars": "all",
            "args": "none",
        }],

        "quotes": ["error", "single"],
        "semi": ["error", "always"],

        "max-len": [2, {
            "code": 80,
            "tabWidth": 4,
            "ignoreUrls": true,
        }],

        "space-before-function-paren": ["error", "never"],
        "space-in-parens": ["error", "never"],
        "no-trailing-spaces": ["error"],

        "key-spacing": ["error", {
            "beforeColon": false,
        }],

        "func-call-spacing": ["error", "never"],
        "react/prop-types": [0],
        "security/detect-buffer-noassert": 1,
        "security/detect-child-process": 1,
        "security/detect-disable-mustache-escape": 1,
        "security/detect-eval-with-expression": 1,
        "security/detect-new-buffer": 1,
        "security/detect-no-csrf-before-method-override": 1,
        "security/detect-non-literal-fs-filename": 1,
        "security/detect-non-literal-regexp": 1,
        "security/detect-non-literal-require": 0,
        "security/detect-object-injection": 0,
        "security/detect-possible-timing-attacks": 1,
        "security/detect-pseudoRandomBytes": 1,
        "security/detect-unsafe-regex": 1,
    },
}, {
    files: ["**/*.{ts,tsx}"],

    "rules": {
        "max-len": [2, {
            "code": 100,
            "tabWidth": 4,
            "ignoreUrls": true,
        }],
    },

    languageOptions: {
        parser: tsParser,

        parserOptions: {
            tsconfigRootDir: __dirname,
            project: ["./tsconfig.json"],
        },
    },

    extends: compat.extends(
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
    ),
}]);
