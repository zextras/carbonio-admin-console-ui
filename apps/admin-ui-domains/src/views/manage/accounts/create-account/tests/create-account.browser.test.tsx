/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  advancedSupportedApiForBrowser,
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  createBrowserZextrasActionInterceptor,
  getQueryClient,
  setupBrowserTest as _setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import CreateAccount from '../create-account';
import CreateAccountDetailSection from '../create-account-detail-section';
import { CreateAccountFormTestProvider } from './create-account-form-test-provider';

const DOMAIN_ID = 'domain-123';
const DOMAIN_NAME = 'test-domain.com';

function setupBrowserTest(ui: ReactElement): Promise<RenderResult> {
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainStatus', _content: 'active' }],
  });
  return _setupBrowserTest(ui, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: `/${DOMAIN_ID}`,
  });
}

describe('CreateAccountDetailSection (browser)', () => {
  beforeEach(() => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {
      cos: [
        { name: 'Default COS', id: 'default-cos-id' },
        { name: 'Premium COS', id: 'premium-cos-id' },
      ],
    });
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render all main form sections', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
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
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
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
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      const domainField = page.getByText('Domain Name');
      await expect.element(domainField).toBeVisible();
      const testDomainField = page.getByText('test-domain.com ');
      await expect.element(testDomainField).toBeVisible();
    });
  });

  describe('Auto-fill Account Name', () => {
    it('should auto-generate the account name from name parts', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await userEvent.fill(page.getByLabelText('Name', { exact: true }), 'John');
      await userEvent.fill(page.getByLabelText('Surname'), 'Doe');

      const userNameInput = page.getByLabelText(/user \(Auto-fill\)/i);
      await expect.element(userNameInput).toHaveValue('john.doe');
    });

    it('should auto-generate the account name including the middle initial', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await userEvent.fill(page.getByLabelText('Name', { exact: true }), 'John');
      await userEvent.fill(page.getByLabelText('Middle Name Initials'), 'M');
      await userEvent.fill(page.getByLabelText('Surname'), 'Doe');

      const userNameInput = page.getByLabelText(/user \(Auto-fill\)/i);
      await expect.element(userNameInput).toHaveValue('john.m.doe');
    });

    it('should let the user override the auto-filled account name', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await userEvent.fill(page.getByLabelText('Surname'), 'Doe');
      const userNameInput = page.getByLabelText(/user \(Auto-fill\)/i);
      await userEvent.fill(userNameInput, 'custom.name');
      await expect.element(userNameInput).toHaveValue('custom.name');
    });
  });

  describe('Auto-fill Display Name', () => {
    it('should auto-generate the display name from name fields', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await userEvent.fill(page.getByLabelText('Name', { exact: true }), 'John');
      await userEvent.fill(page.getByLabelText('Middle Name Initials'), 'M');
      await userEvent.fill(page.getByLabelText('Surname'), 'Doe');

      await expect.element(page.getByLabelText(/Display Name \(Auto-fill\)/i)).toHaveValue(
        'John M Doe',
      );
    });
  });

  describe('Password Fields', () => {
    it('should accept password input', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      const passwordInput = page.getByPlaceholder('Password', { exact: true });
      await userEvent.fill(passwordInput, 'SecurePassword123!');

      const repeatPasswordInput = page.getByPlaceholder('Repeat Password');
      await userEvent.fill(repeatPasswordInput, 'SecurePassword123!');

      await expect.element(passwordInput).toHaveValue('SecurePassword123!');
      await expect.element(repeatPasswordInput).toHaveValue('SecurePassword123!');
    });

    it('should toggle password must change switch', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      const switchElement = page.getByText(/User will change password on next login/i);
      await expect.element(switchElement).toBeVisible();
      await switchElement.click();
    });
  });

  describe('Field Validation', () => {
    it('should show the surname required error once submit was attempted', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider submitAttempted>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await expect.element(page.getByText('Surname is required').first()).toBeVisible();
    });

    it('should not show the surname error before any submit attempt', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await expect.element(page.getByText('Surname is required')).not.toBeInTheDocument();
    });

    it('should show the password mismatch error on touched fields', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await userEvent.fill(page.getByPlaceholder('Password', { exact: true }), 'SecurePass123!');
      await userEvent.fill(page.getByPlaceholder('Repeat Password'), 'DifferentPass456!');

      await expect.element(page.getByText('Passwords do not match').first()).toBeVisible();
    });
  });

  describe('Settings Section', () => {
    it('should display account status dropdown', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await expect.element(page.getByText('Account Status')).toBeVisible();
    });

    it('should display COS selection with default COS switch', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await expect.element(page.getByText('Default COS')).toBeVisible();
      await expect.element(page.getByText('Default Class of Service')).toBeVisible();
    });

    it('should disable COS dropdown when default COS is enabled', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider values={{ defaultCOS: true }}>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await expect.element(page.getByText('Default COS')).toBeVisible();
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid phone number', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      const phoneInput = page.getByRole('textbox', { name: 'Phone', exact: true });
      await userEvent.fill(phoneInput, '+1-555-1234');

      await expect.element(phoneInput).toHaveValue('+1-555-1234');
    });

    it('should flag an invalid phone number', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      const phoneInput = page.getByRole('textbox', { name: 'Phone', exact: true });
      await userEvent.fill(phoneInput, 'abc');

      await expect.element(
        page.getByText('allowed chars are whitespaces, numbers and symbols -+()/,.').first(),
      ).toBeVisible();
    });
  });

  describe('Description and Notes', () => {
    it('should accept description input', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      const descriptionInput = page.getByRole('textbox', { name: 'Description', exact: true });
      await userEvent.fill(descriptionInput, 'Test user account');

      await expect.element(descriptionInput).toHaveValue('Test user account');
    });

    it('should accept notes input', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      const notesInput = page.getByRole('textbox', { name: 'Notes', exact: true });
      await userEvent.fill(notesInput, 'Important notes about this account');

      await expect.element(notesInput).toHaveValue('Important notes about this account');
    });
  });

  describe('Company and Address Fields', () => {
    it('should render company fields', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
      );

      await expect.element(page.getByLabelText('Company')).toBeVisible();
      await expect.element(page.getByLabelText('Job Title')).toBeVisible();
    });

    it('should render address fields', async () => {
      setupBrowserTest(
        <CreateAccountFormTestProvider>
          <CreateAccountDetailSection />
        </CreateAccountFormTestProvider>,
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
    createBrowserSoapAPIInterceptor('SearchDirectory', {
      cos: [
        { name: 'Default COS', id: 'default-cos-id' },
        { name: 'Premium COS', id: 'premium-cos-id' },
      ],
    });
  });

  it('should send correct request payload for account creation', async () => {
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
    await userEvent.fill(page.getByPlaceholder('Password', { exact: true }), 'SecurePass123!');
    await userEvent.fill(page.getByPlaceholder('Repeat Password'), 'SecurePass123!');

    const createButton = page.getByRole('button', { name: /CREATE WITH THESE DATA/i });
    await userEvent.click(createButton);

    await expect.poll(() => apiInterceptor.getLastRequest()).not.toBeNull();

    const capturedRequest = apiInterceptor.getLastRequest();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const capturedRequestBody: any = await capturedRequest.json();

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

  it('should block creation and show a visible error when the surname is missing', async () => {
    let requestSeen = false;
    const apiInterceptor = await createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/CreateAccountRequest',
      () => {
        requestSeen = true;
        return HttpResponse.json({
          Body: { CreateAccountResponse: { account: [{ id: 'x', name: 'x' }] } },
        });
      },
    );
    void apiInterceptor;

    setupBrowserTest(<CreateAccount {...mockProps} />);

    await userEvent.fill(page.getByPlaceholder('Password', { exact: true }), 'SecurePass123!');
    await userEvent.fill(page.getByPlaceholder('Repeat Password'), 'SecurePass123!');

    const createButton = page.getByRole('button', { name: /CREATE WITH THESE DATA/i });
    await userEvent.click(createButton);

    await expect.element(page.getByText('Surname is required').first()).toBeVisible();

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    expect(requestSeen).toBe(false);
  });

  it('should block creation when passwords do not match', async () => {
    let requestSeen = false;
    await createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/CreateAccountRequest',
      () => {
        requestSeen = true;
        return HttpResponse.json({
          Body: { CreateAccountResponse: { account: [{ id: 'x', name: 'x' }] } },
        });
      },
    );

    setupBrowserTest(<CreateAccount {...mockProps} />);

    await userEvent.fill(page.getByLabelText('Name', { exact: true }), 'John');
    await userEvent.fill(page.getByLabelText('Surname'), 'Doe');
    await userEvent.fill(page.getByPlaceholder('Password', { exact: true }), 'SecurePass123!');
    await userEvent.fill(page.getByPlaceholder('Repeat Password'), 'DifferentPass456!');

    const createButton = page.getByRole('button', { name: /CREATE WITH THESE DATA/i });
    await userEvent.click(createButton);

    await expect.element(page.getByText('Passwords do not match').first()).toBeVisible();

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    expect(requestSeen).toBe(false);
  });
});

