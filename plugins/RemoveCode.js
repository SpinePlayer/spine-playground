export default (mode) => ({
  name: 'remove-code',
  enforce: 'pre',
  transform(code, id) {
    if (mode === 'production') {
      return code
        .replace(/\/\* CODE_START \*\/[\s\S]*?\/\* CODE_END \*\//g, '')
        .replace(/<!--\s*CODE_START\s*-->[\s\S]*?<!--\s*CODE_END\s*-->/g, '');
    }
    return code;
  },
});
