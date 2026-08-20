/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, HorizontalWizard, WizardInSection } from '@zextras/ui-components';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import DelegateAddSection from '../add-delegate-section/delegate-add-section';
import { DelegateSelectModeSection } from '../add-delegate-section/delegate-selectmode-section';
import DelegateSetRightsSection from '../add-delegate-section/delegate-setright-section';

type AddDelegateWizardProps = {
	onCancel: () => void;
	onAdd: () => void;
};

/** The three-step add-delegate wizard (mode, rights, confirm). */
export const AddDelegateWizard = ({ onCancel, onAdd }: AddDelegateWizardProps) => {
	const [t] = useTranslation();

	const wizardSteps = [
		{
			name: 'select-mode',
			label: t('account_details.select_mode', 'SELECT MODE'),
			icon: 'PlusOutline',
			view: DelegateSelectModeSection,
			clickDisabled: true,
			CancelButton: (props: any) => (
				<Button
					{...props}
					type="outlined"
					key="wizard-cancel"
					label={t('label.volume_cancel_button', 'CANCEL')}
					icon={'CloseOutline'}
					iconPlacement="right"
					color="secondary"
					onClick={onCancel}
				/>
			),
			PrevButton: (): ReactElement => <></>,
			NextButton: (props: any) => (
				<Button
					{...props}
					label={t('account_details.NEXT', 'NEXT')}
					icon="ChevronRightOutline"
					iconPlacement="right"
				/>
			),
		},
		{
			name: 'set-rights',
			label: t('account_details.set_rights', 'SET RIGHTS'),
			icon: 'OptionsOutline',
			view: DelegateSetRightsSection,
			clickDisabled: true,
			CancelButton: (props: any) => (
				<Button
					{...props}
					type="outlined"
					key="wizard-cancel"
					label={t('label.volume_cancel_button', 'CANCEL')}
					icon={'CloseOutline'}
					iconPlacement="right"
					color="secondary"
					onClick={onCancel}
				/>
			),
			PrevButton: (props: any): any => (
				<Button
					{...props}
					label={t('label.volume_back_button', 'BACK')}
					icon={'ChevronLeftOutline'}
					iconPlacement="left"
					disable={props.completeLoading}
					color="secondary"
				/>
			),
			NextButton: (props: any) => (
				<Button
					{...props}
					label={t('account_details.NEXT', 'NEXT')}
					icon="ChevronRightOutline"
					iconPlacement="right"
				/>
			),
		},
		{
			name: 'add-delegate',
			label: t('account_details.ADD', 'ADD'),
			icon: 'KeyOutline',
			view: DelegateAddSection,
			clickDisabled: true,
			CancelButton: (props: any) => (
				<Button
					{...props}
					type="outlined"
					key="wizard-cancel"
					label={t('label.volume_cancel_button', 'CANCEL')}
					icon={'CloseOutline'}
					iconPlacement="right"
					color="secondary"
					onClick={onCancel}
				/>
			),
			PrevButton: (props: any): any => (
				<Button
					{...props}
					label={t('label.volume_back_button', 'BACK')}
					icon={'ChevronLeftOutline'}
					iconPlacement="left"
					disable={props.completeLoading}
					color="secondary"
				/>
			),
			NextButton: (props: any) => (
				<Button
					{...props}
					label={t('account_details.ADD', 'ADD')}
					icon="PersonOutline"
					iconPlacement="right"
					onClick={onAdd}
				/>
			),
		},
	];

	return (
		<HorizontalWizard
			steps={wizardSteps}
			title={t('account_details.add_user_on_delegates_list', 'Add user on Delegates List')}
			Wrapper={WizardInSection}
			setToggleWizardSection={onCancel}
		/>
	);
};
