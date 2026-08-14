/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@zextras/ui-components/web-components';

import { StrictMode, Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import { Bootstrapper } from './boot/bootstrapper';
import { LoadingView } from './boot/splash';

function shouldAllowContextMenu(ev: MouseEvent): boolean {
  const target = ev.target as HTMLElement;

  // Allow for images and links (including wrapped elements)
  if (target.closest('img, a')) {
    return true;
  }

  // Allow when text is selected
  if (ev.view?.getSelection?.()?.type === 'Range') {
    return true;
  }

  // Allow for elements with bypass class
  if (target.closest('.carbonio-bypass-context-menu')) {
    return true;
  }

  return false;
}

function setupContextMenuRestriction(): void {
  window.addEventListener('contextmenu', (ev) => {
    if (!shouldAllowContextMenu(ev)) {
      ev.preventDefault();
    }
  });
}

function getAppRoot(): HTMLElement {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('Root element #app not found');
  }
  return root;
}

// Initialize
setupContextMenuRestriction();

ReactDOM.createRoot(getAppRoot()).render(
  <StrictMode>
    <Suspense fallback={<LoadingView />}>
      <Bootstrapper />
    </Suspense>
  </StrictMode>,
);
