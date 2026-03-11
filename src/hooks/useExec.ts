import { ElMessage } from 'element-plus';

export default () => {
  const isCodeSafe = (code: string): boolean => {
    const dangerousPatterns = [
      /eval\s*\(/,
      /setTimeout\s*\(/,
      /setInterval\s*\(/,
      /fetch\s*\(/,
      /XMLHttpRequest/,
      /localStorage/,
      /sessionStorage/,
      /import\s*\(/,
      /require\s*\(/,
    ];

    return !dangerousPatterns.some(pattern => pattern.test(code));
  };

  const execCode = (code: string, spinePlayer: any) => {
    /* CODE_START */
    try {
      if (!isCodeSafe(code)) {
        ElMessage.error('代码包含不允许的操作');
        return;
      }

      const func = new Function(`return (${code})`);
      func.call(null)(spinePlayer);

      ElMessage.success('执行代码成功');
    } catch (err) {
      ElMessage.error('执行代码失败: ' + err);
    }
    /* CODE_END */
  };

  return {
    execCode,
  };
};
