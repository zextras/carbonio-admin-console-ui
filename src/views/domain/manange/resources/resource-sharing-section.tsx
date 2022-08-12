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
import { SendInviteAccounts } from './send-invite-accounts';
import { SignatureDetail } from './signature-detail';

const ResourceSharingSection: FC = () => {
	const context = useContext(ResourceContext);
	const { t } = useTranslation();
	const { resourceDetail, setResourceDetail } = context;

	const setZimbraPrefCalendarAutoAcceptSignatureId = useCallback(
		(v) => {
			setResourceDetail((prev: any) => ({ ...prev, zimbraPrefCalendarAutoAcceptSignatureId: v }));
		},
		[setResourceDetail]
	);
	const setZimbraPrefCalendarAutoDeclineSignatureId = useCallback(
		(v) => {
			setResourceDetail((prev: any) => ({ ...prev, zimbraPrefCalendarAutoDeclineSignatureId: v }));
		},
		[setResourceDetail]
	);
	const setZimbraPrefCalendarAutoDenySignatureId = useCallback(
		(v) => {
			setResourceDetail((prev: any) => ({ ...prev, zimbraPrefCalendarAutoDenySignatureId: v }));
		},
		[setResourceDetail]
	);

	const setSignatureList = useCallback(
		(v) => {
			setResourceDetail((prev: any) => ({ ...prev, signaturelist: v }));
		},
		[setResourceDetail]
	);

	const setSignatureItems = useCallback(
		(v) => {
			setResourceDetail((prev: any) => ({ ...prev, signatureItems: v }));
		},
		[setResourceDetail]
	);

	const setSendInviteList = useCallback(
		(v) => {
			setResourceDetail((prev: any) => ({ ...prev, sendInviteList: v }));
		},
		[setResourceDetail]
	);

	useEffect(() => {
		const arrayItem: any[] = [
			{
				label: t('label.not_set', 'Not Set'),
				value: ''
			}
		];
		setSignatureItems(arrayItem);
	}, [setSignatureItems, t]);

	useEffect(() => {
		if (!resourceDetail?.zimbraPrefCalendarAutoAcceptSignatureId) {
			setResourceDetail((prev: any) => ({
				...prev,
				zimbraPrefCalendarAutoAcceptSignatureId: resourceDetail?.signatureItems[0]
			}));
		}
		if (!resourceDetail?.zimbraPrefCalendarAutoDeclineSignatureId) {
			setResourceDetail((prev: any) => ({
				...prev,
				zimbraPrefCalendarAutoDeclineSignatureId: resourceDetail?.signatureItems[0]
			}));
		}
		if (!resourceDetail?.zimbraPrefCalendarAutoDenySignatureId) {
			setResourceDetail((prev: any) => ({
				...prev,
				zimbraPrefCalendarAutoDenySignatureId: resourceDetail?.signatureItems[0]
			}));
		}
	}, [
		resourceDetail?.signatureItems,
		resourceDetail?.zimbraPrefCalendarAutoAcceptSignatureId,
		resourceDetail?.zimbraPrefCalendarAutoDeclineSignatureId,
		resourceDetail?.zimbraPrefCalendarAutoDenySignatureId,
		setResourceDetail
	]);

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

				<SendInviteAccounts
					isEditable
					sendInviteList={resourceDetail?.sendInviteList}
					setSendInviteList={setSendInviteList}
					hideHeaderBar
				/>

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

				<SignatureDetail
					isEditable
					signatureList={resourceDetail?.signaturelist}
					setSignatureList={setSignatureList}
					signatureItems={resourceDetail?.signatureItems}
					setSignatureItems={setSignatureItems}
					zimbraPrefCalendarAutoAcceptSignatureId={
						resourceDetail?.zimbraPrefCalendarAutoAcceptSignatureId
					}
					setZimbraPrefCalendarAutoAcceptSignatureId={setZimbraPrefCalendarAutoAcceptSignatureId}
					zimbraPrefCalendarAutoDeclineSignatureId={
						resourceDetail?.zimbraPrefCalendarAutoDeclineSignatureId
					}
					setZimbraPrefCalendarAutoDeclineSignatureId={setZimbraPrefCalendarAutoDeclineSignatureId}
					zimbraPrefCalendarAutoDenySignatureId={
						resourceDetail?.zimbraPrefCalendarAutoDenySignatureId
					}
					setZimbraPrefCalendarAutoDenySignatureId={setZimbraPrefCalendarAutoDenySignatureId}
					hideHeaderBar
				/>
			</Container>
		</Container>
	);
};

export default ResourceSharingSection;
