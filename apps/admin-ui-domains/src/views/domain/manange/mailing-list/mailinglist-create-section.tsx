/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Row,Table, Text } from '@zextras/carbonio-design-system';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ALL, EMAIL, GRP, PUB } from '../../../../constants';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import ListRow from '../../../list/list-row';
import { MailingListContext } from './mailinglist-context';

const MailingListCreateSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(MailingListContext);
	const { mailingListDetail, setMailingListDetail } = context;
	const [ownerMember, setOwnerMember] = useState<Array<any>>([]);
	const [memberList, setMemberList] = useState<Array<any>>([]);
	const [ldapQueryMembers, setLdapQueryMembers] = useState<Array<any>>([]);
	const [grantEmailType, setGrantEmailType] = useState<string>('');

	const tableHeader: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.accounts', 'Accounts'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const ownerTableHeader: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.accounts_that_are_owners', 'Accounts that are owners'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	useEffect(() => {
		const member = mailingListDetail?.members;
		if (member && member.length > 0) {
			const allRows = member.map((item: any) => ({
				id: item,
				columns: [
					<Text size="medium" weight="light" key={item} color="#828282">
						{item}
					</Text>
				]
			}));
			setMemberList(allRows);
		}
	}, [mailingListDetail?.members]);

	useEffect(() => {
		const ownersList = mailingListDetail?.owners;
		if (ownersList && ownersList.length > 0) {
			const allRows = ownersList.map((item: any) => ({
				id: item,
				columns: [
					<Text size="medium" weight="light" key={item?.id} color="#828282">
						{item}
					</Text>
				]
			}));
			setOwnerMember(allRows);
		}
	}, [mailingListDetail?.owners]);

	useEffect(() => {
		const member = mailingListDetail?.ldapQueryMembers;
		if (member && member.length > 0) {
			const allRows = member.map((item: any) => ({
				id: item?.id,
				columns: [
					<Text size="medium" weight="light" key={item?.id} color="#828282">
						{item?.name}
					</Text>
				]
			}));
			setLdapQueryMembers(allRows);
		}
	}, [mailingListDetail?.ldapQueryMembers]);

	useEffect(() => {
		if (mailingListDetail?.ownerGrantEmailType?.value === PUB) {
			setGrantEmailType(t('label.everyone', 'Everyone'));
		} else if (mailingListDetail?.ownerGrantEmailType?.value === GRP) {
			setGrantEmailType(t('label.members_only', 'Members only'));
		} else if (mailingListDetail?.ownerGrantEmailType?.value === ALL) {
			setGrantEmailType(t('label.internal_users_only', 'Internal Users only'));
		} else if (mailingListDetail?.ownerGrantEmailType?.value === EMAIL) {
			setGrantEmailType(t('label.only_there_users', 'Only these users'));
		}
	}, [mailingListDetail?.ownerGrantEmailType, t]);

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 300px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.display_name', 'Display Name')}
							backgroundColor="gray6"
							value={mailingListDetail?.displayName}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.address', 'Address')}
							backgroundColor="gray6"
							value={`${mailingListDetail?.prefixName}@${mailingListDetail?.suffixName}`}
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.description', 'Description')}
							backgroundColor="gray6"
							value={mailingListDetail?.zimbraNotes}
						/>
					</Container>
				</ListRow>
				{!mailingListDetail?.dynamic && (
					<Row>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'extralarge', bottom: 'medium' }}
						>
							<Text size="small" weight="bold">
								{t('label.members', 'Members')}
							</Text>
						</Container>
					</Row>
				)}
				{!mailingListDetail?.dynamic && (
					<ListRow>
						<Container padding={{ bottom: 'medium' }}>
							<Table
								rows={memberList}
								headers={tableHeader}
								showCheckbox={false}
								RowFactory={CustomRowFactory}
								HeaderFactory={CustomHeaderFactory}
							/>
						</Container>
					</ListRow>
				)}
				{mailingListDetail?.dynamic && (
					<ListRow>
						{!mailingListDetail?.dynamic && (
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large', right: 'small' }}
							>
								<Input
									label={t('label.share_message_to_new_member', 'Share message to new members')}
									backgroundColor="gray6"
									value={
										mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers
											? t('label.yes', 'Yes')
											: t('label.no', 'No')
									}
								/>
							</Container>
						)}
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.hidden_from_gal', 'Hidden from GAL')}
								backgroundColor="gray6"
								value={
									mailingListDetail?.zimbraHideInGal ? t('label.yes', 'Yes') : t('label.no', 'No')
								}
							/>
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t(
									'label.send_new_members_notification_for_share_assigned_to_this_group',
									'Send new members a notification for the share/delegation assigned to this group'
								)}
								backgroundColor="gray6"
								value={
									mailingListDetail?.zimbraMailStatus ? t('label.yes', 'Yes') : t('label.no', 'No')
								}
							/>
						</Container>
					</ListRow>
				)}
				{mailingListDetail?.dynamic && (
					<>
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'small', bottom: 'medium' }}
							>
								<Input
									label={t('label.distribution_list_url', "Distribution List's URL")}
									backgroundColor="gray6"
									value={mailingListDetail?.memberURL}
								/>
							</Container>
						</ListRow>
						<Row>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'extralarge', bottom: 'medium' }}
							>
								<Text size="small" weight="bold">
									{t('label.members', 'Members')}
								</Text>
							</Container>
						</Row>
						<ListRow>
							<Container padding={{ bottom: 'medium' }}>
								<Table
									rows={ldapQueryMembers}
									headers={tableHeader}
									showCheckbox={false}
									RowFactory={CustomRowFactory}
									HeaderFactory={CustomHeaderFactory}
								/>
							</Container>
						</ListRow>
					</>
				)}

				<Row>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'extralarge', bottom: 'medium' }}
					>
						<Text size="small" weight="bold">
							{t('label.owners_settings', 'Owners’ Settings')}
						</Text>
					</Container>
				</Row>

				<ListRow>
					<Input
						label={t('label.who_can_send_mails_to_this_list', 'Who can send mails TO this list?')}
						backgroundColor="gray6"
						value={grantEmailType}
					/>
				</ListRow>

				<ListRow>
					<Container padding={{ bottom: 'medium', top: 'medium' }}>
						<Table
							rows={ownerMember}
							headers={ownerTableHeader}
							showCheckbox={false}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</ListRow>

				{!mailingListDetail?.dynamic && (
					<ListRow>
						{!mailingListDetail?.dynamic && (
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large', right: 'small' }}
							>
								<Input
									label={t('label.share_message_to_new_member', 'Share message to new members')}
									backgroundColor="gray6"
									value={
										mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers
											? t('label.yes', 'Yes')
											: t('label.no', 'No')
									}
								/>
							</Container>
						)}
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.hidden_from_gal', 'Hidden from GAL')}
								backgroundColor="gray6"
								value={
									mailingListDetail?.zimbraHideInGal ? t('label.yes', 'Yes') : t('label.no', 'No')
								}
							/>
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.can_receive_email', 'Can receive email')}
								backgroundColor="gray6"
								value={
									mailingListDetail?.zimbraMailStatus ? t('label.yes', 'Yes') : t('label.no', 'No')
								}
							/>
						</Container>
					</ListRow>
				)}
			</Container>
		</Container>
	);
};

export default MailingListCreateSection;
