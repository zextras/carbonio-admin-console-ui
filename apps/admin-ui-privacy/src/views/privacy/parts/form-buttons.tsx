/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Row, Container, Text, Padding, Button } from '@zextras/carbonio-design-system';
import { t } from 'i18next';
import React from 'react';

type FormButtonsProps = { isDirty: boolean; onSave: () => void; onCancel: () => void };

export const FormButtons = ({ isDirty, onCancel, onSave }: FormButtonsProps) => (
	<Row mainAlignment="flex-start" width="100%">
		<Container orientation="vertical" mainAlignment="space-around" background="gray6" height="58px">
			<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
				<Row mainAlignment="flex-start" width="30%" crossAlignment="flex-start">
					<Text size="medium" weight="bold" color="gray0">
						{t('label.privacy', 'Privacy')}
					</Text>
				</Row>
				<Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
					{isDirty && (
						<>
							<Padding right="large">
								<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
							</Padding>
							<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
						</>
					)}
				</Row>
			</Row>
		</Container>
	</Row>
);
