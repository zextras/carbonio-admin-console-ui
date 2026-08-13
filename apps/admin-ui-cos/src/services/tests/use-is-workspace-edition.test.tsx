/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router', () => ({
	useParams: vi.fn(() => ({ cosId: 'test-cos-id' })),
}));

vi.mock('../use-cos-detail', () => ({
	useCosDetail: vi.fn(),
}));

import { useParams } from 'react-router';

import { useCosDetail } from '../use-cos-detail';
import { useIsWorkspaceEdition } from '../use-is-workspace-edition';

describe('useIsWorkspaceEdition', () => {
	it('returns true when edition is "workspace"', () => {
		vi.mocked(useCosDetail).mockReturnValue({
			data: {
				cos: [
					{
						id: 'test-cos-id',
						name: 'testcos',
						_attrs: { edition: 'workspace' },
					},
				],
			},
		} as never);

		const { result } = renderHook(() => useIsWorkspaceEdition());
		expect(result.current).toBe(true);
	});

	it('returns false when edition is "mail"', () => {
		vi.mocked(useCosDetail).mockReturnValue({
			data: {
				cos: [
					{
						id: 'test-cos-id',
						name: 'testcos',
						_attrs: { edition: 'mail' },
					},
				],
			},
		} as never);

		const { result } = renderHook(() => useIsWorkspaceEdition());
		expect(result.current).toBe(false);
	});

	it('returns false when edition is empty', () => {
		vi.mocked(useCosDetail).mockReturnValue({
			data: {
				cos: [
					{
						id: 'test-cos-id',
						name: 'testcos',
						_attrs: { edition: '' },
					},
				],
			},
		} as never);

		const { result } = renderHook(() => useIsWorkspaceEdition());
		expect(result.current).toBe(false);
	});

	it('returns false when edition attribute is absent', () => {
		vi.mocked(useCosDetail).mockReturnValue({
			data: {
				cos: [
					{
						id: 'test-cos-id',
						name: 'testcos',
						_attrs: { cn: 'testcos' },
					},
				],
			},
		} as never);

		const { result } = renderHook(() => useIsWorkspaceEdition());
		expect(result.current).toBe(false);
	});

	it('returns false when data is still loading', () => {
		vi.mocked(useCosDetail).mockReturnValue({ data: undefined } as never);

		const { result } = renderHook(() => useIsWorkspaceEdition());
		expect(result.current).toBe(false);
	});

	it('returns false when cosEntry is undefined', () => {
		vi.mocked(useCosDetail).mockReturnValue({ data: { cos: [] } } as never);

		const { result } = renderHook(() => useIsWorkspaceEdition());
		expect(result.current).toBe(false);
	});

	it('reads cosId from useParams', () => {
		vi.mocked(useCosDetail).mockReturnValue({ data: undefined } as never);

		renderHook(() => useIsWorkspaceEdition());
		expect(useCosDetail).toHaveBeenCalledWith('test-cos-id');
		expect(useParams).toHaveBeenCalled();
	});
});
