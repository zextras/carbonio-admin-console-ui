/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Text, Container, Row, Button, Padding, Divider } from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeConfigs } from '../theme/theme-configs';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { TwoFactorAuthencationConfig } from '../two-factor-authentication/2fa-config';

const DomainTwoFactorAuthentication: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="56px">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.2-factor-authentication', '2-Factor-Authentication')}
								</Text>
							</Row>
							<Row
								padding={{ all: 'large' }}
								width="50%"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
							>
								<Padding right="small">
									{isDirty && (
										<Button
											label={t('label.cancel', 'Cancel')}
											color="secondary"
											onClick={(): void => {
												console.log('_dd on cancel');
											}}
										/>
									)}
								</Padding>
								{isDirty && (
									<Button
										label={t('label.save', 'Save')}
										color="primary"
										onClick={(): void => {
											console.log('_dd on save');
										}}
										disabled={true}
									/>
								)}
							</Row>
						</Row>
					</Container>
					<Divider color="gray2" />
				</Row>
				{/* <TwoFactorAuthencationConfig /> */}
			</Container>
			<RouteLeavingGuard
				when={isDirty}
				onSave={(): void => {
					console.log('_dd onsave');
				}}
			>
				<Text>
					{t(
						'label.unsaved_changes_line1',
						'Are you sure you want to leave this page without saving?'
					)}
				</Text>
				<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
			</RouteLeavingGuard>
		</Container>
	);
};

export default DomainTwoFactorAuthentication;
