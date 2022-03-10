module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'standard',
    // required to lint *.vue files
    plugins: [
        'html'
    ],
    // add your custom rules here
    'rules': {
        // allow paren-less arrow functions
        'arrow-parens': 0,
        // allow async-await
        'generator-star-spacing': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'no-tabs': 0,
        "space-before-function-paren": [0, "always"],
        "no-mixed-spaces-and-tabs": 0,
        'eol-last': 2,
        "semi": [2, 'always'],   // 分号检查，显示分号
        "quotes": [2, "double", "avoid-escape"],
        "indent": [0, 4],
        "comma-dangle": [0, "never"],
        // 强制在注释中 // 或 /* 使用一致的空格
        "spaced-comment": [2, "always"]
    }
}