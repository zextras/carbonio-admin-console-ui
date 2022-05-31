/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryBarTooltip from '../primary-bar-tooltip/primary-bar-tooltip';

const DomainTooltipView: FC = () => {
	const [t] = useTranslation();
	const domainsTooltipItems = useMemo(
		() => [
			{
				header: t('label.domains', 'DOMAINS'),
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
						label: t('label.domain_status', 'Domain Status')
					},
					{
						label: t('label.General_Settings', 'General Settings')
					},
					{
						label: t('label.gal', 'GAL')
					},
					{
						label: t('label.authentication', 'Authentication')
					},
					{
						label: t('label.virtual_hosts', 'Virtual Hosts')
					},
					{
						label: t('label.mailbox_quota', 'Mailbox Quota')
					}
				]
			},
			{
				header: t('label.management', 'Management'),
				options: [
					{
						label: t('label.accounts', 'Accounts')
					},
					{
						label: t('label.mailing_lists', 'Mailing Lists')
					},
					{
						label: t('label.resources', 'Resources')
					},
					{
						label: t('domain.admin_delegates', 'Admin Delegates')
					},
					{
						label: t('domain.active_sync', 'ActiveSync')
					},
					{
						label: t('domain.account_scan', 'AccountScan')
					},
					{
						label: t('domain.export_domain', 'Export Domain')
					},
					{
						label: t('domain.restore_account', 'Restore Account')
					},
					{
						label: t('domain.restore_deleted_email', 'Restore Deleted E-mail')
					}
				]
			}
		],
		[t]
	);
	return <PrimaryBarTooltip items={domainsTooltipItems} />;
};

export default DomainTooltipView;
