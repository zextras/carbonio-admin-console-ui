/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { trim } from 'lodash';
import { FC } from 'react';

import { AppRouteDescriptor, BadgeInfo, CarbonioModule } from '../../../types';

export const normalizeApp = (app: Partial<CarbonioModule>): CarbonioModule => ({
	commit: app.commit ?? '',
	description: app.description ?? 'A carbonio Module',

	js_entrypoint: app.js_entrypoint ?? '',
	name: app.name ?? 'module',
	priority: app.priority ?? 99,
	version: app.version ?? '',
	type: app.type ?? 'carbonio',
	attrKey: app.attrKey,
	icon: app.icon ?? 'Cube',
	display: app.display ?? 'Module',
	sentryDsn: app.sentryDsn
});

const FallbackView: FC = () => <p>Missing Component</p>;

const normalizeBadgeInfo = (badge: Partial<BadgeInfo>): BadgeInfo => ({
	show: badge.show ?? false,
	count: badge.count ?? 0,
	showCount: badge.showCount ?? false,
	color: badge.color ?? 'primary'
});

export const normalizeRoute = (
	data: Partial<AppRouteDescriptor>,
	app: {
		name: CarbonioModule['name'];
		priority: CarbonioModule['priority'];
		icon: CarbonioModule['icon'];
	}
): AppRouteDescriptor => {
	const route = trim(data.route ?? app.name, '/');
	return {
		app: app.name,
		route,
		id: data.id ?? route,
		badge: normalizeBadgeInfo(data?.badge ?? {}),
		position: data?.position ?? app.priority,
		visible: data?.visible ?? true,
		label: data?.label ?? '',
		primaryBar: data.primaryBar ?? app.icon ?? 'CubeOutline',
		appView: data.appView ?? FallbackView,
		primarybarSection: data.primarybarSection,
		tooltip: data?.tooltip,
		trackerLabel: data?.trackerLabel
	};
};
