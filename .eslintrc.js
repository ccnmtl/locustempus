module.exports = {
    "env": {
        "browser": true,
        "amd": true,
        "jquery": true,
        "cypress/globals": true,
        "es6": true
    },
    "plugins": [
        "cypress",
        "@typescript-eslint"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-unused-vars": [
            "error",
            {"vars": "all", "args": "none"}
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "max-len": [2, {"code": 80, "tabWidth": 4, "ignoreUrls": true}],
        "space-before-function-paren": ["error", "never"],
        "space-in-parens": ["error", "never"],
        "no-trailing-spaces": ["error"],
        "key-spacing": ["error", { "beforeColon": false }],
        "func-call-spacing": ["error", "never"],
        //https://github.com/yannickcr/eslint-plugin-react/issues/2654
        'react/prop-types': [0],
    },
    "overrides": [{
        "files": ["*.{ts,tsx}"],
        "rules": {
            "max-len": [2, {"code": 100, "tabWidth": 4, "ignoreUrls": true}],
        },
        "parser": "@typescript-eslint/parser",
        "parserOptions": {
            tsconfigRootDir: __dirname,
            project: ['./tsconfig.json'],
        },
        "extends": [
            "plugin:@typescript-eslint/eslint-recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:@typescript-eslint/recommended-requiring-type-checking",
        ],
    }]
};
