/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Text,
	IconButton,
	Divider,
	Button,
	Padding,
	MultiButton,
	Icon,
	Input,
	Table
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/ninja_robo.svg';
import Paginig from '../components/paging';

const DomainMailingList: FC = () => {
	const [t] = useTranslation();
	const [mailingList, setMailingList] = useState<any[]>([]);
	const headers: any = useMemo(
		() => [
			{
				id: 'index',
				label: '',
				width: '5%',
				bold: true
			},
			{
				id: 'name',
				label: t('label.name', 'Name'),
				width: '20%',
				bold: true
			},
			{
				id: 'address',
				label: t('label.address', 'Address'),
				width: '20%',
				bold: true
			},
			{
				id: 'members',
				label: t('label.members', 'Members'),
				width: '15%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '15%',
				bold: true
			},
			{
				id: 'gal',
				label: t('label.gal', 'GAL'),
				width: '15%',
				bold: true
			},
			{
				id: 'description',
				label: t('label.description', 'Description'),
				width: '15%',
				bold: true
			}
		],
		[t]
	);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="flex-start"
			background="gray6"
			style={{ maxWidth: '982px' }}
		>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="30%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.mailing_list', 'Mailing List')}
							</Text>
						</Row>
						<Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="medium">
								<IconButton
									iconColor="gray6"
									backgroundColor="primary"
									icon="Plus"
									height={36}
									width={36}
								/>
							</Padding>
							<Padding right="medium">
								<Button label={t('label.details', 'Details')} color="primary" type="outlined" />
							</Padding>
							<MultiButton
								background="primary"
								label={t('label.bulk_actions', 'Bulk Actions')}
								items={[]}
							/>
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				height="calc(100vh - 150px)"
				padding={{ top: 'large' }}
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							padding={{ all: 'large' }}
						>
							<Container>
								<Input
									backgroundColor="gray5"
									label={t('label.search_dot', 'Search ...')}
									CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="primary" />}
								/>
							</Container>
						</Row>
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							padding={{ all: 'large' }}
						>
							{mailingList && mailingList.length > 0 && (
								<Table rows={mailingList} headers={headers} showCheckbox={false} />
							)}
							{mailingList && mailingList.length === 0 && (
								<Container orientation="column" crossAlignment="center" mainAlignment="flex-start">
									<img src={logo} alt="logo" />
								</Container>
							)}
						</Row>
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							padding={{ all: 'large' }}
						>
							{mailingList && mailingList.length > 0 && (
								<Paginig
									totalItem={0}
									setOffset={(): any => {
										console.log('paging operation');
									}}
									pageSize={1}
								/>
							)}
						</Row>
					</Container>
				</Row>
			</Container>
		</Container>
	);
};

export default DomainMailingList;
