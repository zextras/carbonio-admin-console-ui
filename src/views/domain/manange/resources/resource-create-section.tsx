/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, useEffect } from 'react';
import { Container, Input, Row, Text, Icon, Divider } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { ResourceContext } from './resource-context';
import ListRow from '../../../list/list-row';
import { SendInviteAccounts } from './send-invite-accounts';
import { SignatureDetail } from './signature-detail';

const ResourceCreateSection: FC = () => {
	const context = useContext(ResourceContext);
	const { t } = useTranslation();
	const { resourceDetail, setResourceDetail } = context;
	const [sendInviteList, setSendInviteList] = useState<any[]>([]);
	const [zimbraPrefCalendarAutoAcceptSignatureId, setZimbraPrefCalendarAutoAcceptSignatureId] =
		useState<any>({});
	const [zimbraPrefCalendarAutoDeclineSignatureId, setZimbraPrefCalendarAutoDeclineSignatureId] =
		useState<any>({});
	const [zimbraPrefCalendarAutoDenySignatureId, setZimbraPrefCalendarAutoDenySignatureId] =
		useState<any>({});
	const [signatureList, setSignatureList] = useState<any[]>([]);
	const [signatureItems, setSignatureItems] = useState<any[]>([]);
	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 300px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.details', 'Details')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Input
							label={t('label.resource_name', 'ResourceName')}
							backgroundColor="gray6"
							value={resourceDetail?.displayName}
							size="medium"
							readOnly
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="45%">
							<Input
								label={t('label.name', 'Name')}
								backgroundColor="gray6"
								value={resourceDetail?.name}
								size="medium"
								readOnly
							/>
						</Row>
						<Row width="10%" style={{ padding: '12px' }}>
							<Icon icon="AtOutline" color="gray0" size="large" />
						</Row>
						<Row width="45%">
							<Input
								label={t('label.domain', 'Domain')}
								backgroundColor="gray6"
								value=""
								size="medium"
								readOnly
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Container padding={{ right: 'large' }}>
							<Input
								label={t('label.type', 'Type')}
								backgroundColor="gray6"
								value={resourceDetail.zimbraCalResType}
								size="medium"
								readOnly
							/>
						</Container>
						<Container padding={{ right: 'large' }}>
							<Input
								label={t('label.status', 'Status')}
								backgroundColor="gray6"
								value={resourceDetail.zimbraAccountStatus}
								size="medium"
								readOnly
							/>
						</Container>
						<Container>
							<Input
								label={t('label.class_of_service', 'Class of Service')}
								backgroundColor="gray6"
								value={resourceDetail.zimbraCOSId}
								size="medium"
								readOnly
							/>
						</Container>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Container padding={{ right: 'large' }}>
							<Input
								label={t('label.auto_refuse', 'Auto-Refuse')}
								backgroundColor="gray6"
								value={resourceDetail.zimbraCalResAutoDeclineRecurring}
								size="medium"
								readOnly
							/>
						</Container>
						<Container padding={{ right: 'large' }}>
							<Input
								label={t('label.maximum_conflict', 'Maximun Conflict')}
								backgroundColor="gray6"
								value={resourceDetail.zimbraCalResMaxNumConflictsAllowed}
								size="medium"
								readOnly
							/>
						</Container>
						<Container>
							<Input
								label={t('label.percentage_maximum_conflict', '% Maximun Conflict')}
								backgroundColor="gray6"
								value={resourceDetail.zimbraCalResMaxPercentConflictsAllowed}
								readOnly
							/>
						</Container>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Input
							label={t('label.schedule_policy', 'Schedule Policy')}
							backgroundColor="gray6"
							value={resourceDetail.schedulePolicyType}
							size="medium"
							readOnly
						/>
					</Container>
				</ListRow>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<SendInviteAccounts
					isEditable={false}
					sendInviteList={sendInviteList}
					setSendInviteList={setSendInviteList}
					hideSearchBar
				/>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<SignatureDetail
					isEditable={false}
					signatureList={signatureList}
					setSignatureList={setSignatureList}
					signatureItems={signatureItems}
					setSignatureItems={setSignatureItems}
					zimbraPrefCalendarAutoAcceptSignatureId={zimbraPrefCalendarAutoAcceptSignatureId}
					setZimbraPrefCalendarAutoAcceptSignatureId={setZimbraPrefCalendarAutoAcceptSignatureId}
					zimbraPrefCalendarAutoDeclineSignatureId={zimbraPrefCalendarAutoDeclineSignatureId}
					setZimbraPrefCalendarAutoDeclineSignatureId={setZimbraPrefCalendarAutoDeclineSignatureId}
					zimbraPrefCalendarAutoDenySignatureId={zimbraPrefCalendarAutoDenySignatureId}
					setZimbraPrefCalendarAutoDenySignatureId={setZimbraPrefCalendarAutoDenySignatureId}
					hideSearchBar
				/>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<Row>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.notes', 'Notes')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}>
							<Text size="small">{resourceDetail?.zimbraNotes}</Text>
						</Row>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default ResourceCreateSection;
