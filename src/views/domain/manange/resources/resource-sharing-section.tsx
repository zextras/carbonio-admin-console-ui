/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, useEffect, useCallback } from 'react';
import {
	Container,
	Input,
	Row,
	Select,
	Text,
	Icon,
	Divider,
	Switch
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { ResourceContext } from './resource-context';
import ListRow from '../../../list/list-row';
import { SendInviteAccounts } from './send-invite-accounts';
import { SignatureDetail } from './signature-detail';

const ResourceSharingSection: FC = () => {
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
	const [showSendInvite, setShowSendInvite] = useState<boolean>(true);
	const [showSignature, setShowSignature] = useState<boolean>(true);

	useEffect(() => {
		const arrayItem: any[] = [
			{
				label: t('label.not_set', 'Not Set'),
				value: ''
			}
		];
		setSignatureItems(arrayItem);
	}, [t]);

	const sendInviteEnabled = useCallback(() => setShowSendInvite((c) => !c), []);

	const signatureEnabled = useCallback(() => setShowSignature((c) => !c), []);

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
						{t('label.invites', 'Invites')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Switch
							value={showSendInvite}
							label={t(
								'label.i_want_to_send_invites_to_resource',
								'I want to send invites to resource'
							)}
							onClick={sendInviteEnabled}
						/>
					</Container>
				</ListRow>
				{showSendInvite && (
					<SendInviteAccounts
						isEditable
						sendInviteList={sendInviteList}
						setSendInviteList={setSendInviteList}
						hideHeaderBar
					/>
				)}
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<Row padding={{ top: 'large' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.signatures', 'Signatures')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Switch
							value={showSignature}
							label={t('label.i_want_to_set_signature', 'I want to set a Signature')}
							onClick={signatureEnabled}
						/>
					</Container>
				</ListRow>
				{showSignature && (
					<SignatureDetail
						isEditable
						signatureList={signatureList}
						setSignatureList={setSignatureList}
						signatureItems={signatureItems}
						setSignatureItems={setSignatureItems}
						zimbraPrefCalendarAutoAcceptSignatureId={zimbraPrefCalendarAutoAcceptSignatureId}
						setZimbraPrefCalendarAutoAcceptSignatureId={setZimbraPrefCalendarAutoAcceptSignatureId}
						zimbraPrefCalendarAutoDeclineSignatureId={zimbraPrefCalendarAutoDeclineSignatureId}
						setZimbraPrefCalendarAutoDeclineSignatureId={
							setZimbraPrefCalendarAutoDeclineSignatureId
						}
						zimbraPrefCalendarAutoDenySignatureId={zimbraPrefCalendarAutoDenySignatureId}
						setZimbraPrefCalendarAutoDenySignatureId={setZimbraPrefCalendarAutoDenySignatureId}
						hideHeaderBar
					/>
				)}
			</Container>
		</Container>
	);
};

export default ResourceSharingSection;
