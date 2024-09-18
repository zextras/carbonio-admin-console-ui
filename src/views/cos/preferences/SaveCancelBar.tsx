/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Button, Container, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

interface SaveCancelBarProps {
	isDirty: boolean;
	onSave: () => void;
	onCancel: () => void;
}

const SaveCancelBar: React.FC<SaveCancelBarProps> = ({ isDirty, onSave, onCancel }) => {
	const { t } = useTranslation();
	return (
		<Row mainAlignment="flex-start" width="100%">
			<Container
				orientation="vertical"
				mainAlignment="space-around"
				background={'gray6'}
				height="58px"
			>
				<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
					<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
						<Text size="medium" weight="bold" color="gray0">
							{t('cos.preferences', 'Preferences')}
						</Text>
					</Row>
					<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
						<Padding right="small">
							{isDirty && (
								<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
							)}
						</Padding>
						{isDirty && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
					</Row>
				</Row>
			</Container>
		</Row>
	);
};

export default SaveCancelBar;
