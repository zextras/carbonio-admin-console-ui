/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { useLastLoginTimestamp } from '@zextras/ui-shared';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, useLocation } from 'react-router';

import styles from '../breadcrumb-component.module.css';
import { Breadcrumbs } from '../breadcrumbs';

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
  vi.mocked(useLastLoginTimestamp).mockReturnValue({ data: lastLoginTimestamp } as never);
  const i18n = createI18nInstance(translations);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <I18nextProvider i18n={i18n}>
        <Breadcrumbs />
        <LocationProbe />
      </I18nextProvider>
    </MemoryRouter>,
  );
}

function getAllDsTexts(): Array<HTMLElement> {
  return Array.from(document.querySelectorAll('ds-text'));
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
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
    it('applies the current-item class to the last breadcrumb item', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const domainsText = screen.getByText('Domains');
      const dsText = domainsText.closest('ds-text') as HTMLElement | null;
      expect(dsText).not.toBeNull();
      expect(dsText!.className).toContain(styles.labelCurrent);
    });

    it('does not apply pointer cursor to the last breadcrumb item', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const domainsText = screen.getByText('Domains');
      const dsText = domainsText.closest('ds-text') as HTMLElement | null;
      const style = dsText!.getAttribute('style') ?? '';
      expect(style).not.toContain('pointer');
    });

    it('applies the secondary color class to non-last breadcrumb items', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const homeText = screen.getByText('Home');
      const dsText = homeText.closest('ds-text') as HTMLElement | null;
      expect(dsText).not.toBeNull();
      expect(dsText!.className).toContain(styles.label);
    });

    it('renders "/" separator between breadcrumb items', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const allDsTexts = getAllDsTexts();
      const separatorElements = allDsTexts.filter(
        (el) => el.textContent?.includes('/') && el.closest('[aria-hidden="true"]') != null,
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
        (el) => el.textContent?.includes('/') && el.closest('[aria-hidden="true"]') != null,
      );
      expect(separatorElements.length).toBe(2);
    });

    it('applies pointer cursor to non-last breadcrumb items', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const dsText = screen.getByText('Home').closest('ds-text') as HTMLElement | null;
      const style = dsText!.getAttribute('style') ?? '';
      expect(style).toContain('pointer');
    });

    it('keeps the last (current) crumb non-interactive', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const dsText = screen.getByText('Domains').closest('ds-text') as HTMLElement | null;
      expect(dsText!.getAttribute('role')).toBeNull();
      expect(dsText!.getAttribute('tabindex')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('navigates to the crumb path when a non-last crumb is clicked', () => {
      renderBreadcrumb({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      fireEvent.click(screen.getByText('Domains'));
      expect(screen.getByTestId('location').textContent).toBe('/dashboard/domains');
    });

    it('navigates to the dashboard (homePath) when the Home crumb is clicked', () => {
      renderBreadcrumb({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      fireEvent.click(screen.getByText('Home'));
      expect(screen.getByTestId('location').textContent).toBe('/dashboard');
    });

    it('does not navigate when the current (last) crumb is clicked', () => {
      renderBreadcrumb({ path: '/dashboard/domains', translations: TRANSLATIONS });
      fireEvent.click(screen.getByText('Domains'));
      expect(screen.getByTestId('location').textContent).toBe('/dashboard/domains');
    });

    it('activates navigation with the Enter key on a non-last crumb', () => {
      renderBreadcrumb({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      const domains = screen.getByText('Domains').closest('ds-text') as HTMLElement;
      fireEvent.keyDown(domains, { key: 'Enter' });
      expect(screen.getByTestId('location').textContent).toBe('/dashboard/domains');
    });
  });
});
