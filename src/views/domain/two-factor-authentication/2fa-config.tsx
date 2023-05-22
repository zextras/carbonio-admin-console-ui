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
	policies: TwoFactorAuthPolicyValues;
	modifyPolicies: any;
}> = ({ policies, modifyPolicies }) => {
	const [t] = useTranslation();
	const WHAT_TO_TRUST = useMemo(() => TwoFactorWhatToTrust(t), [t]);
	const [allWhatToTrust, setAllWhatToTrust] = useState();
	const [allIpRange, setAllIpRange] = useState<
		[
			{
				value: string;
				error: boolean;
			}
		]
	>();

	console.log('_dd policies', policies);

	const applyToAll = (): void => {
		console.log('_dd applyToAll');
	};

	useEffect(() => {
		console.log('_dd allIpRange', allIpRange);
	}, [allIpRange]);

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
								onChange={(): void => {
									console.log('_dd onchange');
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
									setAllIpRange(data);
								}}
								hasError={some(allIpRange || [], { error: true })}
								value={allIpRange}
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
							width="15%"
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							height="fill"
						>
							<Text>{t('domain.admin_api', 'Admin API')}</Text>
						</Container>

						<Padding right="large" width="30%">
							<Select
								items={WHAT_TO_TRUST}
								label={t('label.what_to_trust', 'What to trust?')}
								onChange={(): void => {
									console.log('_dd onchange');
								}}
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
									setAllIpRange(data);
								}}
								hasError={some(allIpRange || [], { error: true })}
								value={allIpRange}
								errorLabel={t('error.one_or_more_ip_invalid', 'One or more IP are invalid')}
							/>
						</Padding>
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
								/* defaultSelection={WHAT_TO_TRUST.find((item: any) => {
									const objWebUi = find(policies, (obj) => has(obj, 'WebUI'));
									

									console.log(
										'_dd item.trustedDevice === policies?.WebUI?.trustedDevice',
										item.value,
										objWebUi?.trustedDevice
									);
								})} */
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
									setAllIpRange(data);
								}}
								hasError={some(allIpRange || [], { error: true })}
								value={allIpRange}
								errorLabel={t('error.one_or_more_ip_invalid', 'One or more IP are invalid')}
							/>
						</Padding>
					</ListRow>
					<ListRow padding={{ top: 'large' }} orientation="horizontal" crossAlignment="center">
						<Container
							crossAlignment="flex-start"
							width="15%"
							mainAlignment="flex-start"
							height="fill"
						>
							<Text>{t('domain.mobile_apps', 'Mobile Apps')}</Text>
						</Container>

						<Padding right="large" width="30%">
							<Select
								items={WHAT_TO_TRUST}
								label={t('label.what_to_trust', 'What to trust?')}
								onChange={(): void => {
									console.log('_dd onchange');
								}}
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
									setAllIpRange(data);
								}}
								hasError={some(allIpRange || [], { error: true })}
								value={allIpRange}
								errorLabel={t('error.one_or_more_ip_invalid', 'One or more IP are invalid')}
							/>
						</Padding>
					</ListRow>
					<ListRow padding={{ top: 'large' }} orientation="horizontal" crossAlignment="center">
						<Container
							crossAlignment="flex-start"
							width="15%"
							mainAlignment="flex-start"
							height="fill"
						>
							<Text>{t('domain.active_sync', 'ActiveSync')}</Text>
						</Container>

						<Padding right="large" width="30%">
							<Select
								items={WHAT_TO_TRUST}
								label={t('label.what_to_trust', 'What to trust?')}
								onChange={(): void => {
									console.log('_dd onchange');
								}}
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
									setAllIpRange(data);
								}}
								hasError={some(allIpRange || [], { error: true })}
								value={allIpRange}
								errorLabel={t('error.one_or_more_ip_invalid', 'One or more IP are invalid')}
							/>
						</Padding>
					</ListRow>
				</Container>
			</Row>
		</Container>
	);
};
