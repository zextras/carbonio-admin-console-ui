/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	Dispatch,
	FC,
	ReactElement,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState
} from 'react';
import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Input,
	Button,
	Select,
	DefaultTabBarItem,
	TabBar,
	ChipInput
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { find, has, map, some } from 'lodash';
import ListRow from '../../list/list-row';
import { TwoFactorWhatToTrust, isValidIpRange } from '../../utility/utils';
import { IpRangeValue, TwoFactorAuthPolicyValues } from '../../../../types';

export const TwoFactorAuthencationConfig: FC<{
	policies: TwoFactorAuthPolicyValues[];
	modifyPolicies: any;
}> = ({ policies, modifyPolicies }) => {
	const [t] = useTranslation();
	const WHAT_TO_TRUST = useMemo(() => TwoFactorWhatToTrust(t), [t]);
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
		const modifiedPolicy = map(policies, (policy) => ({
			[Object.keys(policy)[0]]: {
				trustedDevice: applyAllValues.whatToTrust,
				trustedIpRange: applyAllValues.ipRange
			}
		}));
		modifyPolicies(modifiedPolicy);
	};

	const applyToIndividual = (): void => {
		const modifiedPolicy = map(policies, (policy) => ({
			[Object.keys(policy)[0]]: {
				trustedDevice: applyAllValues.whatToTrust,
				trustedIpRange: applyAllValues.ipRange
			}
		}));
		modifyPolicies(modifiedPolicy);
	};

	useEffect(() => {
		console.log('_dd applyAllvalues', applyAllValues);
	}, [applyAllValues]);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			style={{ overflow: 'auto' }}
			width="100%"
			height="calc(100vh - 150px)"
		>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
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
						<Padding width="70%">
							<ChipInput
								background="gray5"
								placeholder={t('label.trusted_network_ip', 'Trusted Networks (IP ranges)')}
								onChange={(ips: [IpRangeValue]): void => {
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
								errorLabel={t('error.one_or_more_ip_invalid', 'One or more IP are invalid')}
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
					<ListRow padding={{ top: 'large' }} orientation="horizontal" crossAlignment="center">
						<Container
							crossAlignment="flex-start"
							width="15%"
							mainAlignment="flex-start"
							height="fill"
						>
							<Text>{t('domain.web_ui', 'WebUI')}</Text>
						</Container>

						<Padding right="large" width="30%">
							<Select
								items={WHAT_TO_TRUST}
								label={t('label.what_to_trust', 'What to trust?')}
								onChange={(): void => {
									console.log('_dd onchange');
								}}
								selection={WHAT_TO_TRUST.find((item: any) => {
									const webUIObject = policies.find((obj) =>
										Object.prototype.hasOwnProperty.call(obj, 'WebUI')
									);
									return item.value === webUIObject?.WebUI.trustedDevice;
								})}
								defaultSelection={WHAT_TO_TRUST[0]}
								showCheckbox={false}
							/>
						</Padding>
						<Padding width="65%">
							<ChipInput
								background="gray5"
								placeholder={t('label.trusted_network_ip', 'Trusted Networks (IP ranges)')}
								onChange={(ips: [IpRangeValue]): void => {
									const data: any = [];
									map(ips, (ip: IpRangeValue) => {
										isValidIpRange(ip.label ?? '')
											? data.push(ip)
											: data.push({ ...ip, error: true });
									});
									setApplyAllValues((prev) => ({ ...prev, ipRange: data }));
								}}
								hasError={some(applyAllValues.ipRange || [], { error: true })}
								value={map(
									policies.find((obj) => Object.prototype.hasOwnProperty.call(obj, 'WebUI'))?.WebUI
										.trustedIpRange,
									(ip: string) => ({ label: ip })
								)}
								errorLabel={t('error.one_or_more_ip_invalid', 'One or more IP are invalid')}
							/>
						</Padding>
					</ListRow>
				</Container>
			</Row>
		</Container>
	);
};
