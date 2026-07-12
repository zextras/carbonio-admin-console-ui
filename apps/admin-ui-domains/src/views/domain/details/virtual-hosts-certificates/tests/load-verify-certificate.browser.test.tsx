/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupAccount, setupBrowserTest } from 'admin-ui-test-utils';
import { type FC, type ReactElement, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { CertificateContext } from '../certificate-context';
import { LoadAndVerifyCert } from '../load-verify-certificate';

vi.mock('../../../../../services/modify-domain-service', () => ({
	modifyDomain: vi.fn(() => Promise.resolve({ domain: [] })),
}));

vi.mock('@zextras/ui-shared', async () => {
	const actual = await vi.importActual<typeof import('@zextras/ui-shared')>('@zextras/ui-shared');
	return {
		...actual,
		soapFetch: vi.fn(() => new Promise(() => {})),
		flushCache: vi.fn(() => Promise.resolve()),
	};
});

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function setup(ui: ReactElement) {
	const queryClient = getQueryClient();
	setupAccount(queryClient);
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [
			{ n: 'zimbraDomainName', _content: DOMAIN_NAME },
			{ n: 'zimbraId', _content: DOMAIN_ID },
		],
	});
	return setupBrowserTest(ui, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`,
	});
}

const TestApp: FC = () => {
	const [isCertificateAvailable, setIsCertificateAvailable] = useState(false);
	return (
		<CertificateContext.Provider
			value={{ isCertificateAvailable, setIsCertificateAvailable }}
		>
			<LoadAndVerifyCert setToggleWizardSection={vi.fn()} externalData={vi.fn()} />
		</CertificateContext.Provider>
	);
};

describe('LoadAndVerifyCert (browser)', () => {
	describe('Rendering', () => {
		it('renders the Upload and Verify Certificate title', async () => {
			setup(<TestApp />);

			await expect
				.element(page.getByText('Upload and Verify Certificate'))
				.toBeVisible();
		});

		it('renders the Domain Certificate label', async () => {
			setup(<TestApp />);

			await expect
				.element(page.getByText('Domain Certificate', { exact: true }))
				.toBeVisible();
		});

		it('renders the Domain Certificate CA Chain label', async () => {
			setup(<TestApp />);

			await expect
				.element(page.getByText('Domain Certificate CA Chain', { exact: true }))
				.toBeVisible();
		});

		it('renders the Domain Private Key label', async () => {
			setup(<TestApp />);

			await expect
				.element(page.getByText('Domain Private Key', { exact: true }))
				.toBeVisible();
		});

		it('renders the VERIFY button disabled when fields are empty', async () => {
			setup(<TestApp />);

			await expect
				.element(page.getByRole('button', { name: /verify/i }))
				.toBeDisabled();
		});
	});

	describe('Verify flow', () => {
		it('enables VERIFY button after filling all certificate fields', async () => {
			setup(<TestApp />);

			const certInput = page.getByRole('textbox').nth(0);
			const caChainInput = page.getByRole('textbox').nth(1);
			const privateKeyInput = page.getByRole('textbox').nth(2);

			await userEvent.type(certInput, '-----BEGIN CERTIFICATE-----');
			await userEvent.type(caChainInput, '-----BEGIN CA CHAIN-----');
			await userEvent.type(privateKeyInput, '-----BEGIN PRIVATE KEY-----');

			await expect
				.element(page.getByRole('button', { name: /verify/i }))
				.toBeEnabled();
		});

		it('shows loading state on VERIFY button after clicking with all fields filled', async () => {
			setup(<TestApp />);

			const certInput = page.getByRole('textbox').nth(0);
			const caChainInput = page.getByRole('textbox').nth(1);
			const privateKeyInput = page.getByRole('textbox').nth(2);

			await userEvent.type(certInput, '-----BEGIN CERTIFICATE-----');
			await userEvent.type(caChainInput, '-----BEGIN CA CHAIN-----');
			await userEvent.type(privateKeyInput, '-----BEGIN PRIVATE KEY-----');

			const verifyBtn = page.getByRole('button', { name: /verify/i });
			await verifyBtn.click();

			await expect.element(page.getByRole('status')).toBeVisible();
		});
	});
});
