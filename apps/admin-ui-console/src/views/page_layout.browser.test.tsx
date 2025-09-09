/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe } from 'vitest';

describe.todo('PageSettings', () => {
	// test('PageLayout with only title prop does not show save and cancel button', () => {
	// 	setup(
	// 		<PageLayout title="Page title">
	// 			<div />
	// 		</PageLayout>
	// 	);
	// 	expect(screen.getByText('Page title')).toBeInTheDocument();
	// 	expect(screen.queryByText('Save')).not.toBeInTheDocument();
	// 	expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
	// });
	//
	// test('PageLayout without unsavedChanges does not show save and cancel button', () => {
	// 	setup(
	// 		<PageLayout title="Page title" onSave={jest.fn()} onCancel={jest.fn()} unSavedChanges={false}>
	// 			<div />
	// 		</PageLayout>
	// 	);
	// 	expect(screen.queryByText('Save')).not.toBeInTheDocument();
	// 	expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
	// });
	//
	// test('PageLayout with unsavedChanges shows save and cancel button', () => {
	// 	setup(
	// 		<PageLayout title="Page title" onSave={jest.fn()} onCancel={jest.fn()} unSavedChanges>
	// 			<div />
	// 		</PageLayout>
	// 	);
	// 	expect(screen.getByText('Save')).toBeInTheDocument();
	// 	expect(screen.getByText('Cancel')).toBeInTheDocument();
	// });
	//
	// test('User clicks on save button to run save action', async () => {
	// 	const saveAction = jest.fn();
	// 	const { user } = setup(
	// 		<PageLayout title="Page title" onSave={saveAction} onCancel={jest.fn()} unSavedChanges>
	// 			<div />
	// 		</PageLayout>
	// 	);
	// 	await user.click(screen.getByText('Save'));
	// 	expect(saveAction).toBeCalled();
	// });
	//
	// test('User clicks on cancel button to run cancel action', async () => {
	// 	const cancelAction = jest.fn();
	// 	const { user } = setup(
	// 		<PageLayout title="Page title" onSave={jest.fn()} onCancel={cancelAction} unSavedChanges>
	// 			<div />
	// 		</PageLayout>
	// 	);
	// 	await user.click(screen.getByText('Cancel'));
	// 	expect(cancelAction).toBeCalled();
	// });
});
