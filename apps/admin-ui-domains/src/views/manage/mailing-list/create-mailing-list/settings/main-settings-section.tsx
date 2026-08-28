/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListRow, Row, Switch } from '@zextras/ui-components';
import { type FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { MailingListContext } from '../mailinglist-context';

export const MainSettingsSection: FC = () => {
	const { t } = useTranslation();
	const { mailingListDetail, setMailingListDetail } = useContext(MailingListContext);

	return (
		<>
			<Row>
				<ds-text as="h3" size="small" weight="bold">
					{t('label.main_settings', 'Main Settings')}
				</ds-text>
			</Row>

			{!mailingListDetail?.dynamic && (
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'medium', bottom: 'medium' }}
					>
						<Switch
							value={mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers}
							label={t(
								'label.send_new_members_notification_for_share_assigned_to_this_group',
								'Send new members a notification for the share/delegation assigned to this group'
							)}
							onClick={(): void => {
								setMailingListDetail((prev: any) => ({
									...prev,
									zimbraDistributionListSendShareMessageToNewMembers:
										!mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers
								}));
							}}
							iconColor="primary"
						/>
					</Container>
				</ListRow>
			)}

			<ListRow>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					orientation="horizontal"
					padding={{ top: 'medium', bottom: 'medium' }}
				>
					<Switch
						value={mailingListDetail?.zimbraHideInGal}
						label={t('label.hidden_from_gal', 'Hidden from GAL')}
						onClick={(): void => {
							setMailingListDetail((prev: any) => ({
								...prev,
								zimbraHideInGal: !mailingListDetail?.zimbraHideInGal
							}));
						}}
						iconColor="primary"
					/>
				</Container>
			</ListRow>

			<ListRow>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					orientation="horizontal"
					padding={{ top: 'medium', bottom: 'medium' }}
				>
					<Switch
						value={mailingListDetail?.zimbraMailStatus}
						label={t('label.this_list_can_receive_email', 'This list can receive emails')}
						onClick={(): void => {
							setMailingListDetail((prev: any) => ({
								...prev,
								zimbraMailStatus: !mailingListDetail?.zimbraMailStatus
							}));
						}}
						iconColor="primary"
					/>
				</Container>
			</ListRow>
		</>
	);
};
