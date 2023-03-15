/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Divider,
	Row,
	Text,
	Input,
	Button,
	Padding,
	SnackbarManagerContext,
	Modal,
	Icon
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useCosStore } from '../../store/cos/store';
import { getFormatedDate, getDateFromStr } from '../utility/utils';
import { RouteLeavingGuard } from '../ui-extras/nav-guard';
import { modifyCos } from '../../services/modify-cos-service';
import { renameCos } from '../../services/rename-cos-service';
import { DEFAULT } from '../../constants';
import { deleteCOS } from '../../services/delete-cos-service';
import ListRow from '../list/list-row';

const CosGeneralInformation: FC = () => {
	const [t] = useTranslation();
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [cosData, setCosData]: any = useState({});
	const [cosName, setCosName] = useState<string>('');
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const setCos = useCosStore((state) => state.setCos);
	const [openDeleteCOSConfirmDialog, setOpenDeleteCOSConfirmDialog] = useState<boolean>(false);
	const [isRequstInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const totalAccount = useCosStore((state) => state.totalAccount);
	const totalDomain = useCosStore((state) => state.totalDomain);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: any = {};
			cosInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			setCosName(obj.cn);
			if (obj.zimbraNotes) {
				setZimbraNotes(obj.zimbraNotes);
			} else {
				obj.zimbraNotes = '';
				setZimbraNotes('');
			}
			setCosData(obj);
			setIsDirty(false);
		}
	}, [cosInformation]);

	useEffect(() => {
		if (cosData.cn !== undefined && cosData.cn !== cosName) {
			setIsDirty(true);
		}
	}, [cosData?.cn, cosName]);

	useEffect(() => {
		if (cosData.zimbraNotes !== undefined && cosData.zimbraNotes !== zimbraNotes) {
			setIsDirty(true);
		}
	}, [cosData.zimbraNotes, zimbraNotes]);

	const modifyCosInfo = (): void => {
		const body: any = {};
		const attributes: any[] = [];
		body._jsns = 'urn:zimbraAdmin';
		attributes.push({
			n: 'zimbraNotes',
			_content: zimbraNotes
		});
		attributes.push({
			n: 'cn',
			_content: cosName,
			c: true
		});
		body.a = attributes;
		const id = {
			_content: cosData.zimbraId
		};
		body.id = id;
		modifyCos(body)
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const cos: any = data?.cos[0];
				if (cos) {
					setCos(cos);
				}
				setIsDirty(false);
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

	const onSave = (): void => {
		if (cosData.cn !== cosName) {
			const renameBody: any = {};
			renameBody._jsns = 'urn:zimbraAdmin';
			const id = {
				_content: cosData.zimbraId
			};
			renameBody.id = id;
			const newName = {
				_content: cosName
			};
			renameBody.newName = newName;

			renameCos(renameBody)
				.then((data) => {
					modifyCosInfo();
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
		} else {
			modifyCosInfo();
		}
	};

	const onCancel = (): void => {
		setCosName(cosData.cn);
		setZimbraNotes(cosData.zimbraNotes);
		setIsDirty(false);
	};

	const cosCreationDate = useMemo(
		() =>
			!!cosData.zimbraCreateTimestamp && cosData.zimbraCreateTimestamp !== null
				? getFormatedDate(getDateFromStr(cosData.zimbraCreateTimestamp))
				: '',
		[cosData.zimbraCreateTimestamp]
	);

	const canDeleteCOS = useMemo(() => !!(cosName === '' || cosName === DEFAULT), [cosName]);

	const onDeleteCOSConfirmation = (): void => {
		setOpenDeleteCOSConfirmDialog(true);
	};

	const onDeleteCOS = (): void => {
		setIsRequestInProgress(true);
		deleteCOS(cosData.zimbraId)
			.then((data) => {
				const isCosDelete: any = data;
				setIsRequestInProgress(false);
				if (isCosDelete) {
					createSnackbar({
						key: 'info',
						type: 'info',
						label: t('label.delete_cos_succeess', {
							cosname: cosName,
							defaultValue: 'The {{cosname}} has been deleted successfully'
						}),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});

					setOpenDeleteCOSConfirmDialog(false);
					replaceHistory(`/`);
				}
			})
			.catch((error) => {
				setIsRequestInProgress(false);
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

	return (
		<Container mainAlignment="flex-start" background="gray6" padding={{ all: 'large' }}>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('cos.general_information', 'General Information')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
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
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				// height="calc(100vh - 230px)"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
					<Container
						height="fit"
						crossAlignment="flex-start"
						background="gray6"
						padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.name', 'Name')}
									background={canDeleteCOS ? 'gray6' : 'gray5'}
									value={cosName}
									onChange={(e: any): any => {
										setCosName(e.target.value);
									}}
									disabled={canDeleteCOS}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.id_lbl', 'ID')}
									background="gray6"
									value={cosData.zimbraId}
									disabled
									// eslint-disable-next-line @typescript-eslint/no-empty-function
									onChange={(e: any): any => {}}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.creation_date', 'Creation Date')}
									value={cosCreationDate}
									background="gray6"
									disabled
									// eslint-disable-next-line @typescript-eslint/no-empty-function
									onChange={(e: any): any => {}}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.accounts_that_use_this_cos', 'Accounts that use this CoS')}
									background="gray6"
									value={totalAccount}
									disabled
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.domains_that_use_this_cos', 'Domains that use this CoS')}
									value={totalDomain}
									background="gray6"
									disabled
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.notes', 'Notes')}
									background="gray5"
									value={zimbraNotes}
									onChange={(e: any): any => {
										setZimbraNotes(e.target.value);
									}}
								/>
							</Container>
						</ListRow>
					</Container>
				</Row>
			</Container>
			<Row
				width="100%"
				padding={{ top: 'small', right: 'large', bottom: 'large', left: 'large' }}
				style={{ display: 'block' }}
			>
				<Button
					type="outlined"
					label="DELETE"
					icon="CloseOutline"
					color="error"
					size="large"
					width="100%"
					style={{ width: '100%' }}
					disabled={canDeleteCOS}
					onClick={onDeleteCOSConfirmation}
				/>
			</Row>
			<Modal
				title={
					<Trans
						i18nKey="label.deleting_cos_msg"
						defaults="Deleting <bold>{{cosname}}</bold>"
						components={{ bold: <strong />, cosname: cosName }}
					/>
				}
				open={openDeleteCOSConfirmDialog}
				showCloseIcon
				onClose={(): void => {
					setOpenDeleteCOSConfirmDialog(false);
				}}
				size="medium"
				customFooter={
					<Container orientation="horizontal" mainAlignment="space-between">
						<Button label={t('label.help', 'Help')} type="outlined" color="primary" isSmall />
						<Container orientation="horizontal" mainAlignment="flex-end">
							<Padding all="small">
								<Button
									label={t('label.no_go_back', 'No, Go Back')}
									color="secondary"
									size="medium"
									onClick={(): void => {
										setOpenDeleteCOSConfirmDialog(false);
									}}
								/>
							</Padding>
							<Button
								label={t('label.yes_delete', 'Yes, Delete')}
								color="error"
								onClick={onDeleteCOS}
								disabled={isRequstInProgress}
							/>
						</Container>
					</Container>
				}
			>
				<Container>
					<Padding bottom="small" top="extralarge">
						<Text overflow="break-word" weight="regular">
							{t('label.you_are_deleting', {
								cosname: cosName,
								defaultValue: 'You are deleting {{cosname}}'
							})}
						</Text>
					</Padding>
					<Padding bottom="small">
						<Text overflow="break-word" weight="regular">
							{t(
								'label.are_you_sure_deleting_cos',
								'Are you sure you want to delete this Class of Service?'
							)}
						</Text>
					</Padding>
					<Padding bottom="extralarge">
						<Text overflow="break-word" weight="regular">
							{t(
								'label.delete_cos_instruction_msg',
								'If you click YES, DELETE the DefaultCOS will be replace the deleted COS.'
							)}
						</Text>
					</Padding>
				</Container>
			</Modal>

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

export default CosGeneralInformation;
