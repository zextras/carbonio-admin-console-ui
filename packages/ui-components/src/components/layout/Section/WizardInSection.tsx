/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type FC, type ReactNode } from 'react';

import { Section } from './Section';

export type WizardInSectionProps = {
	title: string;
	wizard: ReactNode;
	wizardFooter?: ReactNode;
	setToggleWizardSection: (value: boolean) => void;
	showClose?: boolean;
};

export const WizardInSection: FC<WizardInSectionProps> = ({
	title,
	wizard,
	wizardFooter,
	setToggleWizardSection,
	showClose = true,
}) => (
	<Section
		title={title}
		padding={{ all: '0' }}
		footer={wizardFooter}
		divider
		showClose={showClose}
		onClose={(): void => {
			setToggleWizardSection(false);
		}}
	>
		{wizard}
	</Section>
);
