/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AclListContext } from './acl-list-context';
import AclListCreateSection from './acl-list-create-section';
import AclListMembersSection from './acl-list-members-section';
import AclListSection from './acl-list-section';
import { PUB } from '../../../../constants';
import { useDomainStore } from '@zextras/admin-ui-bootstrap';
import { HorizontalWizard } from '../../../app/component/hwizard';
import { Section } from '../../../app/component/section-component';
import OverlayDivision from '../../../components/overlayDivision';

// eslint-disable-next-line no-shadow
export enum SUBSCRIBE_UNSUBSCRIBE {
	ACCEPT = 'ACCEPT',
	APPROVAL = 'APPROVAL',
	REJECT = 'REJECT'
}

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 39.4rem;
	top: 0;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

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
			title={t('label.new_security_group', 'New Security Group')}
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
	isLoading: boolean;
}> = ({ setShowCreateAclListView, createAclListReq, isLoading }) => {
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
				label: t('label.security_group', 'Security Groups'),
				icon: 'ListOutline',
				view: AclListSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						// eslint-disable-next-line sonarjs/no-duplicate-string
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
						// eslint-disable-next-line sonarjs/no-duplicate-string
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
						// eslint-disable-next-line sonarjs/no-duplicate-string
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
				// eslint-disable-next-line sonarjs/no-duplicate-string
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
		<>
			{isLoading && <OverlayDivision ovelayStyle={ovelayStyle} />}
			<Container
				background="gray5"
				mainAlignment="flex-start"
				style={{
					position: 'absolute',
					top: '0rem',
					right: '0rem',
					bottom: '0rem',
					transition: 'left 0.2s ease-in-out',
					maxHeight: '100%',
					overflow: 'hidden'
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
		</>
	);
};

export default CreateAclList;
