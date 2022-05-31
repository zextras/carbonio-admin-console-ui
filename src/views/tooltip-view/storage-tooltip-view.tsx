/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryBarTooltip from '../primary-bar-tooltip/primary-bar-tooltip';

const StorageTooltipView: FC = () => {
	const [t] = useTranslation();
	const storagesTooltipItems = useMemo(
		() => [
			{
				header: t('label.storages', 'STORAGES'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.servers', 'Servers'),
				options: [
					{
						label: t('label.service_status', 'Service_Status')
					},
					{
						label: t('label.volumes', 'Volumes')
					},
					{
						label: t('label.hsm_policies', 'HSM Policies')
					},
					{
						label: t('label.indexer_settings', 'Indexer Settings')
					},
					{
						label: t('label.index_volumes', 'Index Volumes')
					}
				]
			},
			{
				header: t('label.buckets', 'Buckets'),
				options: [
					{
						label: t('label.connect_buckets', 'Connect Buckets')
					}
				]
			}
		],
		[t]
	);
	return <PrimaryBarTooltip items={storagesTooltipItems} />;
};

export default StorageTooltipView;
