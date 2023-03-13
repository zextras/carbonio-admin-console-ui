/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext } from 'react';
import { Container, Input, Row, Text, Divider } from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';

import { delegateRightsType } from '../../../../../utility/utils';
import { AccountContext } from '../../account-context';
import { READ_MAILS_ONLY } from '../../../../../../constants';

const DelegateAddSection: FC = () => {
	const [t] = useTranslation();
	const DELEGETES_RIGHTS_TYPE = useMemo(() => delegateRightsType(t), [t]);
	const conext = useContext(AccountContext);
	const { accountDetail, deligateDetail } = conext;

	return (
		<>
			<Container
				mainAlignment="flex-start"
				padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{t('account_details.abstract', `Abstract`)}
						</Text>
					</Row>
				</Row>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{
								<Trans
									i18nKey="account_details.deligate_abstract_text"
									defaults="The user {{granteeEmail}} will be able to send mails {{right}} {{targetEmail}}"
									components={{
										granteeEmail: deligateDetail?.grantee[0]?.name,
										targetEmail: accountDetail?.zimbraMailDeliveryAddress,
										right:
											deligateDetail?.right?.[0]?._content === 'sendAs'
												? t('account_details.as', 'as')
												: t('account_details.on_behalf_of', 'on behalf of')
									}}
								/>
							}
						</Text>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Input
							label={t('account_details.delegate_rights', 'Delegate Rights')}
							backgroundColor="gray5"
							defaultValue={
								DELEGETES_RIGHTS_TYPE.find(
									(item: any) => item.value === deligateDetail?.delegeteRights
								)?.label
							}
							value={
								DELEGETES_RIGHTS_TYPE.find(
									(item: any) => item.value === deligateDetail?.delegeteRights
								)?.label
							}
							// onChange={changeAccDetail}
							inputName="displayName"
							name="descriptiveName"
						/>
					</Row>
				</Row>
				{deligateDetail?.delegeteRights === READ_MAILS_ONLY ? (
					<></>
				) : (
					<Row mainAlignment="flex-start" width="100%">
						<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
							<Input
								label={t('account_details.sendin_options', 'Sending Options')}
								backgroundColor="gray5"
								defaultValue={t(
									'account_details.send_recepients_see_the_mail',
									'Send {{right}} (recepients will see the mail from {{targetEmail}})',
									{
										granteeEmail: deligateDetail?.grantee?.[0]?.name,
										targetEmail: accountDetail?.zimbraMailDeliveryAddress,
										right:
											deligateDetail?.right?.[0]?._content === 'sendAs'
												? t('account_details.as', 'as')
												: t('account_details.on_behalf_of', 'on behalf of')
									}
								)}
								value={t(
									'account_details.send_recepients_see_the_mail',
									'Send {{right}} (recepients will see the mail from {{targetEmail}})',
									{
										granteeEmail: deligateDetail?.grantee?.[0]?.name,
										targetEmail: accountDetail?.zimbraMailDeliveryAddress,
										right:
											deligateDetail?.right?.[0]?._content === 'sendAs'
												? t('account_details.as', 'as')
												: t('account_details.on_behalf_of', 'on behalf of')
									}
								)}
								inputName="displayName"
								name="descriptiveName"
							/>
						</Row>
					</Row>
				)}
			</Container>
		</>
	);
};

export default DelegateAddSection;
