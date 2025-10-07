/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Divider, Padding, Row, Text } from '@zextras/carbonio-design-system';
import React, { FC, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { RouteLeavingGuard } from './ui-extras/nav-guard';

export const PageLayout: FC<{
	title: string;
	children: ReactNode | ReactNode[];
	onSave?: () => void;
	onCancel?: () => void;
	unSavedChanges?: boolean;
}> = ({ title, onSave, onCancel, unSavedChanges, children }) => {
	const [t] = useTranslation();

	const headerButtons = useMemo(() => {
		if (!unSavedChanges) return null;
		return (
			<Container orientation="horizontal" width="fit" gap="1rem">
				{onCancel && (
					<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
				)}
				{onSave && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
			</Container>
		);
	}, [unSavedChanges, onCancel, onSave, t]);

	return (
		<Container mainAlignment="flex-start" padding={{ all: 'large' }}>
			<Container orientation="horizontal" height="fit" padding={{ all: 'medium' }}>
				<Row takeAvailableSpace mainAlignment="flex-start" minHeight="35px">
					<Text weight="bold" color="gray0">
						{title}
					</Text>
				</Row>
				<Row>{headerButtons}</Row>
			</Container>
			<Divider />
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ horizontal: 'medium', vertical: 'large' }}
				style={{ overflowY: 'auto' }}
			>
				{children}
			</Container>
			{onSave && (
				<RouteLeavingGuard when={unSavedChanges} onSave={onSave}>
					<Text>
						{t(
							'label.unsaved_changes_line1',
							'Are you sure you want to leave this page without saving?'
						)}
					</Text>
					<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
				</RouteLeavingGuard>
			)}
		</Container>
	);
};

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
