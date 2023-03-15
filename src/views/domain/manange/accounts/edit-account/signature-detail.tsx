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
	Modal,
	useSnackbar
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { Trans, useTranslation } from 'react-i18next';
import ListRow from '../../../../list/list-row';
import { deleteSignature } from '../../../../../services/delete-signature-service';
import { modifySignature } from '../../../../../services/modify-signature-service';
import { createSignature } from '../../../../../services/create-signature-service';
// import Textarea from '../../../../components/textarea';
import logo from '../../../../../assets/gardian.svg';
import CustomRowFactory from '../../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../../app/shared/customTableHeaderFactory';

const EditorWrapper = styled.div`
	width: 100%;
	height: 100%;
	overflow-y: auto;
	position: relative;
`;
export const SignatureDetail: FC<any> = ({
	isEditable,
	signatureList,
	setSignatureList,
	signatureItems,
	setSignatureItems,
	accountId,
	hideSearchBar
}) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [selectedSignature, setSelectedSignature] = useState<any>([]);
	const [isEditSignature, setIsEditSignature] = useState<boolean>(false);
	const [signatureName, setSignatureName] = useState<string>('');
	const [signatureContent, setSignatureContent] = useState<string>('');
	const [defaultSignatureContent, setDefaultSignatureContent] = useState<string>('');
	const [searchSignatureName, setSearchSignatureName]: any = useState('');
	const [isOpenCreateEditSignatureDialog, setIsOpenCreateEditSignatureDialog] =
		useState<boolean>(false);
	const [signatureListRows, setSignatureListRows] = useState<any[]>([]);
	const [defaultSignatureList, setDefaultSignatureList] = useState<any[]>([]);
	const [isAssignDefaultList, setIsAssignDefaultList] = useState<boolean>(true);
	const [Composer, composerIsAvailable] = useIntegratedComponent('composer');

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
		if (accountId) {
			const deleteRequest: any[] = [];
			selectedSignature.forEach((item: string) => {
				deleteRequest.push(deleteSignature(accountId, item));
			});
			Promise.all(deleteRequest).then((response) => {
				deleteSignatureIntoList(selectedSignature);
			});
		} else {
			deleteSignatureIntoList(selectedSignature);
		}
	}, [accountId, selectedSignature, deleteSignatureIntoList]);

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
		if (accountId) {
			createSignature(accountId, signatureName, signatureContent)
				// 	.then((response) => response.json())
				.then((data) => {
					console.log({ data });
					if (data?.Body?.Reason?.Text) {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: data?.Body?.Fault?.Reason?.Text,
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					} else {
						const signatureItem = data?.Body?.CreateSignatureResponse?.signature[0];
						addSignatureIntoList(signatureItem);
						setIsOpenCreateEditSignatureDialog(false);
					}
				})
				.catch((error) => {
					console.log({ error });
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
	}, [
		accountId,
		signatureName,
		signatureContent,
		createSnackbar,
		addSignatureIntoList,
		signatureList
	]);

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
		if (accountId) {
			modifySignature(accountId, selectedSignature[0], signatureName, signatureContent).then(
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
	}, [modifySignatureIntoList, accountId, selectedSignature, signatureContent, signatureName]);

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
				setDefaultSignatureContent(content[0]?._content);
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
			setDefaultSignatureContent('');
			setSignatureContent('');
			setSignatureName('');
		}
	}, [isOpenCreateEditSignatureDialog]);

	return (
		<>
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
								height="44px"
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
								height="44px"
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
					{signatureListRows && signatureListRows.length > 0 && (
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
					)}
					{signatureListRows?.length === 0 && (
						<Container orientation="column" crossAlignment="center" mainAlignment="center">
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
					)}
				</Container>
			</ListRow>
			{isOpenCreateEditSignatureDialog && (
				<Modal
					title={
						isEditSignature ? (
							<Trans
								i18nKey="label.edit_signature"
								defaults="<bold>Edit Signature</bold>"
								components={{ bold: <strong /> }}
							/>
						) : (
							<Trans
								i18nKey="label.new_signature"
								defaults="<bold>New Signature</bold>"
								components={{ bold: <strong /> }}
							/>
						)
					}
					open={isOpenCreateEditSignatureDialog}
					showCloseIcon
					onClose={(): void => {
						setIsOpenCreateEditSignatureDialog(false);
					}}
					size="large"
					customFooter={
						<Container orientation="horizontal" mainAlignment="space-between">
							<Button label={t('label.help', 'Help')} type="outlined" color="primary" />
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
							{/* <Textarea
								background="gray5"
								label={t('label.content', 'Content')}
								value={signatureContent}
								onChange={(e: any): any => {
									setSignatureContent(e.target.value);
								}}
							/> */}
							{composerIsAvailable && (
								<EditorWrapper>
									<Composer
										// eslint-disable-next-line no-use-before-define, @typescript-eslint/ban-ts-comment
										// @ts-ignore
										value={unescape(defaultSignatureContent)}
										onEditorChange={(ev: any): void => {
											setSignatureContent(escape(ev[1]));
										}}
									/>
								</EditorWrapper>
							)}
						</Container>
					</Container>
				</Modal>
			)}
		</>
	);
};
