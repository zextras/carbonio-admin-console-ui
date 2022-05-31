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
				header: t('label.global', 'Global'),
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
				header: t('label.servers', 'Servers'),
				options: [
					{
						label: t('label.server_lists', 'Server Lists')
					}
				]
			},
			{
				header: t('label.actions', 'Actions'),
				options: [
					{
						label: t('label.import_external_backup', 'Import External Backup')
					}
				]
			}
		],
		[t]
	);
	return <PrimaryBarTooltip items={backupTooltipItems} />;
};

export default BackupTooltipView;
