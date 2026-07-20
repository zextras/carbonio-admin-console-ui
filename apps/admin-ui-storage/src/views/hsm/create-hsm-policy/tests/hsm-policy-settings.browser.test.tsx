/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { Volume } from '../../../../../types';
import { HSMContext } from '../../hsm-context/hsm-context';
import { HSMpolicySettings } from '../hsm-policy-settings';

const SAMPLE_VOLUMES: Array<Volume> = [
	{ id: 1, name: 'Primary Volume', type: 1, isCurrent: true },
	{ id: 2, name: 'Secondary Volume', type: 2, isCurrent: false },
	{ id: 3, name: 'Index Volume', type: 10, isCurrent: false },
];

type PolicyCriteriaEntry = {
	option: string;
	dateScale: string;
	scale: string;
};

type FormValues = {
	isAllEnabled: boolean;
	isMessageEnabled: boolean;
	isEventEnabled: boolean;
	isContactEnabled: boolean;
	isDocumentEnabled: boolean;
	policyCriteria: Array<PolicyCriteriaEntry>;
	sourceVolume: Array<Volume>;
	destinationVolume: Array<Volume>;
};

type TestHarnessProps = {
	initialFormValues?: Partial<FormValues>;
	allVolumes?: Array<Volume>;
};

type FormStateSnapshot = {
	isAllEnabled: boolean;
	isMessageEnabled: boolean;
	isDocumentEnabled: boolean;
	isEventEnabled: boolean;
	isContactEnabled: boolean;
	policyCriteriaLength: number;
	sourceVolumeLength: number;
	destinationVolumeLength: number;
};

function TestHarness({
	initialFormValues,
	allVolumes = SAMPLE_VOLUMES,
}: TestHarnessProps): React.JSX.Element {
	const form = useForm({
		defaultValues: {
			isAllEnabled: false,
			isMessageEnabled: false,
			isEventEnabled: false,
			isContactEnabled: false,
			isDocumentEnabled: false,
			policyCriteria: [],
			sourceVolume: [],
			destinationVolume: [],
			...initialFormValues,
		},
		onSubmit: async () => {},
	});

	const formValues = useSelector(form.store, (s) => s.values);

	return (
		<HSMContext.Provider value={{ form, allVolumes }}>
			<HSMpolicySettings />
			<div data-testid="form-state" style={{ position: 'absolute', left: '-9999px' }}>
				{JSON.stringify({
					isAllEnabled: formValues.isAllEnabled,
					isMessageEnabled: formValues.isMessageEnabled,
					isDocumentEnabled: formValues.isDocumentEnabled,
					isEventEnabled: formValues.isEventEnabled,
					isContactEnabled: formValues.isContactEnabled,
					policyCriteriaLength: formValues.policyCriteria.length,
					sourceVolumeLength: formValues.sourceVolume.length,
					destinationVolumeLength: formValues.destinationVolume.length,
				})}
			</div>
		</HSMContext.Provider>
	);
}

function getFormState(): FormStateSnapshot {
	const el = document.querySelector('[data-testid="form-state"]');
	return JSON.parse(el?.textContent ?? '{}') as FormStateSnapshot;
}

