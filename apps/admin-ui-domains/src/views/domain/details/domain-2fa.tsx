/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Container, RouteLeavingGuard, Row } from '@zextras/ui-components';
import { differenceWith, isEqual, map, some } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TwoFactorAuthPolicyValues } from '../../../../types';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { list2faPolicies } from '../../../services/list-2fa-policies';
import { set2faPolicies } from '../../../services/set-2fa-policies';
import { isValidIpRange, TwoFactorPolicyArray } from '../../utility/utils';
import { TwoFactorAuthencationConfig } from '../two-factor-authentication/2fa-config';
import { DomainFormActions } from './components/domain-form-actions';
import { useDomainMutation } from './hooks/use-domain-mutation';
import { TwoFactorFormValues,twoFactorSchema } from './schemas/domain-2fa-schema';

function parsePoliciesResponse(response: unknown): TwoFactorAuthPolicyValues[] {
	if (!response || typeof response !== 'object') return [];
	const typed = response as { Body?: { response?: { content?: string } } };
	if (!typed.Body?.response?.content) return [];
	try {
		const content = JSON.parse(typed.Body.response.content);
		return content?.response?.values ?? [];
	} catch {
		return [];
	}
}

async function savePolicies(
	domainName: string | undefined,
	originalPolicies: TwoFactorAuthPolicyValues[],
	modifiedPolicies: TwoFactorAuthPolicyValues[]
): Promise<{ ok: boolean; message?: string }> {
	const diff = differenceWith(modifiedPolicies, originalPolicies, isEqual);

	for (const policy of diff) {
		const serviceKey = Object.keys(policy)[0];
		const policyData = policy[serviceKey];
		const ipRangeValue =
			policyData?.trustedIpRange && policyData.trustedIpRange.length > 0
				? policyData.trustedIpRange.toString()
				: 'empty';

		const res = await set2faPolicies(
			domainName,
			serviceKey,
			policyData?.trustedDevice,
			ipRangeValue
		);
		const response = JSON.parse(res?.Body?.response?.content);

		if (!response?.ok) {
			throw new Error(response?.error ?? 'Save failed');
		}
	}

	return { ok: true };
}

// Convert API policies to form values
function policiesToFormValues(policies: TwoFactorAuthPolicyValues[]): TwoFactorFormValues {
	return {
		policies: policies.map((policy) => {
			const serviceKey = Object.keys(policy)[0];
			const policyData = policy[serviceKey];
			return {
				service: serviceKey,
				trustedDevice: policyData?.trustedDevice ?? 0,
				trustedIpRange: policyData?.trustedIpRange ?? []
			};
		})
	};
}

// Convert form values back to API format
function formValuesToPolicies(values: TwoFactorFormValues): TwoFactorAuthPolicyValues[] {
	return values.policies.map((policy) => ({
		[policy.service]: {
			trustedDevice: policy.trustedDevice,
			trustedIpRange: policy.trustedIpRange
		}
	}));
}

const DomainTwoFactorAuthentication = (): React.JSX.Element => {
	const [t] = useTranslation();
	const queryClient = useQueryClient();
	const { data: domain } = useSelectedDomain();
	const domainName = domain?.name;

	const twoFactorPolicyArray = useMemo(() => TwoFactorPolicyArray(t), [t]);

	// Fetch policies
	const { data: policies, isLoading } = useQuery({
		queryKey: ['2fa-policies', domainName],
		queryFn: async () => {
			const res = await list2faPolicies(domainName);
			return parsePoliciesResponse(res);
		},
		enabled: !!domainName
	});

	const [prevPolicies, setPrevPolicies] = useState(policies);

	const form = useForm({
		defaultValues: { policies: [] } as TwoFactorFormValues,
		validators: {
			onChange: twoFactorSchema,
			onSubmit: twoFactorSchema
		},
		onSubmit: async ({ value }) => {
			const policiesData = formValuesToPolicies(value);
			const result = await mutate({ policies: policiesData });
			if (result?.ok) {
				await queryClient.invalidateQueries({ queryKey: ['2fa-policies', domainName] });
				form.reset(value, { keepDefaultValues: true });
			}
		}
	});

	// Sync form with fetched data
	if (policies !== prevPolicies) {
		setPrevPolicies(policies);
		const formValues = policiesToFormValues(policies ?? []);
		form.reset(formValues, { keepDefaultValues: false });
	}

	const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

	// Get arrPoliciesToModify from form state for compatibility with TwoFactorAuthencationConfig
	const formPolicies = useSelector(form.store, (state) => state.values.policies);
	const arrPoliciesToModify = useMemo(() => formValuesToPolicies({ policies: formPolicies }), [formPolicies]);

	// Validation
	const hasValidationErrors = useMemo(() => {
		return twoFactorPolicyArray.some((e: { label?: string; keyToGet: string }) =>
			some(
				map(
					arrPoliciesToModify.find((obj: TwoFactorAuthPolicyValues) =>
						Object.hasOwn(obj, e.keyToGet)
					)?.[e.keyToGet]?.trustedIpRange,
					(ip: string) => ({ label: ip, error: !isValidIpRange(ip) })
				) || [],
				{ error: true }
			)
		);
	}, [arrPoliciesToModify, twoFactorPolicyArray]);

	// Mutation
	const { mutate, isPending } = useDomainMutation({
		mutationFn: async (data: { policies: TwoFactorAuthPolicyValues[] }) => {
			return savePolicies(domainName, policies ?? [], data.policies);
		},
		successMessage: t(
			'label.2fa-policy-updated-successfully',
			'The settings have been applied to all services'
		)
	});

	const handleOnSave = (): void => {
		form.handleSubmit();
	};

	const handleOnCancel = (): void => {
		form.reset();
	};

	// Wrapper for TwoFactorAuthencationConfig compatibility
	const modifyPolicies = useCallback(
		(newPolicies: TwoFactorAuthPolicyValues[]): void => {
			const formValues = policiesToFormValues(newPolicies);
			form.setFieldValue('policies', formValues.policies);
		},
		[form]
	);

	if (isLoading) {
		return (
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
				<ds-page-shimmer rows={6} />
			</Container>
		);
	}

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
								<ds-text as="h2" size="medium" weight="bold" color="gray0">
									{t('label.2-factor-authentication', '2-Factor-Authentication')}
								</ds-text>
							</Row>
							<DomainFormActions
								isDirty={isDirty}
								isPending={isPending}
								isValid={!hasValidationErrors}
								onCancel={handleOnCancel}
								onSave={handleOnSave}
							/>
						</Row>
					</Container>
					<ds-divider></ds-divider>
				</Row>
				<TwoFactorAuthencationConfig
					policies={policies ?? []}
					modifyPolicies={modifyPolicies}
					arrPoliciesToModify={arrPoliciesToModify}
					twoFactorPolicyArray={twoFactorPolicyArray}
				/>
			</Container>
			<RouteLeavingGuard when={isDirty} onSave={handleOnSave} />
		</Container>
	);
};

export default DomainTwoFactorAuthentication;
