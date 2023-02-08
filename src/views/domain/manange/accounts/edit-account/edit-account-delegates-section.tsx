/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	FC,
	useMemo,
	useContext,
	useState,
	ReactElement,
	useEffect,
	useCallback
} from 'react';
import {
	Container,
	Padding,
	Row,
	Button,
	Text,
	useSnackbar,
	Table,
	Divider,
	Select,
	Dropdown,
	Input,
	Icon
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { find, filter } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from '../account-context';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import logo from '../../../../../assets/gardian.svg';
import { Section } from '../../../../app/component/section';
import { fetchSoap } from '../../../../../services/fetch-soap';

import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';

import { delegateType } from '../../../../utility/utils';
import DelegateSelectModeSection from './add-delegate-section/delegate-selectmode-section';
import DelegateSetRightsSection from './add-delegate-section/delegate-setright-section';
import DelegateAddSection from './add-delegate-section/delegate-add-section';

const SelectItem = styled(Row)``;

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const StaticCodesContainer = styled(Row)`
	max-width: 350px;
`;
const StaticCodesWrapper = styled.div`
	position: relative;
	width: 100%;
	column-count: 2;
	padding: 16px;
`;
const StaticCode = styled.label`
	display: block;
	font-family: monospace;
	padding: 4.95px 0;
`;

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('account_details.add_user_on_delegates_list', 'Add user on Delegates List')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

const EditAccountDelegatesSection: FC = () => {
	const conext = useContext(AccountContext);
	const {
		identitiesList,
		accountDetail,
		getIdentitiesList,
		deligateDetail,
		setDeligateDetail,
		folderList
	} = conext;
	const [showCreateIdentity, setShowCreateIdentity] = useState<boolean>(false);
	const [editMode, setEditMode] = useState<boolean>(false);
	const [selectedRows, setSelectedRows] = useState([]);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const [identityListItem, setIdentityListItem] = useState<any>([]);

	useEffect(() => {
		const identitiesArr: any = [];
		identitiesList.map((item: any): any => {
			identitiesArr.push({
				id: item?.grantee?.[0]?.id,
				columns: [
					<Text size="medium" key={item?.grantee?.[0]?.id} color="#414141">
						{item?.grantee?.[0]?.name || ' '}
					</Text>,
					<Text size="medium" key={item?.grantee?.[0]?.id} color="#414141">
						{item?.grantee?.[0]?.type === 'usr' ? 'Single User' : 'Group'}
					</Text>,
					<Text size="medium" key={item?.grantee?.[0]?.id} color="#414141">
						{item?.right?.[0]?._content === 'sendAs' ? 'Send As' : ''}
						{item?.right?.[0]?._content === 'sendOnBehalfOf' ? 'Send on Behalf Of' : ''}
					</Text>,
					<Text size="medium" key={item?.grantee?.[0]?.id} color="#414141">
						{/* {'Read, Send, Write'} */}
						{/* {item?.right?.[0]?._content ? 'Send, ' : ' '} */}
						{find(item?.folder || [], (ele: any) => ele.perm.includes('r')) ? 'Read, ' : ' '}
						{find(item?.folder || [], (ele: any) => ele.perm.includes('w')) ? 'Write' : ' '}
					</Text>
					// <Text size="medium" key={item?.grantee?.[0]?.id} color="#414141">
					// 	{'Save it on the Delegated Account'}
					// </Text>
				],
				item,
				clickable: true
			});
			return '';
		});
		setIdentityListItem(identitiesArr);
	}, [identitiesList]);

	const headers: any = useMemo(
		() => [
			{
				id: 'accounts',
				label: t('label.Accounts', 'Accounts'),
				width: '30%',
				bold: true
			},
			{
				id: 'type',
				label: t('label.Type', 'Type'),
				width: '20%',
				bold: true
			},
			{
				id: 'rights',
				label: t('label.Rights', 'Rights'),
				width: '25%',
				bold: true
			},
			{
				id: 'sharing-options',
				label: t('label.sharing_options', 'Sharing Options'),
				width: '25%',
				bold: true
			}
			// {
			// 	id: 'save-mails-to',
			// 	label: t('label.save_mails_to', 'Save Mails to'),
			// 	width: '20%',
			// 	bold: true
			// }
		],
		[t]
	);

	const handleCreateDelegate = (): void => {
		setEditMode(false);
		setDeligateDetail({});
		setShowCreateIdentity(true);
	};
	const handleEditDelegate = (): void => {
		setEditMode(true);
		const selectedDelegate = find(identitiesList, (o) => o?.grantee?.[0].id === selectedRows[0]);
		selectedDelegate.folderSelection = selectedDelegate?.folder?.length ? 'all_folders' : '';
		if (!selectedDelegate?.folder?.length) {
			selectedDelegate.delegeteRights = 'send_mails_only';
		} else if (selectedDelegate?.folder?.length && !selectedDelegate?.right?.length) {
			selectedDelegate.delegeteRights = 'read_mails_only';
		} else if (selectedDelegate?.folder?.[0]?.perm === 'r') {
			selectedDelegate.delegeteRights = 'send_read_mails';
		} else if (selectedDelegate?.folder?.[0]?.perm === 'rwidxa') {
			selectedDelegate.delegeteRights = 'send_read_manage_mails';
		}
		setDeligateDetail(selectedDelegate);
		setShowCreateIdentity(true);
	};

	const handleDeleteeDelegate = useCallback((): void => {
		const selectedDelegate = find(identitiesList, (o) => o?.grantee?.[0].id === selectedRows[0]);
		if (selectedDelegate) {
			if (selectedDelegate?.folder?.length) {
				selectedDelegate.folder.forEach((ele: any) => {
					postSoapFetchRequest(
						`/service/admin/soap/FolderActionRequest`,
						{
							_jsns: 'urn:zimbraMail',
							action: {
								op: '!grant',
								id: ele.id,
								zid: ele.zid
							}
						},
						'FolderActionRequest',
						accountDetail?.zimbraId
					).then((res: any) => {
						getIdentitiesList({
							id: accountDetail?.zimbraId,
							name: accountDetail?.zimbraMailDeliveryAddress
						});
					});
				});
			}
			if (selectedDelegate?.right?.[0]?._content) {
				postSoapFetchRequest(
					`/service/admin/soap/RevokeRightRequest`,
					{
						_jsns: 'urn:zimbraAdmin',
						target: {
							_content: accountDetail?.zimbraMailDeliveryAddress,
							type: 'account',
							by: 'name'
						},
						grantee: {
							by: 'name',
							type: selectedDelegate?.grantee?.[0]?.type,
							_content: selectedDelegate?.grantee?.[0]?.name
						},
						right: {
							_content: selectedDelegate?.right?.[0]?._content
						}
					},
					'RevokeRightRequest',
					accountDetail?.zimbraId
				).then((res: any) => {
					setShowCreateIdentity(false);
					getIdentitiesList({
						id: accountDetail?.zimbraId,
						name: accountDetail?.zimbraMailDeliveryAddress
					});
				});
			}
			if (!editMode) {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t(
						'account_details.delegate_deleted_successfully',
						'Delegate deleted successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		}
	}, [accountDetail, createSnackbar, editMode, getIdentitiesList, identitiesList, selectedRows, t]);
	const handleCreateDelegateAPI = useCallback((): void => {
		if (editMode) {
			handleDeleteeDelegate();
		}
		if (deligateDetail?.delegeteRights && deligateDetail?.delegeteRights !== 'read_mails_only') {
			postSoapFetchRequest(
				`/service/admin/soap/GrantRightRequest`,
				{
					_jsns: 'urn:zimbraAdmin',
					target: {
						_content: accountDetail?.zimbraMailDeliveryAddress,
						type: 'account',
						by: 'name'
					},
					grantee: {
						by: 'name',
						type: deligateDetail?.grantee?.[0]?.type,
						_content: deligateDetail?.grantee?.[0]?.name
					},
					right: {
						_content: deligateDetail?.right?.[0]?._content
					}
				},
				'GrantRightRequest',
				accountDetail?.zimbraId
			).then((res: any) => {
				getIdentitiesList({
					id: accountDetail?.zimbraId,
					name: accountDetail?.zimbraMailDeliveryAddress
				});
				setShowCreateIdentity(false);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: editMode
						? t('account_details.delegate_updated_successfully', 'Delegate updated successfully')
						: t('account_details.delegate_created_successfully', 'Delegate created successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
		}
		if (deligateDetail?.delegeteRights && deligateDetail?.delegeteRights !== 'send_mails_only') {
			const selectedFolders = filter(folderList, { selected: true });
			const folderIds = selectedFolders.map(function (obj) {
				return obj.id;
			});
			postSoapFetchRequest(
				`/service/admin/soap/FolderActionRequest`,
				{
					_jsns: 'urn:zimbraMail',
					action: {
						op: 'grant',
						id: deligateDetail?.folderSelection === 'all_folders' ? '1' : folderIds.join(','),
						grant: {
							perm: deligateDetail?.delegeteRights === 'send_read_manage_mails' ? 'rwidxa' : 'r',
							gt: deligateDetail?.grantee?.[0]?.type,
							d: deligateDetail?.grantee?.[0]?.name,
							pw: ''
						}
					}
				},
				'FolderActionRequest',
				accountDetail?.zimbraId
			).then((res: any) => {
				getIdentitiesList({
					id: accountDetail?.zimbraId,
					name: accountDetail?.zimbraMailDeliveryAddress
				});
				setShowCreateIdentity(false);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: editMode
						? t('account_details.delegate_updated_successfully', 'Delegate updated successfully')
						: t('account_details.delegate_created_successfully', 'Delegate created successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
		}
	}, [
		deligateDetail,
		editMode,
		handleDeleteeDelegate,
		accountDetail?.zimbraMailDeliveryAddress,
		accountDetail?.zimbraId,
		getIdentitiesList,
		createSnackbar,
		t,
		folderList
	]);

	const wizardSteps = useMemo(
		() => [
			{
				name: 'select-mode',
				label: t('account_details.select_mode', 'SELECT MODE'),
				icon: 'PlusOutline',
				view: DelegateSelectModeSection,
				clickDisabled: true,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.volume_cancel_button', 'CANCEL')}
						icon={'CloseOutline'}
						iconPlacement="right"
						color="secondary"
						onClick={(): void => setShowCreateIdentity(false)}
					/>
				),
				PrevButton: (): ReactElement => <></>,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('account_details.NEXT', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'set-rights',
				label: t('account_details.set_rights', 'SET RIGHTS'),
				icon: 'OptionsOutline',
				view: DelegateSetRightsSection,
				clickDisabled: true,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.volume_cancel_button', 'CANCEL')}
						icon={'CloseOutline'}
						iconPlacement="right"
						color="secondary"
						onClick={(): void => setShowCreateIdentity(false)}
					/>
				),
				PrevButton: (props: any): any => (
					<Button
						{...props}
						label={t('label.volume_back_button', 'BACK')}
						icon={'ChevronLeftOutline'}
						iconPlacement="left"
						disable={props.completeLoading}
						color="secondary"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('account_details.NEXT', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'add-delegate',
				label: t('account_details.ADD', 'ADD'),
				icon: 'KeyOutline',
				view: DelegateAddSection,
				clickDisabled: true,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.volume_cancel_button', 'CANCEL')}
						icon={'CloseOutline'}
						iconPlacement="right"
						color="secondary"
						onClick={(): void => setShowCreateIdentity(false)}
					/>
				),
				PrevButton: (props: any): any => (
					<Button
						{...props}
						label={t('label.volume_back_button', 'BACK')}
						icon={'ChevronLeftOutline'}
						iconPlacement="left"
						disable={props.completeLoading}
						color="secondary"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('account_details.ADD', 'ADD')}
						icon="PersonOutline"
						iconPlacement="right"
						onClick={(): void => handleCreateDelegateAPI()}
					/>
				)
			}
		],
		[handleCreateDelegateAPI, t]
	);
	return (
		<>
			{isAdvanced && (
				<Container
					mainAlignment="flex-start"
					padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
				>
					{!showCreateIdentity && (
						<>
							<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
								<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
									<Text size="small" color="gray0" weight="bold">
										{t('label.delegates', 'DELEGATES')}
									</Text>
								</Row>
								<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
									<Padding right="large">
										<Button
											type="outlined"
											label={t('label.ADD_NEW', 'ADD NEW')}
											icon="PlusOutline"
											iconPlacement="right"
											color="primary"
											height={44}
											onClick={(): void => handleCreateDelegate()}
										/>
									</Padding>
									<Padding right="large">
										<Button
											type="outlined"
											label={t('label.EDIT', 'EDIT')}
											icon="Edit2Outline"
											iconPlacement="right"
											color="secondary"
											height={44}
											onClick={(): void => handleEditDelegate()}
										/>
									</Padding>
									<Button
										type="outlined"
										label={t('label.REMOVE', 'REMOVE')}
										icon="CloseOutline"
										iconPlacement="right"
										color="error"
										height={44}
										disabled={!selectedRows?.length}
										onClick={(): void => handleDeleteeDelegate()}
									/>
								</Row>
								<Row
									padding={{ top: 'large', left: 'large' }}
									width="100%"
									mainAlignment="space-between"
								>
									<Row
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										width="fill"
										height="calc(100vh - 340px)"
									>
										{identityListItem.length !== 0 && (
											<Table
												rows={identityListItem}
												headers={headers}
												multiSelect={false}
												onSelectionChange={setSelectedRows}
												style={{ overflow: 'auto', height: '100%' }}
											/>
										)}
										{identityListItem.length === 0 && (
											<Container
												orientation="column"
												crossAlignment="center"
												mainAlignment="center"
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
															i18nKey="label.create_otp_list_msg"
															defaults="You can create a new OTP by clicking on <bold>NEW OTP</bold> button up here"
															components={{ bold: <strong /> }}
														/>
													</Text>
												</Row>
											</Container>
										)}
										<Row
											orientation="horizontal"
											mainAlignment="space-between"
											crossAlignment="flex-start"
											width="fill"
											padding={{ top: 'medium' }}
										>
											<Divider />
										</Row>
									</Row>
								</Row>
							</Row>
						</>
					)}
					{showCreateIdentity && (
						<>
							<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
								<HorizontalWizard
									steps={wizardSteps}
									Wrapper={WizardInSection}
									setToggleWizardSection={setShowCreateIdentity}
								/>
							</Row>
						</>
					)}
				</Container>
			)}
		</>
	);
};

export default EditAccountDelegatesSection;
