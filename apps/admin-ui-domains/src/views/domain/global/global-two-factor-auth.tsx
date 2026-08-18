/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { 	Button,	Container,	Padding,	RouteLeavingGuard,	Row,	useSnackbar } from '@zextras/ui-components';
import {  differenceWith, isEqual, map, some  } from 'lodash-es';
import {  FC, useEffect, useMemo, useState  } from 'react';
import {  useTranslation  } from 'react-i18next';

import {  TwoFactorAuthPolicyValues  } from '../../../../types';
import {  OK  } from '../../../constants';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import {  set2faPolicies  } from '../../../services/set-2fa-policies';
import { use2faPolicies } from '../../../services/use-2fa-policies';
import {  isValidIpRange,TwoFactorPolicyArray  } from '../../utility/utils';
import {  TwoFactorAuthencationConfig  } from '../two-factor-authentication/2fa-config';

const GlobalTwoFactorAuthentcation: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar = useSnackbar();
	const [arrPoliciesToModify, setArrPoliciesToModify] = useState<TwoFactorAuthPolicyValues[]>([]);
	const queryClient = useQueryClient();
	const { data: arrPolicies = [], error: policiesError } = use2faPolicies('');
	const twoFactorPolicyArray = useMemo(() => TwoFactorPolicyArray(t), [t]);

	useEffect(() => {
		setArrPoliciesToModify(arrPolicies);
	}, [arrPolicies]);

	useEffect(() => {
		if (policiesError) {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: policiesError?.message
					? policiesError?.message
					:
					  t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		}
	}, [policiesError, createSnackbar, t]);

	const modifyPolicies = (newPolicies: TwoFactorAuthPolicyValues[]): void => {
		setArrPoliciesToModify(newPolicies);
		setIsDirty(true);
	};

	const handleOnSave = (): void => {
		const dif = differenceWith(arrPoliciesToModify, arrPolicies, isEqual);

		map(dif, (policy: TwoFactorAuthPolicyValues) => {
			set2faPolicies(
				'',
				Object.keys(policy)[0],
				policy[Object.keys(policy)[0]]?.trustedDevice,
				policy[Object.keys(policy)[0]]?.trustedIpRange?.length !== 0
					? policy[Object.keys(policy)[0]]?.trustedIpRange?.toString()
					: 'empty'
			)
				.then((res) => {
					const response = JSON.parse(res?.Body?.response?.content);
					if (response?.ok) {
						createSnackbar({
							key: 'policy-success',
							severity: response?.message !== OK ? 'warning' : 'success',
							label:
								response?.message !== OK
									? response?.message
									: t(
											'label.2fa-policy-updated-successfully',
											'The settings have been applied to all services'
									  ),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
						setIsDirty(false);
						queryClient.invalidateQueries({ queryKey: domainQueryKeys.twoFactorPolicies('') });
					} else {
						createSnackbar({
							key: 'policy-error',
							severity: 'error',
							label: response?.error
								? response?.error
								: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
				})
				.catch((error: any) => {
					createSnackbar({
						key: 'policy-error',
						severity: 'error',
						label: error
							? error?.error
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		});
	};

	const handleOnCancel = (): void => {
		setArrPoliciesToModify(arrPolicies);
	};

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="3.5rem">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
							<ds-text as="h1" size="medium" weight="bold" color="gray0">
								{t('label.2-factor-authentication', '2-Factor-Authentication')}
							</ds-text>
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
											onClick={handleOnCancel}
										/>
									)}
								</Padding>
								{isDirty && (
									<Button
										label={t('label.save', 'Save')}
										color="primary"
										onClick={handleOnSave}
										disabled={
											twoFactorPolicyArray.filter((e: { label?: string; keyToGet: string }) =>
												some(
													map(
														arrPoliciesToModify.find((obj: any) =>
															Object.prototype.hasOwnProperty.call(obj, e.keyToGet)
														)?.[e.keyToGet].trustedIpRange,
														(ip: string) => ({ label: ip, error: !isValidIpRange(ip) })
													) || [],
													{ error: true }
												)
											).length > 0
										}
									/>
								)}
							</Row>
						</Row>
					</Container>
					<ds-divider></ds-divider>
				</Row>
				<TwoFactorAuthencationConfig
					policies={arrPolicies}
					modifyPolicies={modifyPolicies}
					arrPoliciesToModify={arrPoliciesToModify}
					twoFactorPolicyArray={twoFactorPolicyArray}
				/>
			</Container>
		<RouteLeavingGuard when={isDirty} onSave={handleOnSave} />
		</Container>
	);
};

export default GlobalTwoFactorAuthentcation;
