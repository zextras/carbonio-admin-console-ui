/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, lazy, Suspense, useEffect } from 'react';
import { addRoute, registerActions, setAppContext, Spinner } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { APP_ID, CREATE_NEW_DOMAIN_ROUTE_ID, DOMAINS_ROUTE_ID, MANAGE } from './constants';
import SidebarView from './views/secondary-bar/sidebar';

const LazyAppView = lazy(() => import('./views/app-view'));

const AppView: FC = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazyAppView {...props} />
	</Suspense>
);

const App: FC = () => {
	const [t] = useTranslation();
	const history = useHistory();
	useEffect(() => {
		const label1 = t('label.app_name', 'Manage');
		addRoute({
			route: MANAGE,
			position: 3,
			visible: true,
			label: label1,
			primaryBar: 'List',
			secondaryBar: SidebarView,
			appView: AppView
		});
		setAppContext({ hello: 'world' });
	}, [t]);

	useEffect(() => {
		registerActions({
			action: (): any => ({
				id: 'new-domain',
				label: t('label.new_domain', 'New Domain'),
				icon: '',
				click: (ev: any): void => {
					history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
				},
				disabled: false,
				group: APP_ID,
				primary: false
			}),
			id: 'new-domain',
			type: 'new'
		});
	}, [t, history]);

	return null;
};

export default App;
