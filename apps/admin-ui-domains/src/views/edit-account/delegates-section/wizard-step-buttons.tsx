/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { type TFunction } from 'i18next';
import { type ReactElement } from 'react';

type WizardStepButtons = {
	/** Outlined CANCEL shown on every step. */
	CancelButton: (props: any) => React.JSX.Element;
	/** No previous step on the first wizard page. */
	EmptyPrevButton: () => ReactElement;
	/** NEXT advances to the following step. */
	NextButton: (props: any) => React.JSX.Element;
	/** BACK returns to the previous step while a step is loading. */
	PrevButton: (props: any) => React.JSX.Element;
	/** Final step's ADD submits the wizard. */
	AddButton: (props: any) => React.JSX.Element;
};

/**
 * Module-level factory for the wizard step buttons, so no component is
 * defined inside the wizard component (SonarQube S6478) while the button
 * closures still capture the wizard's cancel/add handlers.
 */
function createWizardStepButtons(
	t: TFunction,
	onCancel: () => void,
	onAdd: () => void,
): WizardStepButtons {
	const CancelButton = (props: any): React.JSX.Element => (
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
	);

	const EmptyPrevButton = (): ReactElement => <></>;

	const NextButton = (props: any): React.JSX.Element => (
		<Button
			{...props}
			label={t('account_details.NEXT', 'NEXT')}
			icon="ChevronRightOutline"
			iconPlacement="right"
		/>
	);

	const PrevButton = (props: any): React.JSX.Element => (
		<Button
			{...props}
			label={t('label.volume_back_button', 'BACK')}
			icon={'ChevronLeftOutline'}
			iconPlacement="left"
			disable={props.completeLoading}
			color="secondary"
		/>
	);

	const AddButton = (props: any): React.JSX.Element => (
		<Button
			{...props}
			label={t('account_details.ADD', 'ADD')}
			icon="PersonOutline"
			iconPlacement="right"
			onClick={onAdd}
		/>
	);

	return { CancelButton, EmptyPrevButton, NextButton, PrevButton, AddButton };
}

export { createWizardStepButtons };
export type { WizardStepButtons };
