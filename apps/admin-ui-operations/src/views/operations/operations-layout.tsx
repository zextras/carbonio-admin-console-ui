/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { Outlet } from 'react-router';

import OperationsListPanel from './operations-list-panel';

const OperationsLayout: FC = () => {
	const detailViewMaxWidth = useDetailViewMaxWidth();

	return (
		<Container orientation="horizontal" mainAlignment="flex-start">
			<Container style={{ maxWidth: '16.563rem' }}>
				<Suspense fallback={<ds-spinner />}>
					<OperationsListPanel />
				</Suspense>
			</Container>
			<Container style={{ maxWidth: '100%' }}>
				<Container
					style={{ maxWidth: detailViewMaxWidth, transition: 'max-width 300ms' }}
				>
					<Suspense fallback={<ds-spinner />}>
						<Outlet />
					</Suspense>
				</Container>
			</Container>
		</Container>
	);
};

export default OperationsLayout;
