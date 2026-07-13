/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
	advancedSupportedApiForBrowser,
	createBrowserZextrasActionInterceptor,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React, { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { volumeCreateSchema } from '../schema';
import { VolumeContext } from '../volume-context';
import AdvancedMailstoresDefinition from './advanced-mailstores-definition';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import type { AdvancedVolumeFormValues } from './types';

const UNUSED_CONNECTORS = [
	{
		uuid: 'conn-unused',
		label: 'Unused connector',
		bucketName: 'unused-bucket',
		storeType: 'S3',
		notes: '',
		'usage in external backup': 'unused',
	},
	{
		uuid: 'conn-used',
		label: 'Used connector',
		bucketName: 'used-bucket',
		storeType: 'S3',
		notes: '',
		'usage in external backup': 'in-use',
	},
];

function Harness({
	setToggleNextBtn,
	setCompleteLoading,
	initialVolumeName,
}: {
	setToggleNextBtn: (value: boolean) => void;
	setCompleteLoading: (value: boolean) => void;
	initialVolumeName?: string;
}): React.JSX.Element {
	const volumeForm = useForm({
		defaultValues: {
			id: '',
			volumeName: initialVolumeName ?? '',
			volumeMain: 1,
			path: '',
			isCurrent: false,
			isCompression: false,
			compressionThreshold: '',
			volumeAllocation: 0,
		},
		validators: { onChange: volumeCreateSchema },
		onSubmit: async () => {},
	});

	const [isAllocationToggle, setIsAllocationToggle] = useState(false);

	const advancedForm = useForm({
		defaultValues: {
			volumeName: initialVolumeName ?? '',
			volumeMain: 0,
			isCurrent: false,
			volumeAllocation: '',
			bucketName: '',
			unusedBucketType: '',
			tieringSupported: false,
			bucketId: '',
			prefix: '',
			centralized: false,
			useInfrequentAccess: false,
			infrequentAccessThreshold: '',
			useIntelligentTiering: false,
		} as AdvancedVolumeFormValues,
		onSubmit: async () => {},
	});

	const advancedValues = useSelector(advancedForm.store, (s) => s.values);

	return (
		<VolumeContext.Provider value={{ form: volumeForm }}>
			<AdvancedVolumeContext.Provider
				value={{ form: advancedForm, isAllocationToggle, setIsAllocationToggle }}
			>
				<AdvancedMailstoresDefinition
					externalData="server-a"
					setToggleNextBtn={setToggleNextBtn}
					setCompleteLoading={setCompleteLoading}
				/>
				<div data-testid="advanced-state">{JSON.stringify(advancedValues)}</div>
			</AdvancedVolumeContext.Provider>
		</VolumeContext.Provider>
	);
}

function renderHarness(props: {
	setToggleNextBtn?: (value: boolean) => void;
	setCompleteLoading?: (value: boolean) => void;
	initialVolumeName?: string;
}): React.ReactElement {
	return (
		<Harness
			setToggleNextBtn={props.setToggleNextBtn ?? vi.fn()}
			setCompleteLoading={props.setCompleteLoading ?? vi.fn()}
			initialVolumeName={props.initialVolumeName}
		/>
	);
}

describe('AdvancedMailstoresDefinition (browser)', () => {
	beforeEach(async () => {
		await advancedSupportedApiForBrowser.withAdvancedSupported();
		createBrowserZextrasActionInterceptor('listS3Connector', () =>
			HttpResponse.json({
				Body: {
					response: {
						content: JSON.stringify({
							ok: true,
							response: { values: UNUSED_CONNECTORS },
						}),
					},
				},
			}),
		);
	});

	it('should show and clear volume name validation message', async () => {
		await setupBrowserTest(renderHarness({}));

		await page.getByLabelText('Volume Name').fill('Volume A');
		expect(
			page.getByText('Volume name is required.', { exact: true }).elements(),
		).toHaveLength(0);

		await page.getByLabelText('Volume Name').fill('');
		await expect
			.element(page.getByText('Volume name is required.', { exact: true }))
			.toBeVisible();
	});

	it('should enable next and complete loading for local block device allocation', async () => {
		const setToggleNextBtn = vi.fn();
		const setCompleteLoading = vi.fn();

		await setupBrowserTest(
			renderHarness({
				setToggleNextBtn,
				setCompleteLoading,
				initialVolumeName: 'Volume A',
			}),
		);

		await vi.waitFor(() => {
			expect(setToggleNextBtn).toHaveBeenCalledWith(true);
			expect(setCompleteLoading).toHaveBeenCalledWith(true);
		});
	});

	it('should initialize local allocation from default selection on mount', async () => {
		const setToggleNextBtn = vi.fn();
		const setCompleteLoading = vi.fn();

		await setupBrowserTest(
			renderHarness({
				setToggleNextBtn,
				setCompleteLoading,
				initialVolumeName: 'Volume A',
			}),
		);

		await vi.waitFor(() => {
			expect(setToggleNextBtn).toHaveBeenCalledWith(true);
			expect(setCompleteLoading).toHaveBeenCalledWith(true);
		});
	});

	it('should render external bucket selector after choosing Object Storage', async () => {
		const setCompleteLoading = vi.fn();

		await setupBrowserTest(
			renderHarness({
				setCompleteLoading,
				initialVolumeName: 'Volume A',
			}),
		);

		await page.getByText('Storage Type', { exact: true }).click();
		await page.getByText('Object Storage', { exact: true }).click();

		await vi.waitFor(() => {
			expect(setCompleteLoading).toHaveBeenCalledWith(true);
		});

		expect(
			document.querySelector('[data-testid="advanced-state"]')?.textContent ?? '',
		).toContain('unused-bucket');
		expect(
			document.querySelector('[data-testid="advanced-state"]')?.textContent ?? '',
		).toContain('conn-unused');
	});

	it('should auto-select first available bucket for object storage', async () => {
		const setCompleteLoading = vi.fn();

		await setupBrowserTest(
			renderHarness({
				setCompleteLoading,
				initialVolumeName: 'Volume A',
			}),
		);

		await page.getByText('Storage Type', { exact: true }).click();
		await page.getByText('Object Storage', { exact: true }).click();

		await vi.waitFor(() => {
			expect(setCompleteLoading).toHaveBeenCalledWith(true);
		});

		expect(
			document.querySelector('[data-testid="advanced-state"]')?.textContent ?? '',
		).toContain('unused-bucket');
	});
});
