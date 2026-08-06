/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Button,
	Container,
	CustomHeaderFactory,
	HoverableRowFactory,
	Input,
	Padding,
	Row,
	Switch,
	Table,
	Tooltip
} from '@zextras/ui-components';
import { ChangeEvent, FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import logo from '../../../assets/ninja_robo.svg';
import {
	ZIMBRA_PUBLIC_SERVICE_HOSTNAME,
	ZIMBRA_PUBLIC_SERVICE_PROTOCOL
} from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { copyTextToClipboard, getServiceUrl, getSPEntityId } from '../../utility/utils';
import { SamlConfigResponse, useSamlOperations } from './hooks/use-saml-operations';

type SamlAttribute = {
	attribute: string;
	value: string;
};

type TableRow = {
	id: string;
	columns: ReactElement[];
};

type TableHeader = {
	id: string;
	label: string;
	width: string;
	bold: boolean;
};

const INFO_BACKGROUND = '#D3EBF8';
const INFO_COLOR = '#2196D3';

type ClearInputIconProps = {
	value: string;
	onClear: () => void;
};

const ClearInputIcon: FC<ClearInputIconProps> = ({ value, onClear }) =>
	value ? (
		<Container onClick={onClear} style={{ cursor: 'pointer' }}>
			<ds-icon icon="CloseOutline" size="large" color="secondary"></ds-icon>
		</Container>
	) : null;

type AttributeCellProps = {
	text: string;
	weight: 'regular' | 'light';
	onClick: () => void;
};

const AttributeCell: FC<AttributeCellProps> = ({ text, weight, onClick }) => (
	<Container crossAlignment="flex-start" mainAlignment="center" onClick={onClick}>
		<ds-text as="span" size="small" weight={weight} color="gray0">
			{text}
		</ds-text>
	</Container>
);

const DomainSaml: FC = () => {
	const [t] = useTranslation();
	const { data: domain, isLoading } = useSelectedDomain();

	const domainName = domain?.name ?? '';
	const domainAttributes = domain?.a;

	// Local state
	const [samlAttributes, setSamlAttributes] = useState<SamlAttribute[]>([]);
	const [samlAttrKey, setSamlAttrKey] = useState('');
	const [samlAttrValue, setSamlAttrValue] = useState('');
	const [metadataUrl, setMetadataUrl] = useState('');
	const [isAllowUnsecure, setIsAllowUnsecure] = useState(false);
	const [showBanner, setShowBanner] = useState(true);

	// Compute endpoints inline
	const { entityId, serviceUrl } = useMemo(() => {
		if (!domainAttributes || domainAttributes.length === 0 || !domainName) {
			return { entityId: '', serviceUrl: '' };
		}
		const publicHostName = domainAttributes.find(
			(attr) => attr.n === ZIMBRA_PUBLIC_SERVICE_HOSTNAME
		)?._content;
		const publicProtocol = domainAttributes.find(
			(attr) => attr.n === ZIMBRA_PUBLIC_SERVICE_PROTOCOL
		)?._content;
		return {
			entityId: getSPEntityId(publicProtocol ?? '', publicHostName ?? '', domainName),
			serviceUrl: getServiceUrl(publicProtocol ?? '', publicHostName ?? '')
		};
	}, [domainAttributes, domainName]);

	// Table headers
	const headers: TableHeader[] = useMemo(
		() => [
			{ id: 'attribute', label: t('label.attribute', 'Attribute'), width: '40%', bold: true },
			{ id: 'value', label: t('label.value', 'Value'), width: '55%', bold: true }
		],
		[t]
	);

	// Config change handler
	const handleConfigChange = useCallback((data: SamlConfigResponse): void => {
		const attrs: SamlAttribute[] = Object.entries(data)
			.filter(([key]) => key !== 'error')
			.map(([key, value]) => ({ attribute: key, value: String(value) }));
		setSamlAttributes(attrs);
	}, []);

	// Clear inputs after attribute operations
	const handleAttributeChange = useCallback((): void => {
		setSamlAttrKey('');
		setSamlAttrValue('');
	}, []);

	const callbacks = useMemo(
		() => ({ onConfigChange: handleConfigChange, onAttributeChange: handleAttributeChange }),
		[handleConfigChange, handleAttributeChange]
	);

	const operations = useSamlOperations(domainName, callbacks);

	// Select attribute from table
	const handleSelectAttribute = useCallback((attr: SamlAttribute): void => {
		setSamlAttrKey(attr.attribute);
		setSamlAttrValue(attr.value);
	}, []);

	// Generate table rows
	const tableRows: TableRow[] = useMemo(
		() =>
			samlAttributes.map((item) => ({
				id: item.attribute,
				columns: [
					<AttributeCell
						key={`attr-${item.attribute}`}
						text={item.attribute}
						weight="regular"
						onClick={(): void => handleSelectAttribute(item)}
					/>,
					<AttributeCell
						key={`val-${item.attribute}`}
						text={item.value}
						weight="light"
						onClick={(): void => handleSelectAttribute(item)}
					/>
				]
			})),
		[samlAttributes, handleSelectAttribute]
	);

	// Fetch config on mount
	useEffect(() => {
		if (domainName) {
			operations.fetchConfig();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [domainName]);

	const renderKeyClearIcon = (): ReactElement | null => (
		<ClearInputIcon value={samlAttrKey} onClear={() => setSamlAttrKey('')} />
	);

	const renderValueClearIcon = (): ReactElement | null => (
		<ClearInputIcon value={samlAttrValue} onClear={() => setSamlAttrValue('')} />
	);

	if (isLoading) {
		return (
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
				<ds-page-shimmer rows={6} />
			</Container>
		);
	}

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				{/* Header */}
				<Row mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="3.5rem">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="100%"
								crossAlignment="flex-start"
							>
								<ds-text as="h2" size="medium" weight="bold" color="gray0">
									{t('label.saml', 'SAML')} @{domainName}
								</ds-text>
							</Row>
						</Row>
					</Container>
					<ds-divider></ds-divider>
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
							{/* Info Banner */}
							{showBanner && (
								<Container
									orientation="horizontal"
									crossAlignment="center"
									width="97%"
									mainAlignment="flex-start"
									padding={{ top: 'medium', bottom: 'medium' }}
									style={{
										backgroundColor: INFO_BACKGROUND,
										borderRadius: '0.125rem 0.125rem 0 0',
										margin: '1rem',
										borderBottom: `0.063rem solid ${INFO_COLOR}`
									}}
								>
									<Row width="5%" mainAlignment="flex-start">
										<Padding horizontal="small">
											<ds-icon
												icon="CheckmarkCircle2Outline"
												style={{ width: '1.25rem', height: '1.25rem' }}
												color={INFO_COLOR}
											></ds-icon>
										</Padding>
									</Row>
									<Row mainAlignment="flex-start" width="65%" padding={{ top: 'small', bottom: 'small' }}>
										<ds-text as="p" overflow="break-word">
											{t(
												'cos.idp_configuration_saml_notes',
												'Go to your IDP to configure your SAML and copy the EntityID and ServiceURL values'
											)}
										</ds-text>
									</Row>
									<Row width="12%" mainAlignment="flex-start">
										<Tooltip placement="top" label={t('label.entity_id_copied', 'EntityID copied')}>
											<Button
												type="outlined"
												label={t('label.entity_id', 'Entity ID')}
												color={INFO_COLOR}
												size="medium"
												backgroundColor={INFO_BACKGROUND}
												icon="CopyOutline"
												iconPlacement="left"
												disabled={!entityId}
												onClick={() => copyTextToClipboard(entityId)}
											/>
										</Tooltip>
									</Row>
									<Row width="16%" mainAlignment="flex-start">
										<Tooltip placement="top" label={t('label.service_url_copied', 'ServiceURL copied')}>
											<Button
												type="outlined"
												label={t('label.service_url', 'ServiceURL')}
												color={INFO_COLOR}
												size="medium"
												backgroundColor={INFO_BACKGROUND}
												icon="CopyOutline"
												iconPlacement="left"
												disabled={!serviceUrl}
												onClick={() => copyTextToClipboard(serviceUrl)}
											/>
										</Tooltip>
									</Row>
									<Row width="4%" mainAlignment="flex-start">
										<Button
											type="ghost"
											color="text"
											icon="CloseOutline"
											size="large"
											onClick={() => setShowBanner(false)}
										/>
									</Row>
								</Container>
							)}

							{/* Configuration Section */}
							<Row
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ left: 'large', top: 'medium' }}
							>
								<ds-text as="h3" size="medium" weight="bold">
									{t('label.configuration_lbl', 'Configuration')}
								</ds-text>
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
										onChange={(e: ChangeEvent<HTMLInputElement>): void => {
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
										onClick={() => operations.importConfig(metadataUrl, isAllowUnsecure)}
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
										onClick={operations.generateCertificate}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="outlined"
										label={t('label.export_configuration', 'EXPORT CONFIGURATION')}
										color="primary"
										size="large"
										width="fill"
										onClick={operations.exportConfig}
									/>
								</Container>
								<Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Button
										type="ghost"
										label={t('label.delete_configuration', 'DELETE CONFIGURATION')}
										color="primary"
										size="large"
										width="fill"
										onClick={operations.deleteConfig}
									/>
								</Container>
							</Row>

							{/* Attributes Table */}
							<Row
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ all: 'large' }}
							>
								<Table
									rows={tableRows}
									headers={headers}
									showCheckbox={false}
									multiSelect={false}
									RowFactory={HoverableRowFactory}
									HeaderFactory={CustomHeaderFactory}
									style={tableRows.length > 0 ? { height: '15rem', overflow: 'auto' } : {}}
								/>
							</Row>
							{tableRows.length === 0 && (
								<Container
									crossAlignment="center"
									mainAlignment="flex-start"
									style={{ marginTop: '1rem' }}
								>
									<ds-text as="span" overflow="break-word" weight="regular" size="large">
										<img src={logo} alt="logo" />
									</ds-text>
									<Padding all="medium" width="25.875rem">
										<ds-text
											as="p"
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
										</ds-text>
									</Padding>
								</Container>
							)}

							{/* Attribute Editor Buttons */}
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
												operations.updateAttribute(samlAttrKey, samlAttrValue, false);
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
												operations.updateAttribute(samlAttrKey, samlAttrValue, true);
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
												operations.removeAttribute(samlAttrKey);
											}
										}}
									/>
								</Container>
							</Row>

							{/* Attribute Key Input */}
							<Row
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ all: 'large' }}
							>
								<Container mainAlignment="flex-start" crossAlignment="flex-end" orientation="vertical">
									<Input
										label={t(
											'label.select_an_attribute_to_show_its_value',
											'Select an Attribute to show its value'
										)}
										backgroundColor="gray5"
										value={samlAttrKey}
										onChange={(e: ChangeEvent<HTMLInputElement>): void => {
											setSamlAttrKey(e.target.value);
										}}
										CustomIcon={renderKeyClearIcon}
									/>
								</Container>
							</Row>

							{/* Attribute Value Input */}
							<Row
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ left: 'large', bottom: 'large', right: 'large' }}
							>
								<Container mainAlignment="flex-start" crossAlignment="flex-end" orientation="vertical">
									<Input
										label={t(
											'label.here_will_be_shown_the_attribute_value',
											'The Attribute Value will be displayed here'
										)}
										backgroundColor="gray5"
										value={samlAttrValue}
										onChange={(e: ChangeEvent<HTMLInputElement>): void => {
											setSamlAttrValue(e.target.value);
										}}
										CustomIcon={renderValueClearIcon}
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
