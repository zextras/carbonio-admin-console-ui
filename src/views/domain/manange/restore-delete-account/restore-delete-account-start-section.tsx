/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext } from 'react';
import { Container, Input, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ListRow from '../../../list/list-row';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';
import { getFormatedDate } from '../../../utility/utils';
import { useDomainStore } from '../../../../store/domain/store';

const RestoreDeleteAccountStartSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(RestoreDeleteAccountContext);
	const { restoreAccountDetail, setRestoreAccountDetail } = context;
	const domainName = useDomainStore((state) => state.domain?.name);
	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="100%"
			padding={{ top: 'extralarge' }}
		>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container height="fit" crossAlignment="flex-start" background="gray6">
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="fill"
						padding={{ bottom: 'large', left: 'large', right: 'large' }}
					>
						<ListRow>
							<Container padding={{ right: 'medium', bottom: 'medium' }}>
								<Input
									backgroundColor="gray6"
									label={t('label.account', 'Account')}
									value={restoreAccountDetail?.name}
									readOnly
								/>
							</Container>
							<Container padding={{ bottom: 'medium' }}>
								<Input
									backgroundColor="gray6"
									label={t('label.destination_account', 'Destination Account')}
									value={
										restoreAccountDetail?.copyAccount === ''
											? ''
											: `${restoreAccountDetail?.copyAccount.split('@')[0]}@${domainName}`
									}
									readOnly
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ bottom: 'large' }}>
								<Input
									backgroundColor="gray6"
									label={t('label.use_last_available_status', 'Use last available status')}
									value={
										restoreAccountDetail?.lastAvailableStatus
											? t('label.yes', 'Yes')
											: t('label.no', 'NO')
									}
									readOnly
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ bottom: 'large' }}>
								<Input
									backgroundColor="gray6"
									label={t('label.date_and_hour', 'Date & Hour')}
									value={
										restoreAccountDetail?.dateTime === null
											? ''
											: getFormatedDate(restoreAccountDetail?.dateTime)
									}
									readOnly
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ right: 'medium', bottom: 'medium' }}>
								<Input
									backgroundColor="gray6"
									label={t(
										'label.apply_hsm_policy_after_the_restore',
										'Apply HSM Policies after the restore'
									)}
									value={
										restoreAccountDetail?.hsmApply ? t('label.yes', 'Yes') : t('label.no', 'NO')
									}
									readOnly
								/>
							</Container>
							<Container padding={{ right: 'medium', bottom: 'medium' }}>
								<Input
									backgroundColor="gray6"
									label={t('label.restore_external_data_source', 'Restore External Data Sources')}
									value={
										restoreAccountDetail?.dataSource ? t('label.yes', 'Yes') : t('label.no', 'NO')
									}
									readOnly
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ bottom: 'large' }}>
								<Input
									backgroundColor="gray6"
									label={t('label.mail_notifications', 'Email Notifications')}
									value={
										restoreAccountDetail?.notificationReceiver === ''
											? '-'
											: restoreAccountDetail?.notificationReceiver
									}
									readOnly
								/>
							</Container>
						</ListRow>
					</Row>
				</Container>
			</Row>
		</Container>
	);
};
export default RestoreDeleteAccountStartSection;
