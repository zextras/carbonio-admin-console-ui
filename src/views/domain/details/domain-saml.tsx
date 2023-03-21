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
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import logo from '../../../assets/ninja_robo.svg';
import { useDomainStore } from '../../../store/domain/store';
import { getSamlConfig } from '../../../services/get-saml-configurations';
import { importSamlConfig } from '../../../services/import-saml-configurations';
import { generateSignedCertificate } from '../../../services/generate-signed-certificate';

export type SamlAttribute = {
	attribute: string;
	value: unknown;
};

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

	const generateSAMLTable = useCallback(
		(samlAttr: Array<SamlAttribute>): void => {
			if (samlAttr && samlAttr.length > 0) {
				const samlRows: Array<any> = [];
				samlAttr.forEach((item: SamlAttribute, index) => {
					samlRows.push({
						id: index.toString(),
						columns: [
							<Text
								size="small"
								weight="bold"
								key={index}
								color="gray0"
								onClick={(): void => {
									openSamlValue(item);
								}}
							>
								{item?.attribute}
							</Text>,
							<Text
								size="small"
								weight="bold"
								key={index}
								color="gray0"
								onClick={(): void => {
									openSamlValue(item);
								}}
							>
								{item?.value}
							</Text>
						]
					});
				});
				setSamlTableRows(samlRows);
			}
		},
		[openSamlValue]
	);

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

	const getSAMLConfigurations = useCallback(
		(domain: string): void => {
			getSamlConfig(domain)
				.then((data) => {
					setSAMLAttributes(data);
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
					setSAMLAttributes(data);
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
					setSAMLAttributes(data);
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
