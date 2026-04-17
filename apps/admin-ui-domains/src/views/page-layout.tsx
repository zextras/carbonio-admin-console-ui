/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding } from '@zextras/ui-components';
import { FC, ReactNode } from 'react';


export const BoxLayout: FC<{
	title: string;
	description: string;
	disabled?: boolean;
	children: ReactNode | ReactNode[];
}> = ({ title, description, disabled = false, children }) => (
	<Container orientation="vertical" height="fit" gap="1rem">
		<Container orientation="vertical" height="fit" crossAlignment="flex-start" gap="0.5rem">
		<ds-text as="h3" weight="bold" overflow="break-word" disabled={disabled}>
			{title}
		</ds-text>
		<ds-text as="p" size="small" overflow="break-word" disabled={disabled}>
			{description}
		</ds-text>
		</Container>
		<Container mainAlignment="flex-start" crossAlignment="flex-start" height="fit" gap="1rem">
			{children}
		</Container>
	</Container>
);

export const SettingLayout: FC<{
	description: string;
	children: ReactNode;
	descriptionGap?: boolean;
}> = ({ description, children, descriptionGap }) => (
	<Container crossAlignment="flex-start">
		{children}
		{descriptionGap && <Padding top="small" />}
		<Container height="fit" crossAlignment="flex-start">
		<ds-text as="p" weight="light" color="gray1" size="small" overflow="break-word">
			{description}
		</ds-text>
		</Container>
	</Container>
);
