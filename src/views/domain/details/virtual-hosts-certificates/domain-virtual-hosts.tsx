/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Input,
	Paragraph,
	Button,
	Table,
	SnackbarManagerContext,
	Icon
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import _ from 'lodash';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import {
	ZIMBRA_DOMAIN_NAME,
	ZIMBRA_ID,
	ZIMBRA_SSL_CERTIFICATE,
	ZIMBRA_SSL_PRIVATE_KEY,
	ZIMBRA_VIRTUAL_HOSTNAME
} from '../../../../constants';
import { modifyDomain } from '../../../../services/modify-domain-service';
import { useDomainStore } from '../../../../store/domain/store';
import logo from '../../../../assets/helmet_logo.svg';
import logoGardian from '../../../../assets/gardian.svg';
import { RouteLeavingGuard } from '../../../ui-extras/nav-guard';
import { AbsoluteContainer } from '../../../components/styled';
import LoadVerifyCertificateWizard from './load-verify-certificate-wizard';
import Textarea from '../../../components/textarea';
import DeleteCertificateModel from './delete-certificate-model';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';

const DomainVirtualHosts: FC = () => {
	const [t] = useTranslation();
	const [selectedRows, setSelectedRows] = useState<any>([]);
	const [addButtonDisabled, setAddButtonDisabled] = useState(true);
	const [removeVirtualBtnDisabled, setRemoveVirtualBtnDisabled] = useState(true);
	const [removeDomainCerti, setRemoveDomainCerti] = useState(true);
	const [removePrivateKey, setRemovePrivateKey] = useState(true);
	const [toggleDownloadDomainCertiBtn, setToggleDownloadDomainCertiBtn] = useState(true);
	const [toggleDownloadPrivateKeyCerti, setToggleDownloadPrivateKeyCerti] = useState(true);
	const [virtualHostValue, setVirutalHostValue] = useState('');
	const [items, setItems] = useState<any>([]);
	const [defaultItems, setDefaultItems] = useState<any>([]);
	const [domainName, setDomainName] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [zimbraId, setZimbraId] = useState('');
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const domainInformation: any = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);
	const [toggleLoadVerifyCertWizard, setToggleLoadVerifyCertWizard] = useState(false);
	const [domainCertificate, setDomainCertificate] = useState<any>(null);
	const [privateKey, setPrivateKey] = useState<any>(null);
	const [open, setOpen] = useState(false);
	const [alertToggle, setAlertToggle] = useState(false);
	const [closeCertiDetail, setCloseCertiDetail] = useState<any>();

	const closeHandler = (): any => {
		setOpen(false);
	};

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const zimbraIdArray = domainInformation.filter((domain: any) => domain.n === ZIMBRA_ID);
			if (zimbraIdArray && zimbraIdArray.length > 0) {
				setZimbraId(zimbraIdArray[0]._content);
			}
			const domainNameArray = domainInformation.filter(
				(domain: any) => domain.n === ZIMBRA_DOMAIN_NAME
			);
			if (domainNameArray && domainNameArray.length > 0) {
				setDomainName(domainNameArray[0]._content);
			}
			const domainVirtualHostArray = domainInformation.filter(
				(domain: any) => domain.n === ZIMBRA_VIRTUAL_HOSTNAME
			);
			if (domainVirtualHostArray && domainVirtualHostArray.length > 0) {
				const virtualHostItems = domainVirtualHostArray.map((domain: any, index: any) => ({
					id: (index + 1)?.toString(),
					columns: [domain._content]
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
		if (virtualHostValue) {
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
		const body: any = {};
		const attributes: any[] = [];
		body.id = zimbraId;
		body._jsns = 'urn:zimbraAdmin';
		items.forEach((item: any) => {
			attributes.push({
				n: ZIMBRA_VIRTUAL_HOSTNAME,
				_content: item.columns[0]
			});
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
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const domain: any = data?.domain[0];
				if (domain) {
					setDomain(domain);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const handleLoadAndVerifyCert = (): void => {
		setToggleLoadVerifyCertWizard(!toggleLoadVerifyCertWizard);
	};

	const getAllCertiDetailsAPICall = useCallback((): any => {
		const zimbraData =
			domainInformation &&
			domainInformation.filter((item: any) => item.n === ZIMBRA_DOMAIN_NAME)[0]?._content;
		soapFetch(`GetDomain`, {
			_jsns: 'urn:zimbraAdmin',
			attrs: 'zimbraSSLCertificate,zimbraSSLPrivateKey',
			domain: {
				by: 'name',
				_content: zimbraData
			}
		})
			.then((response: any) => {
				if (response?.domain[0]?.a) {
					// eslint-disable-next-line array-callback-return
					response?.domain[0]?.a?.map((item: any) => {
						if (item?.n === ZIMBRA_SSL_CERTIFICATE) {
							setDomainCertificate(item);
							setToggleDownloadDomainCertiBtn(false);
							setRemoveDomainCerti(false);
						} else if (item?.n === ZIMBRA_SSL_PRIVATE_KEY) {
							setPrivateKey(item);
							setToggleDownloadPrivateKeyCerti(false);
							setRemovePrivateKey(false);
						}
					});
				}
			})
			.catch((error: any) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, domainInformation, t]);

	const deleteHandler = (field: any): any => {
		const body: any = {};
		const attributes: any[] = [];
		body.id = zimbraId;
		body._jsns = 'urn:zimbraAdmin';
		if (field === ZIMBRA_SSL_CERTIFICATE) {
			attributes.push({
				n: ZIMBRA_SSL_CERTIFICATE,
				_content: ''
			});
		} else if (field === ZIMBRA_SSL_PRIVATE_KEY) {
			attributes.push({
				n: ZIMBRA_SSL_PRIVATE_KEY,
				_content: ''
			});
		}
		body.a = attributes;
		modifyDomain(body)
			.then(() => {
				if (field === ZIMBRA_SSL_CERTIFICATE) {
					setRemoveDomainCerti(true);
					setToggleDownloadDomainCertiBtn(true);
					setDomainCertificate(null);
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t(
							'domain.domain_certificate_removed',
							`The domain certificates has been removed`
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else if (field === ZIMBRA_SSL_PRIVATE_KEY) {
					setRemovePrivateKey(true);
					setToggleDownloadPrivateKeyCerti(true);
					setPrivateKey(null);
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t(
							'domain.private_key_certificate_removed',
							`The private key certificate has been removed`
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				setOpen(false);
				getAllCertiDetailsAPICall();
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const downloadTxtHandler = (field: any): any => {
		if (field === ZIMBRA_SSL_CERTIFICATE) {
			const element = document.createElement('a');
			const file = new Blob([domainCertificate?._content], {
				type: 'text/plain;charset=utf-8'
			});
			element.href = URL.createObjectURL(file);
			element.download = `certificate-${domainName}.txt`;
			document.body.appendChild(element);
			element.click();
		}
		if (field === ZIMBRA_SSL_PRIVATE_KEY) {
			const element = document.createElement('a');
			const file = new Blob([privateKey?._content], {
				type: 'text/plain;charset=utf-8'
			});
			element.href = URL.createObjectURL(file);
			element.download = `private-key-${domainName}.txt`;
			document.body.appendChild(element);
			element.click();
		}
	};

	useEffect(() => {
		getAllCertiDetailsAPICall();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toggleLoadVerifyCertWizard]);

	return (
		<Container padding={{ vertical: 'large' }} background="gray6" mainAlignment="flex-start">
			{toggleLoadVerifyCertWizard && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<LoadVerifyCertificateWizard
						setToggleWizard={setToggleLoadVerifyCertWizard}
						setAlertToggle={setAlertToggle}
					/>
				</AbsoluteContainer>
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
						certiDetails={closeCertiDetail}
					/>
				)}
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
					<Padding value="large">
						<Padding vertical="small">
							<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
								<Paragraph size="medium" color="secondary">
									<Trans
										i18nKey="label.virtual_host_msg"
										defaults="Virtual hosts allow the system to establish a default domain for a user login.<br />Any user that logs in while using a URL with one of the hostnames below will be assumed to be in this domain, domain1.local.<br />Please note, that removal of a virtual host takes effect only after mailbox server is restarted."
										components={{ break: <br /> }}
									/>
								</Paragraph>
							</Row>
						</Padding>
						<Padding vertical="large" width="100%">
							<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" wrap="nowrap">
								<Container width="85%">
									<Input
										label={t(
											'label.new_virtual_host_name',
											'Type a new Virtual Host Name and click on “Add +” to add it to the list'
										)}
										background="gray5"
										value={virtualHostValue}
										onChange={(e: any): any => {
											setVirutalHostValue(e.target.value);
											if (e.target.value) {
												setAddButtonDisabled(false);
											} else {
												setAddButtonDisabled(true);
											}
										}}
									/>
								</Container>

								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.add', 'Add')}
										color="primary"
										disabled={addButtonDisabled}
										height="44px"
										onClick={addVirtualHost}
									/>
								</Padding>
								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.remove', 'Remove')}
										color="error"
										height="44px"
										disabled={removeVirtualBtnDisabled}
										onClick={removeVirtualHost}
									/>
								</Padding>
							</Row>
						</Padding>
						<Table
							rows={items}
							headers={headers}
							selectedRows={selectedRows}
							onSelectionChange={(selected: any): any => {
								setSelectedRows(selected);
								if (selected && selected.length > 0) {
									setRemoveVirtualBtnDisabled(false);
								} else {
									setRemoveVirtualBtnDisabled(true);
								}
							}}
							HeaderFactory={CustomHeaderFactory}
							RowFactory={CustomRowFactory}
						/>
						{items.length === 0 && (
							<Container
								background="gray6"
								height="fit-content"
								mainAlignment="center"
								crossAlignment="center"
							>
								<Padding value="57px 0 0 0" width="100%">
									<Row takeAvwidth="fill" mainAlignment="center" width="100%">
										<img src={logo} alt="logo" />
									</Row>
								</Padding>
								<Padding vertical="extralarge" width="100%">
									<Row
										takeAvwidth="fill"
										mainAlignment="center"
										crossAlignment="center"
										width="100%"
									>
										<Text
											size="large"
											color="secondary"
											weight="regular"
											style={{ textAlign: 'center' }}
										>
											<Trans
												i18nKey="label.no_virtual_host_message"
												defaults="There aren’t virtual hosts here.<br />Click to ADD button to enabled new one."
												components={{ break: <br /> }}
											/>
										</Text>
									</Row>
								</Padding>
							</Container>
						)}
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
							crossAlignment="start"
						>
							<Row>
								<Text size="medium" color="gray0" weight="bold">
									{t('label.domain_certificate', 'Domain Certificate')}
								</Text>
							</Row>
							<Row>
								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.load_and_verify_certificate', 'LOAD AND VERIFY CERTIFICATE')}
										color="primary"
										height="44px"
										onClick={handleLoadAndVerifyCert}
									/>
								</Padding>
								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.download', 'DOWNLOAD')}
										color="primary"
										disabled={toggleDownloadDomainCertiBtn}
										height="44px"
										onClick={(): any => downloadTxtHandler(ZIMBRA_SSL_CERTIFICATE)}
									/>
								</Padding>
								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.remove', 'Remove')}
										color="error"
										height="44px"
										disabled={removeDomainCerti}
										onClick={(): any => {
											setOpen(true);
											setCloseCertiDetail(ZIMBRA_SSL_CERTIFICATE);
										}}
									/>
								</Padding>
							</Row>
						</Row>
					</Container>
					<Container
						padding={{ top: 'large', bottom: 'extralarge', horizontal: 'large' }}
						background="gray6"
						mainAlignment="start"
						crossAlignment="start"
					>
						{domainCertificate ? (
							<Container
								background="gray6"
								padding={{ all: 'large' }}
								width="100%"
								mainAlignment="start"
								crossAlignment="start"
								height="unset"
							>
								<Textarea
									value={domainCertificate._content}
									backgroundColor="gray5"
									rows={5}
									readOnly
								/>
							</Container>
						) : (
							<Container orientation="column" crossAlignment="center" mainAlignment="start">
								<Row>
									<img src={logoGardian} alt="logo" />
								</Row>
								<Row
									orientation="vertical"
									crossAlignment="center"
									style={{ textAlign: 'center' }}
									padding={{ top: 'extralarge' }}
									width="53%"
								>
									<Text weight="light" color="#828282" size="large" overflow="break-word">
										<Trans
											i18nKey="label.load_certificate_message"
											defaults="Load a certificates to see its details!<br />Click on the <strong>“LOAD AND VERIFY CERTIFICATE +”</strong> to start"
											components={{ break: <br />, bold: <strong /> }}
										/>
									</Text>
								</Row>
							</Container>
						)}
					</Container>
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
							crossAlignment="start"
						>
							<Row>
								<Text size="medium" color="gray0" weight="bold">
									{t('label.private_key_certificate', 'Private Key Certificate')}
								</Text>
							</Row>
							<Row>
								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.download', 'DOWNLOAD')}
										color="primary"
										disabled={toggleDownloadPrivateKeyCerti}
										height="44px"
										onClick={(): any => downloadTxtHandler(ZIMBRA_SSL_PRIVATE_KEY)}
									/>
								</Padding>
								<Padding left="large">
									<Button
										type="ghost"
										label={t('label.remove', 'Remove')}
										color="error"
										height="44px"
										disabled={removePrivateKey}
										onClick={(): any => {
											setOpen(true);
											setCloseCertiDetail(ZIMBRA_SSL_PRIVATE_KEY);
										}}
									/>
								</Padding>
							</Row>
						</Row>
					</Container>
					<Container
						padding={{ top: 'large', bottom: 'extralarge', horizontal: 'large' }}
						background="gray6"
						mainAlignment="start"
						crossAlignment="start"
					>
						{privateKey ? (
							<Container
								background="gray6"
								padding={{ all: 'large' }}
								width="100%"
								mainAlignment="start"
								crossAlignment="start"
								height="unset"
							>
								<Textarea value={privateKey?._content} backgroundColor="gray5" rows={5} readOnly />
							</Container>
						) : (
							<Container orientation="column" crossAlignment="center" mainAlignment="start">
								<Row>
									<img src={logoGardian} alt="logo" />
								</Row>
								<Row
									orientation="vertical"
									crossAlignment="center"
									style={{ textAlign: 'center' }}
									padding={{ top: 'extralarge' }}
									width="53%"
								>
									<Text weight="light" color="#828282" size="large" overflow="break-word">
										<Trans
											i18nKey="label.load_certificate_message"
											defaults="Load a certificates to see its details!<br />Click on the <strong>“LOAD AND VERIFY CERTIFICATE +”</strong> to start"
											components={{ break: <br />, bold: <strong /> }}
										/>
									</Text>
								</Row>
							</Container>
						)}
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
