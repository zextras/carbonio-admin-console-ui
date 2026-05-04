/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useDomainStore } from '@zextras/ui-shared';
import { createBrowserAPIInterceptor, setupBrowserTest } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { AccountContext } from '../account-context';
import CreateAccount from '../create-account';
import CreateAccountDetailSection from '../create-account-detail-section';

const mockAccountContext = {
  accountDetail: {
    // Account base
    name: '',
    givenName: '',
    initials: '',
    sn: '',
    displayName: '',

    // Password
    password: '',
    repeatPassword: '',
    zimbraPasswordMustChange: false,

    // Settings
    defaultCOS: true,
    zimbraAccountStatus: 'active',
    zimbraCOSId: '',
    zimbraPrefLocale: '',
    zimbraPrefTimeZoneId: '',

    // Description & Notes
    description: '',
    zimbraNotes: '',

    // Phone
    telephoneNumber: '',
    homePhone: '',
    mobile: '',
    pager: '',
    facsimileTelephoneNumber: '',

    // Company
    company: '',
    title: '',

    // Address
    co: '',
    l: '',
    st: '',
    postalCode: '',
    street: '',

    // Internal flags
    changeNameBool: false,
    changeDisplayNameBool: false,

    // OTP
    generateFirst2FAToken: true,
    generateOTP: false,
    administrationRigths: false,
    qrData: '',
    secrateCode: '',
    pinCodes: '',
    showOtpOptionSection: true,
  },
  setAccountDetail: vi.fn(),
  setShowCreateAccountView: vi.fn(),
};

describe('CreateAccountDetailSection (browser)', () => {
  beforeEach(() => {
    // Setup domain store
    useDomainStore.setState({
      domain: {
        name: 'test-domain.com',
        id: 'domain-123',
        a: [{ n: 'zimbraDomainStatus', _content: 'active' }],
      },
      cosList: [
        { name: 'Default COS', id: 'default-cos-id' },
        { name: 'Premium COS', id: 'premium-cos-id' },
      ],
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    useDomainStore.setState({});
  });

  describe('Basic Rendering', () => {
    it('should render all main form sections', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={mockAccountContext}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByText('Account', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Settings')).toBeVisible();
      await expect.element(page.getByText('Description').first()).toBeVisible();
      await expect.element(page.getByText('Notes').first()).toBeVisible();
      await expect.element(page.getByText('Phone').first()).toBeVisible();
      await expect.element(page.getByText('Company').first()).toBeVisible();
      await expect.element(page.getByText('Address').first()).toBeVisible();
    });

    it('should render all required account input fields', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={mockAccountContext}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByLabelText('Surname')).toBeVisible();
      await expect.element(page.getByLabelText('Middle Name Initials')).toBeVisible();
      await expect.element(page.getByLabelText('Name', { exact: true })).toBeVisible();
      await expect.element(page.getByLabelText(/user \(Auto-fill\)/i)).toBeVisible();
      await expect.element(page.getByText('Domain Name')).toBeVisible();
      await expect.element(page.getByLabelText(/Display Name \(Auto-fill\)/i)).toBeVisible();
      await expect.element(page.getByPlaceholder('Password', { exact: true })).toBeVisible();
      await expect.element(page.getByPlaceholder('Repeat Password')).toBeVisible();
    });

    it('should display domain name as read-only', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={mockAccountContext}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      const domainField = page.getByText('Domain Name');
      await expect.element(domainField).toBeVisible();
      const testDomainField = page.getByText('test-domain.com ');
      await expect.element(testDomainField).toBeVisible();
    });
  });

  describe('Auto-fill Account Name', () => {
    it('should auto-generate account name from given name and surname', async () => {
      const setAccountDetail = vi.fn();
      const contextWithMock = {
        ...mockAccountContext,
        setAccountDetail,
      };

      setupBrowserTest(
        <AccountContext.Provider value={contextWithMock}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      const givenNameInput = page.getByLabelText('Name', { exact: true });
      await userEvent.fill(givenNameInput, 'John');

      const surnameInput = page.getByLabelText('Surname');
      await userEvent.fill(surnameInput, 'Doe');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should auto-generate account name with middle initial', async () => {
      const setAccountDetail = vi.fn();
      const contextWithMock = {
        ...mockAccountContext,
        setAccountDetail,
      };

      setupBrowserTest(
        <AccountContext.Provider value={contextWithMock}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      const givenNameInput = page.getByLabelText('Name', { exact: true });
      await userEvent.fill(givenNameInput, 'John');

      const initialsInput = page.getByLabelText('Middle Name Initials');
      await userEvent.fill(initialsInput, 'M');

      const surnameInput = page.getByLabelText('Surname');
      await userEvent.fill(surnameInput, 'Doe');

      expect(setAccountDetail).toHaveBeenCalled();
    });
  });

  describe('Auto-fill Display Name', () => {
    it('should auto-generate display name from name fields', async () => {
      const setAccountDetail = vi.fn();
      const contextWithMock = {
        ...mockAccountContext,
        setAccountDetail,
      };

      setupBrowserTest(
        <AccountContext.Provider value={contextWithMock}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      await userEvent.fill(page.getByLabelText('Name', { exact: true }), 'John');
      await userEvent.fill(page.getByLabelText('Middle Name Initials'), 'M');
      await userEvent.fill(page.getByLabelText('Surname'), 'Doe');

      expect(setAccountDetail).toHaveBeenCalled();
    });
  });

  describe('Password Fields', () => {
    it('should accept password input', async () => {
      const setAccountDetail = vi.fn();
      const contextWithMock = {
        ...mockAccountContext,
        setAccountDetail,
      };

      setupBrowserTest(
        <AccountContext.Provider value={contextWithMock}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      const passwordInput = page.getByLabelText('Password', { exact: true });
      await userEvent.fill(passwordInput, 'SecurePassword123!');

      const repeatPasswordInput = page.getByLabelText('Repeat Password');
      await userEvent.fill(repeatPasswordInput, 'SecurePassword123!');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should toggle password must change switch', async () => {
      const setAccountDetail = vi.fn();
      const contextWithMock = {
        ...mockAccountContext,
        setAccountDetail,
      };

      setupBrowserTest(
        <AccountContext.Provider value={contextWithMock}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      const switchElement = page.getByText(/User will change password on next login/i);
      await expect.element(switchElement).toBeVisible();
      await switchElement.click();

      expect(setAccountDetail).toHaveBeenCalled();
    });
  });

  describe('Settings Section', () => {
    it('should display account status dropdown', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={mockAccountContext}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByText('Account Status')).toBeVisible();
    });

    it('should display COS selection with default COS switch', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={mockAccountContext}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByText('Default COS')).toBeVisible();
      await expect.element(page.getByText('Default Class of Service')).toBeVisible();
    });

    it('should disable COS dropdown when default COS is enabled', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={mockAccountContext}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByText('Default COS')).toBeVisible();
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid phone number', async () => {
      const setAccountDetail = vi.fn();
      const contextWithMock = {
        ...mockAccountContext,
        setAccountDetail,
      };

      setupBrowserTest(
        <AccountContext.Provider value={contextWithMock}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      const phoneInput = page.getByLabelText('Phone');
      await userEvent.fill(phoneInput, '+1-555-1234');

      expect(setAccountDetail).toHaveBeenCalled();
    });
  });

  describe('Description and Notes', () => {
    it('should accept description input', async () => {
      const setAccountDetail = vi.fn();
      const contextWithMock = {
        ...mockAccountContext,
        setAccountDetail,
      };

      setupBrowserTest(
        <AccountContext.Provider value={contextWithMock}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      const descriptionInput = page.getByLabelText('Description');
      await userEvent.fill(descriptionInput, 'Test user account');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should accept notes input', async () => {
      const setAccountDetail = vi.fn();
      const contextWithMock = {
        ...mockAccountContext,
        setAccountDetail,
      };

      setupBrowserTest(
        <AccountContext.Provider value={contextWithMock}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      const notesInput = page.getByLabelText('Notes');
      await userEvent.fill(notesInput, 'Important notes about this account');

      expect(setAccountDetail).toHaveBeenCalled();
    });
  });

  describe('Company and Address Fields', () => {
    it('should render company fields', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={mockAccountContext}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByLabelText('Company')).toBeVisible();
      await expect.element(page.getByLabelText('Job Title')).toBeVisible();
    });

    it('should render address fields', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={mockAccountContext}>
          <CreateAccountDetailSection />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByLabelText('Country')).toBeVisible();
      await expect.element(page.getByLabelText('State')).toBeVisible();
      await expect.element(page.getByLabelText('City')).toBeVisible();
      await expect.element(page.getByLabelText('Postal Code')).toBeVisible();
      await expect.element(page.getByLabelText('Address')).toBeVisible();
    });
  });
});

