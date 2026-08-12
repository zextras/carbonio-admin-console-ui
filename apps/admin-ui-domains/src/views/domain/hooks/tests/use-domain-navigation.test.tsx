/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  replaceHistory: vi.fn(),
}));

import { replaceHistory } from '@zextras/ui-shared';

import { useDomainNavigation, type UseDomainNavigationReturn } from '../use-domain-navigation';

const replaceHistoryMock = replaceHistory as ReturnType<typeof vi.fn>;

function renderHookAtRoute(path: string): UseDomainNavigationReturn {
  let result: UseDomainNavigationReturn | undefined;
  function Harness() {
    result = useDomainNavigation();
    return null;
  }
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/*" element={<Harness />} />
      </Routes>
    </MemoryRouter>,
  );
  return result!;
}

describe('useDomainNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract domainId and operation from a domain route', () => {
    const result = renderHookAtRoute('/manage/domains/domain-1/general_settings');

    expect(result.isDomainSelect).toBe(true);
    expect(result.selectedDomainId).toBe('domain-1');
    expect(result.domainView).toBe('general_settings');
  });

  it('should redirect when at the base domains route', () => {
    renderHookAtRoute('/manage/domains');

    expect(replaceHistoryMock).toHaveBeenCalledWith('/global/domains');
  });

  it('should not select a domain when the operation segment is missing', () => {
    const result = renderHookAtRoute('/manage/domains/domain-1');

    expect(result.isDomainSelect).toBe(false);
    expect(result.selectedDomainId).toBe('');
    expect(result.domainView).toBe('global/domains');
  });

  it('should detect global route and produce global view', () => {
    const result = renderHookAtRoute('/manage/domains/global/settings');

    expect(result.isGlobalRoute).toBe(true);
    expect(result.isDomainSelect).toBe(false);
    expect(result.domainView).toBe('global/settings');
  });
});
