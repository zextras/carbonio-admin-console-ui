/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import MailingListSection from './mailing-list-section';
import { HorizontalWizard } from '../../../app/component/hwizard';
import { MailingListContext } from './mailinglist-context';
import { Section } from '../../../app/component/section';
import MailingListMembersSection from './mailing-list-members-section';
import MailingListSettingsSection from './mailing-list-settings-sections';
import MailingListCreateSection from './mailinglist-create-section';
import { useDomainStore } from '../../../../store/domain/store';
import { PUB } from '../../../../constants';

// eslint-disable-next-line no-shadow
export enum SUBSCRIBE_UNSUBSCRIBE {
	ACCEPT = 'ACCEPT',
	APPROVAL = 'APPROVAL',
	REJECT = 'REJECT'
}

interface MailingListDetailObj {
	name: string;
	dynamic: boolean;
	zimbraIsACLGroup: string;
	zimbraMailStatus: boolean;
	displayName: string;
	description: string;
	zimbraHideInGal: boolean;
	zimbraNotes: string;
	memberURL: string;
	members: Array<any>;
	zimbraDistributionListSendShareMessageToNewMembers: boolean;
	owners: Array<any>;
	zimbraDistributionListSubscriptionPolicy: any;
	zimbraDistributionListUnsubscriptionPolicy: any;
	prefixName: string;
	suffixName: string;
	ldapQueryMembers: Array<any>;
	allOwnersList: Array<any>;
	ownerGrantEmailType: any;
	ownerGrantEmails: Array<any>;
}

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('label.new_mailing_list', 'New Mailing List')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

// eslint-disable-next-line no-empty-pattern
const CreateMailingList: FC<{
	setShowCreateMailingListView: any;
	createMailingListReq: any;
}> = ({ setShowCreateMailingListView, createMailingListReq }) => {
	const { t } = useTranslation();
	const [wizardData, setWizardData] = useState();
	const domainInformation = useDomainStore((state) => state.domain);

	const [mailingListDetail, setMailingListDetail] = useState<MailingListDetailObj>({
		name: '',
		description: '',
		dynamic: false,
		displayName: '',
		zimbraHideInGal: false,
		zimbraIsACLGroup: '',
		zimbraMailStatus: true,
		zimbraNotes: '',
		memberURL: '',
		members: [],
		zimbraDistributionListSendShareMessageToNewMembers: true,
		owners: [],
		zimbraDistributionListSubscriptionPolicy: {
			label: t('label.automatically_accept', 'Automatically accept'),
			value: SUBSCRIBE_UNSUBSCRIBE.ACCEPT
		},
		zimbraDistributionListUnsubscriptionPolicy: {
			label: t('label.automatically_accept', 'Automatically accept'),
			value: SUBSCRIBE_UNSUBSCRIBE.ACCEPT
		},
		prefixName: '',
		suffixName: '',
		ldapQueryMembers: [],
		allOwnersList: [],
		ownerGrantEmailType: {
			label: t('label.everyone', 'Everyone'),
			value: PUB
		},
		ownerGrantEmails: []
	});

	const onCreate = useCallback(() => {
		createMailingListReq(
			`${mailingListDetail?.prefixName}@${mailingListDetail?.suffixName}`,
			mailingListDetail?.description,
			mailingListDetail?.dynamic,
			mailingListDetail?.displayName,
			mailingListDetail?.zimbraHideInGal,
			mailingListDetail?.zimbraIsACLGroup,
			mailingListDetail?.zimbraMailStatus,
			mailingListDetail?.zimbraNotes,
			mailingListDetail?.memberURL,
			mailingListDetail?.members,
			mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers,
			mailingListDetail?.owners,
			mailingListDetail?.zimbraDistributionListSubscriptionPolicy,
			mailingListDetail?.zimbraDistributionListUnsubscriptionPolicy,
			mailingListDetail?.allOwnersList,
			mailingListDetail?.ownerGrantEmailType,
			mailingListDetail?.ownerGrantEmails
		);
	}, [createMailingListReq, mailingListDetail]);

	const standardMailingListSizardSteps = useMemo(
		() => [
			{
				name: 'details',
				label: t('label.mailing_list', 'Mailing List'),
				icon: 'ListOutline',
				view: MailingListSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.cancel', 'Cancel')}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => {
							setShowCreateMailingListView(false);
						}}
					/>
				),
				PrevButton: (props: any) => null,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'members',
				label: t('label.members', 'Members'),
				icon: 'PeopleOutline',
				view: MailingListMembersSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.cancel', 'Cancel')}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => {
							setShowCreateMailingListView(false);
						}}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'settings',
				label: t('label.settings', 'Settings'),
				icon: 'OptionsOutline',
				view: MailingListSettingsSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.cancel', 'Cancel')}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => {
							setShowCreateMailingListView(false);
						}}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'create',
				label: t('label.create', 'Create'),
				icon: 'PowerOutline',
				view: MailingListCreateSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.cancel', 'Cancel')}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => {
							setShowCreateMailingListView(false);
						}}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.create', 'CREATE')}
						icon="PowerOutline"
						iconPlacement="right"
						disabled={!mailingListDetail?.prefixName || !mailingListDetail?.suffixName}
						onClick={onCreate}
					/>
				)
			}
		],
		[
			t,
			setShowCreateMailingListView,
			mailingListDetail?.prefixName,
			mailingListDetail?.suffixName,
			onCreate
		]
	);

	const dynamicMailingListSizardSteps = useMemo(
		() => [
			{
				name: 'details',
				label: t('label.mailing_list', 'Mailing List'),
				icon: 'ListOutline',
				view: MailingListSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => {
							setShowCreateMailingListView(false);
						}}
					/>
				),
				PrevButton: (props: any) => null,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'create',
				label: t('label.create', 'Create'),
				icon: 'PowerOutline',
				view: MailingListCreateSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => {
							setShowCreateMailingListView(false);
						}}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.create', 'CREATE')}
						icon="PowerOutline"
						iconPlacement="right"
						disabled={!mailingListDetail?.prefixName || !mailingListDetail?.suffixName}
						onClick={onCreate}
					/>
				)
			}
		],
		[
			t,
			setShowCreateMailingListView,
			mailingListDetail?.prefixName,
			mailingListDetail?.suffixName,
			onCreate
		]
	);

	const onComplete = useCallback(() => {
		setShowCreateMailingListView(false);
	}, [setShowCreateMailingListView]);

	useEffect(() => {
		if (domainInformation?.name) {
			setMailingListDetail((prev: any) => ({ ...prev, suffixName: domainInformation?.name }));
		}
	}, [domainInformation?.name]);

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				top: '43px',
				right: '0px',
				bottom: '0px',
				left: `${'max(calc(100% - 680px), 12px)'}`,
				transition: 'left 0.2s ease-in-out',
				height: 'auto',
				width: 'auto',
				maxHeight: '100%',
				overflow: 'hidden',
				boxShadow: '-6px 4px 5px 0px rgba(0, 0, 0, 0.1)'
			}}
		>
			<MailingListContext.Provider value={{ mailingListDetail, setMailingListDetail }}>
				<HorizontalWizard
					steps={
						mailingListDetail?.dynamic
							? dynamicMailingListSizardSteps
							: standardMailingListSizardSteps
					}
					Wrapper={WizardInSection}
					onChange={setWizardData}
					onComplete={onComplete}
					setToggleWizardSection={setShowCreateMailingListView}
				/>
			</MailingListContext.Provider>
		</Container>
	);
};

export default CreateMailingList;
