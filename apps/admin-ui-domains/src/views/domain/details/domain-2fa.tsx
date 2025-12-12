/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDomainStore } from '@zextras/admin-ui-bootstrap';
import {
	Button,
	Container,
	Divider,
	Padding,
	Row,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { differenceWith, isEqual, map, some } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TwoFactorAuthPolicyValues } from '../../../../types';
import { OK } from '../../../constants';
import { list2faPolicies } from '../../../services/list-2fa-policies';
import { set2faPolicies } from '../../../services/set-2fa-policies';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { isValidIpRange,TwoFactorPolicyArray } from '../../utility/utils';
import { TwoFactorAuthencationConfig } from '../two-factor-authentication/2fa-config';

const DomainTwoFactorAuthentication: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar = useSnackbar();
	const [arrPolicies, setArrPolicies] = useState<TwoFactorAuthPolicyValues[]>([]);
	const [arrPoliciesToModify, setArrPoliciesToModify] = useState<TwoFactorAuthPolicyValues[]>([]);
	const domainName = useDomainStore((state) => state.domain?.name);
	const twoFactorPolicyArray = useMemo(() => TwoFactorPolicyArray(t), [t]);

	const listGlobalPolicies = useCallback(() => {
		list2faPolicies(domainName)
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
					severity: 'error',
					label: error
						? error?.error
						: // eslint-disable-next-line sonarjs/no-duplicate-string
						  t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [domainName, createSnackbar, t]);

	const modifyPolicies = (newPolicies: TwoFactorAuthPolicyValues[]): void => {
		setArrPoliciesToModify(newPolicies);
		setIsDirty(true);
	};

	useEffect(() => {
		const dif = differenceWith(arrPoliciesToModify, arrPolicies, isEqual);
		setIsDirty(dif.length > 0);
	}, [arrPolicies, arrPoliciesToModify]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleOnSave = (): void => {
		const dif = differenceWith(arrPoliciesToModify, arrPolicies, isEqual);

		map(dif, (policy: TwoFactorAuthPolicyValues) => {
			set2faPolicies(
				domainName,
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
						key: 'error',
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
				<Row mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="3.5rem">
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
														arrPoliciesToModify.find((obj: unknown) =>
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
					<Divider color="gray2" />
				</Row>
				<TwoFactorAuthencationConfig
					policies={arrPolicies}
					modifyPolicies={modifyPolicies}
					arrPoliciesToModify={arrPoliciesToModify}
					twoFactorPolicyArray={twoFactorPolicyArray}
				/>
			</Container>
			<RouteLeavingGuard when={isDirty} onSave={handleOnSave}>
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
