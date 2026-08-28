/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, HorizontalWizard, WizardInSection } from '@zextras/ui-components';
import { noop } from 'lodash-es';
import { type FC, type ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LDAP, PUB } from '../../../../constants';
import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import CreateSummarySection from './create-summary-section';
import ListSection from './list-section';
import { MailingListContext } from './mailinglist-context';
import MembersSection from './members-section';
import SettingsSection from './settings/settings-section';

type MailingListDetailObj = {
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
	prefixName: string;
	suffixName: string;
	ldapQueryMembers: Array<any>;
	allOwnersList: Array<any>;
	ownerGrantEmailType: any;
	ownerGrantEmails: Array<any>;
};

const CreateMailingList: FC<{
	setShowCreateMailingListView: any;
	createList: (detail: any) => void;
	isLoading: boolean;
}> = ({ setShowCreateMailingListView, createList, isLoading }) => {
	const { t } = useTranslation();
	const { data: domainInformation } = useSelectedDomain();

	const [mailingListDetail, setMailingListDetail] = useState<MailingListDetailObj>({
		name: '',
		description: '',
		dynamic: false,
		displayName: '',
		zimbraHideInGal: false,
		zimbraIsACLGroup: '',
		zimbraMailStatus: true,
		zimbraNotes: '',
		memberURL: LDAP,
		members: [],
		zimbraDistributionListSendShareMessageToNewMembers: false,
		owners: [],
		prefixName: '',
		suffixName: domainInformation?.name ?? '',
		ldapQueryMembers: [],
		allOwnersList: [],
		ownerGrantEmailType: {
			label: t('label.everyone', 'Everyone'),
			value: PUB
		},
		ownerGrantEmails: []
	});

	const onCreate = useCallback(() => {
		createList(mailingListDetail);
	}, [createList, mailingListDetail]);

	const steps = useMemo(() => {
		// defined inside the memo (not a module-level factory): the React
		// compiler hoists factory-created components and breaks their closures
		const CancelButton = (props: any): ReactElement => (
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
		);
		const PrevButton = (props: any): ReactElement => (
			<Button
				{...props}
				label={t('label.back', 'BACK')}
				icon="ChevronLeftOutline"
				color="secondary"
				iconPlacement="left"
			/>
		);
		const NextButton = (props: any): ReactElement => (
			<Button
				{...props}
				label={t('label.next', 'NEXT')}
				icon="ChevronRightOutline"
				iconPlacement="right"
			/>
		);
		const CreateButton = (props: any): ReactElement => (
			<Button
				{...props}
				label={t('label.create', 'CREATE')}
				icon="PowerOutline"
				iconPlacement="right"
				disabled={!mailingListDetail?.prefixName || !mailingListDetail?.suffixName}
				onClick={onCreate}
			/>
		);

		const detailsStep = {
			name: 'details',
			label: t('label.distribution_list', 'Distribution List'),
			icon: 'ListOutline',
			view: ListSection,
			CancelButton,
			PrevButton: (): ReactElement => <></>,
			NextButton
		};
		const membersStep = {
			name: 'members',
			label: t('label.members', 'Members'),
			icon: 'PeopleOutline',
			view: MembersSection,
			CancelButton,
			PrevButton,
			NextButton
		};
		const settingsStep = {
			name: 'settings',
			label: t('label.settings', 'Settings'),
			icon: 'OptionsOutline',
			view: SettingsSection,
			CancelButton,
			PrevButton,
			NextButton
		};
		const createStep = {
			name: 'create',
			label: t('label.create', 'Create'),
			icon: 'PowerOutline',
			view: CreateSummarySection,
			CancelButton,
			PrevButton,
			NextButton: CreateButton
		};

		return mailingListDetail?.dynamic
			? [detailsStep, settingsStep, createStep]
			: [detailsStep, membersStep, settingsStep, createStep];
	}, [
		t,
		setShowCreateMailingListView,
		mailingListDetail?.dynamic,
		mailingListDetail?.prefixName,
		mailingListDetail?.suffixName,
		onCreate
	]);

	const onComplete = useCallback(() => {
		setShowCreateMailingListView(false);
	}, [setShowCreateMailingListView]);

	return (
		<>
			{isLoading && <ds-spinner></ds-spinner>}
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
				<MailingListContext.Provider value={{ mailingListDetail, setMailingListDetail }}>
					<HorizontalWizard
						steps={steps}
						title={t('label.new_distribution_list', 'New Distribution List')}
						Wrapper={WizardInSection}
						onChange={noop}
						onComplete={onComplete}
						setToggleWizardSection={setShowCreateMailingListView}
					/>
				</MailingListContext.Provider>
			</Container>
		</>
	);
};

export default CreateMailingList;
