/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryBarTooltip from '../primary-bar-tooltip/primary-bar-tooltip';

const SubscriptionTooltipView: FC = () => {
	const [t] = useTranslation();
	const subscriptionTooltipItems = useMemo(
		() => [
			{
				header: t('label.subscriptions', 'SUBSCRIPTIONS'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.subscription', 'Subscription'),
				options: [
					{
						label: t('label.details', 'Details')
					},
					{
						label: t('label.activate_and_update', 'Activate & Update')
					}
				]
			}
		],
		[t]
	);
	return <PrimaryBarTooltip items={subscriptionTooltipItems} />;
};

export default SubscriptionTooltipView;
