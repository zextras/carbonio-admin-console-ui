/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import AclListSection from './acl-list-section';
import { HorizontalWizard } from '../../../app/component/hwizard';
import { AclListContext } from './acl-list-context';
import { Section } from '../../../app/component/section';
import AclListMembersSection from './acl-list-members-section';
import AclListCreateSection from './acl-list-create-section';
import { useDomainStore } from '../../../../store/domain/store';
import { PUB } from '../../../../constants';

// eslint-disable-next-line no-shadow
export enum SUBSCRIBE_UNSUBSCRIBE {
	ACCEPT = 'ACCEPT',
	APPROVAL = 'APPROVAL',
	REJECT = 'REJECT'
}

interface AclListDetailObj {
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
			title={t('label.new_acl_list', 'New Acl List')}
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
const CreateAclList: FC<{
	setShowCreateAclListView: any;
	createAclListReq: any;
}> = ({ setShowCreateAclListView, createAclListReq }) => {
	const { t } = useTranslation();
	const [wizardData, setWizardData] = useState();
	const domainInformation = useDomainStore((state) => state.domain);

	const [aclListDetail, setAclListDetail] = useState<AclListDetailObj>({
		name: '',
		description: '',
		dynamic: false,
		displayName: '',
		zimbraHideInGal: true,
		zimbraIsACLGroup: '',
		zimbraMailStatus: false,
		zimbraNotes: '',
		memberURL: '',
		members: [],
		zimbraDistributionListSendShareMessageToNewMembers: false,
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
		createAclListReq(
			`${aclListDetail?.prefixName}@${aclListDetail?.suffixName}`,
			aclListDetail?.description,
			aclListDetail?.dynamic,
			aclListDetail?.displayName,
			aclListDetail?.zimbraHideInGal,
			aclListDetail?.zimbraIsACLGroup,
			aclListDetail?.zimbraMailStatus,
			aclListDetail?.zimbraNotes,
			aclListDetail?.memberURL,
			aclListDetail?.members,
			aclListDetail?.zimbraDistributionListSendShareMessageToNewMembers,
			aclListDetail?.owners,
			aclListDetail?.zimbraDistributionListSubscriptionPolicy,
			aclListDetail?.zimbraDistributionListUnsubscriptionPolicy,
			aclListDetail?.allOwnersList,
			aclListDetail?.ownerGrantEmailType,
			aclListDetail?.ownerGrantEmails
		);
	}, [createAclListReq, aclListDetail]);

	const standardAclListSizardSteps = useMemo(
		() => [
			{
				name: 'details',
				label: t('label.acl_list', 'Acl List'),
				icon: 'ListOutline',
				view: AclListSection,
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
							setShowCreateAclListView(false);
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
				view: AclListMembersSection,
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
							setShowCreateAclListView(false);
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
				view: AclListCreateSection,
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
							setShowCreateAclListView(false);
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
						disabled={!aclListDetail?.prefixName || !aclListDetail?.suffixName}
						onClick={onCreate}
					/>
				)
			}
		],
		[t, setShowCreateAclListView, aclListDetail?.prefixName, aclListDetail?.suffixName, onCreate]
	);

	const dynamicAclListSizardSteps = useMemo(
		() => [
			{
				name: 'details',
				label: t('label.acl_list', 'Acl List'),
				icon: 'ListOutline',
				view: AclListSection,
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
							setShowCreateAclListView(false);
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
				view: AclListCreateSection,
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
							setShowCreateAclListView(false);
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
						disabled={!aclListDetail?.prefixName || !aclListDetail?.suffixName}
						onClick={onCreate}
					/>
				)
			}
		],
		[t, setShowCreateAclListView, aclListDetail?.prefixName, aclListDetail?.suffixName, onCreate]
	);

	const onComplete = useCallback(() => {
		setShowCreateAclListView(false);
	}, [setShowCreateAclListView]);

	useEffect(() => {
		if (domainInformation?.name) {
			setAclListDetail((prev: any) => ({ ...prev, suffixName: domainInformation?.name }));
		}
	}, [domainInformation?.name]);

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				top: '2.7rem',
				right: '0rem',
				bottom: '0rem',
				left: `${'max(calc(100% - 42.5rem), 0.75rem)'}`,
				transition: 'left 0.2s ease-in-out',
				height: 'auto',
				width: 'auto',
				maxHeight: '100%',
				overflow: 'hidden',
				boxShadow: '-6px 4px 5px 0px rgba(0, 0, 0, 0.1)'
			}}
		>
			<AclListContext.Provider value={{ aclListDetail, setAclListDetail }}>
				<HorizontalWizard
					steps={aclListDetail?.dynamic ? dynamicAclListSizardSteps : standardAclListSizardSteps}
					Wrapper={WizardInSection}
					onChange={setWizardData}
					onComplete={onComplete}
					setToggleWizardSection={setShowCreateAclListView}
				/>
			</AclListContext.Provider>
		</Container>
	);
};

export default CreateAclList;
