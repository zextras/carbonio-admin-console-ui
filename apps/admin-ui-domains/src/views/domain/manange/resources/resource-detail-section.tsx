/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDomainStore } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Divider,
	Icon,
	Input,
	Row,
	Select,
	SelectItem,
	Text} from '@zextras/carbonio-design-system';
import {
	ChangeEvent,
	FC,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState} from 'react';
import { useTranslation } from 'react-i18next';

import Textarea from '../../../components/textarea';
import ListRow from '../../../list/list-row';
import { checkValidUserName, convertToAscii, getModifiedName } from '../../../utility/utils';
import { ResourceContext } from './resource-context';
import {
	RESOURCE_TYPE,
	SCHEDULE_POLITY_TYPE,
	STATUS,
	TRUE_FALSE
} from './resource-edit-detail-view';

type SelectValue = SelectItem[] | string | null;

const ResourceDetailSection: FC = () => {
	const { t } = useTranslation();
	const context = useContext(ResourceContext);
	const { resourceDetail, setResourceDetail } = context;
	const cosList = useDomainStore((state) => state.cosList);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const domainName = useDomainStore((state) => state.domain?.name);
	const [showAutoFillAlert, setShowAutoFillAlert] = useState<boolean>(false);

	const resourceTypeOptions: Array<{ label: string; value: string }> = useMemo(
		() => [
			{
				label: t('label.meeting_room', 'Meeting Room'),
				value: RESOURCE_TYPE.LOCATION
			},
			{
				label: t('label.equipment', 'Equipment'),
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

	const onCOSIdChange = useCallback(
		(v: SelectValue): void => {
			const objItem = cosItems.find((item: any) => item.value === v);
			if (objItem !== resourceDetail?.zimbraCOSId) {
				setResourceDetail((prev: any) => ({ ...prev, zimbraCOSId: objItem }));
			}
		},
		[cosItems, resourceDetail?.zimbraCOSId, setResourceDetail]
	);

	const onAccountStatusChange = useCallback(
		(v: SelectValue): void => {
			const objItem = accountStatusOptions.find((item: any) => item.value === v);
			if (objItem !== resourceDetail?.zimbraAccountStatus) {
				setResourceDetail((prev: any) => ({ ...prev, zimbraAccountStatus: objItem }));
			}
		},
		[accountStatusOptions, resourceDetail?.zimbraAccountStatus, setResourceDetail]
	);

	const onResourceTypeChange = useCallback(
		(v: SelectValue): void => {
			const objItem = resourceTypeOptions.find((item: any) => item.value === v);
			if (objItem !== resourceDetail?.zimbraCalResType) {
				setResourceDetail((prev: any) => ({ ...prev, zimbraCalResType: objItem }));
			}
		},
		[resourceDetail?.zimbraCalResType, resourceTypeOptions, setResourceDetail]
	);

	const onAutoRefuseChange = useCallback(
		(v: SelectValue): void => {
			const objItem = autoRefuseOption.find((item: any) => item.value === v);
			if (objItem !== resourceDetail?.zimbraCalResAutoDeclineRecurring) {
				setResourceDetail((prev: any) => ({ ...prev, zimbraCalResAutoDeclineRecurring: objItem }));
			}
		},
		[autoRefuseOption, resourceDetail?.zimbraCalResAutoDeclineRecurring, setResourceDetail]
	);

	const onSchedulePolicyChange = useCallback(
		(v: SelectValue): void => {
			const objItem = schedulePolicyItems.find((item: any) => item.value === v);
			if (objItem !== resourceDetail?.schedulePolicyType) {
				setResourceDetail((prev: any) => ({ ...prev, schedulePolicyType: objItem }));
			}
		},
		[resourceDetail?.schedulePolicyType, schedulePolicyItems, setResourceDetail]
	);

	const changeResourceDetail = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setResourceDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setResourceDetail]
	);

	const changeResourceName = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setShowAutoFillAlert(false);
			setResourceDetail((prev: any) => ({ ...prev, changeNameBool: true }));
			setResourceDetail((prev: any) => ({
				...prev,
				[e.target.name]: e.target.value?.replace(/ /g, '')?.toLowerCase()
			}));
		},
		[setResourceDetail]
	);

	const generatedName = useMemo(() => {
		const { changeNameBool, displayName, name } = resourceDetail || {};

		if (!changeNameBool) {
			const userNameStr = getModifiedName(displayName.trim());
			const asciiValue = convertToAscii(userNameStr);
			if (userNameStr.length === asciiValue.length && checkValidUserName(asciiValue)) {
				setShowAutoFillAlert(false);
				return asciiValue;
			}
			setShowAutoFillAlert(true);
			return '';
		}

		return name || '';
	}, [resourceDetail]);

	useEffect(() => {
		if (domainName) {
			setResourceDetail((prev: any) => ({ ...prev, domain: domainName }));
		}
	}, [domainName, setResourceDetail]);

	useEffect(() => {
		!resourceDetail?.changeNameBool &&
			setResourceDetail((prev: any) => ({ ...prev, name: generatedName }));
	}, [
		generatedName,
		resourceDetail?.changeNameBool,
		resourceDetail?.displayName,
		setResourceDetail
	]);

	useEffect(() => {
		if (accountStatusOptions && accountStatusOptions.length > 0) {
			setResourceDetail((prev: any) => ({ ...prev, zimbraAccountStatus: accountStatusOptions[0] }));
		}
	}, [accountStatusOptions, setResourceDetail]);

	useEffect(() => {
		if (resourceTypeOptions && resourceTypeOptions.length > 0) {
			setResourceDetail((prev: any) => ({ ...prev, zimbraCalResType: resourceTypeOptions[0] }));
		}
	}, [resourceTypeOptions, setResourceDetail]);

	useEffect(() => {
		if (cosItems && cosItems.length > 0) {
			setResourceDetail((prev: any) => ({ ...prev, zimbraCOSId: cosItems[0] }));
		}
	}, [cosItems, setResourceDetail]);

	useEffect(() => {
		if (schedulePolicyItems && schedulePolicyItems.length > 0) {
			setResourceDetail((prev: any) => ({ ...prev, schedulePolicyType: schedulePolicyItems[0] }));
		}
	}, [schedulePolicyItems, setResourceDetail]);

	useEffect(() => {
		if (autoRefuseOption && autoRefuseOption.length > 0) {
			setResourceDetail((prev: any) => ({
				...prev,
				zimbraCalResAutoDeclineRecurring: autoRefuseOption[1]
			}));
		}
	}, [autoRefuseOption, setResourceDetail]);

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
					<Text size="small" weight="bold">
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
							inputName="displayName"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-between"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="45%">
							<Input
								label={t('label.name', 'Name')}
								backgroundColor="gray5"
								value={resourceDetail?.name}
								inputName="name"
								onChange={changeResourceName}
							/>
						</Row>
						<Row width="10%" style={{ padding: '12px' }}>
							<Icon icon="AtOutline" color="gray0" size="large" />
						</Row>
						<Row width="45%">
							<Input
								label={t('label.domain', 'Domain')}
								backgroundColor="gray5"
								value={resourceDetail?.domain}
								inputName="domain"
								disabled
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-between"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Container padding={{ right: 'large' }}>
							<Select
								items={resourceTypeOptions}
								background="gray5"
								label={t('label.type', 'Type')}
								showCheckbox={false}
								onChange={onResourceTypeChange}
								selection={resourceDetail?.zimbraCalResType}
							/>
						</Container>
						<Container padding={{ right: 'large' }}>
							<Select
								items={accountStatusOptions}
								background="gray5"
								label={t('label.status', 'Status')}
								showCheckbox={false}
								selection={resourceDetail?.zimbraAccountStatus}
								onChange={onAccountStatusChange}
							/>
						</Container>
						<Container>
							<Select
								items={cosItems}
								background="gray5"
								label={t('label.class_of_service', 'Class of Service')}
								showCheckbox={false}
								selection={resourceDetail?.zimbraCOSId}
								onChange={onCOSIdChange}
							/>
						</Container>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-between"
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
								selection={resourceDetail?.zimbraCalResAutoDeclineRecurring}
								onChange={onAutoRefuseChange}
							/>
						</Container>
						<Container padding={{ right: 'large' }}>
							<Input
								label={t('label.maximum_conflict', 'Maximum Conflict')}
								backgroundColor="gray5"
								value={resourceDetail.zimbraCalResMaxNumConflictsAllowed}
								inputName="zimbraCalResMaxNumConflictsAllowed"
								onChange={changeResourceDetail}
							/>
						</Container>
						<Container>
							<Input
								label={t('label.percentage_maximum_conflict', '% Maximum Conflict')}
								backgroundColor="gray5"
								value={resourceDetail.zimbraCalResMaxPercentConflictsAllowed}
								inputName="zimbraCalResMaxPercentConflictsAllowed"
								onChange={changeResourceDetail}
							/>
						</Container>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-between"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Select
							items={schedulePolicyItems}
							background="gray5"
							label={t('label.schedule_policy', 'Set Policy')}
							showCheckbox={false}
							selection={resourceDetail?.schedulePolicyType}
							onChange={onSchedulePolicyChange}
						/>
					</Container>
				</ListRow>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<ListRow>
					<Container
						mainAlignment="space-between"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Textarea
							label={t('label.description', 'Description')}
							backgroundColor="gray5"
							value={resourceDetail.zimbraNotes}
							size="medium"
							inputName="zimbraNotes"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default ResourceDetailSection;
