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
	Icon,
	Input,
	Padding,
	Row,
	Switch,
	Table,
	Text,
	Tooltip,
	useSnackbar} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import logo from '../../../assets/ninja_robo.svg';
import {
	CONTENT_TYPE_TEXT_PLAIN,
	SAML_METADATA_JSON_FILE,
	ZIMBRA_PUBLIC_SERVICE_HOSTNAME,
	ZIMBRA_PUBLIC_SERVICE_PROTOCOL
} from '../../../constants';
import { deleteSamlAttributes } from '../../../services/delete-saml-attributes';
import { generateSignedCertificate } from '../../../services/generate-signed-certificate';
import { getSamlConfig } from '../../../services/get-saml-configurations';
import { importSamlConfig } from '../../../services/import-saml-configurations';
import { updateSamlAttributes } from '../../../services/update-saml-attributes';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import { copyTextToClipboard, download, getServiceUrl, getSPEntityId } from '../../utility/utils';

type SamlAttribute = {
	attribute: string;
	value: unknown;
};

const CustomIcon = styled(Icon)`
	width: 1.25rem;
	height: 1.25rem;
`;

const DomainSaml: FC = () => {
	const [t] = useTranslation();
	const [samlAttributes, setSamlAttributes] = useState<Array<SamlAttribute>>([]);
	const [samlTableRows, setSamlTableRows] = useState<any[]>([]);
	const [isAllowUnsecure, setIsAllowUnsecure] = useState<boolean>(false);
	const domainName = useDomainStore((state) => state.domain?.name) || '';
	const createSnackbar = useSnackbar();
	const [samlAttrKey, setSamlAttrKey] = useState<string>('');
	const [samlAttrValue, setSamlAttrValue] = useState<any>('');
	const [metadataUrl, setMetadataUrl] = useState<string>('');
	const [entityId, setEntityId] = useState<string>('');
	const [serverUrl, setServiceUrl] = useState<string>('');
	const [showBannerText, setShowBannerText] = useState<boolean>(true);
	const domainInformation: any = useDomainStore((state) => state.domain?.a);

	const headers: any = useMemo(
		() => [
			{
				id: 'attribute',
				label: t('label.attribute', 'Attribute'),
				width: '40%',
				bold: true
			},
			{
				id: 'value',
				label: t('label.value', 'Value'),
				width: '55%',
				bold: true
			}
		],
		[t]
	);

	const setSAMLAttributes = useCallback((samlData: any): void => {
		const samlAttr: Array<SamlAttribute> = [];
		Object.entries(samlData).forEach((entry) => {
			const [key, value] = entry;
			samlAttr.push({
				attribute: key,
				value
			});
		});
		setSamlAttributes(samlAttr);
	}, []);

	const openSamlValue = useCallback((item: SamlAttribute): void => {
		setSamlAttrKey(item?.attribute);
		setSamlAttrValue(item?.value);
	}, []);

	const showError = useCallback(
		(error: any): void => {
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
		},
		[t, createSnackbar]
	);

	const exportMetadata = (domain: string): void => {
		getSamlConfig(domain)
			.then((data) => {
				if (!data?.error) {
					download(JSON.stringify(data), SAML_METADATA_JSON_FILE, CONTENT_TYPE_TEXT_PLAIN);
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'label.you_have_exported_the_configuration',
							'You have exported the configuration'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					const err = { message: data?.error };
					showError(err);
				}
			})
			.catch((error) => {
				showError(error);
			});
	};

	const generateSAMLTable = useCallback(
		(samlAttr: Array<SamlAttribute>): void => {
			if (samlAttr) {
				const samlRows: Array<any> = [];
				samlAttr.forEach((item: SamlAttribute, index) => {
					samlRows.push({
						id: index.toString(),
						columns: [
							<Container
								crossAlignment="flex-start"
								mainAlignment="center"
								key={index}
								onClick={(): void => {
									openSamlValue(item);
								}}
							>
								<Text size="small" weight="regular" color="gray0">
									{item?.attribute}
								</Text>
							</Container>,
							<Container
								crossAlignment="flex-start"
								mainAlignment="center"
								key={index}
								onClick={(): void => {
									openSamlValue(item);
								}}
							>
								<Text size="small" weight="light" color="gray0">
									{item?.value as unknown as React.ReactNode}
								</Text>
							</Container>
						]
					});
				});
				setSamlTableRows(samlRows);
			}
		},
		[openSamlValue]
	);

	const getSAMLConfigurations = useCallback(
		(domain: string): void => {
			getSamlConfig(domain, true)
				.then((data) => {
					if (!data?.error) {
						setSAMLAttributes(data);
					} else {
						const err = { message: data?.error };
						showError(err);
					}
				})
				.catch((error) => {
					showError(error);
				});
		},
		[setSAMLAttributes, showError]
	);

	const importSAMLConfigurations = useCallback(
		(domain: string, url: string, allowUnsecure: boolean): void => {
			importSamlConfig(domain, url, allowUnsecure)
				.then((data) => {
					if (!data?.error) {
						setSAMLAttributes(data);
						createSnackbar({
							key: 'success',
							severity: 'success',
							label: t(
								'label.you_have_imported_the_configuration',
								'You have imported the configuration'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					} else {
						const err = { message: data?.error };
						showError(err);
					}
				})
				.catch((error) => {
					showError(error);
				});
		},
		[createSnackbar, setSAMLAttributes, showError, t]
	);

	const generateSPCertificates = useCallback(
		(domain: string): void => {
			generateSignedCertificate(domain)
				.then((data) => {
					if (!data?.error) {
						setSAMLAttributes(data);
						createSnackbar({
							key: 'success',
							severity: 'success',
							label: t(
								'label.you_have_generated_the_sp_certificate',
								'You have generated the SP Certificate'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					} else {
						const err = { message: data?.error };
						showError(err);
					}
				})
				.catch((error) => {
					showError(error);
				});
		},
		[createSnackbar, setSAMLAttributes, showError, t]
	);

	const addOrUpdateSAMLAttributes = useCallback(
		(domain: string, key: string, value: unknown, isUpdate: boolean): void => {
			const body: any = { [key]: value };
			updateSamlAttributes(domain, body)
				.then((data) => {
					if (!data?.error) {
						setSAMLAttributes(data);
						setSamlAttrKey('');
						setSamlAttrValue('');
						const attributeName = key;
						if (isUpdate) {
							createSnackbar({
								key: 'success',
								severity: 'success',
								label: t('label.you_have_updated_attribute', {
									attributeName,
									defaultValue: 'You have updated the {{ attributeName }} attribute'
								}),
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
						} else {
							createSnackbar({
								key: 'success',
								severity: 'success',
								label: t('label.you_have_added_attribute', {
									attributeName,
									defaultValue: 'You have added the {{ attributeName }} attribute'
								}),
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
						}
					} else {
						const err = { message: data?.error };
						showError(err);
					}
				})
				.catch((error) => {
					showError(error);
				});
		},
		[createSnackbar, setSAMLAttributes, showError, t]
	);

	const removeSAMLAttributes = useCallback(
		(domain: string, key: string): void => {
			deleteSamlAttributes(domain, key)
				.then((data) => {
					if (!data?.error) {
						setSAMLAttributes(data);
						setSamlAttrKey('');
						setSamlAttrValue('');
						const attributeName = key;
						createSnackbar({
							key: 'success',
							severity: 'success',
							label: t('label.you_have_removed_attribute', {
								attributeName,
								defaultValue: 'You have removed the {{ attributeName }} attribute'
							}),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					} else {
						const err = { message: data?.error };
						showError(err);
					}
				})
				.catch((error) => {
					showError(error);
				});
		},
		[createSnackbar, setSAMLAttributes, showError, t]
	);

	const deleteSAMLConfigurations = useCallback(
		(domain: string): void => {
			deleteSamlAttributes(domain)
				.then((data) => {
					if (!data?.error) {
						setSAMLAttributes(data);
						createSnackbar({
							key: 'success',
							severity: 'success',
							label: t(
								'label.you_have_deleted_the_configuration',
								'You have deleted the configuration'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					} else {
						const err = { message: data?.error };
						showError(err);
					}
				})
				.catch((error) => {
					showError(error);
				});
		},
		[createSnackbar, setSAMLAttributes, showError, t]
	);

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0 && domainName) {
			const publicHostNameArr = domainInformation.filter(
				(domain: any) => domain.n === ZIMBRA_PUBLIC_SERVICE_HOSTNAME
			);
			const publicProtocolArr = domainInformation.filter(
				(domain: any) => domain.n === ZIMBRA_PUBLIC_SERVICE_PROTOCOL
			);
			setEntityId(
				getSPEntityId(publicProtocolArr[0]?._content, publicHostNameArr[0]?._content, domainName)
			);
			setServiceUrl(getServiceUrl(publicProtocolArr[0]?._content, publicHostNameArr[0]?._content));
		}
	}, [domainInformation, domainName]);

	useEffect(() => {
		if (domainName) {
			getSAMLConfigurations(domainName);
		}
	}, [domainName, getSAMLConfigurations]);

	useEffect(() => {
		if (samlAttributes) {
			generateSAMLTable(samlAttributes);
		}
	}, [generateSAMLTable, samlAttributes]);

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
								width="100%"
								crossAlignment="flex-start"
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.saml', 'SAML')} @{domainName}
								</Text>
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
					height="calc(100vh - 9.375rem)"
				>
					<Row mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							{showBannerText && (
								<Container
									orientation="horizontal"
									crossAlignment="center"
									width="97%"
									mainAlignment="flex-start"
									background="#D3EBF8"
									padding={{
										top: 'medium',
										bottom: 'medium'
									}}
									style={{
										borderRadius: '0.125rem 0.125rem 0 0',
										margin: '1rem',
										borderBottom: '0.063rem solid #2196D3'
									}}
								>
									<Row width="5%" mainAlignment="flex-start">
										<Padding horizontal="small">
											<CustomIcon icon="CheckmarkCircle2Outline" color="#2196D3"></CustomIcon>
										</Padding>
									</Row>
									<Row
										mainAlignment="flex-start"
										width="65%"
										padding={{
											top: 'small',
											bottom: 'small'
										}}
									>
										<Text overflow="break-word">
											{t(
												'cos.idp_configuration_saml_notes',
												'Go to your IDP to configure your SAML and copy the EntityID and ServiceURL values'
											)}
										</Text>
									</Row>
									<Row width="12%" mainAlignment="flex-start">
										<Tooltip placement="top" label={t('label.entity_id_copied', 'EntityID copied')}>
											<Button
												type="outlined"
												label={t('label.entity_id', 'Entity ID')}
												color="#2196D3"
												size="medium"
												backgroundColor="#D3EBF8"
												icon="CopyOutline"
												iconPlacement="left"
												disabled={!entityId}
												onClick={() => copyTextToClipboard(entityId)}
											/>
										</Tooltip>
									</Row>
									<Row width="16%" mainAlignment="flex-start">
										<Tooltip
											placement="top"
											label={t('label.service_url_copied', 'ServiceURL copied')}
										>
											<Button
												type="outlined"
												label={t('label.service_url', 'ServiceURL')}
												color="#2196D3"
												size="medium"
												backgroundColor="#D3EBF8"
												icon="CopyOutline"
												iconPlacement="left"
												disabled={!serverUrl}
												onClick={() => copyTextToClipboard(serverUrl)}
											/>
										</Tooltip>
									</Row>
									<Row width="4%" mainAlignment="flex-start">
										<Button
											type="ghost"
											color={'text'}
											icon="CloseOutline"
											size="large"
											onClick={() => setShowBannerText(false)}
										/>
									</Row>
								</Container>
							)}
							<Row
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ left: 'large', top: 'medium' }}
							>
								<Text size="medium" weight="bold">
									{t('label.configuration_lbl', 'Configuration')}
								</Text>
							</Row>
							<Row
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ all: 'large' }}
							>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									orientation="vertical"
									width="16%"
								>
									<Switch
										value={isAllowUnsecure}
										label={t('label.allow_unsecure', 'Allow Unsecure')}
										iconColor="primary"
										onClick={() => setIsAllowUnsecure(!isAllowUnsecure)}
									/>
								</Container>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									orientation="vertical"
									width="72%"
								>
									<Input
										label={t(
											'label.import_saml_metadata_from_idp',
											'Import the SAML Metadata from the IDP'
										)}
										backgroundColor="gray5"
										value={metadataUrl}
										onChange={(e: any): any => {
											setMetadataUrl(e.target.value);
										}}
									/>
								</Container>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-end"
									orientation="vertical"
									width="12%"
								>
									<Button
										type="outlined"
										label={t('label.import', 'IMPORT')}
										color="primary"
										size="extralarge"
										onClick={() =>
											importSAMLConfigurations(domainName, metadataUrl, isAllowUnsecure)
										}
										disabled={!metadataUrl}
									/>
								</Container>
							</Row>
							<Row
								width="100%"
								mainAlignment="space-between"
								crossAlignment="center"
								padding={{ all: 'large' }}
							>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="outlined"
										label={t('label.generate_sp_certificate', 'GENERATE SP CERTIFICATE')}
										color="primary"
										size="large"
										width="fill"
										onClick={() => generateSPCertificates(domainName)}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="outlined"
										label={t('label.export_configuration', 'EXPORT CONFIGURATION')}
										color="primary"
										size="large"
										width="fill"
										onClick={() => exportMetadata(domainName)}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="ghost"
										label={t('label.delete_configuration', 'DELETE CONFIGURATION')}
										color="primary"
										size="large"
										width="fill"
										onClick={() => deleteSAMLConfigurations(domainName)}
									/>
								</Container>
							</Row>
							<Row
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ all: 'large' }}
							>
								<Table
									rows={samlTableRows}
									headers={headers}
									showCheckbox={false}
									multiSelect={false}
									RowFactory={CustomRowFactory}
									HeaderFactory={CustomHeaderFactory}
									style={samlTableRows?.length > 0 ? { height: '15rem', overflow: 'auto' } : {}}
								/>
							</Row>
							{samlTableRows.length === 0 && (
								<Container
									crossAlignment="center"
									mainAlignment="flex-start"
									style={{ marginTop: '1rem' }}
								>
									<Text overflow="break-word" weight="regular" size="large">
										<img src={logo} alt="logo" />
									</Text>
									<Padding all="medium" width="25.875rem">
										<Text
											color="gray1"
											overflow="break-word"
											weight="regular"
											size="large"
											style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
										>
											{t(
												'label.saml_metadata_attribute_notes',
												'Please import some SAML Metadata in the field above to see its attributes'
											)}
										</Text>
									</Padding>
								</Container>
							)}
							<Row
								width="100%"
								mainAlignment="space-between"
								crossAlignment="center"
								padding={{ all: 'large' }}
							>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="outlined"
										label={t('label.add', 'ADD')}
										color="primary"
										size="large"
										width="fill"
										onClick={() => {
											if (samlAttrKey) {
												addOrUpdateSAMLAttributes(domainName, samlAttrKey, samlAttrValue, false);
											}
										}}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="outlined"
										label={t('label.update', 'UPDATE')}
										color="primary"
										size="large"
										width="fill"
										onClick={() => {
											if (samlAttrKey) {
												addOrUpdateSAMLAttributes(domainName, samlAttrKey, samlAttrValue, true);
											}
										}}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="ghost"
										label={t('label.remove', 'Remove')}
										color="primary"
										size="large"
										width="fill"
										onClick={() => {
											if (samlAttrKey) {
												removeSAMLAttributes(domainName, samlAttrKey);
											}
										}}
									/>
								</Container>
							</Row>
							<Row
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ all: 'large' }}
							>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-end"
									orientation="vertical"
								>
									<Input
										label={t(
											'label.select_an_attribute_to_show_its_value',
											'Select an Attribute to show its value'
										)}
										backgroundColor="gray5"
										value={samlAttrKey}
										onChange={(e: any): any => {
											setSamlAttrKey(e.target.value);
										}}
										CustomIcon={(): any =>
											samlAttrKey && (
												<Container onClick={() => setSamlAttrKey('')} style={{ cursor: 'pointer' }}>
													<Icon icon="CloseOutline" size="large" color="secondary" />
												</Container>
											)
										}
									/>
								</Container>
							</Row>
							<Row
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ left: 'large', bottom: 'large', right: 'large' }}
							>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-end"
									orientation="vertical"
								>
									<Input
										label={t(
											'label.here_will_be_shown_the_attribute_value',
											'The Attribute Value will be displayed here'
										)}
										backgroundColor="gray5"
										value={samlAttrValue}
										onChange={(e: any): any => {
											setSamlAttrValue(e.target.value);
										}}
										CustomIcon={(): any =>
											samlAttrValue && (
												<Container
													onClick={() => setSamlAttrValue('')}
													style={{ cursor: 'pointer' }}
												>
													<Icon icon="CloseOutline" size="large" color="secondary" />
												</Container>
											)
										}
									/>
								</Container>
							</Row>
						</Container>
					</Row>
				</Container>
			</Container>
		</Container>
	);
};
export default DomainSaml;
