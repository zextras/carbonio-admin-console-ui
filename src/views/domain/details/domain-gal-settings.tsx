/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Text,
	Divider,
	Button,
	Padding,
	SnackbarManagerContext,
	Dropdown,
	Select,
	Switch,
	Icon,
	Tooltip,
	IconButton
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { getAccount } from '../../../services/get-account-service';
import { getDatasource } from '../../../services/get-datasource-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { modifyDataSource } from '../../../services/modify-datasource-service';
import { useDomainStore } from '../../../store/domain/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';
import { FALSE, TRUE } from '../../../constants';
import { modifyAccountRequest } from '../../../services/modify-account';
import { MeasureUnitItems } from '../../utility/utils';

// eslint-disable-next-line no-shadow
export enum RANGE {
	DAYS = 'd',
	HOURS = 'h',
	MINUTES = 'm',
	SECONDS = 's'
}

const DomainGalSettings: FC = () => {
	const [t] = useTranslation();
	const measureUnitItems = useMemo(() => MeasureUnitItems(t), [t]);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const domainInformation = useDomainStore((state) => state.domain?.a);

	const [open, setOpen] = useState<boolean>(false);

	const onClose = useCallback(() => {
		setOpen(false);
	}, []);
	const onOpen = useCallback(() => {
		setOpen(true);
	}, []);
	const rangeItems = useMemo(
		() => [
			{
				label: t('label.days', 'Days'),
				value: RANGE.DAYS
			},
			{
				label: t('label.hours', 'Hours'),
				value: RANGE.HOURS
			},
			{
				label: t('label.minutes', 'Minutes'),
				value: RANGE.MINUTES
			},
			{
				label: t('label.seconds', 'Seconds'),
				value: RANGE.SECONDS
			}
		],
		[t]
	);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [domainData, setDomainData]: any = useState({
		zimbraGalMaxResults: '',
		zimbraGalAccountId: '',
		zimbraGalMode: '',
		zimbraDataSourcePollingInterval: '',
		zimbraGalLdapPageSize: '',
		zimbraGalLdapURL: '',
		zimbraGalLdapStartTlsEnabled: FALSE,
		zimbraGalLdapSearchBase: '',
		zimbraGalLdapFilter: '',
		zimbraGalLdapBindDn: '',
		zimbraGalLdapBindPassword: '',
		zimbraGalLdapAuthMech: 'none',
		zimbraDataSourceGalPollingInterval: ''
	});
	const [zimbraGalMode, setZimbraGalMode] = useState<string>('');
	const [zimbraGalMaxResults, setZimbraGalMaxResults] = useState<string>('');
	const [zimbraDataSourceGalPollingInterval, setZimbraDataSourceGalPollingInterval] =
		useState<string>('');
	const [zimbraGalLdapPageSize, setZimbraGalLdapPageSize] = useState<string>('');
	const [zimbraGalAccountId, setZimbraGalAccountId] = useState<string>('');
	const [zimbraGalLdapStartTlsEnabled, setZimbraGalLdapStartTlsEnabled] = useState<{
		init: boolean;
		current: boolean;
	}>({
		init: false,
		current: false
	});
	const [zimbraGalLdapAuthMech, setZimbraGalLdapAuthMech] = useState<boolean>(false);
	const [zimbraGalAccountName, setZimbraGalAccountName] = useState<string>('');
	const [mailServerName, setMailServerName] = useState<string>('');
	const [zimbraDataSourcePollingInterval, setZimbraDataSourcePollingInterval] =
		useState<string>('');
	const [pollingIntervalValue, setPollingIntervalValue] = useState<string>('');
	const [pollingIntervalType, setPollingIntervalType] = useState<any>(rangeItems[0]);
	const [dataSourceId, setDataSourceId] = useState<any>('');
	const setDomain = useDomainStore((state) => state.setDomain);
	const [dataSourceName, setDataSourceName] = useState<string>('');
	const [measureUnitSelection, setMeasureUnitSelection] = useState<{
		label: string;
		value: string;
	}>();

	const [freqValue, setFreqValue] = useState<object | any>({
		digits: '',
		time: 's'
	});
	const changeGalModeBtnItems = [
		{
			id: 'internal',
			label: t('domain.gal_change_mode_internal', 'Internal'),
			value: 'zimbra',
			click: (ev: any): void => {
				setDomainData({ ...domainData, zimbraGalMode: 'zimbra' });
				if (ev?.target?.value !== domainData?.zimbraGalMode) {
					setIsDirty(true);
				}
			}
		},
		{
			id: 'external',
			label: t('domain.gal_change_mode_external', 'External'),
			value: 'ldap',
			click: (ev: any): void => {
				setDomainData({ ...domainData, zimbraGalMode: 'ldap' });
				if (ev?.target?.value !== domainData?.zimbraGalMode) {
					setIsDirty(true);
				}
			}
		},
		{
			id: 'both',
			label: t('domain.gal_change_mode_both', 'Both'),
			value: 'both',
			click: (ev: any): void => {
				setDomainData({ ...domainData, zimbraGalMode: 'both' });
				if (ev?.target?.value !== domainData?.zimbraGalMode) {
					setIsDirty(true);
				}
			}
		}
	];

	const updateFreqValues = useCallback(
		(obj: any) => {
			const val = obj?.zimbraDataSourceGalPollingInterval || zimbraDataSourceGalPollingInterval;
			setZimbraDataSourceGalPollingInterval(val);
			setDomainData({
				...domainData,
				zimbraDataSourceGalPollingInterval: val
			});
			const splitText = val.split(/(\d+)/);

			setFreqValue({
				digits: splitText[1],
				time: splitText[2]
			});
			const measureUnitObject: any = measureUnitItems?.find(
				(item: any): any => item?.value === splitText[2]
			);
			setMeasureUnitSelection(measureUnitObject);
		},
		[domainData, measureUnitItems, zimbraDataSourceGalPollingInterval]
	);

	const getGalAccount = (accountId: string): void => {
		getAccount(accountId).then((data) => {
			const galAccount: any = data?.account[0];
			if (galAccount) {
				setZimbraGalAccountName(galAccount?.name);
				if (galAccount?.a) {
					const obj: any = {};
					galAccount?.a.map((item: any) => {
						obj[item?.n] = item._content;
						return '';
					});
					if (obj?.zimbraMailHost) {
						setMailServerName(obj?.zimbraMailHost);
					} else {
						setMailServerName('');
					}
					if (obj?.zimbraDataSourceGalPollingInterval) {
						updateFreqValues(obj);
					}
				}
			}
		});
	};

	const getDomainDataSource = (accountId: string): void => {
		getDatasource(accountId).then((data) => {
			const dataSource: any = data?.dataSource[0];
			if (dataSource && dataSource?.id) {
				setDataSourceId(dataSource?.id);
				if (dataSource?._attrs && dataSource?._attrs?.zimbraDataSourcePollingInterval) {
					setZimbraDataSourcePollingInterval(dataSource?._attrs?.zimbraDataSourcePollingInterval);
				}
				if (dataSource?._attrs && dataSource?._attrs?.zimbraDataSourceName) {
					setDataSourceName(dataSource?._attrs?.zimbraDataSourceName);
				}
			} else {
				setZimbraDataSourcePollingInterval('');
				setDataSourceName('');
			}
		});
	};

	const updateDomainInformation = useCallback(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			setZimbraGalAccountId('');
			setZimbraGalAccountName('');
			setZimbraDataSourcePollingInterval('');
			setDataSourceName('');
			const obj: any = {};
			domainInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});

			if (obj.zimbraGalMaxResults) {
				setZimbraGalMaxResults(obj.zimbraGalMaxResults);
			} else {
				obj.zimbraGalMaxResults = '';
				setZimbraGalMaxResults('');
			}

			if (obj.zimbraGalLdapPageSize) {
				setZimbraGalLdapPageSize(obj.zimbraGalLdapPageSize);
			} else {
				obj.zimbraGalLdapPageSize = '';
				setZimbraGalLdapPageSize('');
			}

			if (obj.zimbraGalAccountId) {
				setZimbraGalAccountId(obj.zimbraGalAccountId);
			} else {
				obj.zimbraGalAccountId = '';
				setZimbraGalAccountId('');
			}

			if (!obj.zimbraGalLdapURL) {
				obj.zimbraGalLdapURL = '';
			}

			if (!obj.zimbraGalLdapFilter) {
				obj.zimbraGalLdapFilter = '';
			}

			if (!obj.zimbraGalLdapSearchBase) {
				obj.zimbraGalLdapSearchBase = '';
			}

			if (!obj.zimbraGalLdapStartTlsEnabled) {
				obj.zimbraGalLdapStartTlsEnabled = FALSE;
				setZimbraGalLdapStartTlsEnabled({ init: false, current: false });
			} else if (obj.zimbraGalLdapStartTlsEnabled && obj.zimbraGalLdapStartTlsEnabled === TRUE) {
				setZimbraGalLdapStartTlsEnabled({ init: true, current: true });
			} else {
				setZimbraGalLdapStartTlsEnabled({ init: false, current: false });
			}

			if (!obj.zimbraGalLdapAuthMech) {
				obj.zimbraGalLdapAuthMech = 'none';
			} else {
				setZimbraGalLdapAuthMech(obj.zimbraGalLdapAuthMech !== 'none');
			}
			setDomainData(obj);
			setIsDirty(false);
		}
	}, [domainInformation]);

	useEffect(() => {
		if (zimbraGalAccountId !== '') {
			getGalAccount(zimbraGalAccountId);
			getDomainDataSource(zimbraGalAccountId);
		} else {
			setZimbraGalAccountName('');
			setMailServerName('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [zimbraGalAccountId]);

	useMemo(() => {
		if (zimbraDataSourcePollingInterval !== '') {
			const rangeType = zimbraDataSourcePollingInterval.charAt(
				zimbraDataSourcePollingInterval.length - 1
			);
			setPollingIntervalValue(
				zimbraDataSourcePollingInterval.substring(0, zimbraDataSourcePollingInterval.length - 1)
			);
			if (rangeType && rangeType !== '') {
				const range = rangeItems.find((item: any) => item.value === rangeType);
				setPollingIntervalType(range);
			}
		} else {
			setPollingIntervalType(rangeItems[0]);
			setPollingIntervalValue('');
		}
	}, [zimbraDataSourcePollingInterval, rangeItems]);

	const onCancel = (): void => {
		setZimbraGalMaxResults(domainData?.zimbraGalMaxResults);
		setZimbraGalLdapPageSize(domainData?.zimbraGalLdapPageSize);
		updateFreqValues(domainData);
		updateDomainInformation();
		if (zimbraGalAccountId !== '') {
			const rangeType = zimbraDataSourcePollingInterval.charAt(
				zimbraDataSourcePollingInterval.length - 1
			);
			if (rangeType && rangeType !== '') {
				const range = rangeItems.find((item: any) => item.value === rangeType);
				setPollingIntervalType(range);
			}
			setPollingIntervalValue(
				zimbraDataSourcePollingInterval.substring(0, zimbraDataSourcePollingInterval.length - 1)
			);
		}
		setIsDirty(false);
	};

	const onSave = (): void => {
		const requests: any[] = [];
		const body: any = {};
		let attributes: any[] = [];
		body.id = domainData.zimbraId;
		body._jsns = 'urn:zimbraAdmin';
		attributes.push({
			n: 'zimbraGalMaxResults',
			_content: zimbraGalMaxResults
		});
		attributes.push({
			n: 'zimbraGalLdapPageSize',
			_content: zimbraGalLdapPageSize
		});
		attributes.push({
			n: 'zimbraGalMode',
			_content: domainData?.zimbraGalMode
		});
		attributes.push({
			n: 'zimbraGalLdapURL',
			_content: domainData?.zimbraGalLdapURL
		});

		attributes.push({
			n: 'zimbraGalLdapStartTlsEnabled',
			_content: domainData?.zimbraGalLdapStartTlsEnabled
		});
		setZimbraGalLdapStartTlsEnabled({
			...zimbraGalLdapStartTlsEnabled,
			current: zimbraGalLdapStartTlsEnabled?.init
		});

		attributes.push({
			n: 'zimbraGalLdapFilter',
			_content: domainData?.zimbraGalLdapFilter
		});

		attributes.push({
			n: 'zimbraGalLdapSearchBase',
			_content: domainData?.zimbraGalLdapSearchBase
		});

		attributes.push({
			n: 'zimbraGalLdapBindDn',
			_content: domainData?.zimbraGalLdapBindDn
		});

		attributes.push({
			n: 'zimbraGalLdapBindPassword',
			_content: domainData?.zimbraGalLdapBindPassword
		});
		attributes.push({
			n: 'zimbraGalLdapAuthMech',
			_content: domainData?.zimbraGalLdapAuthMech
		});
		body.a = attributes;
		requests.push(modifyDomain(body));
		if (zimbraGalAccountId !== '') {
			const dataSourceBody: any = {};
			dataSourceBody.id = zimbraGalAccountId;
			dataSourceBody._jsns = 'urn:zimbraAdmin';
			attributes = [];
			attributes.push({
				n: 'zimbraGalType',
				_content: domainData?.zimbraGalMode
			});
			attributes.push({
				n: 'zimbraDataSourceGalPollingInterval',
				_content: zimbraDataSourceGalPollingInterval
			});
			dataSourceBody.dataSource = {
				id: dataSourceId,
				a: attributes
			};
			requests.push(modifyDataSource(dataSourceBody));
		}
		Promise.all(requests)
			.then((results) => Promise.all(results))
			.then((results) => {
				const domain: any = results[0]?.domain[0];
				if (domain) {
					updateDomainInformation();
					setDomain(domain);
				}
				setIsDirty(false);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});

		modifyAccountRequest(zimbraGalAccountId, {
			zimbraDataSourceGalPollingInterval
		}).catch((error) => {
			createSnackbar({
				key: 'error',
				type: 'error',
				label: error?.message
					? error?.message
					: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
				autoHideTimeout: 5000,
				hideButton: true,
				replace: true
			});
			updateFreqValues({});
		});
	};

	const onChangeRangeType = (v: any): any => {
		const range = rangeItems.find((item: any) => item.value === v);
		setPollingIntervalType(range);
	};

	const changeIntervalValue = (ev: any): any => {
		setPollingIntervalValue(ev.target.value);
	};

	const onZimbraGalMaxResultChange = (ev: any): any => {
		setZimbraGalMaxResults(ev.target.value);
	};

	const onZimbraGalLdapPageSizeChange = (ev: any): any => {
		setZimbraGalLdapPageSize(ev.target.value);
	};

	const onZimbraGalLdapUrlChange = (ev: any): any => {
		setDomainData({ ...domainData, zimbraGalLdapURL: ev?.target?.value });
		setIsDirty(domainData?.zimbraGalLdapURL !== ev?.target?.value);
	};

	const onZimbraGalLdapStartTlsEnabledChange = (ev: any): any => {
		setZimbraGalLdapStartTlsEnabled({
			...zimbraGalLdapStartTlsEnabled,
			current: !zimbraGalLdapStartTlsEnabled?.current
		});
		setDomainData({
			...domainData,
			zimbraGalLdapStartTlsEnabled: domainData?.zimbraGalLdapStartTlsEnabled === TRUE ? FALSE : TRUE
		});
	};

	useEffect(() => {
		if (
			domainData?.zimbraGalMaxResults !== zimbraGalMaxResults ||
			domainData?.zimbraGalLdapPageSize !== zimbraGalLdapPageSize
		) {
			setIsDirty(true);
		}

		if (zimbraGalLdapStartTlsEnabled?.current !== zimbraGalLdapStartTlsEnabled?.init) {
			setIsDirty(true);
		}

		if (zimbraGalAccountId !== '' && pollingIntervalValue !== '') {
			if (
				zimbraDataSourcePollingInterval !== `${pollingIntervalValue}${pollingIntervalType?.value}`
			) {
				setIsDirty(true);
			}
		}
	}, [
		zimbraGalMaxResults,
		domainData,
		zimbraDataSourcePollingInterval,
		pollingIntervalType,
		pollingIntervalValue,
		zimbraGalAccountId,
		zimbraGalLdapPageSize,
		zimbraGalLdapStartTlsEnabled
	]);

	const onFreqDigitsChange = useCallback(
		(ev: any) => {
			if (ev?.target?.value < 0 || ev?.target?.value > 9) {
				return;
			}
			setFreqValue({ digits: ev?.target?.value, time: freqValue.time });
			const measureUnitObject: any = measureUnitItems?.find(
				(item: any): any => item?.value === freqValue?.time
			);
			setMeasureUnitSelection(measureUnitObject);
			setZimbraDataSourceGalPollingInterval(`${ev?.target?.value}${freqValue.time}`);
			if (ev?.target?.value !== freqValue?.digits) {
				setIsDirty(true);
			}
		},
		[freqValue?.digits, freqValue.time, measureUnitItems]
	);

	const onFreqTimeUnitChange = useCallback(
		(ev: any) => {
			setFreqValue({ digits: freqValue.digits, time: ev });
			const measureUnitObject: any = measureUnitItems?.find((item: any): any => item?.value === ev);
			setMeasureUnitSelection(measureUnitObject);
			setZimbraDataSourceGalPollingInterval(`${freqValue.digits}${ev}`);
			if (ev !== freqValue?.time) {
				setIsDirty(true);
			}
		},
		[freqValue.digits, freqValue?.time, measureUnitItems]
	);

	const onZimbraGalLdapFilterChange = (ev: any): void => {
		setIsDirty(ev?.target?.value !== domainData?.zimbraGalLdapFilter);

		setDomainData({
			...domainData,
			zimbraGalLdapFilter: ev?.target?.value
		});
	};
	const onZimbraGalLdapSearchBaseChange = (ev: any): void => {
		setDomainData({
			...domainData,
			zimbraGalLdapSearchBase: ev?.target?.value
		});
		if (ev?.target?.value !== domainData?.zimbraGalLdapSearchBase) {
			setIsDirty(true);
		}
	};

	const onZimbraGalLdapBindDnChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setDomainData({
			...domainData,
			zimbraGalLdapBindDn: ev?.target?.value
		});
		if (ev?.target?.value !== domainData?.zimbraGalLdapBindDn) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	};
	const onZimbraGalLdapBindPasswordChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setDomainData({
			...domainData,
			zimbraGalLdapBindPassword: ev?.target?.value
		});
		if (ev?.target?.value !== domainData?.zimbraGalLdapBindPassword) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	};

	const onZimbraGalLdapAuthMechChange = (ev: any): void => {
		setIsDirty(true);
		setDomainData({
			...domainData,
			zimbraGalLdapAuthMech: domainData?.zimbraGalLdapAuthMech === 'none' ? 'simple' : 'none'
		});
	};

	useEffect(() => {
		if (domainData?.zimbraGalMode === '' || domainData?.zimbraGalMode === 'zimbra') {
			setZimbraGalMode('Internal');
		} else if (domainData?.zimbraGalMode === 'ldap') {
			setZimbraGalMode('External');
		} else {
			setZimbraGalMode('Both');
		}
	}, [domainData?.zimbraGalMode]);

	useEffect(() => {
		updateDomainInformation();
	}, [updateDomainInformation]);

	return (
		<Container padding={{ all: 'large' }} background="gray6" mainAlignment="flex-start">
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
								{t('label.global_address_list', 'Global Add`ress List')}
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
										onClick={onCancel}
									/>
								)}
							</Padding>
							{isDirty && (
								<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
							)}
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			{/* new layout based on internal external mode */}
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
			>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					width="100%"
					height="fit"
				>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'large' }}
					>
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ all: 'small' }}
							>
								<Text size="small" weight="bold">
									{t('account_details.general', 'General')}
								</Text>
							</Row>
							<ListRow>
								<Container orientation="horizontal" padding={{ all: 'small' }}>
									<Dropdown items={changeGalModeBtnItems} onOpen={onOpen} onClose={onClose}>
										<Button
											type="outlined"
											size="extralarge"
											label={t('label.change_to', 'CHANGE TO')}
											icon={open ? 'ChevronUp' : 'ChevronDown'}
										/>
									</Dropdown>

									<Padding left="small" width="100%">
										<Input
											label={t('label.gal_mode', 'GAL Mode')}
											value={zimbraGalMode}
											background="gray6"
											readOnly
										/>
									</Padding>
								</Container>
							</ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									type="number"
									label={t(
										'domain.max_result_return_gal_search',
										'Max results returned by GAL search'
									)}
									value={zimbraGalMaxResults}
									background="gray5"
									onChange={onZimbraGalMaxResultChange}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									type="number"
									label={t('domain.page_size', 'Page Size')}
									value={zimbraGalLdapPageSize}
									background="gray5"
									onChange={onZimbraGalLdapPageSizeChange}
								/>
							</Container>
						</Container>
					</Row>
				</Container>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					width="100%"
					height="fit"
				>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'large' }}
					>
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ all: 'small' }}
							>
								<Text size="small" weight="bold">
									{t('label.settings', 'Settings')}
								</Text>
							</Row>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.gal_update_frequencey_value', 'GAL Update Frequency Value')}
										value={freqValue?.digits}
										background="gray5"
										onChange={onFreqDigitsChange}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Select
										items={measureUnitItems}
										background="gray5"
										label={t('label.measure_unit', 'Measure Unit')}
										onChange={onFreqTimeUnitChange}
										showCheckbox={false}
										selection={measureUnitSelection}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Container>

				{domainData?.zimbraGalMode === 'ldap' && (
					<>
						<Container
							orientation="column"
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							width="100%"
							height="fit"
						>
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								padding={{ top: 'large' }}
							>
								<Container height="fit" crossAlignment="flex-start" background="gray6">
									<Row
										takeAvwidth="fill"
										mainAlignment="flex-start"
										width="100%"
										background="gray6"
										padding={{ all: 'small' }}
									>
										<Text size="small" weight="bold">
											{t('label.ldap_url', 'LDAP Url')}
										</Text>
									</Row>
									<Row
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="center"
										width="fill"
										wrap="nowrap"
									>
										<Container padding={{ all: 'small' }}>
											<Input
												label={t('label.external_server_address', 'External Server Address')}
												value={domainData?.zimbraGalLdapURL}
												background="gray5"
												onChange={onZimbraGalLdapUrlChange}
												CustomIcon={({ hasFocus }: any): any => (
													<Tooltip
														placement="top"
														overflow="break-word"
														maxWidth="40rem"
														label={t(
															'tooltip.external_server_exampl',
															'e.g. ldap://192.168.1.151:3268 or ldaps://ldap.internal.tld'
														)}
													>
														<Text>
															<Icon
																icon="InfoOutline"
																size="large"
																color={hasFocus ? 'primary' : 'text'}
															/>
														</Text>
													</Tooltip>
												)}
											/>
										</Container>

										<Container
											width="20%"
											orientation="horizontal"
											mainAlignment="flex-start"
											crossAlignment="center"
										>
											<Switch
												defaultChecked={zimbraGalLdapStartTlsEnabled?.current}
												onClick={onZimbraGalLdapStartTlsEnabledChange}
												label={t('label.user_ssl', 'Use SSL')}
												value={zimbraGalLdapStartTlsEnabled?.current}
											/>
										</Container>
									</Row>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.ldap_filter', 'LDAP Filter')}
											value={domainData?.zimbraGalLdapFilter}
											background="gray5"
											onChange={onZimbraGalLdapFilterChange}
											CustomIcon={({ hasFocus }: any): any => (
												<Tooltip
													placement="top"
													overflow="break-word"
													maxWidth="40rem"
													label={t(
														'tooltip.ldap_filter_example',
														'e.g. (&(|(cn=%s*)(sn=%s*)(gn=%s*)(mail=%s*)))'
													)}
												>
													<Text>
														<Icon
															icon="InfoOutline"
															size="large"
															color={hasFocus ? 'primary' : 'text'}
														/>
													</Text>
												</Tooltip>
											)}
										/>
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.ldap_search_base', 'LDAP Search Base')}
											value={domainData?.zimbraGalLdapSearchBase}
											background="gray5"
											onChange={onZimbraGalLdapSearchBaseChange}
											CustomIcon={({ hasFocus }: any): any => (
												<Tooltip
													placement="top"
													overflow="break-word"
													maxWidth="40rem"
													label={t('tooltip.ldap_search_base_example', 'e.g. dc=company,dc=local')}
												>
													<Text>
														<Icon
															icon="InfoOutline"
															size="large"
															color={hasFocus ? 'primary' : 'text'}
														/>
													</Text>
												</Tooltip>
											)}
										/>
									</Container>
								</Container>
							</Row>
						</Container>

						<Container height="fit" padding={{ all: 'small' }}>
							<Divider />
						</Container>

						<Container
							orientation="column"
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							width="100%"
							height="fit"
						>
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ all: 'small' }}
							>
								<Text size="small" weight="bold">
									{t('label.dn_settings', 'DN Settings')}
								</Text>
							</Row>
							<ListRow>
								<Container
									orientation="horizontal"
									mainAlignment="flex-start"
									crossAlignment="center"
									padding={{ all: 'small' }}
								>
									<Switch
										defaultChecked={zimbraGalLdapAuthMech}
										onClick={onZimbraGalLdapAuthMechChange}
										label={t(
											'label.use_dn_password_to_bind_external_server',
											'Use DN/Password to bind to external server'
										)}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.bind_dn', 'Bind DN')}
										value={domainData?.zimbraGalLdapBindDn}
										background="gray5"
										onChange={onZimbraGalLdapBindDnChange}
										CustomIcon={({ hasFocus }: any): any => (
											<Tooltip
												placement="top"
												overflow="break-word"
												maxWidth="40rem"
												label={t(
													'tooltip.ldap_bind_dn_example',
													'e.g. CN=galsync, OU=Service Accounts, OU=Servers, DC=Corp, DC=domain, DC=com'
												)}
											>
												<Text>
													<Icon
														icon="InfoOutline"
														size="large"
														color={hasFocus ? 'primary' : 'text'}
													/>
												</Text>
											</Tooltip>
										)}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.bind_password', 'Bind Password')}
										value={domainData?.zimbraGalLdapBindPassword}
										background="gray5"
										onChange={onZimbraGalLdapBindPasswordChange}
									/>
								</Container>
							</ListRow>
						</Container>
					</>
				)}
			</Container>
			<RouteLeavingGuard when={isDirty} onSave={onSave}>
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

export default DomainGalSettings;
