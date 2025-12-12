/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Dropdown,MultiButton } from '@zextras/carbonio-design-system';
import { groupBy,reduce } from 'lodash';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Action, AppRoute } from '../../types';
import { ACTION_TYPES } from '../constants';
import { useAppList } from '../store/app';
import { useActions } from '../store/integrations/hooks';

const useSecondaryActions = (
	actions: Array<Action>,
	activeRoute?: AppRoute
): Array<Action | { type: string; id: string }> => {
	const apps = useAppList();

	const byApp = useMemo(() => groupBy(actions, 'group'), [actions]);
	return useMemo(
		() => [
			...(byApp[activeRoute?.app ?? ''] ?? []),
			...reduce(
				apps,
				(acc, app, i) => {
					if (app.name !== activeRoute?.app && byApp[app.name]?.length > 0) {
						acc.push({ type: 'divider', label: '', id: `divider-${i}` }, ...byApp[app.name]);
					}
					return acc;
				},
				[] as Array<Action | { type: string; id: string }>
			)
		],
		[activeRoute?.app, apps, byApp]
	);
};

export const CreationButton: FC<{ activeRoute?: AppRoute }> = ({ activeRoute }) => {
	const [t] = useTranslation();
	const location = useLocation();
	const actions = useActions({ activeRoute, location }, ACTION_TYPES.NEW);
	const [open, setOpen] = useState(false);
	const primaryAction = useMemo(
		() =>
			actions?.find?.(
				(a) => (a.group === activeRoute?.id || a.group === activeRoute?.app) && a.primary
			),
		[actions, activeRoute?.app, activeRoute?.id]
	);
	const secondaryActions = useSecondaryActions(actions, activeRoute);

	const onClose = useCallback(() => {
		setOpen(false);
	}, []);
	const onOpen = useCallback(() => {
		setOpen(true);
	}, []);
	return primaryAction ? (
		<MultiButton
			style={{ height: '2.625rem' }}
			background="primary"
			label={primaryAction?.label ?? t('new', 'New')}
			onClick={primaryAction?.onClick}
			items={secondaryActions}
			disabled={!primaryAction || primaryAction?.disabled}
		/>
	) : (
		<Dropdown items={secondaryActions} onClose={onClose} onOpen={onOpen}>
			<Button
				style={{ height: '2.625rem', padding: '0.5rem 0.75rem 0.5rem 0.75rem ' }}
				background="primary"
				items={secondaryActions}
				label={t('create', 'Create')}
				icon={open ? 'ChevronUp' : 'ChevronDown'}
				minWidth={'max-content'}
			/>
		</Dropdown>
	);
};
