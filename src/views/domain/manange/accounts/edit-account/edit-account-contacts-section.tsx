/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useState, useContext } from 'react';
import { Container, Input, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../account-context';
import { AccountType } from '../account-types/account-types';
import { isValidNumber } from '../../../../utility/utils';

const EditAccountContactsSection: FC = () => {
	const context = useContext(AccountContext);
	const { accountDetail, setAccountDetail } = context;
	const [t] = useTranslation();
	const [isValidPhone, setIsValidPhone] = useState<boolean>(true);
	const [isValidHomePhone, setIsValidHomePhone] = useState<boolean>(true);
	const [isValidMobile, setIsValidMobile] = useState<boolean>(true);
	const [isValidPager, setIsValidPager] = useState<boolean>(true);
	const [isValidFaxNumber, setIsValidFaxNumber] = useState<boolean>(true);

	const changeAccDetail = useCallback(
		(e) => {
			setAccountDetail((prev: AccountType) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{ overflow: 'auto' }}
		>
			<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.phone', 'Phone')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="space-between">
						<Input
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								if (e.target.value) {
									const validPhone = isValidNumber(e.target.value);
									setIsValidPhone(validPhone);
									if (validPhone) {
										changeAccDetail(e);
									}
								} else {
									changeAccDetail(e);
								}
							}}
							hasError={!isValidPhone}
							inputName="telephoneNumber"
							label={t('label.phone', 'Phone')}
							backgroundColor="gray5"
							defaultValue={accountDetail?.telephoneNumber || ''}
							value={accountDetail?.telephoneNumber || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="space-between">
						<Input
							label={t('label.home', 'Home')}
							backgroundColor="gray5"
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								if (e.target.value) {
									const validPhone = isValidNumber(e.target.value);
									setIsValidHomePhone(validPhone);
									if (validPhone) {
										changeAccDetail(e);
									}
								} else {
									changeAccDetail(e);
								}
							}}
							hasError={!isValidHomePhone}
							inputName="homePhone"
							defaultValue={accountDetail?.homePhone || ''}
							value={accountDetail?.homePhone || ''}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.mobile', 'Mobile')}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								if (e.target.value) {
									const validPhone = isValidNumber(e.target.value);
									setIsValidMobile(validPhone);
									if (validPhone) {
										changeAccDetail(e);
									}
								} else {
									changeAccDetail(e);
								}
							}}
							hasError={!isValidMobile}
							inputName="mobile"
							defaultValue={accountDetail?.mobile || ''}
							value={accountDetail?.mobile || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.pager', 'Pager')}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								if (e.target.value) {
									const validPhone = isValidNumber(e.target.value);
									setIsValidPager(validPhone);
									if (validPhone) {
										changeAccDetail(e);
									}
								} else {
									changeAccDetail(e);
								}
							}}
							hasError={!isValidPager}
							inputName="pager"
							defaultValue={accountDetail?.pager || ''}
							value={accountDetail?.pager || ''}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.fax_number', 'Fax Number')}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								if (e.target.value) {
									const validPhone = isValidNumber(e.target.value);
									setIsValidFaxNumber(validPhone);
									if (validPhone) {
										changeAccDetail(e);
									}
								} else {
									changeAccDetail(e);
								}
							}}
							hasError={!isValidFaxNumber}
							inputName="facsimileTelephoneNumber"
							defaultValue={accountDetail?.facsimileTelephoneNumber || ''}
							value={accountDetail?.facsimileTelephoneNumber || ''}
						/>
					</Row>
				</Row>
			</Row>
			<Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }}>
					<Text size="small" color="gray0" weight="bold">
						{t('label.company', 'Company')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.company', 'Company')}
							onChange={changeAccDetail}
							inputName="company"
							defaultValue={accountDetail?.company || ''}
							value={accountDetail?.company || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.job_title', 'Job Title')}
							onChange={changeAccDetail}
							inputName="title"
							defaultValue={accountDetail?.title || ''}
							value={accountDetail?.title || ''}
						/>
					</Row>
				</Row>
			</Row>
			<Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }}>
					<Text size="small" color="gray0" weight="bold">
						{t('label.address', 'Address')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.country', 'Country')}
							onChange={changeAccDetail}
							inputName="co"
							defaultValue={accountDetail?.co || ''}
							value={accountDetail?.co || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.state', 'State')}
							onChange={changeAccDetail}
							inputName="st"
							defaultValue={accountDetail?.st || ''}
							value={accountDetail?.st || ''}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.city', 'City')}
							onChange={changeAccDetail}
							inputName="l"
							defaultValue={accountDetail?.l || ''}
							value={accountDetail?.l || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.postal_code', 'Postal Code')}
							onChange={changeAccDetail}
							inputName="postalCode"
							defaultValue={accountDetail?.postalCode || ''}
							value={accountDetail?.postalCode || ''}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.address', 'Address')}
							onChange={changeAccDetail}
							inputName="street"
							defaultValue={accountDetail?.street || ''}
							value={accountDetail?.street || ''}
						/>
					</Row>
				</Row>
			</Row>
		</Container>
	);
};

export default EditAccountContactsSection;
