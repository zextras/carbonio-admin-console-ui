/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	SnackbarManagerContext,
	Row,
	Padding,
	Text,
	Button,
	Divider,
	Icon,
	IconButton,
	Select,
	Input,
	Switch
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { isEqual } from 'lodash';
import { useConfigStore } from '../../../store/config/store';
import ListRow from '../../list/list-row';
import { MtaPostTuning } from '../../../../types';
import {
	ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST,
	ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
	ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD,
	ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
	ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE
} from '../../../constants';

const CustomIcon = styled(Icon)`
	width: 1.25rem;
	height: 1.25rem;
`;

const MTAPostScreenTuning: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const configInformation = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const [mtaPostTuningInitialDetail, setMtaPostTuningInitialDetail] = useState<MtaPostTuning>();
	const [mtaPostTuningDetail, setMtaPostTuningDetail] = useState<MtaPostTuning>();

	const setInitialValue = useCallback((key: string, value: unknown): void => {
		setMtaPostTuningInitialDetail((prev: any) => ({
			...prev,
			[key]: value
		}));
	}, []);
	const setValue = useCallback((key: string, value: unknown): void => {
		setMtaPostTuningDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setInitialAndCurrentValue = useCallback(
		(key, value) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	useEffect(() => {
		if (mtaPostTuningDetail && !isEqual(mtaPostTuningDetail, mtaPostTuningInitialDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [mtaPostTuningDetail, mtaPostTuningInitialDetail]);

	const ignoreEnforceDropOptions = useMemo(
		() => [
			{
				label: t('mta.ignore', 'Ignore'),
				value: 'ignore'
			},
			{
				label: t('mta.enforce', 'Enforce'),
				value: 'enforce'
			},
			{
				label: t('mta.drop', 'Drop'),
				value: 'drop'
			}
		],
		[t]
	);

	const ignoreDropOptions = useMemo(
		() => [
			{
				label: t('mta.ignore', 'Ignore'),
				value: 'ignore'
			},
			{
				label: t('mta.drop', 'Drop'),
				value: 'drop'
			}
		],
		[t]
	);

	const intervalOptions = useMemo(
		() => [
			{
				label: t('mta.seconds', 'Seconds'),
				value: 's'
			},
			{
				label: t('mta.minutes', 'Minutes'),
				value: 'm'
			},
			{
				label: t('mta.hours', 'Hours'),
				value: 'h'
			},
			{
				label: t('mta.days', 'Days'),
				value: 'd'
			},
			{
				label: t('mta.weeks', 'Weeks'),
				value: 'w'
			}
		],
		[t]
	);
	const [dnsblMinTTLUnit, setDnsblMinTTLUnit] = useState(intervalOptions[2]);
	const [dnsblMaxTTLUnit, setDnsblMaxTTLUnit] = useState(intervalOptions[2]);
	const [dnsblTTLUnit, setDnsblTTLUnit] = useState(intervalOptions[2]);

	useEffect(() => {
		if (configInformation && configInformation.length > 0) {
			const zimbraMtaPostscreenBlacklistAction = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION
			);
			if (zimbraMtaPostscreenBlacklistAction && zimbraMtaPostscreenBlacklistAction?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION,
					zimbraMtaPostscreenBlacklistAction?._content
				);
			}

			const zimbraMtaPostscreenAccessList = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST
			);
			if (zimbraMtaPostscreenAccessList && zimbraMtaPostscreenAccessList?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST,
					zimbraMtaPostscreenAccessList?._content
				);
			}

			const zimbraMtaPostscreenDnsblAction = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION
			);
			if (zimbraMtaPostscreenDnsblAction && zimbraMtaPostscreenDnsblAction?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION,
					zimbraMtaPostscreenDnsblAction?._content
				);
			}

			const zimbraMtaPostscreenDnsblSites = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES
			);
			if (zimbraMtaPostscreenDnsblSites && zimbraMtaPostscreenDnsblSites?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES,
					zimbraMtaPostscreenDnsblSites?._content
				);
			} else {
				setInitialAndCurrentValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES, '');
			}

			const zimbraMtaPostscreenDnsblThreshold = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD
			);
			if (zimbraMtaPostscreenDnsblThreshold && zimbraMtaPostscreenDnsblThreshold?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD,
					zimbraMtaPostscreenDnsblThreshold?._content
				);
			} else {
				setInitialAndCurrentValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD, '');
			}

			const zimbraMtaPostscreenDnsblWhitelistThreshold = configInformation.find(
				(item: Record<string, string>) =>
					item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD
			);
			if (
				zimbraMtaPostscreenDnsblWhitelistThreshold &&
				zimbraMtaPostscreenDnsblWhitelistThreshold?._content
			) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD,
					zimbraMtaPostscreenDnsblWhitelistThreshold?._content
				);
			}

			const zimbraMtaPostscreenDnsblMinTTL = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL
			);
			if (zimbraMtaPostscreenDnsblMinTTL && zimbraMtaPostscreenDnsblMinTTL?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
					zimbraMtaPostscreenDnsblMinTTL?._content
				);
			}

			const zimbraMtaPostscreenDnsblMaxTTL = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL
			);
			if (zimbraMtaPostscreenDnsblMaxTTL && zimbraMtaPostscreenDnsblMaxTTL?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
					zimbraMtaPostscreenDnsblMaxTTL?._content
				);
			}

			const zimbraMtaPostscreenDnsblTTL = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL
			);
			if (zimbraMtaPostscreenDnsblTTL && zimbraMtaPostscreenDnsblTTL?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
					zimbraMtaPostscreenDnsblTTL?._content
				);
			}

			const zimbraMtaPostscreenBareNewlineEnable = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE
			);
			if (zimbraMtaPostscreenBareNewlineEnable && zimbraMtaPostscreenBareNewlineEnable?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
					zimbraMtaPostscreenBareNewlineEnable?._content === 'yes'
				);
			}

			const zimbraMtaPostscreenNonSmtpCommandEnable = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE
			);
			if (
				zimbraMtaPostscreenNonSmtpCommandEnable &&
				zimbraMtaPostscreenNonSmtpCommandEnable?._content
			) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
					zimbraMtaPostscreenNonSmtpCommandEnable?._content === 'yes'
				);
			}

			const zimbraMtaPostscreenPipeliningEnable = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE
			);
			if (zimbraMtaPostscreenPipeliningEnable && zimbraMtaPostscreenPipeliningEnable?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
					zimbraMtaPostscreenPipeliningEnable?._content === 'yes'
				);
			}
		}
	}, [configInformation, setInitialAndCurrentValue]);

	useEffect(() => {
		if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL) {
			const unit = mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL.replace(/[^a-zA-Z]/g, '');
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setDnsblMinTTLUnit(findOption || intervalOptions[2]);
		}
	}, [mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL, intervalOptions]);

	useEffect(() => {
		if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL) {
			const unit = mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL.replace(/[^a-zA-Z]/g, '');
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setDnsblMaxTTLUnit(findOption || intervalOptions[2]);
		}
	}, [mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL, intervalOptions]);

	useEffect(() => {
		if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL) {
			const unit = mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL.replace(/[^a-zA-Z]/g, '');
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setDnsblTTLUnit(findOption || intervalOptions[2]);
		}
	}, [mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL, intervalOptions]);

	const onBlackListActionChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION, v);
		},
		[setValue]
	);

	const onDNSBlackListActionChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION, v);
		},
		[setValue]
	);

	const onDNSBlSiteChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES, v);
		},
		[setValue]
	);

	const onDNSMinTTLUnitChange = useCallback(
		(v) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setDnsblMinTTLUnit(findOption || intervalOptions[2]);
			setValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
				`${mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL.replace(/[^0-9]/g, '')}${
					findOption?.value
				}`
			);
		},
		[intervalOptions, setValue, mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL]
	);

	const onDNSMaxTTLUnitChange = useCallback(
		(v) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setDnsblMaxTTLUnit(findOption || intervalOptions[2]);
			setValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
				`${mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL.replace(/[^0-9]/g, '')}${
					findOption?.value
				}`
			);
		},
		[intervalOptions, setValue, mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL]
	);

	const onDNSTTLUnitChange = useCallback(
		(v) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setDnsblTTLUnit(findOption || intervalOptions[2]);
			setValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
				`${mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL.replace(/[^0-9]/g, '')}${
					findOption?.value
				}`
			);
		},
		[intervalOptions, setValue, mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL]
	);

	useEffect(() => {
		console.log('>>>>>', mtaPostTuningDetail);
	}, [mtaPostTuningDetail]);
	const onCancel = useCallback(() => {
		setMtaPostTuningDetail(mtaPostTuningInitialDetail);
		setValue(
			ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES,
			mtaPostTuningInitialDetail?.zimbraMtaPostscreenDnsblSites
				? mtaPostTuningInitialDetail?.zimbraMtaPostscreenDnsblSites
				: ''
		);
	}, [mtaPostTuningInitialDetail, setValue]);

	const onSave = useCallback(() => {
		console.log('xxxxx');
	}, []);

	return (
		<Container background="gray6" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray6"
				width="fill"
				height="3.5rem"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.postscreen_tuning', 'Postscreen Tuning')}
					</Text>
				</Row>
				<Row>
					{isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
						>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										height={36}
										onClick={onCancel}
									/>
								)}
							</Padding>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.save', 'Save')}
										color="primary"
										height={36}
										onClick={onSave}
									/>
								)}
							</Padding>
						</Container>
					)}
				</Row>
			</Row>
			<ListRow>
				<Divider />
			</ListRow>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 10.5rem)"
				style={{ overflow: 'auto' }}
			>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.blacklisting', 'Blacklisting')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="100%"
					background="#D3EBF8"
					padding={{ all: 'small' }}
					style={{
						borderRadius: '0.125rem 0.125rem 0 0',
						borderBottom: '0.063rem solid #2196D3',
						marginTop: '15px',
						marginBottom: '15px'
					}}
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="100%"
					>
						<Container width="5%" padding={{ left: 'extralarge', right: 'extralarge' }}>
							<Padding horizontal="small">
								<CustomIcon icon="InfoOutline" color="#2196D3"></CustomIcon>
							</Padding>
						</Container>
						<Container
							padding={{
								top: 'small',
								bottom: 'small'
							}}
							crossAlignment="flex-start"
						>
							<Text overflow="break-word">
								{t(
									'mta.graylisting_disabled_warning_message',
									'This is a form of greylisting, so you need to disable other forms of greylisting.'
								)}
							</Text>
						</Container>
					</Container>

					<Container width="auto" padding={{ right: 'small' }}>
						<IconButton icon="CloseOutline" size="large" />
					</Container>
				</Container>
				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Select
							items={ignoreEnforceDropOptions}
							background="gray5"
							label={t('mta.black_list_action', 'Blacklist Action')}
							showCheckbox={false}
							selection={ignoreEnforceDropOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaPostTuningDetail?.zimbraMtaPostscreenBlacklistAction
							)}
							onChange={onBlackListActionChange}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Input
							label={t('mta.access_list_path', 'Access List Path')}
							background="gray5"
							value={mtaPostTuningDetail?.zimbraMtaPostscreenAccessList}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST, e.target.value);
							}}
						/>
					</Container>
				</Container>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.dns_black_listing', 'DNS Blacklisting')}
					</Text>
				</Container>
				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ top: 'large', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Select
							items={ignoreDropOptions}
							background="gray5"
							label={t('mta.dns_blacklist_sites', 'DNS Blacklist Sites')}
							showCheckbox={false}
							selection={ignoreDropOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaPostTuningDetail?.zimbraMtaPostscreenDnsblSites
							)}
							onChange={onDNSBlSiteChange}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Select
							items={ignoreEnforceDropOptions}
							background="gray5"
							label={t('mta.dns_blacklist_action', 'DNS Blacklist Action')}
							showCheckbox={false}
							selection={ignoreEnforceDropOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaPostTuningDetail?.zimbraMtaPostscreenDnsblAction
							)}
							onChange={onDNSBlackListActionChange}
						/>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Input
							label={t('mta.dns_blacklist_threshold_value', 'DNS Blacklist Threshold (value)')}
							background="gray5"
							value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblThreshold}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD, e.target.value);
							}}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Input
							label={t(
								'mta.dns_blacklist_whitelist_threshold_value',
								'DNS Blacklist Whitelist Threshold  (value)'
							)}
							background="gray5"
							value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblWhitelistThreshold}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD, e.target.value);
							}}
						/>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
					width="100%"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
						width="46%"
					>
						<Container
							padding={{ right: 'medium' }}
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							width="75%"
						>
							<Input
								label={t(
									'mta.dns_blacklist_min_time_to_live',
									'DNS Blacklist Min Time to Live (value)'
								)}
								background="gray5"
								value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL.replace(/[^0-9]/g, '')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL, e.target.value);
								}}
							/>
						</Container>
						<Container crossAlignment="flex-start" mainAlignment="flex-start" width="25%">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
								selection={dnsblMinTTLUnit}
								onChange={onDNSMinTTLUnitChange}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="54%"
					>
						<Container padding={{ right: 'medium' }} width="75%">
							<Input
								label={t(
									'mta.dns_blacklist_max_time_to_live',
									'DNS Blacklist Max Time to Live (value)'
								)}
								background="gray5"
								value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL.replace(/[^0-9]/g, '')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL, e.target.value);
								}}
							/>
						</Container>
						<Container width="25%">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
								selection={dnsblMaxTTLUnit}
								onChange={onDNSMaxTTLUnitChange}
							/>
						</Container>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
					width="100%"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="82%"
					>
						<Container padding={{ right: 'small' }} width="75%">
							<Input
								label={t('mta.dns_blacklist_time_to_live', 'DNS Blacklist Time to Live (value)')}
								background="gray5"
								value={
									mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL &&
									mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL.replace(/[^0-9]/g, '')
								}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL, e.target.value);
								}}
							/>
						</Container>
						<Container width="25%">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
								selection={dnsblTTLUnit}
								onChange={onDNSTTLUnitChange}
							/>
						</Container>
					</Container>
					<Container></Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium', bottom: 'medium' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.tuning', 'Tuning')}
					</Text>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Switch
								label={t('mta.bare_newline', 'Bare Newline')}
								value={mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineEnable}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
										!mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineEnable
									)
								}
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={ignoreEnforceDropOptions}
								background="gray5"
								label={t('mta.action', 'Action')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Input
								label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
								background="gray5"
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Switch
								label={t('mta.non_smtp_command', 'NonSMTP Command')}
								value={mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandEnable}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
										!mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandEnable
									)
								}
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={ignoreEnforceDropOptions}
								background="gray5"
								label={t('mta.action', 'Action')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Input
								label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
								background="gray5"
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Switch
								label={t('mta.pipelining', 'Pipelining')}
								value={mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningEnable}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
										!mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningEnable
									)
								}
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={ignoreEnforceDropOptions}
								background="gray5"
								label={t('mta.action', 'Action')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Input
								label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
								background="gray5"
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAPostScreenTuning;
