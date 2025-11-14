/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Input,
	Button,
	Table,
	Icon,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { soapFetch, useUserSettings } from '@zextras/admin-ui-bootstrap';
import _ from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import DeleteCertificateModel from './delete-certificate-model';
import VirtualHostsRow from './VirtualHostsRow';
import LoadVerifyCertificateWizard from './load-verify-certificate-wizard';
import { objectType } from '../../../../../types';
import logo from '../../../../assets/helmet_logo.svg';
import {
	TRUE,
	ZIMBRA_ADMIN_URN,
	ZIMBRA_DOMAIN_NAME,
	ZIMBRA_ID,
	ZIMBRA_SSL_CERTIFICATE,
	ZIMBRA_SSL_PRIVATE_KEY,
	ZIMBRA_VIRTUAL_HOSTNAME
} from '../../../../constants';
import { flushCache } from '../../../../services/flush-cache-service';
import { modifyDomain } from '../../../../services/modify-domain-service';
import { useDomainStore } from '../../../../store/domain/store';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import ModalOverlay from '../../../components/ModalOverlay';
import ListRow from '../../../list/list-row';
import { RouteLeavingGuard } from '../../../ui-extras/nav-guard';
import { isValidVirtualHostname } from '../../../utility/utils';

const DomainVirtualHosts: FC = () => {
	const [t] = useTranslation();
	const { domainId }: { domainId: string } = useParams();
	const createSnackbar = useSnackbar();
	const domainInformation: any = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);
	const [selectedRows, setSelectedRows] = useState<any>([]);
	const [addButtonDisabled, setAddButtonDisabled] = useState(true);
	const [removeVirtualBtnDisabled, setRemoveVirtualBtnDisabled] = useState(true);
	const [toggleCertiBtn, setToggleCertiBtn] = useState(true);
	const [virtualHostValue, setVirutalHostValue] = useState('');
	const [items, setItems] = useState<any>([]);
	const [defaultItems, setDefaultItems] = useState<any>([]);
	const [domainName, setDomainName] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [zimbraId, setZimbraId] = useState('');
	const [toggleLoadVerifyCertWizard, setToggleLoadVerifyCertWizard] = useState(false);
	const [domainCertificate, setDomainCertificate] = useState<any>(null);
	const [open, setOpen] = useState(false);
	const [alertToggle, setAlertToggle] = useState(false);
	const [domainCertiDetails, setDomainCertiDetails] = useState<objectType>();
	const setIsCertificateAvailbale = useDomainStore((state) => state.setIsCertificateAvailbale);
	const [errVirtualHostName, setErrVirtualHostName] = useState(true);
	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	const userSetting = useUserSettings();
	useEffect(() => {
		if (userSetting?.attrs) {
			const account = userSetting?.attrs?.zimbraIsAdminAccount;
			if (account && account === TRUE) {
				setIsGlobalAdmin(true);
			}
		}
	}, [userSetting?.attrs]);

	const closeHandler = (): void => {
		setOpen(false);
	};

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const zimbraIdArray = domainInformation.filter(
				(domainData: any) => domainData.n === ZIMBRA_ID
			);
			if (zimbraIdArray && zimbraIdArray.length > 0) {
				setZimbraId(zimbraIdArray[0]._content);
			}
			const domainNameArray = domainInformation.filter(
				(domainData: any) => domainData.n === ZIMBRA_DOMAIN_NAME
			);
			if (domainNameArray && domainNameArray.length > 0) {
				setDomainName(domainNameArray[0]._content);
			}
			const domainVirtualHostArray = domainInformation.filter(
				(domainData: any) => domainData.n === ZIMBRA_VIRTUAL_HOSTNAME
			);
			if (domainVirtualHostArray && domainVirtualHostArray.length > 0) {
				const virtualHostItems = domainVirtualHostArray.map((domainData: any, index: any) => ({
					id: (index + 1)?.toString(),
					columns: [
						<Text key={index + 1} color="gray0" weight="regular">
							{domainData._content}
						</Text>
					]
				}));
				setItems(virtualHostItems);
				setDefaultItems(virtualHostItems);
			} else {
				setItems([]);
				setDefaultItems([]);
			}
		}
	}, [domainInformation]);

	useEffect(() => {
		if (!_.isEqual(defaultItems, items)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [defaultItems, items]);

	const headers = useMemo(
		() => [
			{
				id: 'hosts',
				label: t('label.virtual_host_name', 'Virtual Host Name'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const addVirtualHost = useCallback((): void => {
		if (virtualHostValue && isValidVirtualHostname(virtualHostValue)) {
			const lastId = items.length > 0 ? items[items.length - 1]?.id : '0';
			const newId = parseInt(lastId, 10) + 1;
			const item = {
				id: newId?.toString(),
				columns: [virtualHostValue],
				clickable: true
			};
			setItems([...items, item]);
			setAddButtonDisabled(true);
			setVirutalHostValue('');
		}
	}, [virtualHostValue, items]);

	const removeVirtualHost = useCallback((): void => {
		if (selectedRows && selectedRows.length > 0 && items.length > 0) {
			const filterItems = items.filter((item: any) => !selectedRows.includes(item.id));
			setItems(filterItems);
			setRemoveVirtualBtnDisabled(true);
			setSelectedRows([]);
		}
	}, [selectedRows, items]);

	const onCancel = (): void => {
		setItems(defaultItems);
	};

	const onSave = (): void => {
		const body: {
			id?: string;
			_jsns?: string;
			a?: { n: string; _content?: string }[];
		} = {};
		const attributes: { n: string; _content?: string }[] = [];
		body.id = zimbraId;
		// eslint-disable-next-line sonarjs/no-duplicate-string
		body._jsns = ZIMBRA_ADMIN_URN;
		items.forEach((item: any) => {
			if (item.columns[0]?.props?.children) {
				attributes.push({
					n: ZIMBRA_VIRTUAL_HOSTNAME,
					_content: item.columns[0]?.props?.children
				});
			} else {
				attributes.push({
					n: ZIMBRA_VIRTUAL_HOSTNAME,
					_content: item.columns[0]
				});
			}
		});
		if (attributes?.length === 0) {
			attributes.push({
				n: ZIMBRA_VIRTUAL_HOSTNAME,
				_content: ''
			});
		}
		body.a = attributes;
		modifyDomain(body)
			.then((data) => {
				if (data?.warning && Array.isArray(data.warning) && data.warning.length > 0) {
					data.warning.forEach((warning: any) => {
						createSnackbar({
							key: `warning-${warning.type ?? Date.now()}`,
							severity: 'warning',
							label:
								warning.message ??
								t('label.warning_message', 'A warning occurred during the operation'),
							autoHideTimeout: 5000,
							hideButton: true,
							replace: false
						});
					});
				}

				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: false
				});
				if (isGlobalAdmin) {
					flushCache('domain', 'id', zimbraId);
				}
				const domainData: any = data?.domain?.[0];
				if (domainData) {
					setDomain(domainData);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: // eslint-disable-next-line sonarjs/no-duplicate-string
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const handleLoadAndVerifyCert = (): void => {
		setToggleLoadVerifyCertWizard(!toggleLoadVerifyCertWizard);
	};

	const getAllCertiDetailsAPICall = useCallback((): void => {
		soapFetch('GetDomainCert', {
			_jsns: ZIMBRA_ADMIN_URN,
			domain: domainId
		})
			.then((res: any) => {
				const data = _.mapValues(res?.cert[0], (value) => value[0]._content);
				setDomainCertiDetails(data);
				setToggleCertiBtn(false);
				setIsCertificateAvailbale(true);
			})
			// TODO: On no cert found server always returns error so used empty catch for now
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			.catch((error) => {
				if (error) {
					setIsCertificateAvailbale(false);
				}

			});
		const zimbraData =
			domainInformation &&
			domainInformation.filter((item: objectType) => item.n === ZIMBRA_DOMAIN_NAME)[0]?._content;
		soapFetch(`GetDomain`, {
			_jsns: ZIMBRA_ADMIN_URN,
			attrs: 'zimbraSSLCertificate,zimbraSSLPrivateKey',
			domain: {
				by: 'name',
				_content: zimbraData
			}
		})
			.then((response: any) => {
				if (response?.domain[0]?.a) {
					const certificates = _.reduce(
						response?.domain[0]?.a,
						(result, item) => ({ ...result, [item.n]: item._content }),
						{}
					);
					setDomainCertificate(certificates);
				} else {
					setDomainCertificate(null);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, domainId, domainInformation, setIsCertificateAvailbale, t]);

	const deleteHandler = (): void => {
		const body: {
			id?: string;
			_jsns?: string;
			a?: { n: string; _content?: string }[];
		} = {};
		const attributes: { n: string; _content?: string }[] = [];
		body.id = zimbraId;
		body._jsns = ZIMBRA_ADMIN_URN;
		attributes.push({
			n: ZIMBRA_SSL_CERTIFICATE,
			_content: ''
		});
		attributes.push({
			n: ZIMBRA_SSL_PRIVATE_KEY,
			_content: ''
		});
		body.a = attributes;
		modifyDomain(body)
			.then(() => {
				setDomainCertificate(null);
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('domain.certificate_removed', `The certificates has been removed`),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				if (isGlobalAdmin) {
					flushCache('domain', 'id', zimbraId);
				}
				setOpen(false);
				getAllCertiDetailsAPICall();
				setDomainCertiDetails({});
				setToggleCertiBtn(true);
				setIsCertificateAvailbale(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const downloadTxtHandler = (): void => {
		const elementCerti = document.createElement('a');
		const fileCerti = new Blob([domainCertificate?.zimbraSSLCertificate], {
			type: 'application/x-pem-file'
		});
		elementCerti.href = URL.createObjectURL(fileCerti);
		elementCerti.download = `certificate-${domainName}.pem`;
		document.body.appendChild(elementCerti);
		elementCerti.click();

		const elementPrivateKey = document.createElement('a');
		const fileKey = new Blob([domainCertificate?.zimbraSSLPrivateKey], {
			type: 'application/x-pem-file'
		});
		elementPrivateKey.href = URL.createObjectURL(fileKey);
		elementPrivateKey.download = `private-key-${domainName}.pem`;
		document.body.appendChild(elementPrivateKey);
		elementPrivateKey.click();
	};

	useEffect(() => {
		getAllCertiDetailsAPICall();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [alertToggle]);

	return (
		<Container padding={{ vertical: 'large' }} background="gray6" mainAlignment="flex-start">
			{toggleLoadVerifyCertWizard && (
				<ModalOverlay open={toggleLoadVerifyCertWizard}>
					<LoadVerifyCertificateWizard
						setToggleWizard={setToggleLoadVerifyCertWizard}
						setAlertToggle={setAlertToggle}
					/>
				</ModalOverlay>
			)}
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				{open && (
					<DeleteCertificateModel
						open={open}
						closeHandler={closeHandler}
						deleteHandler={deleteHandler}
					/>
				)}
				<Row mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="56px">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.virtual_hosts', 'Virtual Hosts')}
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
					<Divider color="gray2" />
				</Row>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					style={{ overflow: 'auto' }}
					width="100%"
					height="calc(100vh - 150px)"
				>
					<Padding value="large" width='100%'>
						{/*
						// AC-886 Hide sentense until the login page is not able to manage the virtual host.
						<Padding vertical="small">
							<Row mainAlignment="flex-start" width="100%">
								<Paragraph size="medium" color="secondary">
									<Trans
										i18nKey="label.virtual_host_msg"
										defaults="Virtual hosts allow the system to establish a default domain for a user login.<br />Any user that logs in while using a URL with one of the hostnames below will be assumed to be in this domain, domain1.local.<br />Please note, that removal of a virtual host takes effect only after mail server is restarted."
										components={{ break: <br /> }}
									/>
								</Paragraph>
							</Row>
						</Padding> */}
						<VirtualHostsRow
							items={items}
							setItems={setItems}
						/>
					</Padding>
					{alertToggle && (
						<Container
							height="fit-content"
							mainAlignment="space-between"
							crossAlignment="center"
							padding={{ horizontal: 'large' }}
						>
							<Row
								padding={{ all: 'large' }}
								width="100%"
								mainAlignment="space-between"
								style={{
									borderRadius: '2px 2px 0px 0px',
									backgroundColor: '#BDE7FE'
								}}
							>
								<Row>
									<Icon icon="AlertTriangleOutline" size="large" color="info" />
									<Padding left="large">
										<Text>
											{t(
												'label.certificate_alert_helperText',
												'The certificate will be available once the proxy is restarted'
											)}
										</Text>
									</Padding>
								</Row>
								<Icon
									icon="CloseOutline"
									size="large"
									style={{ cursor: 'pointer' }}
									onClick={(): any => setAlertToggle(false)}
								/>
							</Row>
						</Container>
					)}
					<Row width="100%" padding={{ horizontal: 'large' }}>
						<Divider color="gray2" />
					</Row>
					<Container
						padding={{ all: 'large' }}
						height="fit"
						crossAlignment="flex-start"
						background="gray6"
					>
						<Row
							padding={{ top: 'large' }}
							width="100%"
							mainAlignment="space-between"
							crossAlignment="flex-start"
						>
							<Row>
								<Text size="medium" color="gray0" weight="bold">
									{t('label.certificate', 'Certificate')}
								</Text>
							</Row>
							<Row>
								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.verify_certificate', 'VERIFY CERTIFICATE')}
										color="primary"
										onClick={handleLoadAndVerifyCert}
									/>
								</Padding>
								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.download_uppercase', 'DOWNLOAD')}
										color="primary"
										disabled={toggleCertiBtn}
										onClick={downloadTxtHandler}
									/>
								</Padding>
								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.remove', 'Remove')}
										color="error"
										disabled={toggleCertiBtn}
										onClick={(): void => {
											setOpen(true);
										}}
									/>
								</Padding>
							</Row>
						</Row>
						<ListRow padding={{ top: 'extralarge' }}>
							<Container padding={{ horizontal: 'small', top: 'small' }}>
								<Input
									label={t(
										'label.subject_name_cname',
										'Subject Name (Canonical Name record - CNAME)'
									)}
									backgroundColor="gray6"
									value={domainCertiDetails?.subject || ''}
								/>
							</Container>
							<Container padding={{ horizontal: 'small', top: 'small' }}>
								<Input
									label={t(
										'label.subject_name_fqdn',
										'Subject Alt Name (Fully Qualified Domain Name - FQDN)'
									)}
									backgroundColor="gray6"
									value={domainCertiDetails?.SubjectAltName || ''}
								/>
							</Container>
						</ListRow>
						<ListRow padding={{ top: 'large' }}>
							<Container padding={{ horizontal: 'small' }}>
								<Input
									backgroundColor="gray6"
									label={t('label.issuer', 'Issuer')}
									value={domainCertiDetails?.issuer || ''}
								/>
							</Container>
						</ListRow>
						<ListRow padding={{ top: 'large' }}>
							<Container padding={{ horizontal: 'small' }}>
								<Input
									label={t('label.valid_not_before', 'Valid from (not before)')}
									backgroundColor="gray6"
									value={domainCertiDetails?.notBefore || ''}
								/>
							</Container>
							<Container padding={{ horizontal: 'small' }}>
								<Input
									label={t('label.valid_not_after', 'Valid until (not after)')}
									backgroundColor="gray6"
									value={domainCertiDetails?.notAfter || ''}
								/>
							</Container>
						</ListRow>
					</Container>
				</Container>
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

export default DomainVirtualHosts;