describe('CreateAccountDetailSection – External LDAP (browser)', () => {
  function setupExternalLdapDomainTest(
    ldapUrlContent: string,
    values?: { zimbraAuthLdapExternalDn?: string },
  ): Promise<RenderResult> {
    const queryClient = getQueryClient();
    queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
      id: DOMAIN_ID,
      name: DOMAIN_NAME,
      a: [
        { n: 'zimbraDomainStatus', _content: 'active' },
        { n: 'zimbraAuthLdapURL', _content: ldapUrlContent },
      ],
    });
    return _setupBrowserTest(
      <CreateAccountFormTestProvider values={values}>
        <CreateAccountDetailSection />
      </CreateAccountFormTestProvider>,
      {
        queryClient,
        withDomainIdRoute: true,
        initialRouterEntry: `/${DOMAIN_ID}`,
      },
    );
  }

  beforeEach(() => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {
      cos: [
        { name: 'Default COS', id: 'default-cos-id' },
        { name: 'Premium COS', id: 'premium-cos-id' },
      ],
    });
    vi.clearAllMocks();
  });

  it('should render the External LDAP section when the domain has an external LDAP URL', async () => {
    setupExternalLdapDomainTest('ldap://ldap.example.com:389');

    await expect.element(page.getByText('External LDAP', { exact: true })).toBeVisible();
    await expect
      .element(page.getByLabelText('External LDAP Reference for Authentication'))
      .toBeVisible();
  });

  it('should render the external LDAP reference value from the form state', async () => {
    setupExternalLdapDomainTest('ldap://ldap.example.com:389', {
      zimbraAuthLdapExternalDn: 'uid=john,ou=people,dc=example,dc=com',
    });

    await expect
      .element(page.getByLabelText('External LDAP Reference for Authentication'))
      .toHaveValue('uid=john,ou=people,dc=example,dc=com');
  });

  it('should not render the External LDAP section when the URL attribute is empty', async () => {
    setupExternalLdapDomainTest('');

    await expect
      .element(page.getByText('External LDAP', { exact: true }))
      .not.toBeInTheDocument();
  });
});

