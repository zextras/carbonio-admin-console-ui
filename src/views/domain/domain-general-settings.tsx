/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Text,
	Select,
	Divider,
	Button,
	Padding,
	Icon,
	Shimmer
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { timeZoneList } from '../utility/utils';
import {
	ACTIVE,
	CLOSED,
	HTTP,
	HTTPS,
	LOCKED,
	MAINTENANCE,
	NOT_SET,
	SUSPENDED
} from '../../constants';

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const SettingRow: FC<{ children?: any; wrap?: any }> = ({ children, wrap }) => (
	<Row
		orientation="horizontal"
		mainAlignment="space-between"
		crossAlignment="flex-start"
		width="fill"
		wrap={wrap || 'nowrap'}
	>
		{children}
	</Row>
);

const DomainGeneralSettings: FC<{ domainInformation: any }> = ({ domainInformation }) => {
	const [t] = useTranslation();
	const timezones = useMemo(() => timeZoneList(t), [t]);
	const serviceProtocolItems: any = useMemo(
		() => [
			{
				value: NOT_SET,
				label: t('label.not_set', 'Not Set')
			},
			{
				label: t('label.https', 'https'),
				value: HTTPS
			},
			{
				label: t('label.http', 'http'),
				value: HTTP
			}
		],
		[t]
	);

	const domainStatusItems = useMemo(
		() => [
			{
				label: t('label.active', 'Active'),
				value: ACTIVE
			},
			{
				label: t('label.closed', 'Closed'),
				value: CLOSED
			},
			{
				label: t('label.locked', 'Locked'),
				value: LOCKED
			},
			{
				label: t('label.maintenance', 'Maintenance'),
				value: MAINTENANCE
			},
			{
				label: t('label.suspended', 'Suspended'),
				value: SUSPENDED
			}
		],
		[t]
	);
	const [domainData, setDomainData]: any = useState({
		zimbraPrefTimeZoneId: NOT_SET,
		zimbraPublicServiceProtocol: NOT_SET,
		zimbraDomainStatus: ACTIVE,
		zimbraPublicServicePort: '',
		zimbraDNSCheckHostname: '',
		zimbraNotes: '',
		zimbraHelpAdminURL: '',
		zimbraHelpDelegatedURL: ''
	});
	const [selectedTimeZone, setSelectedTimeZone]: any = useState(timezones[0]);
	const [selectedPublicServiceProtocol, setSelectedPublicServiceProtocol]: any = useState(
		serviceProtocolItems[0]
	);
	const [domainStatus, setDomainStatus] = useState<any>(domainStatusItems[0]);
	const [domainName, setDomainName] = useState<string>('');
	const [publicServiceHostName, setPublicServiceHostName] = useState<string>('');
	const [zimbraPublicServicePort, setZimbraPublicServicePort] = useState<string>('');
	const [zimbraDNSCheckHostname, setZimbraDNSCheckHostname] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [zimbraHelpAdminURL, setZimbraHelpAdminURL] = useState<string>('');
	const [zimbraHelpDelegatedURL, setZimbraHelpDelegatedURL] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
			domainInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			setDomainName(obj.zimbraDomainName);
			if (obj.zimbraPrefTimeZoneId) {
				setSelectedTimeZone(timezones.find((item) => item.value === obj.zimbraPrefTimeZoneId));
			} else {
				obj.zimbraPrefTimeZoneId = NOT_SET;
				setSelectedTimeZone(timezones[0]);
			}

			if (obj.zimbraPublicServiceProtocol) {
				setSelectedPublicServiceProtocol(
					serviceProtocolItems.find((item: any) => item.value === obj.zimbraPublicServiceProtocol)
				);
			} else {
				obj.zimbraPublicServiceProtocol = NOT_SET;
				setSelectedPublicServiceProtocol(serviceProtocolItems[0]);
			}

			if (obj.zimbraDomainStatus) {
				setDomainStatus(domainStatusItems.find((item) => item.value === obj.zimbraDomainStatus));
			} else {
				setDomainStatus(domainStatusItems[0]);
			}

			if (obj.zimbraPublicServicePort) {
				setZimbraPublicServicePort(obj.zimbraPublicServicePort);
			} else {
				obj.zimbraPublicServicePort = '';
				setZimbraPublicServicePort('');
			}

			if (obj.zimbraDNSCheckHostname) {
				setZimbraDNSCheckHostname(obj.zimbraDNSCheckHostname);
			} else {
				obj.zimbraDNSCheckHostname = '';
				setZimbraDNSCheckHostname('');
			}

			if (obj.zimbraNotes) {
				setZimbraNotes(obj.zimbraNotes);
			} else {
				obj.zimbraNotes = '';
				setZimbraNotes('');
			}

			if (obj.zimbraHelpAdminURL) {
				setZimbraHelpAdminURL(obj.zimbraHelpAdminURL);
			} else {
				obj.zimbraHelpAdminURL = '';
				setZimbraHelpAdminURL('');
			}

			if (obj.zimbraHelpDelegatedURL) {
				setZimbraHelpDelegatedURL(obj.zimbraHelpDelegatedURL);
			} else {
				obj.zimbraHelpDelegatedURL = '';
				setZimbraHelpDelegatedURL('');
			}
			setDomainData(obj);
			setIsDirty(false);
		}
	}, [domainInformation, timezones, serviceProtocolItems, domainStatusItems]);

	const getDomainCreateDate = (serverStr: string): any => {
		if (serverStr === null) return null;
		const d = new Date();
		const yyyy = parseInt(serverStr.substr(0, 4), 10);
		const MM = parseInt(serverStr.substr(4, 2), 10);
		const dd = parseInt(serverStr.substr(6, 2), 10);
		d.setFullYear(yyyy);
		d.setMonth(MM - 1);
		d.setMonth(MM - 1);
		d.setDate(dd);
		return d;
	};

	const getFormatedDate = (date: Date): any => {
		const dd = date.getDate();
		const mm = date.getMonth() + 1; // January is 0!

		const yyyy = date.getFullYear();
		return `${yyyy}-${mm}-${dd}`;
	};

	const onTimeZoneChange = (v: any): any => {
		const it = timezones.find((item: any) => item.value === v);
		setSelectedTimeZone(it);
	};

	const onPublicServiceProtocolChange = (v: any): any => {
		const it = serviceProtocolItems.find((item: any) => item.value === v);
		setSelectedPublicServiceProtocol(it);
	};

	const onDomainStatusChange = (v: any): any => {
		const it = domainStatusItems.find((item: any) => item.value === v);
		setDomainStatus(it);
	};

	useEffect(() => {
		if (domainData.zimbraPrefTimeZoneId.toString() !== selectedTimeZone?.value.toString()) {
			setIsDirty(true);
		}
		if (domainData.zimbraPublicServiceProtocol !== selectedPublicServiceProtocol.value) {
			setIsDirty(true);
		}

		if (domainData.zimbraDomainStatus !== domainStatus.value) {
			setIsDirty(true);
		}

		if (domainData.zimbraPublicServicePort !== zimbraPublicServicePort) {
			setIsDirty(true);
		}

		if (domainData.zimbraDNSCheckHostname !== zimbraDNSCheckHostname) {
			setIsDirty(true);
		}

		if (domainData.zimbraNotes !== zimbraNotes) {
			setIsDirty(true);
		}

		if (domainData.zimbraHelpAdminURL !== zimbraHelpAdminURL) {
			setIsDirty(true);
		}

		if (domainData.zimbraHelpDelegatedURL !== zimbraHelpDelegatedURL) {
			setIsDirty(true);
		}
	}, [
		domainData,
		selectedTimeZone,
		zimbraPublicServicePort,
		domainStatus,
		zimbraDNSCheckHostname,
		selectedPublicServiceProtocol,
		zimbraHelpAdminURL,
		zimbraHelpDelegatedURL,
		zimbraNotes
	]);

	const onCancel = (): void => {
		setLoading(true);
		setTimeout(() => setLoading(false), 10);
		setSelectedPublicServiceProtocol(
			serviceProtocolItems.find(
				(item: any) => item.value === domainData.zimbraPublicServiceProtocol
			)
		);
		setSelectedTimeZone(timezones.find((item) => item.value === domainData.zimbraPrefTimeZoneId));
		setDomainStatus(domainStatusItems.find((item) => item.value === domainData.zimbraDomainStatus));
		setZimbraPublicServicePort(domainData.zimbraPublicServicePort);
		setZimbraDNSCheckHostname(domainData.zimbraDNSCheckHostname);
		setZimbraNotes(domainData.zimbraNotes);
		setZimbraHelpAdminURL(domainData.zimbraHelpAdminURL);
		setZimbraHelpDelegatedURL(domainData.zimbraHelpDelegatedURL);
		setIsDirty(false);
	};

	const onSave = (): void => {
		console.log('SAVCEEEEE');
	};
	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray6"
			padding={{ all: 'large' }}
			style={{ overflow: 'auto', margin: '16px' }}
			width="96%"
		>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="fit"
				>
					<Row orientation="horizontal" width="100%">
						<Row
							padding={{ all: 'small' }}
							mainAlignment="flex-start"
							width="50%"
							crossAlignment="flex-start"
						>
							<Text size="medium" weight="bold" color="gray0">
								{t('domain.general_settings', 'General Settings')}
							</Text>
						</Row>
						<Row
							padding={{ all: 'small' }}
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
			{loading ? (
				<Container
					orientation="horizontal"
					mainAlignment="flex-start"
					width="fill"
					crossAlignment="flex-start"
				>
					<Shimmer.FormSection>
						<Shimmer.FormSubSection />
					</Shimmer.FormSection>
				</Container>
			) : (
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container height="fit" crossAlignment="flex-start" background="gray6" className="ff">
						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.name', 'Name')}
									value={domainName}
									background="gray6"
									disabled
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input label={t('label.certificate', 'Certificate')} value="" background="gray6" />
							</Container>
						</SettingRow>

						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.id', 'Id')}
									value={domainData.zimbraId}
									background="gray6"
									disabled
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.create_date', 'CreateDate')}
									value={
										!!domainData.zimbraCreateTimestamp && domainData.zimbraCreateTimestamp !== null
											? getFormatedDate(getDomainCreateDate(domainData.zimbraCreateTimestamp))
											: ''
									}
									background="gray6"
									disabled
								/>
							</Container>
						</SettingRow>

						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Select
									items={serviceProtocolItems}
									background="gray5"
									label={t('label.public_service_protocol', 'Public Service Protocol')}
									showCheckbox={false}
									onChange={onPublicServiceProtocolChange}
									selection={selectedPublicServiceProtocol}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.public_service_hostname', 'Public Service Host Name')}
									value={publicServiceHostName}
									background="gray5"
									onChange={(e: any): any => {
										setPublicServiceHostName(e.target.value);
									}}
								/>
							</Container>

							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.public_service_port', 'Public Service Port')}
									value={zimbraPublicServicePort}
									background="gray6"
									onChange={(e: any): any => {
										setZimbraPublicServicePort(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>

						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Select
									items={timezones}
									background="gray5"
									label={t('label.timezone', 'Time Zone')}
									showCheckbox={false}
									onChange={onTimeZoneChange}
									selection={selectedTimeZone}
								/>
							</Container>
						</SettingRow>
						<Container
							orientation="horizontal"
							width="98%"
							crossAlignment="center"
							mainAlignment="space-between"
							style={{ margin: '8px' }}
						>
							<Divider />
						</Container>

						<SettingRow>
							<Container
								orientation="horizontal"
								width="99%"
								crossAlignment="center"
								mainAlignment="space-between"
								background="#D3EBF8"
								padding={{
									all: 'large'
								}}
								style={{ margin: '8px' }}
							>
								<Row takeAvwidth="fill" mainAlignment="flex-start">
									<Padding horizontal="small">
										<CustomIcon icon="InfoOutline"></CustomIcon>
									</Padding>
								</Row>
								<Row
									takeAvwidth="fill"
									mainAlignment="flex-start"
									width="100%"
									padding={{
										all: 'small'
									}}
								>
									<Text overflow="break-word">
										{t(
											'label.mx_record_information_msg',
											'If your MX records point to a spam-relay or any other external non-zimbra server, enter the name of that server in "Inbound SMTP Host Name" field.'
										)}
									</Text>
								</Row>
							</Container>
						</SettingRow>

						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.inbound_smtp_host_name', 'Inbound SMTP Host Name')}
									value={zimbraDNSCheckHostname}
									background="gray5"
									onChange={(e: any): any => {
										setZimbraDNSCheckHostname(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>

						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.description', 'Description')}
									value={description}
									background="gray5"
									onChange={(e: any): any => {
										setDescription(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>

						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.default_class_of_service', 'Default Class of Service')}
									value=""
									background="gray5"
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Select
									items={domainStatusItems}
									background="gray5"
									label={t('label.status', 'Status')}
									defaultSelection={domainStatusItems[0]}
									showCheckbox={false}
									onChange={onDomainStatusChange}
									selection={domainStatus}
								/>
							</Container>
						</SettingRow>

						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.note', 'Note')}
									value={zimbraNotes}
									background="gray5"
									onChange={(e: any): any => {
										setZimbraNotes(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>

						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.admin_help_url', 'Admin Help URL')}
									value={zimbraHelpAdminURL}
									background="gray5"
									onChange={(e: any): any => {
										setZimbraHelpAdminURL(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>

						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.deligated_admin_help_url', 'Deligated Admin Help URL')}
									value={zimbraHelpDelegatedURL}
									background="gray5"
									onChange={(e: any): any => {
										setZimbraHelpDelegatedURL(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>
						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Button
									type="outlined"
									label={t('label.delete_domain', 'Delete Domain')}
									icon="Close"
									color="error"
									size="fill"
								/>
							</Container>
						</SettingRow>
					</Container>
				</Row>
			)}
		</Container>
	);
};
export default DomainGeneralSettings;
