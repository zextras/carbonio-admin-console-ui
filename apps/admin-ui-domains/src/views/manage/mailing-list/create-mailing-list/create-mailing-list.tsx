/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, HorizontalWizard, WizardInSection } from '@zextras/ui-components';
import { noop } from 'lodash-es';
import {
	createContext,
	type FC,
	type ReactElement,
	useContext,
	useState
} from 'react';
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
	ownerGrantEmailType: any;
	ownerGrantEmails: Array<any>;
};

type WizardActionsContextValue = {
	t: (key: string, fallback?: string) => string;
	onCancel: () => void;
	createDisabled: boolean;
	onCreate: () => void;
};

const WizardActionsContext = createContext<WizardActionsContextValue | null>(null);

function useWizardActions(): WizardActionsContextValue {
	const context = useContext(WizardActionsContext);
	if (!context) {
		throw new Error('wizard buttons must be used within WizardActionsContext');
	}
	return context;
}

/* Module-level wizard buttons: dynamic values come from context, so the
 * React compiler can hoist them safely (no closures to break). */
const WizardCancelButton = (props: any): ReactElement => {
	const { t, onCancel } = useWizardActions();
	return (
		<Button
			{...props}
			type="outlined"
			key="wizard-cancel"
			label={t('label.cancel', 'Cancel')}
			color="secondary"
			icon="CloseOutline"
			iconPlacement="right"
			onClick={onCancel}
		/>
	);
};

const WizardPrevButton = (props: any): ReactElement => {
	const { t } = useWizardActions();
	return (
		<Button
			{...props}
			label={t('label.back', 'BACK')}
			icon="ChevronLeftOutline"
			color="secondary"
			iconPlacement="left"
		/>
	);
};

const WizardNextButton = (props: any): ReactElement => {
	const { t } = useWizardActions();
	return (
		<Button
			{...props}
			label={t('label.next', 'NEXT')}
			icon="ChevronRightOutline"
			iconPlacement="right"
		/>
	);
};

const WizardCreateButton = (props: any): ReactElement => {
	const { t, createDisabled, onCreate } = useWizardActions();
	return (
		<Button
			{...props}
			label={t('label.create', 'CREATE')}
			icon="PowerOutline"
			iconPlacement="right"
			disabled={createDisabled}
			onClick={onCreate}
		/>
	);
};

const WizardNoButton = (): ReactElement => <></>;

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
		ownerGrantEmailType: {
			label: t('label.everyone', 'Everyone'),
			value: PUB
		},
		ownerGrantEmails: []
	});

	const onCreate = (): void => {
		createList(mailingListDetail);
	};

	const detailsStep = {
		name: 'details',
		label: t('label.distribution_list', 'Distribution List'),
		icon: 'ListOutline',
		view: ListSection,
		CancelButton: WizardCancelButton,
		PrevButton: WizardNoButton,
		NextButton: WizardNextButton
	};
	const membersStep = {
		name: 'members',
		label: t('label.members', 'Members'),
		icon: 'PeopleOutline',
		view: MembersSection,
		CancelButton: WizardCancelButton,
		PrevButton: WizardPrevButton,
		NextButton: WizardNextButton
	};
	const settingsStep = {
		name: 'settings',
		label: t('label.settings', 'Settings'),
		icon: 'OptionsOutline',
		view: SettingsSection,
		CancelButton: WizardCancelButton,
		PrevButton: WizardPrevButton,
		NextButton: WizardNextButton
	};
	const createStep = {
		name: 'create',
		label: t('label.create', 'Create'),
		icon: 'PowerOutline',
		view: CreateSummarySection,
		CancelButton: WizardCancelButton,
		PrevButton: WizardPrevButton,
		NextButton: WizardCreateButton
	};
	const steps = mailingListDetail?.dynamic
		? [detailsStep, settingsStep, createStep]
		: [detailsStep, membersStep, settingsStep, createStep];

	const onComplete = (): void => {
		setShowCreateMailingListView(false);
	};

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
					<WizardActionsContext.Provider
						value={{
							t: (key: string, fallback?: string): string => t(key, fallback ?? key),
							onCancel: (): void => {
								setShowCreateMailingListView(false);
							},
							createDisabled:
								!mailingListDetail?.prefixName || !mailingListDetail?.suffixName,
							onCreate
						}}
					>
						<HorizontalWizard
						steps={steps}
						title={t('label.new_distribution_list', 'New Distribution List')}
						Wrapper={WizardInSection}
						onChange={noop}
							onComplete={onComplete}
							setToggleWizardSection={setShowCreateMailingListView}
						/>
					</WizardActionsContext.Provider>
				</MailingListContext.Provider>
			</Container>
		</>
	);
};

export default CreateMailingList;
