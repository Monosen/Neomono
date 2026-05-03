const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
    {
        ignores: [
            'out/**',
            'node_modules/**',
            '.pnpm-store/**',
            '.vscode-test/**',
            '**/*.tsbuildinfo',
            // Runtime templates are deliberately written in ES2015 with `var`
            // because they are injected verbatim into VS Code's renderer.
            'src/templates/**'
        ]
    },

    // Plain JS (CommonJS) — build scripts and ESLint config itself
    {
        files: ['scripts/**/*.js', 'eslint.config.js', '.vscode-test.js'],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                module: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                process: 'readonly',
                console: 'readonly',
                Buffer: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'prefer-const': 'warn',
            eqeqeq: ['error', 'smart']
        }
    },

    // TypeScript — extension source and tests
    ...tseslint.configs.recommended.map((cfg) => ({
        ...cfg,
        files: ['src/**/*.ts']
    })),
    {
        files: ['src/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-require-imports': 'off',
            'prefer-const': 'warn',
            eqeqeq: ['error', 'smart']
        }
    }
);
