/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { AccountContext } from '../../account-context';
import EditAccountContactsSection from '../edit-account-contacts-section';

const mockAccountDetail = {
  zimbraId: 'account-123',
  name: 'testuser@example.com',
  telephoneNumber: '',
  homePhone: '',
  mobile: '',
  pager: '',
  facsimileTelephoneNumber: '',
  company: '',
  title: '',
  co: '',
  st: '',
  l: '',
  postalCode: '',
  street: '',
};

const mockContextValue = {
  accountDetail: mockAccountDetail,
  setAccountDetail: vi.fn(),
  initAccountDetail: mockAccountDetail,
  setInitAccountDetail: vi.fn(),
  accSpecificDetail: {},
  setAccSpecificDetail: vi.fn(),
  cosDetail: {},
  directMemberList: [],
  inDirectMemberList: [],
  setSignatureItems: vi.fn(),
  setSignatureList: vi.fn(),
  setDirectMemberList: vi.fn(),
  setInDirectMemberList: vi.fn(),
  otpList: [],
  identitiesList: [],
  folderList: [],
  setFolderList: vi.fn(),
  getListOtp: vi.fn(),
  getIdentitiesList: vi.fn(),
  deligateDetail: {},
  setDeligateDetail: vi.fn(),
  credentialList: [],
  getCredentialList: vi.fn(),
  initialGlobalRights: {},
  setinitialGlobalRights: vi.fn(),
  globalRights: {},
  setGlobalRights: vi.fn(),
  deleteAdministrationRights: [],
  setDeleteAdministrationRights: vi.fn(),
  userSessionList: [],
  setAllUserSessionList: vi.fn(),
  allUserSessionList: [],
  setUserSessionList: vi.fn(),
  defaultCOS: {},
  setDefaultCOS: vi.fn(),
  allowedDeletePassword: false,
  setAllowedDeletePassword: vi.fn(),
};

function setupTest(contextOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();
  const context = { ...mockContextValue, ...contextOverrides };

  return setupBrowserTest(
    <AccountContext.Provider value={context as any}>
      <EditAccountContactsSection />
    </AccountContext.Provider>,
    { queryClient },
  );
}

describe('EditAccountContactsSection (browser)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render Phone section header', async () => {
      setupTest();

      await expect.element(page.getByText('Phone', { exact: true }).first()).toBeVisible();
    });

    it('should render Company section header', async () => {
      setupTest();

      await expect.element(page.getByText('Company', { exact: true }).first()).toBeVisible();
    });

    it('should render Address section header', async () => {
      setupTest();

      await expect.element(page.getByText('Address', { exact: true }).first()).toBeVisible();
    });

    it('should render all phone input fields', async () => {
      setupTest();

      await expect.element(page.getByLabelText('Phone')).toBeVisible();
      await expect.element(page.getByLabelText('Home')).toBeVisible();
      await expect.element(page.getByLabelText('Mobile')).toBeVisible();
      await expect.element(page.getByLabelText('Pager')).toBeVisible();
      await expect.element(page.getByLabelText('Fax Number')).toBeVisible();
    });

    it('should render company input fields', async () => {
      setupTest();

      await expect.element(page.getByLabelText('Company')).toBeVisible();
      await expect.element(page.getByLabelText('Job Title')).toBeVisible();
    });

    it('should render address input fields', async () => {
      setupTest();

      await expect.element(page.getByLabelText('Country')).toBeVisible();
      await expect.element(page.getByLabelText('State')).toBeVisible();
      await expect.element(page.getByLabelText('City')).toBeVisible();
      await expect.element(page.getByLabelText('Postal Code')).toBeVisible();
      await expect.element(page.getByLabelText('Address')).toBeVisible();
    });
  });

  describe('Phone Field Input', () => {
    it('should call setAccountDetail when valid phone number is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const phoneInput = page.getByLabelText('Phone');
      await userEvent.type(phoneInput, '+1234567890');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should call setAccountDetail when home phone is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const homeInput = page.getByLabelText('Home');
      await userEvent.type(homeInput, '+1234567890');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should call setAccountDetail when mobile is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const mobileInput = page.getByLabelText('Mobile');
      await userEvent.type(mobileInput, '+1234567890');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should call setAccountDetail when pager is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const pagerInput = page.getByLabelText('Pager');
      await userEvent.type(pagerInput, '+1234567890');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should call setAccountDetail when fax is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const faxInput = page.getByLabelText('Fax Number');
      await userEvent.type(faxInput, '+1234567890');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should allow clearing phone field', async () => {
      const setAccountDetail = vi.fn();
      setupTest({
        setAccountDetail,
        accountDetail: { ...mockAccountDetail, telephoneNumber: '+1234567890' },
      });

      const phoneInput = page.getByLabelText('Phone');
      await userEvent.clear(phoneInput);

      expect(setAccountDetail).toHaveBeenCalled();
    });
  });

  describe('Company Fields Input', () => {
    it('should call setAccountDetail when company is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const companyInput = page.getByLabelText('Company');
      await userEvent.type(companyInput, 'Zextras');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should call setAccountDetail when job title is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const titleInput = page.getByLabelText('Job Title');
      await userEvent.type(titleInput, 'Developer');

      expect(setAccountDetail).toHaveBeenCalled();
    });
  });

  describe('Address Fields Input', () => {
    it('should call setAccountDetail when country is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const countryInput = page.getByLabelText('Country');
      await userEvent.type(countryInput, 'Italy');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should call setAccountDetail when state is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const stateInput = page.getByLabelText('State');
      await userEvent.type(stateInput, 'Lombardy');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should call setAccountDetail when city is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const cityInput = page.getByLabelText('City');
      await userEvent.type(cityInput, 'Milan');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should call setAccountDetail when postal code is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const postalInput = page.getByLabelText('Postal Code');
      await userEvent.type(postalInput, '20100');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should call setAccountDetail when address is entered', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail });

      const addressInput = page.getByLabelText('Address');
      await userEvent.type(addressInput, 'Via Roma 1');

      expect(setAccountDetail).toHaveBeenCalled();
    });
  });

  describe('Pre-filled Values', () => {
    it('should display pre-filled phone number', async () => {
      setupTest({
        accountDetail: { ...mockAccountDetail, telephoneNumber: '+39123456789' },
      });

      const phoneInput = page.getByLabelText('Phone');
      await expect.element(phoneInput).toHaveValue('+39123456789');
    });

    it('should display pre-filled company', async () => {
      setupTest({
        accountDetail: { ...mockAccountDetail, company: 'Zextras SRL' },
      });

      const companyInput = page.getByLabelText('Company');
      await expect.element(companyInput).toHaveValue('Zextras SRL');
    });

    it('should display pre-filled address fields', async () => {
      setupTest({
        accountDetail: {
          ...mockAccountDetail,
          co: 'Italy',
          st: 'Lombardy',
          l: 'Milan',
          postalCode: '20100',
          street: 'Via Roma 1',
        },
      });

      await expect.element(page.getByLabelText('Country')).toHaveValue('Italy');
      await expect.element(page.getByLabelText('State')).toHaveValue('Lombardy');
      await expect.element(page.getByLabelText('City')).toHaveValue('Milan');
      await expect.element(page.getByLabelText('Postal Code')).toHaveValue('20100');
      await expect.element(page.getByLabelText('Address')).toHaveValue('Via Roma 1');
    });
  });
});
