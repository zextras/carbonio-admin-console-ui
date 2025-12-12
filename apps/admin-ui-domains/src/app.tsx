/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	addRoute,
	registerActions,
	useCurrentUserRights,
	useDomainStore,
	useMtaServers
} from '@zextras/admin-ui-bootstrap';
import { find } from 'lodash';
import { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import {
	APP_ID,
	CREATE_NEW_DOMAIN_ROUTE_ID,
	CREATE_TOP_DOMAIN,
	DOMAINS_ROUTE_ID,
	GLOBAL,
	MANAGE,
	MANAGE_APP_ID,
	PRIMARY_BAR_DOMAINS
} from './constants';
import { Spinner } from './views/components/spinner';
import PrimaryBarTooltip from './views/primary-bar-tooltip/primary-bar-tooltip';

const LazyAppView = lazy(() => import('./views/app-view'));

const AppView: FC = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazyAppView {...props} />
	</Suspense>
);

const App: FC = () => {
	const [t] = useTranslation();
	const history = useHistory();
	const { data: _mtaServerList = [] } = useMtaServers();

	const { data: rights } = useCurrentUserRights();
	const { setDomainView, setDomain } = useDomainStore((state) => state);

	const createDomainRight = useMemo(() => {
		const rightsConfig = find(rights, { type: GLOBAL }) ?? { all: [], type: GLOBAL };
		return !!(
			rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
			rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
			find(rightsConfig?.all?.[0]?.right, { n: CREATE_TOP_DOMAIN })
		);
	}, [rights]);

	const managementSection = useMemo(
		() => ({
			id: MANAGE_APP_ID,
			label: t('label.management', 'Management'),
			position: 3
		}),
		[t]
	);

	const domainsTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.domains_lbl"
							defaults="<bold>Domains</bold>"
							components={{ bold: <strong /> }}
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.domain_primarybar_tooltip"
							defaults="View your <bold>domains details</bold> and <bold>manage</bold> their resources such as <bold>accounts, distribution lists, resources</bold> and <bold>more</bold>."
							components={{ bold: <strong /> }}
							t={t}
						/>
					</>
				),
				options: []
			}
		],
		[t]
	);

	const DomainTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={domainsTooltipItems} />,
		[domainsTooltipItems]
	);

	useEffect(() => {
		addRoute({
			route: DOMAINS_ROUTE_ID,
			position: 1,
			visible: true,
			label: t('label.domains', 'Domains') || '',
			primaryBar: 'AtOutline',
			appView: AppView,
			primarybarSection: { ...managementSection },
			tooltip: DomainTooltipView,
			trackerLabel: PRIMARY_BAR_DOMAINS
		});
	}, [DomainTooltipView, managementSection, t]);

	useEffect(() => {
		registerActions({
			action: (): any => ({
				id: 'new-domain',
				label: t('label.create_new_domain', 'Create New Domain'),
				icon: '',
				onClick: (): void => {
					history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
					setDomain({});
					setTimeout(() => {
						setDomainView(CREATE_NEW_DOMAIN_ROUTE_ID);
					}, 100);
				},
				disabled: !createDomainRight,
				group: APP_ID,
				primary: false
			}),
			id: 'new-domain',
			type: 'new'
		});
	}, [createDomainRight, history, setDomain, setDomainView, t]);

	return null;
};

export default App;
