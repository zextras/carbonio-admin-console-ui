/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryBarTooltip from '../primary-bar-tooltip/primary-bar-tooltip';

const BackupTooltipView: FC = () => {
	const [t] = useTranslation();
	const backupTooltipItems = useMemo(
		() => [
			{
				header: t('label.backup', 'BACKUP'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.default_settings', 'Default Settings'),
				options: [
					{
						label: t('label.service_status', 'Service Status')
					},
					{
						label: t('label.server_config', 'Server Config')
					},
					{
						label: t('label.advanced', 'Advanced')
					}
				]
			},
			{
				header: t('label.server_settings', 'Server Settings'),
				options: [
					{
						label: t('label.servers_list', 'Servers List')
					}
				]
			},
			{
				header: t('label.actions', 'Actions'),
				options: [
					{
						label: t('label.import_an_external_backup', 'Import an External Backup')
					}
				]
			}
		],
		[t]
	);
	return <PrimaryBarTooltip items={backupTooltipItems} />;
};

export default BackupTooltipView;
