/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryBarTooltip from '../primary-bar-tooltip/primary-bar-tooltip';

const CosTooltipView: FC = () => {
	const [t] = useTranslation();
	const cosTooltipItems = useMemo(
		() => [
			{
				header: t('label.cos', 'COS'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.details', 'Details'),
				options: [
					{
						label: t('label.general_information', 'General Information')
					},
					{
						label: t('label.features', 'Features')
					},
					{
						label: t('label.preferences', 'Preferences')
					},
					{
						label: t('label.server_pools', 'Server Pools')
					},
					{
						label: t('label.advanced', 'Advanced')
					},
					{
						label: t('label.retention_policy', 'Retention Policy')
					}
				]
			}
		],
		[t]
	);
	return <PrimaryBarTooltip items={cosTooltipItems} />;
};

export default CosTooltipView;