describe('HSMpolicySettings (browser)', () => {
	describe('Rendering', () => {
		it('renders the Items section heading', async () => {
			await setupBrowserTest(<TestHarness />);
			await expect.element(page.getByText('Items', { exact: true })).toBeVisible();
		});

		it('renders all item type checkboxes (All, Message, Document, Event, Contact)', async () => {
			await setupBrowserTest(<TestHarness />);
			await expect.element(page.getByText('All', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Message', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Document', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Event', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Contact', { exact: true })).toBeVisible();
		});

		it('renders the Criteria section heading', async () => {
			await setupBrowserTest(<TestHarness />);
			await expect.element(page.getByText('Criteria', { exact: true })).toBeVisible();
		});

		it('renders the Add button in the criteria row', async () => {
			await setupBrowserTest(<TestHarness />);
			await expect
				.element(page.getByRole('button', { name: /^add$/i }))
				.toBeVisible();
		});

		it('renders the empty-list message when no criteria are present', async () => {
			await setupBrowserTest(<TestHarness />);
			await expect
				.element(page.getByText('This list is empty.', { exact: true }))
				.toBeVisible();
		});

		it('renders the criteria Option selector with its default After (Date) value', async () => {
			await setupBrowserTest(<TestHarness />);
			await expect.element(page.getByText('Option', { exact: true })).toBeVisible();
			await expect
				.element(page.getByText('After (Date)', { exact: true }))
				.toBeVisible();
		});

		it('renders the Source Volume section heading and helper text', async () => {
			await setupBrowserTest(<TestHarness />);
			await expect
				.element(page.getByText('Source Volume', { exact: true }))
				.toBeVisible();
			await expect
				.element(
					page.getByText(/All primary volumes will be used as source by default/),
				)
				.toBeVisible();
		});

		it('renders the Destination Volume section heading and helper text', async () => {
			await setupBrowserTest(<TestHarness />);
			await expect
				.element(page.getByText('Destination Volume', { exact: true }))
				.toBeVisible();
			await expect
				.element(
					page.getByText(/current secondary volume will be used as a destination/),
				)
				.toBeVisible();
		});
	});

	describe('Volume tables', () => {
		it('renders every volume name in the source volume table when source volumes are preselected', async () => {
			await setupBrowserTest(
				<TestHarness
					initialFormValues={{
						sourceVolume: [
							{ id: 1, name: 'Primary Volume', type: 1, isCurrent: true },
						],
					}}
				/>,
			);
			await expect
				.element(page.getByText('Primary Volume', { exact: true }))
				.toBeVisible();
			await expect
				.element(page.getByText('Secondary Volume', { exact: true }))
				.toBeVisible();
			await expect
				.element(page.getByText('Index Volume', { exact: true }))
				.toBeVisible();
		});

		it('renders the volume type labels (Primary, Secondary, Indexes) in the source volume table', async () => {
			await setupBrowserTest(
				<TestHarness
					initialFormValues={{
						sourceVolume: [
							{ id: 1, name: 'Primary Volume', type: 1, isCurrent: true },
						],
					}}
				/>,
			);
			await expect.element(page.getByText('Primary', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Secondary', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Indexes', { exact: true })).toBeVisible();
		});

		it('renders volume names in the destination volume table when destination volumes are preselected', async () => {
			await setupBrowserTest(
				<TestHarness
					initialFormValues={{
						destinationVolume: [
							{ id: 2, name: 'Secondary Volume', type: 2, isCurrent: false },
						],
					}}
				/>,
			);
			await expect
				.element(page.getByText('Primary Volume', { exact: true }))
				.toBeVisible();
			await expect
				.element(page.getByText('Secondary Volume', { exact: true }))
				.toBeVisible();
			await expect
				.element(page.getByText('Index Volume', { exact: true }))
				.toBeVisible();
		});
	});

	describe('Item type checkbox interactions', () => {
		it('enables all types when the All checkbox is clicked', async () => {
			await setupBrowserTest(<TestHarness />);
			await page.getByText('All', { exact: true }).click();
			await vi.waitFor(() => {
				const state = getFormState();
				expect(state.isAllEnabled).toBe(true);
				expect(state.isMessageEnabled).toBe(true);
				expect(state.isDocumentEnabled).toBe(true);
				expect(state.isEventEnabled).toBe(true);
				expect(state.isContactEnabled).toBe(true);
			});
		});

		it('toggles Message type on/off and syncs isAllEnabled', async () => {
			await setupBrowserTest(<TestHarness />);
			await page.getByText('Message', { exact: true }).click();
			await vi.waitFor(() => {
				expect(getFormState().isMessageEnabled).toBe(true);
				expect(getFormState().isAllEnabled).toBe(false);
			});
		});

		it('sets isAllEnabled=true when all four individual types are enabled one by one', async () => {
			await setupBrowserTest(<TestHarness />);
			await page.getByText('Message', { exact: true }).click();
			await page.getByText('Document', { exact: true }).click();
			await page.getByText('Event', { exact: true }).click();
			await page.getByText('Contact', { exact: true }).click();
			await vi.waitFor(() => {
				expect(getFormState().isAllEnabled).toBe(true);
			});
		});

		it('toggles Document type on', async () => {
			await setupBrowserTest(<TestHarness />);
			await page.getByText('Document', { exact: true }).click();
			await vi.waitFor(() => {
				expect(getFormState().isDocumentEnabled).toBe(true);
			});
		});

		it('toggles Event type on', async () => {
			await setupBrowserTest(<TestHarness />);
			await page.getByText('Event', { exact: true }).click();
			await vi.waitFor(() => {
				expect(getFormState().isEventEnabled).toBe(true);
			});
		});

		it('toggles Contact type on', async () => {
			await setupBrowserTest(<TestHarness />);
			await page.getByText('Contact', { exact: true }).click();
			await vi.waitFor(() => {
				expect(getFormState().isContactEnabled).toBe(true);
			});
		});
	});

	describe('Criteria interactions', () => {
		it('adds a criteria row when Add is clicked', async () => {
			await setupBrowserTest(<TestHarness />);
			await page.getByRole('button', { name: /^add$/i }).click();
			await vi.waitFor(() => {
				expect(getFormState().policyCriteriaLength).toBe(1);
			});
		});

		it('adds multiple criteria rows when Add is clicked repeatedly', async () => {
			await setupBrowserTest(<TestHarness />);
			await page.getByRole('button', { name: /^add$/i }).click();
			await page.getByRole('button', { name: /^add$/i }).click();
			await vi.waitFor(() => {
				expect(getFormState().policyCriteriaLength).toBe(2);
			});
		});

		it('hides the empty-list message after a criteria is added', async () => {
			await setupBrowserTest(<TestHarness />);
			await expect
				.element(page.getByText('This list is empty.', { exact: true }))
				.toBeVisible();
			await page.getByRole('button', { name: /^add$/i }).click();
			await vi.waitFor(() => {
				expect(
					page.getByText('This list is empty.', { exact: true }).elements().length,
				).toBe(0);
			});
		});
	});

	describe('Volume selection interactions', () => {
		it('shows the source volume table after toggling the source switch on', async () => {
			await setupBrowserTest(<TestHarness />);
			await page
				.getByRole('switch', { name: 'Select manually source volumes' })
				.click();
			await expect
				.element(page.getByText('Primary Volume', { exact: true }))
				.toBeVisible();
		});

		it('shows the destination volume table after toggling the destination switch on', async () => {
			await setupBrowserTest(<TestHarness />);
			await page
				.getByRole('switch', { name: 'Select manually destination volumes' })
				.click();
			await expect
				.element(page.getByText('Secondary Volume', { exact: true }))
				.toBeVisible();
		});

		it('renders volume type labels in the source table (Primary, Secondary, Indexes)', async () => {
			await setupBrowserTest(<TestHarness />);
			await page
				.getByRole('switch', { name: 'Select manually source volumes' })
				.click();
			await expect.element(page.getByText('Primary', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Secondary', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Indexes', { exact: true })).toBeVisible();
		});

		it('renders Yes/No for the current volume flag', async () => {
			await setupBrowserTest(<TestHarness />);
			await page
				.getByRole('switch', { name: 'Select manually source volumes' })
				.click();
			await expect.element(page.getByText('Yes', { exact: true })).toBeVisible();
			await expect.element(page.getByText('No', { exact: true }).first()).toBeVisible();
		});
	});
});
