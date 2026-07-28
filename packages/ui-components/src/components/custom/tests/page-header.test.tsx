/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { useLastLoginTimestamp, useModuleCrumbMenu } from '@zextras/ui-shared';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, useLocation } from 'react-router';

import breadcrumbStyles from '../breadcrumb-component.module.css';
import { type CrumbMenuItem,PageHeader } from '../page-header';

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
  crumbMenus?: Record<string, Array<CrumbMenuItem>>;
  moduleCrumbMenu?: Array<CrumbMenuItem>;
  nonNavigableSegments?: Array<string>;
  labelOverrides?: Record<string, string>;
};

function renderPageHeader({
  path = '/dashboard',
  lastLoginTimestamp,
  translations,
  crumbMenus,
  moduleCrumbMenu = [],
  nonNavigableSegments,
  labelOverrides,
}: RenderOptions = {}) {
  vi.mocked(useLastLoginTimestamp).mockReturnValue({ data: lastLoginTimestamp } as never);
  vi.mocked(useModuleCrumbMenu).mockReturnValue(moduleCrumbMenu as never);
  const i18n = createI18nInstance(translations);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <I18nextProvider i18n={i18n}>
        <PageHeader
          crumbMenus={crumbMenus}
          nonNavigableSegments={nonNavigableSegments}
          labelOverrides={labelOverrides}
        />
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

describe('PageHeader', () => {
  describe('Home breadcrumb', () => {
    it('renders "Home" as the first breadcrumb for the dashboard route', () => {
      renderPageHeader({ path: '/dashboard', translations: TRANSLATIONS });
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
    });

    it('shows "Home" and "Dashboard" for the dashboard route', () => {
      renderPageHeader({ path: '/dashboard', translations: TRANSLATIONS });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Dashboard')).not.toBeNull();
    });

    it('does not show duplicate "Home" when only a single segment exists', () => {
      renderPageHeader({ path: '/dashboard', translations: TRANSLATIONS });
      expect(screen.getAllByText('Home').length).toBe(1);
    });

    it('does not show the additional "Home" label when multiple breadcrumbs exist', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      expect(screen.getAllByText('Home').length).toBe(1);
    });
  });

  describe('Breadcrumb trail building', () => {
    it('shows capitalized segment name when translation is unavailable', () => {
      renderPageHeader({ path: '/dashboard/unknown-segment' });
      expect(screen.getByText('Unknown-segment')).not.toBeNull();
      expect(screen.getAllByText('Home').length).toBe(1);
    });

    it('prefers translated label over raw segment name', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Domains')).not.toBeNull();
    });

    it('handles deep nesting with a mix of translated and untranslated segments', () => {
      renderPageHeader({
        path: '/dashboard/domains/unknown/settings',
        translations: TRANSLATIONS,
      });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Domains')).not.toBeNull();
      expect(screen.getByText('Unknown')).not.toBeNull();
      expect(screen.getByText('Settings')).not.toBeNull();
    });

    it('builds incremental paths for each breadcrumb level', () => {
      renderPageHeader({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Domains')).not.toBeNull();
      expect(screen.getByText('Users')).not.toBeNull();
    });

    it('shows capitalized segment names when no translations are available', () => {
      renderPageHeader({ path: '/manage/subscriptions' });
      expect(screen.getByText('Home')).not.toBeNull();
      expect(screen.getByText('Subscriptions')).not.toBeNull();
    });
  });

  describe('Last access timestamp', () => {
    it('shows "Last access" with the timestamp when lastLoginTimestamp is provided', () => {
      renderPageHeader({
        path: '/dashboard',
        translations: TRANSLATIONS,
        lastLoginTimestamp: '2024-01-15 10:30',
      });
      expect(screen.getByText(/Last access 2024-01-15 10:30/)).not.toBeNull();
    });

    it('does not show "Last access" when lastLoginTimestamp is omitted', () => {
      renderPageHeader({ path: '/dashboard', translations: TRANSLATIONS });
      expect(screen.queryByText(/Last access/)).toBeNull();
    });

    it('does not show "Last access" when lastLoginTimestamp is empty string', () => {
      renderPageHeader({
        path: '/dashboard',
        translations: TRANSLATIONS,
        lastLoginTimestamp: '',
      });
      expect(screen.queryByText(/Last access/)).toBeNull();
    });
  });

  describe('Styling', () => {
    it('applies the current-item class to the last breadcrumb item', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const domainsText = screen.getByText('Domains');
      const dsText = domainsText.closest('ds-text') as HTMLElement | null;
      expect(dsText).not.toBeNull();
      expect(dsText!.className).toContain(breadcrumbStyles.labelCurrent);
    });

    it('does not apply pointer cursor to the last breadcrumb item', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const domainsText = screen.getByText('Domains');
      const dsText = domainsText.closest('ds-text') as HTMLElement | null;
      const style = dsText!.getAttribute('style') ?? '';
      expect(style).not.toContain('pointer');
    });

    it('applies the secondary color class to non-last breadcrumb items', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const homeText = screen.getByText('Home');
      const dsText = homeText.closest('ds-text') as HTMLElement | null;
      expect(dsText).not.toBeNull();
      expect(dsText!.className).toContain(breadcrumbStyles.label);
    });

    it('renders "/" separator between breadcrumb items', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const allDsTexts = getAllDsTexts();
      const separatorElements = allDsTexts.filter(
        (el) => el.textContent?.includes('/') && el.closest('[aria-hidden="true"]') != null,
      );
      expect(separatorElements.length).toBe(1);
    });

    it('does not render separator after the last breadcrumb item', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const allDsTexts = getAllDsTexts();
      const afterDomains = allDsTexts.findIndex((el) => el.textContent === 'Domains');
      const remainingTexts = allDsTexts.slice(afterDomains + 1);
      const hasSeparatorAfter = remainingTexts.some((el) => el.textContent?.trim() === '/');
      expect(hasSeparatorAfter).toBe(false);
    });

    it('renders separators between all pairs for a 3-level breadcrumb', () => {
      renderPageHeader({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      const allDsTexts = getAllDsTexts();
      const separatorElements = allDsTexts.filter(
        (el) => el.textContent?.includes('/') && el.closest('[aria-hidden="true"]') != null,
      );
      expect(separatorElements.length).toBe(2);
    });

    it('applies pointer cursor to non-last breadcrumb items', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const dsText = screen.getByText('Home').closest('ds-text') as HTMLElement | null;
      const style = dsText!.getAttribute('style') ?? '';
      expect(style).toContain('pointer');
    });

    it('keeps the last (current) crumb non-interactive', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      const dsText = screen.getByText('Domains').closest('ds-text') as HTMLElement | null;
      expect(dsText!.getAttribute('role')).toBeNull();
      expect(dsText!.getAttribute('tabindex')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('navigates to the crumb path when a non-last crumb is clicked', () => {
      renderPageHeader({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      fireEvent.click(screen.getByText('Domains'));
      expect(screen.getByTestId('location').textContent).toBe('/dashboard/domains');
    });

    it('navigates to the dashboard (homePath) when the Home crumb is clicked', () => {
      renderPageHeader({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      fireEvent.click(screen.getByText('Home'));
      expect(screen.getByTestId('location').textContent).toBe('/dashboard');
    });

    it('does not navigate when the current (last) crumb is clicked', () => {
      renderPageHeader({ path: '/dashboard/domains', translations: TRANSLATIONS });
      fireEvent.click(screen.getByText('Domains'));
      expect(screen.getByTestId('location').textContent).toBe('/dashboard/domains');
    });

    it('activates navigation with the Enter key on a non-last crumb', () => {
      renderPageHeader({ path: '/dashboard/domains/users', translations: TRANSLATIONS });
      const domains = screen.getByText('Domains').closest('ds-text') as HTMLElement;
      fireEvent.keyDown(domains, { key: 'Enter' });
      expect(screen.getByTestId('location').textContent).toBe('/dashboard/domains');
    });
  });

  describe('Section dropdown', () => {
    const menus: Record<string, Array<CrumbMenuItem>> = {
      '/dashboard/domains': [
        { path: '/dashboard/domains', label: 'Domains' },
        { path: '/dashboard/settings', label: 'Settings' },
      ],
    };

    it('renders a dropdown caret on the crumb that has a menu', () => {
      renderPageHeader({
        path: '/dashboard/domains',
        translations: TRANSLATIONS,
        crumbMenus: menus,
      });
      expect(screen.getByRole('button', { name: 'Show sections' })).not.toBeNull();
    });

    it('renders a single caret (none on crumbs without a menu)', () => {
      renderPageHeader({
        path: '/dashboard/domains',
        translations: TRANSLATIONS,
        crumbMenus: menus,
      });
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('opens the menu and highlights the current route when the caret is clicked', () => {
      renderPageHeader({
        path: '/dashboard/domains',
        translations: TRANSLATIONS,
        crumbMenus: menus,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Show sections' }));
      const items = screen.getAllByTestId('dropdown-item');
      expect(items).toHaveLength(2);
      const selected = items.filter((el) => el.classList.contains('zapp-selected'));
      expect(selected).toHaveLength(1);
      expect(selected[0]!.textContent).toBe('Domains');
    });

    it('navigates to the selected route when a menu item is clicked', () => {
      renderPageHeader({
        path: '/dashboard/domains',
        translations: TRANSLATIONS,
        crumbMenus: menus,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Show sections' }));
      const items = screen.getAllByTestId('dropdown-item');
      fireEvent.click(items[1]!);
      expect(screen.getByTestId('location').textContent).toBe('/dashboard/settings');
    });

    it('renders section menu items in alphabetical order by label', () => {
      const unordered: Record<string, Array<CrumbMenuItem>> = {
        '/dashboard/domains': [
          { path: '/dashboard/domains/zebra', label: 'Zebra' },
          { path: '/dashboard/domains/apple', label: 'Apple' },
          { path: '/dashboard/domains/mango', label: 'Mango' },
        ],
      };
      renderPageHeader({
        path: '/dashboard/domains',
        translations: TRANSLATIONS,
        crumbMenus: unordered,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Show sections' }));
      const labels = screen.getAllByTestId('dropdown-item').map((el) => el.textContent);
      expect(labels).toEqual(['Apple', 'Mango', 'Zebra']);
    });

    it('shows a checkmark on the selected dropdown item only', () => {
      renderPageHeader({
        path: '/dashboard/domains',
        translations: TRANSLATIONS,
        crumbMenus: menus,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Show sections' }));
      const items = screen.getAllByTestId('dropdown-item');
      const selected = items.filter((el) => el.classList.contains('zapp-selected'));
      expect(selected).toHaveLength(1);
      expect(selected[0]!.querySelector('ds-icon[icon="IconCheckbox"]')).not.toBeNull();
      expect(selected[0]!.getAttribute('style')).toContain('Highlight-Light-Regular');
      const unselected = items.filter((el) => !el.classList.contains('zapp-selected'));
      expect(unselected[0]!.querySelector('ds-icon[icon="IconCheckbox"]')).toBeNull();
    });
  });

  describe('Module dropdown', () => {
    const moduleTranslations: Record<string, string> = {
      ...TRANSLATIONS,
      storage: 'Storage',
      servers_list: 'Servers List',
      cos: 'COS',
    };

    const moduleMenu: Array<CrumbMenuItem> = [
      { path: '/manage/storage', label: 'Storage' },
      { path: '/manage/domains', label: 'Domains' },
      { path: '/services/backup', label: 'Backup' },
    ];

    it('renders a dropdown caret on the module-level crumb', () => {
      renderPageHeader({
        path: '/manage/storage/servers_list',
        translations: moduleTranslations,
        moduleCrumbMenu: moduleMenu,
      });
      expect(screen.getByRole('button', { name: 'Show sections' })).not.toBeNull();
    });

    it('opens the module menu showing all modules across sections', () => {
      renderPageHeader({
        path: '/manage/storage',
        translations: moduleTranslations,
        moduleCrumbMenu: moduleMenu,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Show sections' }));
      const items = screen.getAllByTestId('dropdown-item');
      expect(items).toHaveLength(3);
      const labels = items.map((el) => el.textContent);
      expect(labels).toContain('Backup');
      expect(labels).toContain('Storage');
      const selected = items.filter((el) => el.classList.contains('zapp-selected'));
      expect(selected).toHaveLength(1);
      expect(selected[0]!.textContent).toBe('Storage');
    });

    it('navigates to a module in a different section when clicked', () => {
      renderPageHeader({
        path: '/manage/storage/servers_list',
        translations: moduleTranslations,
        moduleCrumbMenu: moduleMenu,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Show sections' }));
      const items = screen.getAllByTestId('dropdown-item');
      const backupItem = items.find((el) => el.textContent === 'Backup')!;
      fireEvent.click(backupItem);
      expect(screen.getByTestId('location').textContent).toBe('/services/backup');
    });

    it('highlights the current module as selected on a deep path', () => {
      renderPageHeader({
        path: '/manage/domains/global/settings',
        translations: moduleTranslations,
        moduleCrumbMenu: [
          { path: '/manage/domains', label: 'Domains' },
          { path: '/services/backup', label: 'Backup' },
        ],
      });
      fireEvent.click(screen.getByRole('button', { name: 'Show sections' }));
      const items = screen.getAllByTestId('dropdown-item');
      const selected = items.filter((el) => el.classList.contains('zapp-selected'));
      expect(selected).toHaveLength(1);
      expect(selected[0]!.textContent).toBe('Domains');
    });

    it('shows the dropdown on the dashboard page', () => {
      renderPageHeader({
        path: '/dashboard',
        translations: moduleTranslations,
        moduleCrumbMenu: [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/manage/domains', label: 'Domains' },
        ],
      });
      expect(screen.getByRole('button', { name: 'Show sections' })).not.toBeNull();
    });

    it('does not render a caret when there are no sibling modules', () => {
      renderPageHeader({
        path: '/manage/storage/servers_list',
        translations: moduleTranslations,
      });
      expect(screen.queryByRole('button', { name: 'Show sections' })).toBeNull();
    });
  });

  describe('Non-navigable segments', () => {
    const translations: Record<string, string> = {
      ...TRANSLATIONS,
      global: 'Global',
    };

    it('makes a non-navigable segment non-interactive (no role, no tabIndex, no pointer)', () => {
      renderPageHeader({
        path: '/manage/domains/global/domains',
        translations,
        nonNavigableSegments: ['global'],
      });
      const globalText = screen.getByText('Global').closest('ds-text') as HTMLElement;
      expect(globalText.getAttribute('role')).toBeNull();
      expect(globalText.getAttribute('tabindex')).toBeNull();
      const style = globalText.getAttribute('style') ?? '';
      expect(style).not.toContain('pointer');
    });

    it('applies the labelCurrent class to a non-navigable segment', () => {
      renderPageHeader({
        path: '/manage/domains/global/domains',
        translations,
        nonNavigableSegments: ['global'],
      });
      const globalText = screen.getByText('Global').closest('ds-text') as HTMLElement;
      expect(globalText.className).toContain(breadcrumbStyles.labelCurrent);
    });

    it('still renders the separator after a non-navigable segment', () => {
      renderPageHeader({
        path: '/manage/domains/global/domains',
        translations,
        nonNavigableSegments: ['global'],
      });
      const allDsTexts = getAllDsTexts();
      const globalIndex = allDsTexts.findIndex((el) => el.textContent === 'Global');
      const afterGlobal = allDsTexts.slice(globalIndex + 1);
      const hasSeparator = afterGlobal.some(
        (el) => el.textContent?.includes('/') && el.closest('[aria-hidden="true"]') != null,
      );
      expect(hasSeparator).toBe(true);
    });

    it('keeps other crumbs clickable when one is non-navigable', () => {
      renderPageHeader({
        path: '/manage/domains/global/domains',
        translations,
        nonNavigableSegments: ['global'],
      });
      const domainsText = screen.getAllByText('Domains')[0]!.closest('ds-text') as HTMLElement;
      const style = domainsText.getAttribute('style') ?? '';
      expect(style).toContain('pointer');
      expect(domainsText.getAttribute('role')).toBe('link');
    });

    it('does not navigate when a non-navigable crumb is clicked', () => {
      renderPageHeader({
        path: '/manage/domains/global/domains',
        translations,
        nonNavigableSegments: ['global'],
      });
      fireEvent.click(screen.getByText('Global'));
      expect(screen.getByTestId('location').textContent).toBe('/manage/domains/global/domains');
    });
  });

  describe('Label overrides', () => {
    const translations: Record<string, string> = {
      ...TRANSLATIONS,
      accounts: 'Accounts',
    };
    const domainId = 'cb671926-996b-4adc-95a5-6d4956dff68c';

    it('replaces a UUID segment with the overridden label', () => {
      renderPageHeader({
        path: `/manage/domains/${domainId}/accounts`,
        translations,
        labelOverrides: { [domainId]: 'example.com' },
        nonNavigableSegments: [domainId],
      });
      expect(screen.getByText('example.com')).not.toBeNull();
      expect(screen.queryByText('Cb671926-996b-4adc-95a5-6d4956dff68c')).toBeNull();
    });

    it('does not affect other segments', () => {
      renderPageHeader({
        path: `/manage/domains/${domainId}/accounts`,
        translations,
        labelOverrides: { [domainId]: 'example.com' },
        nonNavigableSegments: [domainId],
      });
      expect(screen.getByText('Accounts')).not.toBeNull();
      expect(screen.getAllByText('Domains').length).toBeGreaterThanOrEqual(1);
    });

    it('renders the overridden label as non-clickable when also in nonNavigableSegments', () => {
      renderPageHeader({
        path: `/manage/domains/${domainId}/accounts`,
        translations,
        labelOverrides: { [domainId]: 'example.com' },
        nonNavigableSegments: [domainId],
      });
      const domainText = screen.getByText('example.com').closest('ds-text') as HTMLElement;
      expect(domainText.getAttribute('role')).toBeNull();
      expect(domainText.getAttribute('tabindex')).toBeNull();
      expect(domainText.className).toContain(breadcrumbStyles.labelCurrent);
    });
  });
});
