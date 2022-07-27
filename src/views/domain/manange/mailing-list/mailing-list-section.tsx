/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useState } from 'react';
import { Container, Text, Input, Row, Switch, Icon } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { MailingListContext } from './mailinglist-context';
import ListRow from '../../../list/list-row';
import { getDomainList } from '../../../../services/search-domain-service';

const MailingListSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(MailingListContext);
	const [domainList, setDomainList] = useState([]);

	const { mailingListDetail, setMailingListDetail } = context;

	const changeResourceDetail = useCallback(
		(e) => {
			setMailingListDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setMailingListDetail]
	);

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 300px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.mailing_list_name', 'Mailing List Name')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Input
							label={t('label.displayed_name', 'Displayed Name')}
							backgroundColor="gray5"
							value={mailingListDetail?.displayName}
							size="medium"
							inputName="displayName"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.list_name_auto_fill', 'List Name (Auto-fill)')}
							backgroundColor="gray5"
							value={mailingListDetail?.prefixName}
							size="medium"
							inputName="prefixName"
							onChange={changeResourceDetail}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="fit"
					>
						<Icon icon="AtOutline" size="large" />
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', left: 'small' }}
					>
						<Input
							label={t('domain.type_here_a_domain', 'Type here a domain')}
							value={mailingListDetail?.suffixName}
							readOnly
							backgroundColor="gray5"
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'medium', bottom: 'medium' }}
					>
						<Switch
							value={mailingListDetail?.dynamic}
							label={t('label.dynamic_mode', 'Dynamic Mode')}
							onClick={(): void => {
								setMailingListDetail((prev: any) => ({
									...prev,
									dynamic: !mailingListDetail?.dynamic
								}));
							}}
						/>
					</Container>
				</ListRow>
				{mailingListDetail?.dynamic && (
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'small', bottom: 'medium' }}
						>
							<Input
								label={t('label.list_url', 'List URL')}
								backgroundColor="gray5"
								value={mailingListDetail?.memberURL}
								size="medium"
								inputName="memberURL"
								onChange={changeResourceDetail}
							/>
						</Container>
					</ListRow>
				)}
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'small', bottom: 'medium' }}
					>
						<Input
							label={t('label.notes', 'Notes')}
							backgroundColor="gray5"
							value={mailingListDetail?.zimbraNotes}
							size="medium"
							inputName="zimbraNotes"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>

				{mailingListDetail?.dynamic && (
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'medium', bottom: 'medium' }}
						>
							<Switch
								value={mailingListDetail?.zimbraHideInGal}
								label={t('label.hidden_from_gal', 'Hidden from GAL')}
								onClick={(): void => {
									setMailingListDetail((prev: any) => ({
										...prev,
										zimbraHideInGal: !mailingListDetail?.zimbraHideInGal
									}));
								}}
							/>
						</Container>
					</ListRow>
				)}

				{mailingListDetail?.dynamic && (
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'medium', bottom: 'medium' }}
						>
							<Switch
								value={mailingListDetail?.zimbraMailStatus}
								label={t('label.can_receive_email', 'Can receive email')}
								onClick={(): void => {
									setMailingListDetail((prev: any) => ({
										...prev,
										zimbraMailStatus: !mailingListDetail?.zimbraMailStatus
									}));
								}}
							/>
						</Container>
					</ListRow>
				)}
			</Container>
		</Container>
	);
};

export default MailingListSection;
