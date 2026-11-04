/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HorizontalWizard, WizardInSection } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { DelegateAddSection } from '../add-delegate-section/delegate-add-section';
import { DelegateSelectModeSection } from '../add-delegate-section/delegate-selectmode-section';
import { DelegateSetRightsSection } from '../add-delegate-section/delegate-setright-section';
import { createWizardStepButtons } from './wizard-step-buttons';

type AddDelegateWizardProps = {
	/** Editing an existing delegate: the title and confirm step/button say EDIT instead of ADD. */
	editMode: boolean;
	onCancel: () => void;
	onAdd: () => void;
};

/** The three-step add-delegate wizard (mode, rights, confirm). */
export const AddDelegateWizard = ({ editMode, onCancel, onAdd }: AddDelegateWizardProps) => {
	const [t] = useTranslation();
	const confirmLabel = editMode ? t('label.EDIT', 'EDIT') : t('account_details.ADD', 'ADD');

	const { CancelButton, EmptyPrevButton, NextButton, PrevButton, AddButton } =
		createWizardStepButtons(t, onCancel, onAdd, confirmLabel);

	const wizardSteps = [
		{
			name: 'select-mode',
			label: t('account_details.select_mode', 'SELECT MODE'),
			icon: 'PlusOutline',
			view: DelegateSelectModeSection,
			clickDisabled: true,
			CancelButton,
			PrevButton: EmptyPrevButton,
			NextButton,
		},
		{
			name: 'set-rights',
			label: t('account_details.set_rights', 'SET RIGHTS'),
			icon: 'OptionsOutline',
			view: DelegateSetRightsSection,
			clickDisabled: true,
			CancelButton,
			PrevButton,
			NextButton,
		},
		{
			name: 'add-delegate',
			label: confirmLabel,
			icon: 'KeyOutline',
			view: DelegateAddSection,
			clickDisabled: true,
			CancelButton,
			PrevButton,
			NextButton: AddButton,
		},
	];

	return (
		<HorizontalWizard
			steps={wizardSteps}
			title={
				editMode
					? t('account_details.edit_user_on_delegates_list', 'Edit user on Delegates List')
					: t('account_details.add_user_on_delegates_list', 'Add user on Delegates List')
			}
			Wrapper={WizardInSection}
			setToggleWizardSection={onCancel}
		/>
	);
};
