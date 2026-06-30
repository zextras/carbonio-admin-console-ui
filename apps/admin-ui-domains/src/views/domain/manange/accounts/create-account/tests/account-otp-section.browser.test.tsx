/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { useDomainStore } from '../../../../../../store/store';
import { AccountContext } from '../account-context';
import AccountOtpSection from '../account-otp-section';

const mockSetToggleNextBtn = vi.fn();

const baseAccountDetail = {
  name: 'testuser',
  givenName: 'Test',
  sn: 'User',
  displayName: 'Test User',
  generateOTP: false,
  administrationRigths: false,
  qrData: 'otpauth://totp/testuser%40test-domain.com?secret=JBSWY3DPEHPK3PXP&issuer=Carbonio',
  secrateCode: 'JBSWY3DPEHPK3PXP',
  pinCodes: [
    { code: '12345678' },
    { code: '87654321' },
    { code: '11223344' },
    { code: '44332211' },
  ],
  showOtpOptionSection: false,
};

const buildContext = (overrides: Partial<typeof baseAccountDetail> = {}) => ({
  accountDetail: { ...baseAccountDetail, ...overrides },
  setAccountDetail: vi.fn(),
  setShowCreateAccountView: vi.fn(),
});

describe('AccountOtpSection – QRCodeSVG', () => {
  beforeEach(() => {
    useDomainStore.setState({
      domain: {
        name: 'test-domain.com',
        id: 'domain-123',
        a: [{ n: 'zimbraDomainStatus', _content: 'active' }],
      },
      cosList: [],
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    useDomainStore.setState({});
  });

  describe('QR code view (showOtpOptionSection = false)', () => {
    it('should render the QRCodeSVG element', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext()}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      const qr = page.getByTestId('qrcode-password');
      await expect.element(qr).toBeVisible();
    });

    it('should render QRCodeSVG as an SVG element', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext()}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      const qr = page.getByTestId('qrcode-password');
      await expect.element(qr).toBeVisible();
      // QRCodeSVG renders an <svg> tag
      const tagName = await qr.element().tagName.toLowerCase();
      expect(tagName).toBe('svg');
    });

    it('should render QRCodeSVG with size 179', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext()}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      const qr = page.getByTestId('qrcode-password');
      await expect.element(qr).toBeVisible();
      await expect.element(qr).toHaveAttribute('width', '179');
      await expect.element(qr).toHaveAttribute('height', '179');
    });

    it('should display the secret code text below the QR code', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext()}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByText('Secret Code')).toBeVisible();
      await expect.element(page.getByText('JBSWY3DPEHPK3PXP')).toBeVisible();
    });

    it('should display all static pin codes', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext()}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByText('12345678')).toBeVisible();
      await expect.element(page.getByText('87654321')).toBeVisible();
      await expect.element(page.getByText('11223344')).toBeVisible();
      await expect.element(page.getByText('44332211')).toBeVisible();
    });

    it('should render QRCodeSVG even when qrData is an empty string', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext({ qrData: '' })}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      const qr = page.getByTestId('qrcode-password');
      await expect.element(qr).toBeVisible();
    });

    it('should render QRCodeSVG with a long otpauth URL', async () => {
      const longUrl =
        'otpauth://totp/verylongusername%40example-enterprise-domain.com?secret=ABCDEFGHIJKLMNOP&issuer=Carbonio+Admin';

      setupBrowserTest(
        <AccountContext.Provider value={buildContext({ qrData: longUrl })}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      const qr = page.getByTestId('qrcode-password');
      await expect.element(qr).toBeVisible();
    });

    it('should not render the OTP option switches in QR code view', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext()}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByText('Create OTP code')).not.toBeInTheDocument();
      await expect.element(page.getByText('Add Administration rights')).not.toBeInTheDocument();
    });

    it('should display the send OTP chip input and send button', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext()}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByText('SEND', { exact: true })).toBeVisible();
    });
  });

  describe('OTP options view (showOtpOptionSection = true)', () => {
    it('should NOT render the QRCodeSVG when showOtpOptionSection is true', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext({ showOtpOptionSection: true })}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      await expect.element(page.getByTestId('qrcode-password')).not.toBeInTheDocument();
    });

    it('should render the success banner and OTP switches', async () => {
      setupBrowserTest(
        <AccountContext.Provider value={buildContext({ showOtpOptionSection: true })}>
          <AccountOtpSection setToggleNextBtn={mockSetToggleNextBtn} />
        </AccountContext.Provider>,
      );

      await expect
        .element(page.getByText('The account has been successfully created'))
        .toBeVisible();
      await expect.element(page.getByText('Create OTP code')).toBeVisible();
      await expect.element(page.getByText('Add Administration rights')).toBeVisible();
    });
  });
});