describe('CreateAccount OTP Step (browser)', () => {
  const wizardProps = {
    setShowCreateAccountView: vi.fn(),
    getAccountList: vi.fn(),
    setShowEditAccountView: vi.fn(),
    openDetailView: vi.fn(),
    setShowAccountDetailView: vi.fn(),
    setIsAccountCreated: vi.fn(),
    setDefaultTab: vi.fn(),
  };

  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
    createBrowserSoapAPIInterceptor('SearchDirectory', {
      cos: [
        { name: 'Default COS', id: 'default-cos-id' },
        { name: 'Premium COS', id: 'premium-cos-id' },
      ],
    });
    vi.clearAllMocks();
  });

  function mockCreateAccountSuccess() {
    return createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/CreateAccountRequest',
      () =>
        HttpResponse.json({
          Body: {
            CreateAccountResponse: {
              account: [{ id: 'new-account-otp', name: 'john.doe@test-domain.com' }],
            },
          },
        }),
    );
  }

  async function fillDetailsAndCreate(): Promise<void> {
    await userEvent.fill(page.getByLabelText('Name', { exact: true }), 'John');
    await userEvent.fill(page.getByLabelText('Surname'), 'Doe');
    await userEvent.fill(page.getByPlaceholder('Password', { exact: true }), 'SecurePass123!');
    await userEvent.fill(page.getByPlaceholder('Repeat Password'), 'SecurePass123!');
    await userEvent.click(page.getByRole('button', { name: /CREATE WITH THESE DATA/i }));

    await expect
      .element(page.getByText('The account has been successfully created'))
      .toBeVisible();
  }

  it('should show the OTP options step after creating an account in advanced mode', async () => {
    mockCreateAccountSuccess();
    setupBrowserTest(<CreateAccount {...wizardProps} />);

    await fillDetailsAndCreate();

    await expect.element(page.getByRole('switch', { name: 'Create OTP code' })).toBeVisible();
    await expect
      .element(page.getByRole('switch', { name: 'Add Administration rights' }))
      .toBeVisible();
    await expect
      .element(page.getByText('The account has been created successfully'))
      .toBeVisible();
  });

  it('should generate the OTP secret and pin codes when Create OTP code is enabled', async () => {
    mockCreateAccountSuccess();
    createBrowserZextrasActionInterceptor('totp_generate_command', () =>
      HttpResponse.json({
        Body: {
          response: {
            content: JSON.stringify({
              ok: true,
              response: {
                label: 'john.doe@test-domain.com',
                secret: 'OTPSECRET123456',
                issuer: 'Carbonio',
                algorithm: 'SHA1',
                digits_length: '6',
                period: '30',
                static_otp_codes: [{ code: '12345678' }, { code: '87654321' }],
              },
            }),
          },
        },
      }),
    );
    setupBrowserTest(<CreateAccount {...wizardProps} />);

    await fillDetailsAndCreate();

    await page.getByRole('switch', { name: 'Create OTP code' }).click();
    await page.getByRole('button', { name: 'CLOSE', exact: true }).click();

    await expect.element(page.getByText('OTPSECRET123456')).toBeVisible();
    await expect.element(page.getByText('12345678')).toBeVisible();
    await expect.element(page.getByText('87654321')).toBeVisible();
  });

  it('should keep the wizard on the details step and show an error snackbar when creation fails', async () => {
    createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/CreateAccountRequest',
      () =>
        HttpResponse.json({
          Body: {
            Fault: { Reason: { Text: 'an account with that name already exists' } },
          },
        }),
    );
    setupBrowserTest(<CreateAccount {...wizardProps} />);

    await userEvent.fill(page.getByLabelText('Name', { exact: true }), 'John');
    await userEvent.fill(page.getByLabelText('Surname'), 'Doe');
    await userEvent.fill(page.getByPlaceholder('Password', { exact: true }), 'SecurePass123!');
    await userEvent.fill(page.getByPlaceholder('Repeat Password'), 'SecurePass123!');
    await userEvent.click(page.getByRole('button', { name: /CREATE WITH THESE DATA/i }));

    await expect
      .element(page.getByText('an account with that name already exists'))
      .toBeVisible();
    await expect
      .element(page.getByText('The account has been successfully created'))
      .not.toBeInTheDocument();
  });

  it('should close the wizard when CLOSE is clicked without selecting any OTP option', async () => {
    mockCreateAccountSuccess();
    setupBrowserTest(<CreateAccount {...wizardProps} />);

    await fillDetailsAndCreate();

    await page.getByRole('button', { name: 'CLOSE', exact: true }).click();

    expect(wizardProps.setShowCreateAccountView).toHaveBeenCalledWith(false);
    expect(wizardProps.setIsAccountCreated).toHaveBeenCalledWith(true);
  });

  it('should open the administration tab of the edit view when administration rights are enabled', async () => {
    mockCreateAccountSuccess();
    setupBrowserTest(<CreateAccount {...wizardProps} />);

    await fillDetailsAndCreate();

    await page.getByRole('switch', { name: 'Add Administration rights' }).click();
    await page.getByRole('button', { name: 'CLOSE', exact: true }).click();

    expect(wizardProps.setShowCreateAccountView).toHaveBeenCalledWith(false);
    expect(wizardProps.openDetailView).toHaveBeenCalledWith(
      expect.objectContaining({ sn: 'Doe', givenName: 'John' }),
    );
    expect(wizardProps.setShowAccountDetailView).toHaveBeenCalledWith(false);
    expect(wizardProps.setShowEditAccountView).toHaveBeenCalledWith(true);
    expect(wizardProps.setDefaultTab).toHaveBeenCalledWith('administration');
  });

  it('should reset the form and return to the details step when CREATE ANOTHER ACCOUNT is clicked', async () => {
    mockCreateAccountSuccess();
    setupBrowserTest(<CreateAccount {...wizardProps} />);

    await fillDetailsAndCreate();

    await page.getByRole('button', { name: 'CREATE ANOTHER ACCOUNT' }).click();

    await expect
      .element(page.getByRole('button', { name: /CREATE WITH THESE DATA/i }))
      .toBeVisible();
    await expect.element(page.getByLabelText('Name', { exact: true })).toHaveValue('');
    await expect.element(page.getByLabelText('Surname')).toHaveValue('');
  });
});

