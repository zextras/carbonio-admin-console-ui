/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import {
	Container,
	Input,
	Row,
	Text,
	IconButton,
	Padding,
	Icon,
	Divider,
	Table
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ListRow from '../../list/list-row';
import { getCalenderResource } from '../../../services/get-cal-resource-service';
import { getSingatures } from '../../../services/get-signature-service';
import { useDomainStore } from '../../../store/domain/store';

const ResourceDetailContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 43px;
	right: 12px;
	bottom: 0px;
	left: ${'max(calc(100% - 680px), 12px)'};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	overflow: hidden;
	box-shadow: -6px 4px 5px 0px rgba(0, 0, 0, 0.1);
	opacity: '10%;
`;

const ResourceDetailView: FC<any> = ({ selectedResourceList, setShowResourceDetailView }) => {
	const [t] = useTranslation();
	const cosList = useDomainStore((state) => state.cosList);
	const [resourceDetailData, setResourceDetailData]: any = useState({});
	const [sendInviteList, setSendInviteList] = useState<any[]>([]);
	const sendInviteHeaders: any[] = useMemo(
		() => [
			{
				id: 'account',
				label: t('label.accounts', 'Accounts'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);
	const [signatureList, setSignatureList] = useState<any[]>([]);
	const signatureHeaders: any[] = useMemo(
		() => [
			{
				id: 'name',
				label: t('label.name', 'Name'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const STATUS_COLOR: any = useMemo(
		() => ({
			active: {
				color: '#8BC34A',
				label: t('label.active', 'Active')
			},
			closed: {
				color: '#828282',
				label: t('label.closed', 'Closed')
			}
		}),
		[t]
	);

	const getResourceDetail = useCallback((): void => {
		getCalenderResource(selectedResourceList?.id)
			.then((response) => response.json())
			.then((data) => {
				const resourceDetailResponse =
					data?.Body?.GetCalendarResourceResponse?.calresource[0] || {};
				const obj: any = {};
				resourceDetailResponse?.a?.map((item: any) => {
					obj[item?.n] = item._content;
					return '';
				});
				const sendInviteTo = resourceDetailResponse?.a?.filter(
					(value: any) => value?.n === 'zimbraPrefCalendarForwardInvitesTo'
				);
				if (sendInviteTo && Array.isArray(sendInviteTo)) {
					const sList: any[] = [];
					sendInviteTo.forEach((item: any, index: number) => {
						sList.push({
							id: index,
							columns: [
								<Text size="medium" weight="light" key={index} color="gray0">
									{item?._content}
								</Text>
							],
							item,
							clickable: false
						});
					});
					setSendInviteList(sList);
				}
				setResourceDetailData(obj);
			});
	}, [selectedResourceList?.id]);

	useEffect(() => {
		getResourceDetail();
	}, [getResourceDetail]);

	const getSignatureDetail = useCallback((): void => {
		getSingatures(selectedResourceList?.id)
			.then((response) => response.json())
			.then((data) => {
				const signatureResponse = data?.Body?.GetSignaturesResponse?.signature || [];
				if (signatureResponse && Array.isArray(signatureResponse)) {
					const sList: any[] = [];
					signatureResponse.forEach((item: any, index: number) => {
						sList.push({
							id: item?.id,
							columns: [
								<Text size="medium" weight="light" key={item?.id} color="gray0">
									{item?.name}
								</Text>
							],
							item,
							clickable: false
						});
					});
					setSignatureList(sList);
				}
			});
	}, [selectedResourceList?.id]);

	useEffect(() => {
		getSignatureDetail();
	}, [getSignatureDetail]);

	return (
		<ResourceDetailContainer background="gray5" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="48px"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{selectedResourceList?.name}
					</Text>
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => setShowResourceDetailView(false)}
					/>
				</Row>
			</Row>
			<Row>
				<Divider color="gray3" />
			</Row>
			<Container
				padding={{ left: 'large' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100% - 64px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.resource', 'Resource')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="BulbOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.name', 'Name')}
								backgroundColor="gray6"
								value={resourceDetailData?.displayName}
								size="medium"
								readOnly
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="EmailOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.email', 'Email')}
								backgroundColor="gray6"
								value={resourceDetailData?.mail}
								size="medium"
								readOnly
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="HardDriveOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.server', 'Server')}
								backgroundColor="gray6"
								value={resourceDetailData?.zimbraMailHost}
								size="medium"
								readOnly
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CubeOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.type', 'Type')}
								backgroundColor="gray6"
								value={resourceDetailData?.zimbraCalResType}
								readOnly
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon
								icon="DashboardOutline"
								size="large"
								color={STATUS_COLOR[resourceDetailData?.zimbraAccountStatus]?.color}
							/>
						</Row>
						<Row width="85%">
							<Input
								label={t('label.status', 'Status')}
								backgroundColor="gray6"
								value={STATUS_COLOR[resourceDetailData?.zimbraAccountStatus]?.label}
								size="medium"
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CosOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.class_of_service', 'Class of Service')}
								readOnly
								backgroundColor="gray6"
								value={selectedResourceList?.zimbraMailHost}
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="FingerPrintOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.id_lbl', 'ID')}
								backgroundColor="gray6"
								value={selectedResourceList?.id}
								size="medium"
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CalendarOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.creation_date', 'Creation Date')}
								readOnly
								backgroundColor="gray6"
								value={moment(resourceDetailData?.zimbraCreateTimestamp, 'YYYYMMDDHHmmss.Z').format(
									'DD MMM YYYY | hh:MM:SS A'
								)}
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="HistoryOutline" size="large" color="gray0" />
						</Row>
						<Row width="100%">
							<Input
								label={t('label.auto_refuse', 'Auto-Refuse')}
								backgroundColor="gray6"
								value={
									selectedResourceList?.zimbraCalResAutoDeclineRecurring === 'TRUE'
										? t('lable.true', 'True')
										: t('lable.false', 'False')
								}
								size="medium"
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="FlashOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.maximum_conflict_allowed', 'Maximun Conflict Allowed')}
								backgroundColor="gray6"
								value={resourceDetailData?.zimbraCalResMaxNumConflictsAllowed}
								size="medium"
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="FlashOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.percentage_maximum_conflict_allowed', '% Maximun Conflict Allowed')}
								readOnly
								backgroundColor="gray6"
								value={resourceDetailData?.zimbraCalResMaxPercentConflictsAllowed}
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="ClockOutline" size="large" color="gray0" />
						</Row>
						<Row width="100%">
							<Input
								label={t('label.schedule_policy', 'Schedule Policy')}
								backgroundColor="gray6"
								value=""
								size="medium"
							/>
						</Row>
					</Container>
				</ListRow>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.send_invite_to', 'Send Invite To')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%">
							<Input
								label={t('label.search_an_account', 'Search an account')}
								backgroundColor="gray6"
								value=""
								size="medium"
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="secondary" />}
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Table
							rows={sendInviteList}
							headers={sendInviteHeaders}
							showCheckbox={false}
							style={{ overflow: 'auto', height: '100%' }}
						/>
					</Container>
				</ListRow>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.signatures', 'Signatures')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%">
							<Input
								label={t('label.search_a_signature', 'Search a signature')}
								backgroundColor="gray6"
								value=""
								size="medium"
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="secondary" />}
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Table
							rows={signatureList}
							headers={signatureHeaders}
							showCheckbox={false}
							style={{ overflow: 'auto', height: '100%' }}
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
						<Row width="30%">
							<Input
								label={t('label.auto_accept', 'Auto-Accept')}
								backgroundColor="gray6"
								value="--"
								size="medium"
							/>
						</Row>
						<Row width="30%">
							<Input
								label={t('label.auto_refuse', 'Auto-Refuse')}
								backgroundColor="gray6"
								value="--"
								size="medium"
							/>
						</Row>
						<Row width="30%">
							<Input
								label={t('label.auto_negation', 'Auto-Negation')}
								backgroundColor="gray6"
								value="--"
								size="medium"
							/>
						</Row>
					</Container>
				</ListRow>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<Row padding={{ top: 'extralarge' }}>
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
				<Row padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}>
					<Text size="small">{resourceDetailData?.description}</Text>
				</Row>
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.notes', 'Notes')}
					</Text>
				</Row>
				<Row padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}>
					<Text size="small">{resourceDetailData?.zimbraNotes}</Text>
				</Row>
			</Container>
		</ResourceDetailContainer>
	);
};

export default ResourceDetailView;
