/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { Outlet, Route, Routes, useNavigate } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { RouteLeavingGuard } from '../route-leaving-guard';

function NavigationTrigger({ label }: { label: string }): React.ReactElement {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/other')}>
      {label}
    </button>
  );
}

function Layout({ when }: { when: boolean }): React.ReactElement {
  return (
    <>
      <RouteLeavingGuard when={when} onSave={onSave} />
      <Outlet />
    </>
  );
}

const onSave = vi.fn();

async function setupGuardTest(when = true): Promise<void> {
  await setupBrowserTest(
    <Routes>
      <Route element={<Layout when={when} />}>
        <Route
          path="/"
          element={
            <>
              <span>Home Page</span>
              <NavigationTrigger label="Go Away" />
            </>
          }
        />
        <Route path="/other" element={<span>Other Page</span>} />
      </Route>
    </Routes>,
    { initialRouterEntry: '/' },
  );
  await expect.element(page.getByText('Home Page')).toBeVisible();
}

describe('RouteLeavingGuard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when unsaved changes exist', () => {
    it('should show modal when navigating away', async () => {
      await setupGuardTest(true);

      await page.getByRole('button', { name: 'Go Away' }).click();

      await expect.element(page.getByText('You have unsaved changes')).toBeVisible();
      // default body copy is rendered
      await expect
        .element(page.getByText('Are you sure you want to leave this page without saving?'))
        .toBeVisible();
    });

    it('should render Leave anyway and Save and leave buttons', async () => {
      await setupGuardTest(true);

      await page.getByRole('button', { name: 'Go Away' }).click();

      await expect.element(page.getByRole('button', { name: 'Leave anyway' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save and leave' })).toBeVisible();
    });

    it('should navigate away when Leave anyway is clicked', async () => {
      await setupGuardTest(true);

      await page.getByRole('button', { name: 'Go Away' }).click();
      await page.getByRole('button', { name: 'Leave anyway' }).click();

      await expect.element(page.getByText('Other Page')).toBeVisible();
    });

    it('should call onSave and navigate when Save and leave is clicked', async () => {
      await setupGuardTest(true);

      await page.getByRole('button', { name: 'Go Away' }).click();
      await page.getByRole('button', { name: 'Save and leave' }).click();

      expect(onSave).toHaveBeenCalledOnce();
      await expect.element(page.getByText('Other Page')).toBeVisible();
    });

    it('should not show modal initially', async () => {
      await setupGuardTest(true);

      await expect.element(page.getByText('You have unsaved changes')).not.toBeInTheDocument();
    });
  });

  describe('when no unsaved changes', () => {
    it('should not show modal when navigating', async () => {
      await setupGuardTest(false);

      await page.getByRole('button', { name: 'Go Away' }).click();

      await expect.element(page.getByText('You have unsaved changes')).not.toBeInTheDocument();
      await expect.element(page.getByText('Other Page')).toBeVisible();
    });
  });

  describe('custom children', () => {
    function CustomLayout({ when }: { when: boolean }): React.ReactElement {
      return (
        <>
          <RouteLeavingGuard when={when} onSave={onSave}>
            <p>Custom body line</p>
          </RouteLeavingGuard>
          <Outlet />
        </>
      );
    }

    it('should render custom children when provided', async () => {
      await setupBrowserTest(
        <Routes>
          <Route element={<CustomLayout when={true} />}>
            <Route
              path="/"
              element={
                <>
                  <span>Home Page</span>
                  <NavigationTrigger label="Go Away" />
                </>
              }
            />
            <Route path="/other" element={<span>Other Page</span>} />
          </Route>
        </Routes>,
        { initialRouterEntry: '/' },
      );
      await expect.element(page.getByText('Home Page')).toBeVisible();

      await page.getByRole('button', { name: 'Go Away' }).click();

      await expect.element(page.getByText('Custom body line')).toBeVisible();
    });
  });
});
