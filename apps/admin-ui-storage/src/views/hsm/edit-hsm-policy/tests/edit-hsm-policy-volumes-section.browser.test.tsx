/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { HsmPolicyFromServer, PolicyCriteriaItem, Volume } from '../../../../../types';
import { HSMContext } from '../../hsm-context/hsm-context';
import { EditHsmPolicyVolumesSection } from '../edit-hsm-policy-volumes-section';
import { parseHsmQueryVolumes, parseHsmType } from '../parse-hsm-policy';

const SAMPLE_VOLUMES: Array<Volume> = [
	{ id: 1, name: 'Primary Volume', type: 1, isCurrent: true },
	{ id: 2, name: 'Secondary Volume', type: 2 },
	{ id: 3, name: 'Index Volume', type: 10 },
];

function TestWrapper({
	currentPolicy,
}: {
	currentPolicy?: HsmPolicyFromServer;
}): React.JSX.Element {
	const parsedTypes = parseHsmType(currentPolicy?.hsmType);
	const parsedVolumes = parseHsmQueryVolumes(currentPolicy?.hsmQuery);
	const initialSourceVolume = SAMPLE_VOLUMES.filter(
		(v) => v?.id != null && parsedVolumes.sourceVolumeIds.includes(String(v.id)),
	);
	const initialDestinationVolume = SAMPLE_VOLUMES.filter(
		(v) => v?.id != null && parsedVolumes.destinationVolumeIds.includes(String(v.id)),
	);
	const form = useForm({
		defaultValues: {
			isAllEnabled: false,
			isMessageEnabled: parsedTypes.isMessageEnabled,
			isDocumentEnabled: parsedTypes.isDocumentEnabled,
			isEventEnabled: parsedTypes.isEventEnabled,
			isContactEnabled: parsedTypes.isContactEnabled,
			policyCriteria: [] as Array<PolicyCriteriaItem>,
			sourceVolume: initialSourceVolume,
			destinationVolume: initialDestinationVolume,
		},
		onSubmit: async () => {},
	});

	return (
		<HSMContext.Provider value={{ form, allVolumes: SAMPLE_VOLUMES }}>
			<EditHsmPolicyVolumesSection
				initialShowSource={parsedVolumes.hasSource}
				initialShowDestination={parsedVolumes.hasDestination}
			/>
		</HSMContext.Provider>
	);
}

describe('EditHsmPolicyVolumesSection (browser)', () => {
	describe('Section rendering', () => {
		it('renders the source volume section heading', async () => {
			await setupBrowserTest(<TestWrapper />);

			await expect.element(page.getByText('Source Volume', { exact: true })).toBeVisible();
		});

		it('renders the destination volume section heading', async () => {
			await setupBrowserTest(<TestWrapper />);

			await expect.element(page.getByText('Destination Volume', { exact: true })).toBeVisible();
		});
	});

	describe('Toggle switches', () => {
		it('renders the source volume toggle switch', async () => {
			await setupBrowserTest(<TestWrapper />);

			await expect
				.element(
					page.getByRole('switch', {
						name: 'Select manually source volumes',
					}),
				)
				.toBeVisible();
		});

		it('renders the destination volume toggle switch', async () => {
			await setupBrowserTest(<TestWrapper />);

			await expect
				.element(
					page.getByRole('switch', {
						name: 'Select manually destination volumes',
					}),
				)
				.toBeVisible();
		});
	});

	describe('Volume tables', () => {
		it('shows the source volume table after toggling the source switch on', async () => {
			await setupBrowserTest(<TestWrapper />);

			await page.getByRole('switch', { name: 'Select manually source volumes' }).click();

			await expect.element(page.getByText('Primary Volume', { exact: true })).toBeVisible();
		});

		it('shows the destination volume table after toggling the destination switch on', async () => {
			await setupBrowserTest(<TestWrapper />);

			await page.getByRole('switch', { name: 'Select manually destination volumes' }).click();

			await expect.element(page.getByText('Secondary Volume', { exact: true })).toBeVisible();
		});

		it('displays volume type labels (Primary, Secondary, Indexes) in the table', async () => {
			await setupBrowserTest(<TestWrapper />);

			await page.getByRole('switch', { name: 'Select manually source volumes' }).click();

			await expect.element(page.getByText('Primary', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Secondary', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Indexes', { exact: true })).toBeVisible();
		});
	});

	describe('currentPolicy parsing', () => {
		it('auto-toggles source and destination switches by parsing hsmQuery', async () => {
			await setupBrowserTest(
				<TestWrapper
					currentPolicy={{
						hsmQuery: 'source:1 destination:2',
						hsmType: [5],
					}}
				/>,
			);

			await expect
				.element(
					page.getByRole('switch', {
						name: 'Select manually source volumes',
					}),
				)
				.toHaveAttribute('aria-checked', 'true');
			await expect
				.element(
					page.getByRole('switch', {
						name: 'Select manually destination volumes',
					}),
				)
				.toHaveAttribute('aria-checked', 'true');
		});

		it('makes volume names visible in both tables when hsmQuery has source and destination', async () => {
			await setupBrowserTest(
				<TestWrapper
					currentPolicy={{
						hsmQuery: 'source:1 destination:2',
						hsmType: [5],
					}}
				/>,
			);

			await expect.element(page.getByText('Index Volume', { exact: true }).first()).toBeVisible();
		});
	});
});
