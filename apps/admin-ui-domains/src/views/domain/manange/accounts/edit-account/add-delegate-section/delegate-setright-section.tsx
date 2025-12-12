/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Checkbox,
	Container,
	Divider,
	Radio,
	RadioGroup,
	Row,
	Select,
	Text} from '@zextras/carbonio-design-system';
import { cloneDeep } from 'lodash';
import { FC, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	MANAGE_NO_SEND,
	READ_MAILS_ONLY,
	SEND_MAILS_ONLY,
	SEND_READ_MAILS,
	SEND_READ_MANAGE_MAILS
} from '../../../../../../constants';
import { delegateRightsType } from '../../../../../utility/utils';
import { AccountContext } from '../../account-context';

const DelegateSetRightsSection: FC = () => {
	const [t] = useTranslation();
	const [sendingOption, setSendingOption] = useState('');
	const DELEGETES_RIGHTS_TYPE = useMemo(() => delegateRightsType(t), [t]);
	const context = useContext(AccountContext);
	const { accountDetail, deligateDetail, setDeligateDetail, folderList, setFolderList } = context;

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
							{t('account_details.delegate_rights', 'Delegate`s rights')}
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
											'account_details.send_as_recipients',
											`Send as (recipients will display this sender email {{targetEmail}})`,
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
										iconColor="primary"
									/>
									<Radio
										label={t(
											'account_details.send_as_behalf',
											`Send on Behalf of (recipients will see the sender {{targetEmail}})`,
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
										iconColor="primary"
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
										<RadioGroup value={deligateDetail?.folderSelection}>
											<Radio
												label={t(
													'account_details.all_folders',
													`All Folders ( it includes also folders that will be created later on)`
												)}
												value="all_folders"
												width="19rem"
												onChange={(): void => {
													setDeligateDetail((prev: any) => ({
														...prev,
														folderSelection: 'all_folders'
													}));
												}}
												iconColor="primary"
											/>
											<Radio
												label={t(
													'account_details.i_want_to_select',
													`I want to select the Folders`
												)}
												value="i_want_to_select"
												width="300px"
												style={{ display: 'none' }}
												iconColor="primary"
											/>
										</RadioGroup>
									</Row>

									{deligateDetail?.folderSelection === 'i_want_to_select' ? (
										<>
											<Row width="100%">
												{folderList.map((ele: any, index) =>
													ele.id !== '1' ? (
														<Row key={ele.id} width="200px">
															<Checkbox
																defaultChecked={ele.selected || false}
																label={ele.name}
																onClick={(): void => onFolderSelect(ele, index)}
																iconColor="primary"
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
