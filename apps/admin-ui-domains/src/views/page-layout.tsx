/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Text } from '@zextras/carbonio-design-system';
import { FC, ReactNode } from 'react';


export const BoxLayout: FC<{
	title: string;
	description: string;
	disabled?: boolean;
	children: ReactNode | ReactNode[];
}> = ({ title, description, disabled = false, children }) => (
	<Container orientation="vertical" height="fit" gap="1rem">
		<Container orientation="vertical" height="fit" crossAlignment="flex-start" gap="0.5rem">
			<Text weight="bold" overflow="break-word" disabled={disabled}>
				{title}
			</Text>
			<Text size="small" overflow="break-word" disabled={disabled}>
				{description}
			</Text>
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
			<Text weight="light" color="gray1" size="small" overflow="break-word">
				{description}
			</Text>
		</Container>
	</Container>
);
