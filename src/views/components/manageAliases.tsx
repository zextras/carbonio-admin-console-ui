/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';
import { cloneDeep, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import {
	Container,
	IconButton,
	Text,
	Row,
	Modal,
	Input,
	Icon,
	Select,
	Chip,
	Divider,
	Button
} from '@zextras/carbonio-design-system';
import { useDomainStore } from '../../store/domain/store';

const ManageAliases: FC<{
	listAliases: Array<{ label: string }>;
	setListAliases: (arg: Array<{ label: string }>) => void;
	setAliasChange: (arg: Array<{ label: string }>) => void;
	aliasType?: string;
}> = ({ listAliases, setListAliases, setAliasChange, aliasType = '' }) => {
	const [t] = useTranslation();
	const [showManageAliesModal, setShowManageAliesModal] = useState<boolean>(false);
	const domainName = useDomainStore((state) => state.domain?.name);
	const domainList = useDomainStore((state) => state.domainList);
	const [aliasNameValue, setAliasNameValue] = useState<string>('');
	const [selectedDomainName, setSelectedDomainName] = useState<string>('');
	const onDomainOptionChange = (v: string): void => {
		setSelectedDomainName(v);
	};

	return (
		<>
			<Row width="100%" padding={{ top: 'large', left: 'large' }}>
				<Row width="76%" mainAlignment="flex-start" crossAlignment="flex-start">
					<Row padding={{ left: 'large', bottom: 'small' }}>
						<Text size="small" color="secondary">
							{t('account_details.aliases', 'Aliases')}
						</Text>
					</Row>
					<Row width="100%">
						<Container
							orientation="horizontal"
							wrap="wrap"
							mainAlignment="flex-start"
							maxWidth="44rem"
							style={{ gap: '0.5rem' }}
						>
							{listAliases?.map(
								(ele, index) =>
									(aliasType !== 'accounts' || index > 0) && (
										<Chip key={`chip${index}`} label={ele.label} />
									)
							)}
							<Row width="100%" padding={{ top: 'medium' }}>
								<Divider color="gray2" />
							</Row>
						</Container>
					</Row>
				</Row>
				<Row width="24%">
					<Button
						type="outlined"
						label={t('account_details.manage_aliases', 'MANAGE ALIAS')}
						color="primary"
						onClick={(): void => setShowManageAliesModal(true)}
					/>
				</Row>
			</Row>
			<Modal
				title={t(
					'account_details.manage_the_aliases_for_this_account',
					'Manage the Aliases for this account'
				)}
				open={showManageAliesModal}
				onClose={(): void => setShowManageAliesModal(false)}
				showCloseIcon
				hideFooter
				size={'medium'}
			>
				<Row padding={{ top: 'large', bottom: 'large' }} width="100%">
					<Row padding={{ top: 'medium', bottom: 'large' }}>
						<Text>
							{t(
								'account_details.type_the_new_alias_name',
								'Type the new Alias Name and select a domain to add it to your available aliases'
							)}
						</Text>
					</Row>
					<Row
						padding={{ bottom: 'large' }}
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="100%"
						wrap={'nowrap'}
					>
						<Container mainAlignment="flex-start" crossAlignment="flex-start" width="40%">
							<Input
								label={t('account_details.new_alias_name', 'New Alias Name')}
								backgroundColor="gray5"
								size="medium"
								value={aliasNameValue}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setAliasNameValue(e.target.value);
								}}
							/>
						</Container>
						<Container padding={{ top: 'large', left: 'small', right: 'small' }} width="10%">
							<Icon icon="AtOutline" size="large" />
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ right: 'large' }}
							width="40%"
						>
							<Select
								items={domainList.map((ele) => ({
									label: ele.name,
									value: ele.name
								}))}
								background="gray5"
								label={t('account_details.domain', 'Domain')}
								showCheckbox={false}
								selection={{
									label: selectedDomainName || domainName,
									value: selectedDomainName || domainName
								}}
								onChange={onDomainOptionChange}
							/>
						</Container>
						<Container width="10%">
							<IconButton
								type="outlined"
								icon="PlusOutline"
								iconColor="primary"
								size="extralarge"
								onClick={(): void => {
									if (!aliasNameValue.trim()) return;
									const aliaes: Array<{ label: string }> = cloneDeep(listAliases);
									aliaes.push({
										label: `${aliasNameValue.trim()}@${selectedDomainName || domainName}`
									});
									const aliaesUniq: Array<{ label: string }> = uniqBy(aliaes, 'label');
									setListAliases(aliaesUniq);
									setAliasChange(aliaesUniq);
									setAliasNameValue('');
								}}
							/>
						</Container>
					</Row>
					<Row padding={{ top: 'medium', bottom: 'large' }}>
						<Text>
							{t(
								'account_details.click_on_the_pencil_to_edit',
								'Click on the pencil to edit the available alias or click on the cross to delete it'
							)}
						</Text>
					</Row>
					<Row width="100%" mainAlignment="flex-start" crossAlignment="flex-start">
						<Row padding={{ left: 'large', bottom: 'small' }}>
							<Text size="small" color="secondary">
								{t('account_details.your_available_aliases', 'Your Available Aliases')}
							</Text>
						</Row>
						<Row width="100%">
							<Container
								orientation="horizontal"
								wrap="wrap"
								mainAlignment="flex-start"
								maxWidth="44rem"
								style={{ gap: '0.5rem' }}
							>
								{listAliases?.map(
									(ele, index) =>
										(aliasType !== 'accounts' || index > 0) && (
											<Chip
												key={`chip${index}`}
												label={ele.label}
												onClose={(): void => {
													const aliaes = cloneDeep(listAliases);
													aliaes.splice(index, 1);
													setListAliases(aliaes);
													setAliasChange(aliaes);
												}}
												actions={[
													{
														id: `chipAliasId${index}`,
														label: ele.label,
														type: 'button',
														icon: 'Edit2Outline',
														onClick: (): void => {
															const aliaes = cloneDeep(listAliases);
															// eslint-disable-next-line max-len
															const selectedItemArr: Array<{ label: string }> = aliaes.splice(
																index,
																1
															);
															const selectedItem: string = selectedItemArr[0].label;
															const selectedItemSplit = selectedItem.split('@');

															setAliasNameValue(selectedItemSplit[0]);
															setSelectedDomainName(selectedItemSplit[1]);
															setListAliases(aliaes);
															setAliasChange(aliaes);
														}
													}
												]}
											/>
										)
								)}
								<Row width="100%" padding={{ top: 'medium' }}>
									<Divider color="gray2" />
								</Row>
							</Container>
						</Row>
					</Row>
				</Row>
			</Modal>
		</>
	);
};

export default ManageAliases;
