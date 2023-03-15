/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Text,
	Icon,
	Table,
	Button,
	Padding,
	Select,
	Modal
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import ListRow from '../../../list/list-row';
import { deleteSignature } from '../../../../services/delete-signature-service';
import { modifySignature } from '../../../../services/modify-signature-service';
import { createSignature } from '../../../../services/create-signature-service';
import Textarea from '../../../components/textarea';
import logo from '../../../../assets/carbonio_defender.svg';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';

export const SignatureDetail: FC<any> = ({
	isEditable,
	signatureList,
	setSignatureList,
	signatureItems,
	setSignatureItems,
	resourceId,
	zimbraPrefCalendarAutoAcceptSignatureId,
	setZimbraPrefCalendarAutoAcceptSignatureId,
	zimbraPrefCalendarAutoDeclineSignatureId,
	setZimbraPrefCalendarAutoDeclineSignatureId,
	zimbraPrefCalendarAutoDenySignatureId,
	setZimbraPrefCalendarAutoDenySignatureId,
	hideSearchBar,
	hideHeaderBar
}) => {
	const [t] = useTranslation();
	const [selectedSignature, setSelectedSignature] = useState<any>([]);
	const [isEditSignature, setIsEditSignature] = useState<boolean>(false);
	const [signatureName, setSignatureName] = useState<string>('');
	const [signatureContent, setSignatureContent] = useState<string>('');
	const [searchSignatureName, setSearchSignatureName]: any = useState('');
	const [isOpenCreateEditSignatureDialog, setIsOpenCreateEditSignatureDialog] =
		useState<boolean>(false);
	const [signatureListRows, setSignatureListRows] = useState<any[]>([]);
	const [defaultSignatureList, setDefaultSignatureList] = useState<any[]>([]);
	const [isAssignDefaultList, setIsAssignDefaultList] = useState<boolean>(true);

	useEffect(() => {
		if (signatureList && signatureList.length > 0 && isAssignDefaultList) {
			setDefaultSignatureList(signatureList);
			setIsAssignDefaultList(false);
		}
	}, [isAssignDefaultList, signatureList]);

	const signatureHeaders: any[] = useMemo(
		() => [
			{
				id: 'name',
				label: t('label.name', 'Name'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	useEffect(() => {
		const sList: any[] = [];
		signatureList.forEach((item: any) => {
			sList.push({
				id: item?.id,
				columns: [
					<Text size="medium" weight="light" key={`${item?.id}-name`} color="gray0">
						{item?.name}
					</Text>
				],
				item,
				label: item?.name,
				clickable: true
			});
		});
		setSignatureListRows(sList);
	}, [signatureList]);

	const onZimbraAutoAcceptSignatureChange = useCallback(
		(v: any): any => {
			const objItem = signatureItems.find((item: any) => item.value === v);
			if (objItem !== zimbraPrefCalendarAutoAcceptSignatureId) {
				setZimbraPrefCalendarAutoAcceptSignatureId(objItem);
			}
		},
		[
			setZimbraPrefCalendarAutoAcceptSignatureId,
			signatureItems,
			zimbraPrefCalendarAutoAcceptSignatureId
		]
	);

	const onZimbraAutoDeclineSignatureChange = useCallback(
		(v: any): any => {
			const objItem = signatureItems.find((item: any) => item.value === v);
			if (objItem !== zimbraPrefCalendarAutoDeclineSignatureId) {
				setZimbraPrefCalendarAutoDeclineSignatureId(objItem);
			}
		},
		[
			setZimbraPrefCalendarAutoDeclineSignatureId,
			signatureItems,
			zimbraPrefCalendarAutoDeclineSignatureId
		]
	);

	const onZimbraAutoDenySignatureChange = useCallback(
		(v: any): any => {
			const objItem = signatureItems.find((item: any) => item.value === v);
			if (objItem !== zimbraPrefCalendarAutoDenySignatureId) {
				setZimbraPrefCalendarAutoDenySignatureId(objItem);
			}
		},
		[
			setZimbraPrefCalendarAutoDenySignatureId,
			signatureItems,
			zimbraPrefCalendarAutoDenySignatureId
		]
	);

	useEffect(() => {
		const filterList = defaultSignatureList.filter((item: any) =>
			item?.name?.includes(searchSignatureName)
		);
		setSignatureList(filterList);
	}, [defaultSignatureList, searchSignatureName, setSignatureList]);

	const deleteSignatureIntoList = useCallback(
		(selectedList: any) => {
			const newList = signatureList.filter((item: any) => !selectedList.includes(item?.id));
			setSignatureList(newList);
			const newDefaultList = defaultSignatureList.filter(
				(item: any) => !selectedList.includes(item?.id)
			);
			setDefaultSignatureList(newDefaultList);
			setSelectedSignature([]);
			const signItems = signatureItems.filter((item: any) => !selectedList.includes(item?.value));
			setSignatureItems(signItems);
		},
		[defaultSignatureList, setSignatureItems, setSignatureList, signatureItems, signatureList]
	);

	const onDeleteSignature = useCallback(() => {
		if (resourceId) {
			const deleteRequest: any[] = [];
			selectedSignature.forEach((item: string) => {
				deleteRequest.push(deleteSignature(resourceId, item));
			});
			Promise.all(deleteRequest).then((response) => {
				deleteSignatureIntoList(selectedSignature);
			});
		} else {
			deleteSignatureIntoList(selectedSignature);
		}
	}, [resourceId, selectedSignature, deleteSignatureIntoList]);

	const addSignatureIntoList = useCallback(
		(signatureItem: any) => {
			if (signatureItem?.id) {
				const item = {
					content: [
						{
							type: 'text/plain',
							_content: signatureContent
						}
					],
					id: signatureItem?.id,
					name: signatureItem?.name
				};
				setSignatureList([...signatureList, item]);
				const signItem = {
					label: signatureItem?.name,
					value: signatureItem?.id
				};
				setSignatureItems([...signatureItems, signItem]);
			}
		},
		[setSignatureItems, setSignatureList, signatureContent, signatureItems, signatureList]
	);

	const _createSignature = useCallback((): void => {
		if (resourceId) {
			createSignature(resourceId, signatureName, signatureContent).then((data) => {
				const signatureItem = data?.Body?.CreateSignatureResponse?.signature[0];
				addSignatureIntoList(signatureItem);
				setIsOpenCreateEditSignatureDialog(false);
			});
		} else {
			const lastId = signatureList.length > 0 ? signatureList[signatureList.length - 1].id : 0;
			const newId = +lastId + 1;
			const item = {
				content: [
					{
						type: 'text/plain',
						_content: signatureContent
					}
				],
				id: newId.toString(),
				name: signatureName
			};
			addSignatureIntoList(item);
			setIsOpenCreateEditSignatureDialog(false);
		}
	}, [resourceId, signatureName, signatureContent, addSignatureIntoList, signatureList]);

	const modifySignatureIntoList = useCallback(
		(id: any, name: any, content: any) => {
			if (id && name) {
				const allSignature = signatureList.map((item: any) => {
					if (item?.id === id) {
						// eslint-disable-next-line no-param-reassign
						item.content = [
							{
								type: 'text/plain',
								_content: content
							}
						];
						// eslint-disable-next-line no-param-reassign
						item.name = name;
					}
					return item;
				});
				setSignatureList([]);
				setSignatureList(allSignature);
				const signItems = signatureItems.map((item: any) => {
					if (item?.value === id) {
						// eslint-disable-next-line no-param-reassign
						item.name = name;
					}
					return item;
				});
				setSignatureItems(signItems);
			}
		},
		[setSignatureItems, setSignatureList, signatureItems, signatureList]
	);

	const _modifySignature = useCallback(() => {
		if (resourceId) {
			modifySignature(resourceId, selectedSignature[0], signatureName, signatureContent).then(
				(data) => {
					const _signature = data?.Body?.ModifySignatureResponse;
					if (_signature) {
						modifySignatureIntoList(selectedSignature[0], signatureName, signatureContent);
					}
					setIsOpenCreateEditSignatureDialog(false);
				}
			);
		} else {
			modifySignatureIntoList(selectedSignature[0], signatureName, signatureContent);
			setIsOpenCreateEditSignatureDialog(false);
		}
	}, [modifySignatureIntoList, resourceId, selectedSignature, signatureContent, signatureName]);

	const onSaveOrEditSignature = useCallback(() => {
		if (isEditSignature) {
			_modifySignature();
		} else {
			_createSignature();
		}
	}, [_createSignature, _modifySignature, isEditSignature]);

	const onEditSignature = useCallback(() => {
		const _signature = signatureList.find((item: any) => item?.id === selectedSignature[0]);
		if (_signature && _signature?.id) {
			const content = _signature?.content;
			if (content && content[0]?._content) {
				setSignatureContent(content[0]?._content);
			}
			if (_signature?.name) {
				setSignatureName(_signature?.name);
			}
			setIsEditSignature(true);
			setIsOpenCreateEditSignatureDialog(true);
		}
	}, [selectedSignature, signatureList]);

	useEffect(() => {
		if (!isOpenCreateEditSignatureDialog) {
			setIsEditSignature(false);
			setSignatureContent('');
			setSignatureName('');
		}
	}, [isOpenCreateEditSignatureDialog]);

	return (
		<>
			{!hideHeaderBar && (
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.signatures', 'Signatures')}
					</Text>
				</Row>
			)}
			{isEditable && (
				<ListRow>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-end"
						width="100%"
						wrap="nowrap"
						padding={{ top: 'large' }}
					>
						<Padding>
							<Button
								type="outlined"
								label={t('label.add', 'Add')}
								icon="Plus"
								color="primary"
								onClick={(): void => {
									setIsOpenCreateEditSignatureDialog(true);
								}}
							/>
						</Padding>
						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.edit', 'Edit')}
								icon="Edit"
								color="secondary"
								disabled={selectedSignature.length === 0 || selectedSignature.length > 1}
								onClick={onEditSignature}
							/>
						</Padding>
						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.delete', 'Delete')}
								icon="Close"
								color="error"
								height="44px"
								disabled={selectedSignature.length === 0}
								onClick={onDeleteSignature}
							/>
						</Padding>
					</Row>
				</ListRow>
			)}
			{!hideSearchBar && (
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%">
							<Input
								label={t('label.search_a_signature', 'Search for a signature')}
								backgroundColor="gray5"
								value={searchSignatureName}
								size="medium"
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="secondary" />}
								onChange={(e: any): any => {
									setSearchSignatureName(e.target.value);
								}}
							/>
						</Row>
					</Container>
				</ListRow>
			)}
			<ListRow>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					orientation="horizontal"
					padding={{ top: 'large' }}
				>
					<Table
						rows={signatureListRows}
						headers={signatureHeaders}
						showCheckbox={false}
						style={{ overflow: 'auto', height: '100%' }}
						selectedRows={selectedSignature}
						onSelectionChange={(selected: any): void => setSelectedSignature(selected)}
						RowFactory={CustomRowFactory}
						HeaderFactory={CustomHeaderFactory}
					/>
				</Container>
			</ListRow>
			{signatureListRows?.length === 0 && (
				<ListRow>
					<Container
						orientation="column"
						crossAlignment="center"
						mainAlignment="center"
						padding={{ top: 'extralarge' }}
					>
						<Row>
							<img src={logo} alt="logo" />
						</Row>
						<Row
							padding={{ top: 'extralarge' }}
							orientation="vertical"
							crossAlignment="center"
							style={{ textAlign: 'center' }}
						>
							<Text weight="light" color="#828282" size="large" overflow="break-word">
								{t('label.this_list_is_empty', 'This list is empty.')}
							</Text>
						</Row>
						<Row
							orientation="vertical"
							crossAlignment="center"
							style={{ textAlign: 'center' }}
							padding={{ top: 'small' }}
							width="53%"
						>
							<Text weight="light" color="#828282" size="large" overflow="break-word">
								<Trans
									i18nKey="label.do_you_need_more_information"
									defaults="Do you need more information?"
								/>
							</Text>
						</Row>
						<Row
							orientation="vertical"
							crossAlignment="center"
							style={{ textAlign: 'center' }}
							padding={{ top: 'small' }}
							width="53%"
						>
							<Text weight="light" color="primary">
								{t('label.click_here', 'Click here')}
							</Text>
						</Row>
					</Container>
				</ListRow>
			)}
			<ListRow>
				<Container
					mainAlignment="space-between"
					crossAlignment="flex-start"
					orientation="horizontal"
					padding={{ top: 'large' }}
				>
					<Row width="30%">
						{isEditable && (
							<Select
								items={signatureItems}
								background="gray5"
								label={t('label.auto_accept', 'Auto-Accept')}
								showCheckbox={false}
								onChange={onZimbraAutoAcceptSignatureChange}
								selection={zimbraPrefCalendarAutoAcceptSignatureId}
							/>
						)}
						{!isEditable && (
							<Input
								label={t('label.auto_accept', 'Auto-Accept')}
								backgroundColor="gray6"
								value={zimbraPrefCalendarAutoAcceptSignatureId?.label}
								size="medium"
								readOnly
							/>
						)}
					</Row>
					<Row width="30%">
						{isEditable && (
							<Select
								items={signatureItems}
								background="gray5"
								label={t('label.auto_refuse', 'Auto-Refuse')}
								showCheckbox={false}
								onChange={onZimbraAutoDeclineSignatureChange}
								selection={zimbraPrefCalendarAutoDeclineSignatureId}
							/>
						)}
						{!isEditable && (
							<Input
								label={t('label.auto_refuse', 'Auto-Refuse')}
								backgroundColor="gray6"
								value={zimbraPrefCalendarAutoDeclineSignatureId?.label}
								size="medium"
								readOnly
							/>
						)}
					</Row>
					<Row width="30%">
						{isEditable && (
							<Select
								items={signatureItems}
								background="gray5"
								label={t('label.auto_negation', 'Auto-Negation')}
								showCheckbox={false}
								onChange={onZimbraAutoDenySignatureChange}
								selection={zimbraPrefCalendarAutoDenySignatureId}
							/>
						)}
						{!isEditable && (
							<Input
								label={t('label.auto_negation', 'Auto-Negation')}
								backgroundColor="gray6"
								value={zimbraPrefCalendarAutoDenySignatureId?.label}
								size="medium"
								readOnly
							/>
						)}
					</Row>
				</Container>
			</ListRow>
			{isOpenCreateEditSignatureDialog && (
				<Modal
					title={
						isEditSignature ? (
							<Trans
								i18nKey="label.edit_signature"
								defaults="<bold>Edit Signature</bod>"
								components={{ bold: <strong /> }}
							/>
						) : (
							<Trans
								i18nKey="label.new_signature"
								defaults="<bold>New Signature</bod>"
								components={{ bold: <strong /> }}
							/>
						)
					}
					open={isOpenCreateEditSignatureDialog}
					showCloseIcon
					onClose={(): void => {
						setIsOpenCreateEditSignatureDialog(false);
					}}
					size="medium"
					customFooter={
						<Container orientation="horizontal" mainAlignment="space-between">
							<Container orientation="horizontal" mainAlignment="flex-start">
								<Button label={t('label.help', 'Help')} type="outlined" />
							</Container>

							<Container orientation="horizontal" mainAlignment="flex-end">
								<Padding all="small">
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={(): void => {
											setIsOpenCreateEditSignatureDialog(false);
										}}
									/>
								</Padding>
								<Button
									label={t('label.add_to_the_list', 'Add to the list')}
									color="primary"
									disabled={signatureName === '' || signatureContent === ''}
									onClick={onSaveOrEditSignature}
								/>
							</Container>
						</Container>
					}
				>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'extralarge', bottom: 'extralarge' }}
					>
						<Container padding={{ bottom: 'medium' }}>
							<Input
								label={t('label.name_of_signature', 'Name of Signature')}
								value={signatureName}
								background="gray5"
								onChange={(e: any): any => {
									setSignatureName(e.target.value);
								}}
							/>
						</Container>
						<Container>
							<Textarea
								background="gray5"
								label={t('label.content', 'Content')}
								value={signatureContent}
								onChange={(e: any): any => {
									setSignatureContent(e.target.value);
								}}
							/>
						</Container>
					</Container>
				</Modal>
			)}
		</>
	);
};
