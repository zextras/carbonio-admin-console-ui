/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useState } from 'react';

import {
	Container,
	Row,
	Padding,
	Text,
	Button,
	Select,
	ChipInput
} from '@zextras/carbonio-design-system';
import { map, some } from 'lodash';
import { useTranslation } from 'react-i18next';

import { IpRangeValue, TwoFactorAuthPolicyValues } from '../../../../types';
import CustomChip from '../../components/customChip';
import ListRow from '../../list/list-row';
import { TwoFactorWhatToTrust, isValidIpRange } from '../../utility/utils';

type TwoFactorPolicy = {
	label: string;
	keyToGet: string;
};

export const TwoFactorAuthencationConfig: FC<{
	policies: TwoFactorAuthPolicyValues[];
	modifyPolicies: any;
	arrPoliciesToModify: TwoFactorAuthPolicyValues[];
	twoFactorPolicyArray: Array<TwoFactorPolicy>;
}> = ({ modifyPolicies, arrPoliciesToModify, twoFactorPolicyArray }) => {
	const [t] = useTranslation();
	const WHAT_TO_TRUST: any = useMemo(() => TwoFactorWhatToTrust(t), [t]);

	const [applyAllValues, setApplyAllValues] = useState<{
		whatToTrust?: object;
		ipRange?: [
			{
				value: string;
				error: boolean;
			}
		];
	}>({});

	const applyToAll = (): void => {
		const modifiedPolicy = map(arrPoliciesToModify, (policy) => {
			let flatIpRange: Array<string> | undefined = policy[Object.keys(policy)[0]].trustedIpRange;
			if (applyAllValues.ipRange !== undefined) {
				flatIpRange = map(applyAllValues.ipRange, (ip: any) => ip.label);
			}
			return {
				[Object.keys(policy)[0]]: {
					trustedDevice: applyAllValues.whatToTrust,
					trustedIpRange: flatIpRange
				}
			};
		});
		modifyPolicies(modifiedPolicy);
	};

	const applyToIndividual = (
		key: string,
		whatToTrust?: number | undefined,
		ipRange?: [] | undefined
	): void => {
		const modifiedPolicy = map(arrPoliciesToModify, (policy) => {
			if (key === Object.keys(policy)[0]) {
				let flatIpRange: Array<string> | undefined = policy[key].trustedIpRange;
				if (ipRange !== undefined) {
					flatIpRange = map(ipRange, (ip: { label: string }) => ip.label);
				}
				return {
					[key]: {
						trustedDevice: whatToTrust !== undefined ? whatToTrust : policy[key].trustedDevice,
						trustedIpRange: flatIpRange
					}
				};
			}
			return policy;
		});
		modifyPolicies(modifiedPolicy);
	};

	const hasValidIpCheck = (cVal: TwoFactorPolicy): boolean =>
		some(
			map(
				arrPoliciesToModify.find(
					(obj: TwoFactorAuthPolicyValues) => obj?.[cVal.keyToGet]?.trustedIpRange
				)?.[cVal.keyToGet]?.trustedIpRange,
				(ip: string) => ({ label: ip, error: !isValidIpRange(ip) })
			) || [],
			{ error: true }
		);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			style={{ overflow: 'auto' }}
			width="100%"
			height="calc(100vh - 9.375rem)"
		>
			<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
				<Container
					padding={{ all: 'small' }}
					height="fit"
					crossAlignment="flex-start"
					background="gray6"
				>
					<ListRow padding={{ top: 'large' }}>
						<Text size="medium" color="gray0" weight="bold">
							{t('label.configuration_lbl', 'Configuration')}
						</Text>
					</ListRow>
					<ListRow padding={{ top: 'large' }}>
						<Text size="small" color="gray1">
							{t(
								'label.configuration_help_text',
								'Setup the networks or the devices (IPs) that will not require the 2FA authentication'
							)}
						</Text>
					</ListRow>
					<ListRow padding={{ top: 'large' }}>
						<Padding right="large" width="30%">
							<Select
								items={WHAT_TO_TRUST}
								label={t('label.what_to_trust', 'What to trust?')}
								onChange={(item: any): void => {
									setApplyAllValues((prev) => ({ ...prev, whatToTrust: item }));
								}}
								showCheckbox={false}
							/>
						</Padding>
						<Padding right="0" width="70%">
							<ChipInput
								background="gray5"
								placeholder={t('label.trusted_network_ip', 'Trusted Networks (IP ranges)')}
								onChange={(ips): void => {
									const data: any = [];
									map(ips, (ip: IpRangeValue) => {
										isValidIpRange(ip.label ?? '')
											? data.push(ip)
											: data.push({ ...ip, error: true });
									});
									setApplyAllValues((prev) => ({ ...prev, ipRange: data }));
								}}
								hasError={some(applyAllValues.ipRange || [], { error: true })}
								value={applyAllValues.ipRange}
								description={
									some(applyAllValues.ipRange || [], { error: true })
										? t('error.one_or_more_ip_invalid', 'One or more IP are invalid')
										: ''
								}
								ChipComponent={CustomChip}
								maxChips={null}
							/>
						</Padding>
					</ListRow>
					<ListRow padding={{ top: 'large' }}>
						<Button
							width="fill"
							type="outlined"
							label={t('label.apply_to_all', 'APPLY TO ALL SERVICES')}
							color="primary"
							onClick={applyToAll}
						/>
					</ListRow>
					{twoFactorPolicyArray?.map((cVal) => (
						<ListRow
							key={`${cVal.label}-${cVal.keyToGet}`}
							padding={{ top: 'large' }}
							orientation="horizontal"
							crossAlignment="center"
						>
							<Container
								crossAlignment="flex-start"
								width="15%"
								mainAlignment="flex-start"
								height="fill"
							>
								<Text>{cVal.label}</Text>
							</Container>

							<Padding right="large" width="30%">
								<Select
									items={WHAT_TO_TRUST}
									label={t('label.what_to_trust', 'What to trust?')}
									onChange={(v: any): void => {
										applyToIndividual(cVal.keyToGet, v);
									}}
									selection={WHAT_TO_TRUST.find((item: any) => {
										const tmpObj = arrPoliciesToModify.find((obj) =>
											Object.prototype.hasOwnProperty.call(obj, cVal.keyToGet)
										);
										return item.value === tmpObj?.[cVal.keyToGet]?.trustedDevice;
									})}
									showCheckbox={false}
								/>
							</Padding>
							<Padding right="0" width="65%">
								<ChipInput
									background="gray5"
									placeholder={t('label.trusted_network_ip', 'Trusted Networks (IP ranges)')}
									onChange={(ips): void => {
										const data: any = [];
										map(ips, (ip: IpRangeValue) => {
											isValidIpRange(ip.label ?? '')
												? data.push(ip)
												: data.push({ ...ip, error: true });
										});
										applyToIndividual(cVal.keyToGet, undefined, data);
									}}
									hasError={hasValidIpCheck(cVal)}
									value={map(
										// eslint-disable-next-line @typescript-eslint/no-explicit-any, max-len
										arrPoliciesToModify.find((obj: any) => Object.hasOwn(obj, cVal.keyToGet))?.[
											cVal.keyToGet
										]?.trustedIpRange,
										(ip: string) => ({ label: ip, error: !isValidIpRange(ip) })
									)}
									{...(hasValidIpCheck(cVal) && {
										description: t('error.one_or_more_ip_invalid', 'One or more IP are invalid')
									})}
									ChipComponent={CustomChip}
									maxChips={null}
								/>
							</Padding>
						</ListRow>
					))}
				</Container>
			</Row>
		</Container>
	);
};
