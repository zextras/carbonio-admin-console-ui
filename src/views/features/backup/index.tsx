/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, lazy, Suspense } from 'react';

const GlobalView = lazy(() => import('./global/global-view'));

const BackupView: FC = () => (
	<Suspense fallback="Loading...">
		<GlobalView />
	</Suspense>
);
export default BackupView;
