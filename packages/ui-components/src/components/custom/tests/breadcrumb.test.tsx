/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';

import { BreadcrumbComponent } from '../breadcrumb-component';

const TRANSLATIONS: Record<string, string> = {
  home: 'Home',
  dashboard: 'Dashboard',
  domains: 'Domains',
  settings: 'Settings',
  users: 'Users',
  last_access: 'Last access',
};

function createI18nInstance(resources?: Record<string, string>) {
  const instance = i18next.createInstance();
  instance.init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: resources
          ? Object.fromEntries(Object.entries(resources).map(([k, v]) => [`label.${k}`, v]))
          : {},
      },
    },
  });
  return instance;
}

const dashboardRoute = 'dashboard';

type RenderOptions = {
  path?: string;
  lastLoginTimestamp?: string;
  translations?: Record<string, string>;
};

function renderBreadcrumb({
  path = '/dashboard',
  lastLoginTimestamp,
  translations,
}: RenderOptions = {}) {
  const i18n = createI18nInstance(translations);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <I18nextProvider i18n={i18n}>
        <BreadcrumbComponent
          dashboardRoute={dashboardRoute}
          lastLoginTimestamp={lastLoginTimestamp}
        />
      </I18nextProvider>
    </MemoryRouter>,
  );
}

function getAllDsTexts(): Array<HTMLElement> {
  return Array.from(document.querySelectorAll('ds-text'));
}

describe('BreadcrumbComponent', () => {
  describe('Home breadcrumb', () => {
    it('renders "Home" as the first breadcrumb for the dashboard route', () => {
      renderBreadcrumb({ path: '/dashboard', translations: TRANSLATIONS });
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
    });

    it('shows "Home" and "Dashboard" for the dashboard route', () => {
      renderBreadcrumb({ path: '/dashboard', translations: TRANSLATIONS });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Dashboard')).not.toBeNull();
    });

    it('does not show duplicate "Home" when only a single segment exists', () => {
      renderBreadcrumb({ path: '/dashboard', translations: TRANSLATIONS });
      expect(screen.getAllByText('Home').length).toBe(1);
    });

    it('does not show the additional "Home" label when multiple breadcrumbs exist', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      expect(screen.getAllByText('Home').length).toBe(1);
    });
  });

  describe('Breadcrumb trail building', () => {
    it('shows capitalized segment name when translation is unavailable', () => {
      renderBreadcrumb({ path: '/dashboard/unknown-segment' });
      expect(screen.getByText('Unknown-segment')).not.toBeNull();
      expect(screen.getAllByText('Home').length).toBe(1);
    });

    it('prefers translated label over raw segment name', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Domains')).not.toBeNull();
    });

    it('handles deep nesting with a mix of translated and untranslated segments', () => {
      renderBreadcrumb({
        path: '/dashboard/domains/unknown/settings',
        translations: TRANSLATIONS,
      });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Domains')).not.toBeNull();
      expect(screen.getByText('Unknown')).not.toBeNull();
      expect(screen.getByText('Settings')).not.toBeNull();
    });

    it('builds incremental paths for each breadcrumb level', () => {
      renderBreadcrumb({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Domains')).not.toBeNull();
      expect(screen.getByText('Users')).not.toBeNull();
    });

    it('shows capitalized segment names when no translations are available', () => {
      renderBreadcrumb({ path: '/manage/subscriptions' });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Subscriptions')).not.toBeNull();
    });
  });

  describe('Last access timestamp', () => {
    it('shows "Last access" with the timestamp when lastLoginTimestamp is provided', () => {
      renderBreadcrumb({
        path: '/dashboard',
        translations: TRANSLATIONS,
        lastLoginTimestamp: '2024-01-15 10:30',
      });
      expect(screen.getByText(/Last access 2024-01-15 10:30/)).not.toBeNull();
    });

    it('does not show "Last access" when lastLoginTimestamp is omitted', () => {
      renderBreadcrumb({ path: '/dashboard', translations: TRANSLATIONS });
      expect(screen.queryByText(/Last access/)).toBeNull();
    });

    it('does not show "Last access" when lastLoginTimestamp is empty string', () => {
      renderBreadcrumb({
        path: '/dashboard',
        translations: TRANSLATIONS,
        lastLoginTimestamp: '',
      });
      expect(screen.queryByText(/Last access/)).toBeNull();
    });
  });

  describe('Styling', () => {
    it('styles the last breadcrumb item with gray0 color', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const domainsText = screen.getByText('Domains');
      const dsText = domainsText.closest('ds-text') as HTMLElement | null;
      expect(dsText).not.toBeNull();
      const style = dsText!.getAttribute('style') ?? '';
      expect(style).toContain('var(--color-gray0-regular)');
    });

    it('does not apply pointer cursor to the last breadcrumb item', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const domainsText = screen.getByText('Domains');
      const dsText = domainsText.closest('ds-text') as HTMLElement | null;
      const style = dsText!.getAttribute('style') ?? '';
      expect(style).not.toContain('pointer');
    });

    it('styles non-last breadcrumb items with secondary color', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const homeText = screen.getByText('Home');
      const dsText = homeText.closest('ds-text') as HTMLElement | null;
      expect(dsText).not.toBeNull();
      const color = dsText!.getAttribute('color') ?? '';
      expect(color).toBe('#cccccc');
    });

    it('renders "/" separator between breadcrumb items', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const allDsTexts = getAllDsTexts();
      const separatorElements = allDsTexts.filter(
        (el) => el.textContent?.includes('/') && el.getAttribute('color') === '#cccccc',
      );
      expect(separatorElements.length).toBe(1);
    });

    it('does not render separator after the last breadcrumb item', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const allDsTexts = getAllDsTexts();
      const afterDomains = allDsTexts.findIndex((el) => el.textContent === 'Domains');
      const remainingTexts = allDsTexts.slice(afterDomains + 1);
      const hasSeparatorAfter = remainingTexts.some((el) => el.textContent?.trim() === '/');
      expect(hasSeparatorAfter).toBe(false);
    });

    it('renders separators between all pairs for a 3-level breadcrumb', () => {
      renderBreadcrumb({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      const allDsTexts = getAllDsTexts();
      const separatorElements = allDsTexts.filter(
        (el) => el.textContent?.includes('/') && el.getAttribute('color') === '#cccccc',
      );
      expect(separatorElements.length).toBe(2);
    });
  });
});
