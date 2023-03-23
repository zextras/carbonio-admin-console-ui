/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Container,
	Row,
	Divider,
	Text,
	Input,
	Button,
	Switch,
	Table,
	Padding,
	SnackbarManagerContext,
	Icon,
	IconButton
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import logo from '../../../assets/ninja_robo.svg';
import { useDomainStore } from '../../../store/domain/store';
import { getSamlConfig } from '../../../services/get-saml-configurations';
import { importSamlConfig } from '../../../services/import-saml-configurations';
import { generateSignedCertificate } from '../../../services/generate-signed-certificate';
import { copyTextToClipboard, download, isValidHttpsUrl, isValidUrl } from '../../utility/utils';
import { updateSamlAttributes } from '../../../services/update-saml-attributes';
import {
	SAML_METADATA_JSON_FILE,
	CONTENT_TYPE_TEXT_PLAIN,
	SP_ENTITY_ID_KEY,
	SP_ASSERTION_CONSUMER_SERVICE_KEY
} from '../../../constants';

export type SamlAttribute = {
	attribute: string;
	value: unknown;
};

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const DomainSaml: FC = () => {
	const [t] = useTranslation();
	const [samlAttributes, setSamlAttributes] = useState<Array<SamlAttribute>>([]);
	const [samlTableRows, setSamlTableRows] = useState<any[]>([]);
	const [isAllowUnsecure, setIsAllowUnsecure] = useState<boolean>(false);
	const domainName = useDomainStore((state) => state.domain?.name) || '';
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [samlAttrKey, setSamlAttrKey] = useState<string>('');
	const [samlAttrValue, setSamlAttrValue] = useState<unknown>('');
	const [metadataUrl, setMetadataUrl] = useState<string>('');
	const [isAllowImport, setIsAllowImport] = useState<boolean>(false);
	const [entityId, setEntityId] = useState<string>('');
	const [serverUrl, setServiceUrl] = useState<string>('');
	const [showBannerText, setShowBannerText] = useState<boolean>(true);

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
		(error): void => {
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
		},
		[t, createSnackbar]
	);

	const exportMetadata = (domain: string): void => {
		getSamlConfig(domain)
			.then((data) => {
				if (!data?.error) {
					download(JSON.stringify(data), SAML_METADATA_JSON_FILE, CONTENT_TYPE_TEXT_PLAIN);
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
			if (samlAttr && samlAttr.length > 0) {
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
								<Text size="small" weight="bold" color="gray0">
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
								<Text size="small" weight="bold" color="gray0">
									{item?.value}
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

	const setCopySAMLValues = useCallback((samlAttr: Array<SamlAttribute>): void => {
		const spId: any = samlAttr.find((item) => item.attribute === SP_ENTITY_ID_KEY)?.value;
		const spURl: any = samlAttr.find(
			(item) => item.attribute === SP_ASSERTION_CONSUMER_SERVICE_KEY
		)?.value;
		if (spId) {
			setEntityId(spId);
		}
		if (spURl) {
			setServiceUrl(spURl);
		}
	}, []);

	const getSAMLConfigurations = useCallback(
		(domain: string): void => {
			getSamlConfig(domain)
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
		(domain: string, url: string): void => {
			importSamlConfig(domain, url)
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

	const generateSPCertificates = useCallback(
		(domain: string): void => {
			generateSignedCertificate(domain)
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

	const updateSAMLAttributes = useCallback(
		(domain: string, key: string, value: unknown): void => {
			const body: any = { [key]: value };
			updateSamlAttributes(domain, body)
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

	useEffect(() => {
		if (domainName) {
			getSAMLConfigurations(domainName);
		}
	}, [domainName, getSAMLConfigurations]);

	useEffect(() => {
		if (samlAttributes && samlAttributes?.length > 0) {
			generateSAMLTable(samlAttributes);
			setCopySAMLValues(samlAttributes);
		}
	}, [generateSAMLTable, setCopySAMLValues, samlAttributes]);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="56px">
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
					height="calc(100vh - 150px)"
				>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'large' }}
					>
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							{showBannerText && (entityId || serverUrl) && (
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
										borderRadius: '2px 2px 0px 0px',
										margin: '1rem',
										borderBottom: '1px solid #2196D3'
									}}
								>
									<Row takeAvwidth="fill" width="5%" mainAlignment="flex-start">
										<Padding horizontal="small">
											<CustomIcon icon="CheckmarkCircle2Outline" color="#2196D3"></CustomIcon>
										</Padding>
									</Row>
									<Row
										takeAvwidth="fill"
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
												'Go to your IDP to configure your SAML and copy the entityid and serviceurl values'
											)}
										</Text>
									</Row>
									<Row takeAvwidth="fill" width="12%" mainAlignment="flex-start">
										<Button
											type="outlined"
											label={t('label.entity_id', 'Entity ID')}
											color="#2196D3"
											size="medium"
											backgroundColor="#D3EBF8"
											icon="CopyOutline"
											iconPlacement="left"
											disabled={!entityId}
											// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
											onClick={() => copyTextToClipboard(entityId)}
										/>
									</Row>
									<Row takeAvwidth="fill" width="16%" mainAlignment="flex-start">
										<Button
											type="outlined"
											label={t('label.service_url', 'Service URL')}
											color="#2196D3"
											size="medium"
											backgroundColor="#D3EBF8"
											icon="CopyOutline"
											iconPlacement="left"
											disabled={!serverUrl}
											// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
											onClick={() => copyTextToClipboard(serverUrl)}
										/>
									</Row>
									<Row takeAvwidth="fill" width="4%" mainAlignment="flex-start">
										<IconButton
											icon="CloseOutline"
											size="large"
											// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
											onClick={() => setShowBannerText(false)}
										/>
									</Row>
								</Container>
							)}
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ left: 'large', top: 'large' }}
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
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
										background="gray5"
										value={metadataUrl}
										onChange={(e: any): any => {
											setMetadataUrl(e.target.value);
											if (e.target.value) {
												if (isAllowUnsecure) {
													const validUrl = isValidUrl(e.target.value);
													setIsAllowImport(validUrl);
												} else {
													const validUrl = isValidHttpsUrl(e.target.value);
													setIsAllowImport(validUrl);
												}
											} else {
												setIsAllowImport(false);
											}
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
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onClick={() => importSAMLConfigurations(domainName, metadataUrl)}
										disabled={!isAllowImport}
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
										height={36}
										width="fill"
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onClick={() => generateSPCertificates(domainName)}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="outlined"
										label={t('label.export_configuration', 'EXPORT CONFIGURATION')}
										color="primary"
										size="large"
										height={36}
										width="fill"
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onClick={() => exportMetadata(domainName)}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="ghost"
										label={t('label.delete_configuration', 'DELETE CONFIGURATION')}
										color="primary"
										size="large"
										height={36}
										width="fill"
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
								/>
							</Row>
							{samlTableRows.length === 0 && (
								<Container
									crossAlignment="center"
									mainAlignment="flex-start"
									style={{ marginTop: '1rem' }}
								>
									<Text overflow="break-word" weight="normal" size="large">
										<img src={logo} alt="logo" />
									</Text>
									<Padding all="medium" width="25.875rem">
										<Text
											color="gray1"
											overflow="break-word"
											weight="normal"
											size="large"
											width="60%"
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
										height={36}
										width="fill"
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onClick={() => updateSAMLAttributes(domainName, samlAttrKey, samlAttrValue)}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="outlined"
										label={t('label.update', 'UPDATE')}
										color="primary"
										size="large"
										height={36}
										width="fill"
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onClick={() => updateSAMLAttributes(domainName, samlAttrKey, samlAttrValue)}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="ghost"
										label={t('label.remove', 'Remove')}
										color="primary"
										size="large"
										height={36}
										width="fill"
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
										background="gray5"
										value={samlAttrKey}
										onChange={(e: any): any => {
											setSamlAttrKey(e.target.value);
										}}
										CustomIcon={(): any =>
											samlAttrKey && (
												<Container
													// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
													onClick={() => setSamlAttrKey('')}
													style={{ cursor: 'pointer' }}
												>
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
											'Here will be shown the Attribute Value'
										)}
										background="gray5"
										value={samlAttrValue}
										onChange={(e: any): any => {
											setSamlAttrValue(e.target.value);
										}}
										CustomIcon={(): any =>
											samlAttrValue && (
												<Container
													// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
