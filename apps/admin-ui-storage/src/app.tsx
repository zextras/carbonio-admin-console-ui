/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addRoute, getRights, useCurrentUserRights } from '@zextras/admin-ui-bootstrap';
import { FC, lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	LIST_SERVER,
	MANAGE_APP_ID,
	PRIMARY_BAR_STORAGE,
	SERVER,
	STORAGES_ROUTE_ID
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

	const { data: rights } = useCurrentUserRights();
	const [hasListServerRights, sethasListServerRights] = useState<boolean>(false);

	const managementSection = useMemo(
		() => ({
			id: MANAGE_APP_ID,
			label: t('label.management', 'Management'),
			position: 3
		}),
		[t]
	);
	const storagesTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.storage_lbl"
							defaults="<bold>Storage</bold>"
							components={{ bold: <strong /> }}
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.storage_primarybar_tooltip"
							defaults="View your <bold>server status</bold>, your <bold>volumes</bold> and <bold>HSM policies</bold>. You’ll also be able to <bold>connect buckets</bold>."
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

	const StorageTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={storagesTooltipItems} />,
		[storagesTooltipItems]
	);

	useEffect(() => {
		if (rights && rights.length > 0) {
			const right = getRights(rights, SERVER);
			if (right.length > 0) {
				const findServerRight = right.find(
					(item: Record<string, string>) => item?.n && item?.n === LIST_SERVER
				);
				if (findServerRight) {
					sethasListServerRights(true);
				}
			}
		}
	}, [rights]);

	useEffect(() => {
		if (hasListServerRights) {
			addRoute({
				route: STORAGES_ROUTE_ID,
				position: 4,
				visible: true,
				label: t('label.storage', 'Storage') || '',
				primaryBar: 'HardDriveOutline',
				appView: AppView,
				primarybarSection: { ...managementSection },
				tooltip: StorageTooltipView,
				trackerLabel: PRIMARY_BAR_STORAGE
			});
		}
	}, [StorageTooltipView, hasListServerRights, managementSection, t]);

	return null;
};

export default App;
