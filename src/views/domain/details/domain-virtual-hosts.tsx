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
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { ZIMBRA_DOMAIN_NAME, ZIMBRA_ID, ZIMBRA_VIRTUAL_HOSTNAME } from '../../../constants';
import { modifyDomain } from '../../../services/modify-domain-service';
import { useDomainStore } from '../../../store/domain/store';
import logo from '../../../assets/helmet_logo.svg';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';

const DomainVirtualHosts: FC = () => {
	const [t] = useTranslation();
	const [selectedRows, setSelectedRows] = useState<any>([]);
	const [addButtonDisabled, setAddButtonDisabled] = useState(true);
	const [removeButtonDisabled, setRemoveButtonDisabled] = useState(true);
	const [virtualHostValue, setVirutalHostValue] = useState('');
	const [items, setItems] = useState<any>([]);
	const [defaultItems, setDefaultItems] = useState<any>([]);
	const [domainName, setDomainName] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [zimbraId, setZimbraId] = useState('');
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);

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
					id: index + 1,
					columns: [domain._content]
				}));
				setItems(virtualHostItems);
				setDefaultItems(virtualHostItems);
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
			const lastId = items.length > 0 ? items[items.length - 1].id : 0;
			const newId = lastId + 1;
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
		if (selectedRows && selectedRows.length > 0) {
			const filterItems = items.filter((item: any) => !selectedRows.includes(item.id));
			setItems(filterItems);
			setRemoveButtonDisabled(true);
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
		body.a = attributes;
		modifyDomain(body)
			.then((response) => response.json())
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const domain: any = data?.Body?.ModifyDomainResponse?.domain[0];
				if (domain) {
					setDomain(domain);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	return (
		<Container
			padding={{ all: 'large' }}
			background="gray6"
			mainAlignment="flex-start"
			style={{ maxWidth: '982px' }}
		>
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
					background="gray6"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="calc(100% - 70px)"
					style={{ overflow: 'auto' }}
				>
					<Padding value="large">
						<Padding vertical="small">
							<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
								<Text>{t('label.description', 'Description')}</Text>
							</Row>
						</Padding>
						<Padding vertical="small">
							<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
								<Paragraph size="medium" color="secondary">
									{t(
										'label.virtual_host_info_msg',
										'Virtual hosts allow the system to establish a default domain for a user login.'
									)}
								</Paragraph>
							</Row>
							<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
								<Paragraph size="medium" color="secondary">
									{t('label.virtual_host_user_msg', {
										domainName,
										defaultValue:
											'Any user that logs in while using a URL with one of the hostnames below will be assumed to be in this domain, {{domainName}}'
									})}
								</Paragraph>
							</Row>
							<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
								<Paragraph size="medium" color="secondary">
									{t(
										'label.virtual_host_note',
										'Please note, that removal of a virtual host takes effect only after mailbox server is restarted.'
									)}
								</Paragraph>
							</Row>
						</Padding>
						<Padding vertical="large" width="100%">
							<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" wrap="nowrap">
								<Input
									label="New Virtual hostname"
									background="gray5"
									value={virtualHostValue}
									onChange={(e: any): any => {
										setVirutalHostValue(e.target.value);
										setAddButtonDisabled(false);
									}}
								/>
								<Padding left="large">
									<Button
										type="outlined"
										label={t('label.add', 'Add')}
										icon="Plus"
										color="primary"
										disabled={addButtonDisabled}
										height="44px"
										onClick={addVirtualHost}
									/>
								</Padding>
								<Padding left="large">
									<Button
										type="outlined"
										label={t('label.remove', 'Remove')}
										icon="Close"
										color="error"
										height="44px"
										disabled={removeButtonDisabled}
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
									setRemoveButtonDisabled(false);
								} else {
									setRemoveButtonDisabled(true);
								}
							}}
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
									<Row takeAvwidth="fill" mainAlignment="center" width="100%">
										<Text size="large" color="secondary" weight="regular">
											{t('label.no_virtual_host_msg', 'There aren’t virtual hosts here.')}
										</Text>
									</Row>
									<Row takeAvwidth="fill" mainAlignment="center" width="100%">
										<Text size="large" color="secondary" weight="regular">
											{t(
												'label.virtual_host_enable_info_msg',
												'Click to ADD button to enabled new one.'
											)}
										</Text>
									</Row>
								</Padding>
							</Container>
						)}
					</Padding>
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
