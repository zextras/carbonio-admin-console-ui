/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, useEffect } from 'react';
import {
	Container,
	Input,
	Row,
	Select,
	Text,
	Icon,
	Divider,
	PasswordInput
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { ResourceContext } from './resource-context';
import ListRow from '../../../list/list-row';
import {
	RESOURCE_TYPE,
	SCHEDULE_POLITY_TYPE,
	STATUS,
	TRUE_FALSE
} from './resource-edit-detail-view';
import { useDomainStore } from '../../../../store/domain/store';
import Textarea from '../../../components/textarea';

const ResourceDetailSection: FC = () => {
	const { t } = useTranslation();
	const context = useContext(ResourceContext);
	const { resourceDetail, setResourceDetail } = context;
	const cosList = useDomainStore((state) => state.cosList);
	const [cosItems, setCosItems] = useState<any[]>([]);

	const resourceTypeOptions: any[] = useMemo(
		() => [
			{
				label: t('label.location', 'Location'),
				value: RESOURCE_TYPE.LOCATION
			},
			{
				label: t('label.device', 'Device'),
				value: RESOURCE_TYPE.EQUIPMENT
			}
		],
		[t]
	);

	const accountStatusOptions: any[] = useMemo(
		() => [
			{
				label: t('label.active', 'Active'),
				value: STATUS.ACTIVE
			},
			{
				label: t('label.closed', 'Closed'),
				value: STATUS.CLOSED
			}
		],
		[t]
	);

	const autoRefuseOption: any[] = useMemo(
		() => [
			{
				label: t('label.yes', 'Yes'),
				value: TRUE_FALSE.TRUE
			},
			{
				label: t('label.no', 'No'),
				value: TRUE_FALSE.FALSE
			}
		],
		[t]
	);

	const schedulePolicyItems: any[] = useMemo(
		() => [
			{
				label: t(
					'label.auto_accept_auto_decline_on_conflict',
					'Automatic acceptance if available, automatic rejection in case of conflict'
				),
				value: SCHEDULE_POLITY_TYPE.AUTO_ACCEPT
			},
			{
				label: t(
					'label.manual_accept_auto_decline_on_conflict',
					'Handle acceptance, automatic rejection in case of conflict'
				),
				value: SCHEDULE_POLITY_TYPE.MANUAL_ACCEPT
			},
			{
				label: t('label.auto_accept_always', 'Automatic acceptance if available always'),
				value: SCHEDULE_POLITY_TYPE.AUTO_ACCEPT_ALWAYS
			},
			{
				label: t('label.no_auto_accept_or_decline', 'No automatic acceptance if available always'),
				value: SCHEDULE_POLITY_TYPE.NO_AUTO_ACCEPT
			}
		],
		[t]
	);

	useEffect(() => {
		const arrayItem: any[] = [
			{
				label: t('label.auto', 'Auto'),
				value: ''
			}
		];
		cosList.forEach((item: any) => {
			arrayItem.push({
				label: item.name,
				value: item.id
			});
		});
		setCosItems(arrayItem);
	}, [cosList, t]);

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
						{t('label.details', 'Details')}
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
							label={t('label.resource_name', 'ResourceName')}
							backgroundColor="gray5"
							value={resourceDetail?.displayName}
							size="medium"
							// onChange={(e: any): any => {
							// 	setResourceName(e.target.value);
							// }}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="45%">
							<Input
								label={t('label.name', 'Name')}
								backgroundColor="gray5"
								value={resourceDetail?.name}
								size="medium"
								// onChange={(e: any): any => {
								// 	setResourceName(e.target.value);
								// }}
							/>
						</Row>
						<Row width="10%" style={{ padding: '12px' }}>
							<Icon icon="AtOutline" color="gray0" size="large" />
						</Row>
						<Row width="45%">
							<Input
								label={t('label.domain', 'Domain')}
								backgroundColor="gray5"
								value=""
								size="medium"
								// onChange={(e: any): any => {
								// 	setResourceName(e.target.value);
								// }}
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', width: '100%' }}
					>
						<Container padding={{ right: 'large' }}>
							<Select
								items={resourceTypeOptions}
								background="gray5"
								label={t('label.type', 'Type')}
								showCheckbox={false}
								// onChange={onResouseTypeChange}
								selection={resourceDetail.zimbraCalResType}
							/>
						</Container>
						<Container padding={{ right: 'large' }}>
							<Select
								items={accountStatusOptions}
								background="gray5"
								label={t('label.status', 'Status')}
								showCheckbox={false}
								// onChange={onAccountStatusChange}
								selection={resourceDetail.zimbraAccountStatus}
							/>
						</Container>
						<Container>
							<Select
								items={cosItems}
								background="gray5"
								label={t('label.class_of_service', 'Class of Service')}
								showCheckbox={false}
								// onChange={onCosChange}
								selection={resourceDetail.zimbraCOSId}
							/>
						</Container>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Container padding={{ right: 'large' }}>
							<Select
								items={autoRefuseOption}
								background="gray5"
								label={t('label.auto_refuse', 'Auto-Refuse')}
								showCheckbox={false}
								// onChange={onAutoRefuseChange}
								selection={resourceDetail.zimbraCalResAutoDeclineRecurring}
							/>
						</Container>
						<Container padding={{ right: 'large' }}>
							<Input
								label={t('label.maximum_conflict', 'Maximun Conflict')}
								backgroundColor="gray5"
								value={resourceDetail.zimbraCalResMaxNumConflictsAllowed}
								// onChange={(e: any): any => {
								// 	setZimbraCalResMaxPercentConflictsAllowed(e.target.value);
								// }}
							/>
						</Container>
						<Container>
							<Input
								label={t('label.percentage_maximum_conflict', '% Maximun Conflict')}
								backgroundColor="gray5"
								value={resourceDetail.zimbraCalResMaxPercentConflictsAllowed}
								// onChange={(e: any): any => {
								// 	setZimbraCalResMaxPercentConflictsAllowed(e.target.value);
								// }}
							/>
						</Container>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Select
							items={schedulePolicyItems}
							background="gray5"
							label={t('label.schedule_policy', 'Schedule Policy')}
							showCheckbox={false}
							// onChange={onSchedulePolicyChange}
							selection={resourceDetail.schedulePolicyType}
						/>
					</Container>
				</ListRow>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<Row padding={{ top: 'large' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.password', 'Password')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Container padding={{ right: 'large' }}>
							<PasswordInput
								label={t('label.password', 'Password')}
								backgroundColor="gray5"
								value={resourceDetail.password}
								inputName="password"
								// onChange={(e: any): any => {
								// 	setPassword(e.target.value);
								// 	setIsDirty(true);
								// }}
							/>
						</Container>
						<Container>
							<PasswordInput
								label={t('label.repeat_password', 'Repeat Password')}
								backgroundColor="gray5"
								value={resourceDetail.repeatPassword}
								inputName="repeatPassword"
								// onChange={(e: any): any => {
								// 	setRepeatPassword(e.target.value);
								// 	setIsDirty(true);
								// }}
							/>
						</Container>
					</Container>
				</ListRow>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<Row padding={{ top: 'large' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.description', 'Description')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Textarea
							label={t('label.description', 'Description')}
							backgroundColor="gray5"
							value={resourceDetail.description}
							size="medium"
							// onChange={(e: any): any => {
							// 	setDescription(e.target.value);
							// }}
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default ResourceDetailSection;