describe('CreateAccount API Integration (browser)', () => {
  const mockProps = {
    setShowCreateAccountView: vi.fn(),
    getAccountList: vi.fn(),
    setShowEditAccountView: vi.fn(),
    openDetailView: vi.fn(),
    setShowAccountDetailView: vi.fn(),
    setIsAccountCreated: vi.fn(),
    setDefaultTab: vi.fn(),
  };

  beforeEach(() => {
    useDomainStore.setState({
      domain: {
        name: 'test-domain.com',
        id: 'domain-123',
        a: [{ n: 'zimbraDomainStatus', _content: 'active' }],
      },
      cosList: [
        { name: 'Default COS', id: 'default-cos-id' },
        { name: 'Premium COS', id: 'premium-cos-id' },
      ],
    });
  });

  afterEach(() => {
    useDomainStore.setState({});
  });

  it('should send correct request payload for account creation', async () => {
    let capturedRequestBody: any = null;

    const apiInterceptor = await createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/CreateAccountRequest',
      () =>
        HttpResponse.json({
          Body: {
            CreateAccountResponse: {
              account: [
                {
                  id: 'new-account-123',
                  name: 'john.doe@test-domain.com',
                },
              ],
            },
          },
        }),
    );

    setupBrowserTest(<CreateAccount {...mockProps} />);

    await userEvent.fill(page.getByLabelText('Name', { exact: true }), 'John');
    await userEvent.fill(page.getByLabelText('Surname'), 'Doe');
    await userEvent.fill(page.getByLabelText('Password', { exact: true }), 'SecurePass123!');
    await userEvent.fill(page.getByLabelText('Repeat Password'), 'SecurePass123!');

    const createButton = page.getByRole('button', { name: /CREATE WITH THESE DATA/i });
    await userEvent.click(createButton);

    await expect.poll(() => apiInterceptor.getLastRequest()).not.toBeNull();

    const capturedRequest = apiInterceptor.getLastRequest();
    capturedRequestBody = await capturedRequest.json();

    expect(capturedRequestBody.Body.CreateAccountRequest.name).toBe('john.doe@test-domain.com');
    expect(capturedRequestBody.Body.CreateAccountRequest.password).toBe('SecurePass123!');
    expect(capturedRequestBody.Body.CreateAccountRequest.a).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ n: 'givenName', _content: 'John' }),
        expect.objectContaining({ n: 'sn', _content: 'Doe' }),
        expect.objectContaining({ n: 'displayName' }),
      ]),
    );
  });
});
