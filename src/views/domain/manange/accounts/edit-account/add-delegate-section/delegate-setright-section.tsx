/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState } from 'react';
import {
	Container,
	Row,
	Select,
	Text,
	Checkbox,
	Divider,
	Radio,
	RadioGroup
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { delegateRightsType } from '../../../../../utility/utils';
import { AccountContext } from '../../account-context';
import {
	MANAGE_NO_SEND,
	READ_MAILS_ONLY,
	SEND_MAILS_ONLY,
	SEND_READ_MAILS,
	SEND_READ_MANAGE_MAILS
} from '../../../../../../constants';

const DelegateSetRightsSection: FC = () => {
	const [t] = useTranslation();
	const [sendingOption, setSendingOption] = useState('');
	const DELEGETES_RIGHTS_TYPE = useMemo(() => delegateRightsType(t), [t]);
	const conext = useContext(AccountContext);
	const { accountDetail, deligateDetail, setDeligateDetail, folderList, setFolderList } = conext;

	const onWhoDelegateChange = (v: any): any => {
		setDeligateDetail((prev: any) => ({ ...prev, delegeteRights: v }));
	};

	const onFolderSelect = (v: any, index: number): any => {
		const changeFolder = cloneDeep(folderList);
		changeFolder[index].selected = !changeFolder[index].selected;
		setFolderList(changeFolder);
	};
	return (
		<>
			<Container
				mainAlignment="flex-start"
				padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{t('account_details.delegate_rights', `Delegate Rights`)}
						</Text>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<Select
							background="gray5"
							label={t(
								'account_details.what_rights_will_the_delegate_have',
								'What rights will the delegate have?'
							)}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={DELEGETES_RIGHTS_TYPE.find(
								(item: any) => item.value === deligateDetail?.delegeteRights
							)}
							onChange={onWhoDelegateChange}
							items={DELEGETES_RIGHTS_TYPE}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				{!(
					deligateDetail?.delegeteRights === SEND_MAILS_ONLY ||
					deligateDetail?.delegeteRights === SEND_READ_MAILS ||
					deligateDetail?.delegeteRights === SEND_READ_MANAGE_MAILS
				) ? (
					<></>
				) : (
					<>
						<Row mainAlignment="flex-start" width="100%">
							<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
								<Text size="small" color="gray0" weight="bold">
									{t('account_details.sending_options', `Sending Options`)}
								</Text>
							</Row>
						</Row>
						<Row
							padding={{ top: 'large', left: 'large' }}
							width="100%"
							mainAlignment="space-between"
						>
							<Row width="100%" mainAlignment="flex-start">
								<RadioGroup value={sendingOption || deligateDetail?.right?.[0]?._content}>
									<Radio
										label={t(
											'account_details.send_as_recepients',
											`Send as (recipients will see the sender {{targetEmail}})`,
											{
												targetEmail: accountDetail?.zimbraMailDeliveryAddress
											}
										)}
										value="sendAs"
										onClick={(): void => {
											setDeligateDetail((prev: any) => ({
												...prev,
												right: [{ _content: 'sendAs' }]
											}));
										}}
									/>
									<Radio
										label={t(
											'account_details.send_as_behalf',
											`Send on Behalf of (recepients will see the sender {{targetEmail}})`,
											{
												targetEmail: accountDetail?.zimbraMailDeliveryAddress
											}
										)}
										value="sendOnBehalfOf"
										onClick={(): void => {
											setDeligateDetail((prev: any) => ({
												...prev,
												right: [{ _content: 'sendOnBehalfOf' }]
											}));
										}}
									/>
								</RadioGroup>
							</Row>
						</Row>
					</>
				)}
				{!(
					deligateDetail?.delegeteRights === READ_MAILS_ONLY ||
					deligateDetail?.delegeteRights === MANAGE_NO_SEND ||
					deligateDetail?.delegeteRights === SEND_READ_MAILS ||
					deligateDetail?.delegeteRights === SEND_READ_MANAGE_MAILS
				) ? (
					<></>
				) : (
					<>
						<Row mainAlignment="flex-start" width="100%">
							<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
								<Text size="small" color="gray0" weight="bold">
									{t(
										'account_details.select_delegate_folder',
										`Select which folders the delegate can view`
									)}
								</Text>
							</Row>
						</Row>
						<Row
							padding={{ top: 'large', left: 'large' }}
							width="100%"
							mainAlignment="space-between"
						>
							<Row width="100%" mainAlignment="flex-start">
								<Row width="100%" mainAlignment="space-between">
									<Row width="100%" mainAlignment="space-between">
										<RadioGroup
											value={deligateDetail?.folderSelection}
											width="100%"
											mainAlignment="space-between"
										>
											<Radio
												label={t(
													'account_details.all_folders',
													`All Folders (include future folders)`
												)}
												value="all_folders"
												width="19rem"
												onChange={(newValue: string): void => {
													setDeligateDetail((prev: any) => ({
														...prev,
														folderSelection: 'all_folders'
													}));
												}}
											/>
											<Radio
												label={t(
													'account_details.i_want_to_select',
													`I want to select the Folders`
												)}
												value="i_want_to_select"
												width="300px"
												style={{ display: 'none' }}
											/>
										</RadioGroup>
									</Row>

									{deligateDetail?.folderSelection === 'i_want_to_select' ? (
										<>
											<Row width="100%" mainAlignment="space-start">
												{folderList.map((ele: any, index) =>
													ele.id !== '1' ? (
														<Row key={ele.id} width="200px" mainAlignment="space-start">
															<Checkbox
																defaultChecked={ele.selected || false}
																label={ele.name}
																onClick={(): void => onFolderSelect(ele, index)}
															/>
														</Row>
													) : (
														<></>
													)
												)}
											</Row>
										</>
									) : (
										<></>
									)}
								</Row>
							</Row>
						</Row>
					</>
				)}
			</Container>
		</>
	);
};

export default DelegateSetRightsSection;
