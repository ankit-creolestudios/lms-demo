module.exports = {
    root: true,
    env: {
        browser: true,
        node: false,
    },
    parser: '@typescript-eslint/parser',
    extends: ['plugin:react/recommended', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'],
    plugins: ['only-warn', 'progress', 'prettier', '@typescript-eslint'],
    ignorePatterns: ['*.js', '*.jsx'],
    rules: {
        'react/prop-types': 0,
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
    },
};
