/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { TwoFactorAuthencationConfig } from '../2fa-config';

const modifyPoliciesMock = vi.fn();

const defaultProps = {
  policies: [],
  modifyPolicies: modifyPoliciesMock,
  arrPoliciesToModify: [],
  twoFactorPolicyArray: [],
};

// NOTE: These tests document the current behavior of the component,
// but the component should be rewritten from scratch.
// The tests are a best effort that will not survive nor serve any refactor.
// They can happily be removed once the refactor is in
describe('TwoFactorAuthencationConfig', () => {
  describe('Rendering', () => {
    it('displays all elements', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      await expect.element(page.getByText('Configuration')).toBeVisible();
      await expect
        .element(
          page.getByText(
            /Setup the networks or the devices \(IPs\) that will not require the 2FA authentication/,
          ),
        )
        .toBeVisible();
      await expect.element(page.getByText('What to trust?')).toBeVisible();
      await expect.element(page.getByPlaceholder('Trusted Networks (IP ranges)')).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /apply to all services/i }))
        .toBeVisible();
    });

    it('renders service configurations from twoFactorPolicyArray', async () => {
      const mockPolicies = [
        { label: 'Admin API', keyToGet: 'WebAdminUI' },
        { label: 'WebUI', keyToGet: 'WebUI' },
      ];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig {...defaultProps} twoFactorPolicyArray={mockPolicies} />,
      );
      await expect.element(page.getByText('Admin API')).toBeVisible();
      await expect.element(page.getByText('WebUI')).toBeVisible();
    });

    it('displays service labels in the correct order', async () => {
      const mockPolicies = [
        { label: 'First Service', keyToGet: 'Service1' },
        { label: 'Second Service', keyToGet: 'Service2' },
        { label: 'Third Service', keyToGet: 'Service3' },
      ];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig {...defaultProps} twoFactorPolicyArray={mockPolicies} />,
      );
      await expect.element(page.getByText('First Service')).toBeVisible();
      await expect.element(page.getByText('Second Service')).toBeVisible();
      await expect.element(page.getByText('Third Service')).toBeVisible();
    });
  });

  describe('Apply to All functionality', () => {
    it('allows changing the "What to trust?" dropdown', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const dropdown = page.getByText('What to trust?');
      await dropdown.click();
      const dropdownOption = page.getByText('Trust the device');
      await dropdownOption.click();
      const newValue = page.getByText('Trust the device');
      await expect.element(newValue).toBeVisible();
    });

    it('displays "Trust the IP" option in dropdown', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const dropdown = page.getByText('What to trust?');
      await dropdown.click();
      const dropdownOption = page.getByText('Trust the IP');
      await dropdownOption.click();
      const newValue = page.getByText('Trust the IP');
      await expect.element(newValue).toBeVisible();
    });

    it('displays "Disable 2FA" option in dropdown', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const dropdown = page.getByText('What to trust?');
      await dropdown.click();
      const dropdownOption = page.getByText('Disable 2FA');
      await dropdownOption.click();
      const newValue = page.getByText('Disable 2FA');
      await expect.element(newValue).toBeVisible();
    });

    it('calls modifyPolicies when Apply to All button is clicked', async () => {
      const mockPolicies = [
        { label: 'WebUI', keyToGet: 'WebUI', trustedDevice: 0, trustedIpRange: [] },
      ];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig
          {...defaultProps}
          arrPoliciesToModify={[{ WebUI: { trustedDevice: 0, trustedIpRange: [] } }]}
          twoFactorPolicyArray={mockPolicies}
        />,
      );
      const applyButton = page.getByRole('button', { name: /apply to all services/i });
      await applyButton.click();
      expect(modifyPoliciesMock).toHaveBeenCalled();
    });

    it('updates policies with selected whatToTrust value', async () => {
      const mockPolicies = [
        { label: 'WebUI', keyToGet: 'WebUI', trustedDevice: 0, trustedIpRange: [] },
      ];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig
          {...defaultProps}
          arrPoliciesToModify={[{ WebUI: { trustedDevice: 0, trustedIpRange: [] } }]}
          twoFactorPolicyArray={mockPolicies}
        />,
      );
      const dropdown = page.getByText('What to trust?').nth(1);
      await dropdown.click();
      const trustIpOption = page.getByText('Trust the IP').nth(0);
      await trustIpOption.click();
      const applyButton = page.getByRole('button', { name: /apply to all services/i });
      await applyButton.click();
      expect(modifyPoliciesMock).toHaveBeenCalledWith([
        { WebUI: { trustedDevice: 1, trustedIpRange: [] } },
      ]);
    });
  });

  describe('IP Range Input', () => {
    it('accepts valid IP addresses', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const chipInput = page.getByPlaceholder('Trusted Networks (IP ranges)');
      await userEvent.type(chipInput, '192.168.1.1{Enter}');
      await expect.element(page.getByText('192.168.1.1')).toBeVisible();
    });

    it('accepts valid IP ranges with CIDR', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const chipInput = page.getByPlaceholder('Trusted Networks (IP ranges)');
      await userEvent.type(chipInput, '192.168.1.0/24{Enter}');
      await expect.element(page.getByText('192.168.1.0/24')).toBeVisible();
    });

    it('shows error message for invalid IP addresses', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const chipInput = page.getByPlaceholder('Trusted Networks (IP ranges)');
      await userEvent.type(chipInput, 'invalid-ip{Enter}');
      await expect.element(page.getByText('One or more IP are invalid')).toBeVisible();
    });

    it('shows error message for partially invalid IP ranges', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const chipInput = page.getByPlaceholder('Trusted Networks (IP ranges)');
      await userEvent.type(chipInput, '192.168.1.1{Enter}invalid-ip{Enter}');
      await expect.element(page.getByText('One or more IP are invalid')).toBeVisible();
    });

    it('does not show error for valid IP ranges', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const chipInput = page.getByPlaceholder('Trusted Networks (IP ranges)');
      await userEvent.type(chipInput, '192.168.1.0/24{Enter}');
      await userEvent.tab();
      await userEvent.type(chipInput, '10.0.0.1{Enter}');
      await userEvent.tab();
      const errorMessage = page.getByText('One or more IP are invalid');
      expect(errorMessage.elements()).toHaveLength(0);
    });

    it('allows multiple valid IP ranges', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const chipInput = page.getByPlaceholder('Trusted Networks (IP ranges)');
      await userEvent.type(chipInput, '192.168.1.0/24{Enter}');
      await userEvent.tab();
      await userEvent.type(chipInput, '10.0.0.1/32{Enter}');
      await userEvent.tab();
      await userEvent.type(chipInput, '172.16.0.0/16{Enter}');
      await userEvent.tab();
      await expect.element(page.getByText('192.168.1.0/24')).toBeVisible();
      await expect.element(page.getByText('10.0.0.1/32')).toBeVisible();
      await expect.element(page.getByText('172.16.0.0/16')).toBeVisible();
    });

    it('validates IP range with invalid CIDR', async () => {
      await setupBrowserTest(<TwoFactorAuthencationConfig {...defaultProps} />);
      const chipInput = page.getByPlaceholder('Trusted Networks (IP ranges)');
      await userEvent.type(chipInput, '192.168.1.0/33{Enter}');
      await expect.element(page.getByText('One or more IP are invalid')).toBeVisible();
    });
  });

  describe('Individual Service Configuration', () => {
    it('renders individual service IP range inputs', async () => {
      const mockPolicies = [{ label: 'WebUI', keyToGet: 'WebUI' }];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig
          {...defaultProps}
          twoFactorPolicyArray={mockPolicies}
          arrPoliciesToModify={[{ WebUI: { trustedDevice: 0, trustedIpRange: ['192.168.1.1'] } }]}
        />,
      );
      await expect.element(page.getByText('192.168.1.1')).toBeVisible();
    });

    it('shows error for invalid IP in individual service', async () => {
      const mockPolicies = [{ label: 'WebUI', keyToGet: 'WebUI' }];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig
          {...defaultProps}
          twoFactorPolicyArray={mockPolicies}
          arrPoliciesToModify={[{ WebUI: { trustedDevice: 0, trustedIpRange: ['invalid-ip'] } }]}
        />,
      );
      await expect.element(page.getByText('One or more IP are invalid')).toBeVisible();
    });
  });

  describe('Integration Tests', () => {
    it('updates multiple services with Apply to All', async () => {
      const mockPolicies = [
        { label: 'WebUI', keyToGet: 'WebUI' },
        { label: 'Admin API', keyToGet: 'WebAdminUI' },
      ];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig
          {...defaultProps}
          twoFactorPolicyArray={mockPolicies}
          arrPoliciesToModify={[
            { WebUI: { trustedDevice: 0, trustedIpRange: [] } },
            { WebAdminUI: { trustedDevice: 0, trustedIpRange: [] } },
          ]}
        />,
      );
      const dropdown = page.getByText('What to trust?').nth(0);
      await dropdown.click();
      const trustIpOption = page.getByText('Trust the IP').nth(0);
      await trustIpOption.click();
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(null);
        }, 200),
      ); // Wait for state update
      const applyButton = page.getByRole('button', { name: /apply to all services/i });
      await applyButton.click();
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(null);
        }, 200),
      ); // Wait for state update

      expect(modifyPoliciesMock).toHaveBeenCalledWith([
        { WebUI: { trustedDevice: undefined, trustedIpRange: [] } },
        { WebAdminUI: { trustedDevice: undefined, trustedIpRange: [] } },
      ]);
    });

    it('applies IP ranges to all services with Apply to All', async () => {
      const mockPolicies = [
        { label: 'WebUI', keyToGet: 'WebUI' },
        { label: 'Admin API', keyToGet: 'WebAdminUI' },
      ];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig
          {...defaultProps}
          twoFactorPolicyArray={mockPolicies}
          arrPoliciesToModify={[
            { WebUI: { trustedDevice: 0, trustedIpRange: [] } },
            { WebAdminUI: { trustedDevice: 0, trustedIpRange: [] } },
          ]}
        />,
      );
      const chipInput = page.getByPlaceholder('Trusted Networks (IP ranges)').nth(0);
      await userEvent.type(chipInput, '192.168.1.0/24{Enter}');
      const applyButton = page.getByRole('button', { name: /apply to all services/i });
      await applyButton.click();
      expect(modifyPoliciesMock).toHaveBeenCalled();
    });
  });

  describe('UI Components', () => {
    it('renders Chip component with Copy button', async () => {
      const mockPolicies = [{ label: 'WebUI', keyToGet: 'WebUI' }];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig
          {...defaultProps}
          twoFactorPolicyArray={mockPolicies}
          arrPoliciesToModify={[{ WebUI: { trustedDevice: 0, trustedIpRange: ['192.168.1.1'] } }]}
        />,
      );
      await expect.element(page.getByText('192.168.1.1')).toBeVisible();
    });

    it('renders Chip components for all IP ranges', async () => {
      const mockPolicies = [{ label: 'WebUI', keyToGet: 'WebUI' }];
      await setupBrowserTest(
        <TwoFactorAuthencationConfig
          {...defaultProps}
          twoFactorPolicyArray={mockPolicies}
          arrPoliciesToModify={[
            { WebUI: { trustedDevice: 0, trustedIpRange: ['192.168.1.1', '10.0.0.1'] } },
          ]}
        />,
      );
      await expect.element(page.getByText('192.168.1.1')).toBeVisible();
      await expect.element(page.getByText('10.0.0.1')).toBeVisible();
    });
  });
});
