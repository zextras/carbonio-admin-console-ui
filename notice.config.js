import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import notice from 'eslint-plugin-notice';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const noticeRule = {
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    'coverage/**',
    'scripts/**',
    'package/**',
    '**/notice.template.ts',
  ],
  plugins: {
    notice: notice,
  },
  rules: {
    'notice/notice': [
      'error',
      {
        templateFile: resolve(__dirname, 'notice.template.ts'),
        templateVars: {
          author: 'Zextras <https://www.zextras.com>',
          license: 'AGPL-3.0-only',
        },
        onNonMatchingHeader: 'replace',
      },
    ],
  },
};

export default noticeRule;
