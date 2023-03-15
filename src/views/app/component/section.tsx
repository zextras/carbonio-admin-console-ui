/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Container, Divider, Text, Row, IconButton } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export const SectionHeader: FC<any> = ({
	title,
	divider,
	onSave,
	onCancel,
	isSaving,
	isDisabled,
	onClose,
	showClose
}) => {
	const { t } = useTranslation();

	return (
		<>
			<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
					<Text size="extralarge" weight="bold">
						{title}
					</Text>
				</Row>
				{showClose && (
					<Row padding={{ horizontal: 'small' }}>
						<IconButton icon="CloseOutline" onClick={onClose} size="large" />
					</Row>
				)}
			</Row>
			{divider && <Divider />}
		</>
	);
};

export const SectionBody: FC<{ padding: any; children: any }> = ({ padding, children }) => (
	<Container mainAlignment="flex-start" padding={padding} style={{ overflowY: 'auto' }}>
		{children}
	</Container>
);

export const SectionFooter: FC<{ divider: boolean; footer: any }> = ({ divider, footer }) => (
	<Row width="100%">
		<Row takeAvailableSpace>
			{divider && <Divider />}
			<Container height="fit" padding={{ all: 'large' }}>
				{footer}
			</Container>
		</Row>
	</Row>
);

export const Section: FC<any> = ({
	children,
	title,
	divider,
	footer,
	showButtons,
	saveLabel,
	onSave,
	onCancel,
	isSaving,
	padding = { all: 'large' },
	isDisabled,
	showClose,
	onClose
}) => (
	<Container background="gray6">
		<SectionHeader
			title={title}
			showButtons={showButtons}
			saveLabel={saveLabel}
			onSave={onSave}
			onCancel={onCancel}
			isSaving={isSaving}
			isDisabled={isDisabled}
			divider={divider}
			showClose={showClose}
			onClose={onClose}
		/>
		<SectionBody padding={padding}>{children}</SectionBody>
		{footer && <SectionFooter divider={divider} footer={footer} />}
	</Container>
);
