/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
	Text,
	Container,
	Row,
	Button,
	Padding,
	Divider,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { TwoFactorAuthencationConfig } from '../two-factor-authentication/2fa-config';
import { list2faPolicies } from '../../../services/list-2fa-policies';
import { TwoFactorAuthPolicyValues } from '../../../../types';

const GlobalTwoFactorAuthentcation: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [arrPolicies, setArrPolicies] = useState<TwoFactorAuthPolicyValues>({});
	const [arrPoliciesToModify, setArrPoliciesToModify] = useState<TwoFactorAuthPolicyValues>({});

	const listGlobalPolicies = useCallback(() => {
		list2faPolicies()
			.then((res) => {
				if (res?.Body?.response?.content) {
					const content = JSON.parse(res?.Body?.response?.content);
					if (content?.response) {
						setArrPolicies(content?.response?.values);
						setArrPoliciesToModify(content?.response?.values);
					}
				}
			})
			.catch((error: any) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error
						? error?.error
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [t, createSnackbar]);

	const modifyPolicies = (): void => {
		console.log('_dd modifyPolicy called');
	};

	useEffect(() => {
		console.log('_dd arrPolicies', arrPolicies);
	}, [arrPolicies]);

	useEffect(() => {
		listGlobalPolicies();
	}, [listGlobalPolicies]);

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
				<TwoFactorAuthencationConfig policies={arrPolicies} modifyPolicies={modifyPolicies} />
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

export default GlobalTwoFactorAuthentcation;