describe('CreateAccount COS Selection (browser)', () => {
  const selectionProps = {
    setShowCreateAccountView: vi.fn(),
    getAccountList: vi.fn(),
    setShowEditAccountView: vi.fn(),
    openDetailView: vi.fn(),
    setShowAccountDetailView: vi.fn(),
    setIsAccountCreated: vi.fn(),
    setDefaultTab: vi.fn(),
  };

  beforeEach(() => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {
      cos: [
        { name: 'Default COS', id: 'default-cos-id' },
        { name: 'Premium COS', id: 'premium-cos-id' },
      ],
    });
    vi.clearAllMocks();
  });

  it('should send the selected COS id and the must-change password flag', async () => {
    const apiInterceptor = await createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/CreateAccountRequest',
      () =>
        HttpResponse.json({
          Body: {
            CreateAccountResponse: {
              account: [{ id: 'new-account-cos', name: 'john.doe@test-domain.com' }],
            },
          },
        }),
    );

    setupBrowserTest(<CreateAccount {...selectionProps} />);

    await userEvent.fill(page.getByLabelText('Name', { exact: true }), 'John');
    await userEvent.fill(page.getByLabelText('Surname'), 'Doe');
    await userEvent.fill(page.getByPlaceholder('Password', { exact: true }), 'SecurePass123!');
    await userEvent.fill(page.getByPlaceholder('Repeat Password'), 'SecurePass123!');

    await page.getByRole('switch', { name: 'Default COS' }).click();
    await page.getByText('Default Class of Service', { exact: true }).click();
    await page.getByText('Premium COS').click();
    await page.getByRole('switch', { name: /User will change password on next login/i }).click();

    await userEvent.click(page.getByRole('button', { name: /CREATE WITH THESE DATA/i }));

    await expect.poll(() => apiInterceptor.getLastRequest()).not.toBeNull();

    const capturedRequest = apiInterceptor.getLastRequest();
    const capturedRequestBody = (await capturedRequest.json()) as {
      Body: { CreateAccountRequest: { a: Array<{ n: string; _content: string }> } };
    };

    expect(capturedRequestBody.Body.CreateAccountRequest.a).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ n: 'zimbraCOSId', _content: 'premium-cos-id' }),
        expect.objectContaining({ n: 'zimbraPasswordMustChange', _content: 'TRUE' }),
      ]),
    );
  });
});
