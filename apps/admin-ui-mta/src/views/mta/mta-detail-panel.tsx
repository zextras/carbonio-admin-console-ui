/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import MTADetailOperationPanel from './mta-detail-operation-panel';

const MTADetailPanel: FC = () => {
	const location = useLocation();
	const path = location.pathname;

	return (
		<Container
			orientation="column"
			crossAlignment="center"
			mainAlignment="flex-start"
			style={{ overflowY: 'hidden' }}
			background="gray6"
		>
			<Routes>
				<Route path={`${path}/:operation`} element={<MTADetailOperationPanel />} />
				<Route path={`${path}/:server/:operation`} element={<MTADetailOperationPanel />} />
			</Routes>
		</Container>
	);
};

export default MTADetailPanel;
