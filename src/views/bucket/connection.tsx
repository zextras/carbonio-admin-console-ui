/* eslint-disable no-empty-pattern */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';
import {
	Container,
	Input,
	Icon,
	Row,
	Select,
	Text,
	Padding,
	PasswordInput
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line @typescript-eslint/ban-types

const Connection: FC<{
	isActive: any;
	getData: any;
	onSelection: any;
	title: string;
}> = ({ isActive, getData, onSelection, title }) => {
	const [t] = useTranslation();

	const [selected, setSelected]: any = useState(4);

	const items = [
		{
			label: 'hi',
			value: '1'
		},
		{
			label: 'hello',
			value: '2'
		},
		{
			label: 'good day',
			value: '3'
		},
		{
			label: 'goodnight',
			value: '4'
		},
		{
			label: 'nothing',
			value: '5'
		}
	];

	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start">
			<Row padding="32px 12px 10px 12px" width="100%">
				<Select
					items={items}
					background="gray5"
					label="Buckets Type"
					onChange={setSelected}
					showCheckbox={false}
					padding={{ right: 'medium' }}
				/>
			</Row>
			<Row padding="32px 12px 10px 12px" width="100%">
				<Input
					label={t('connection.descriptive_name', 'Descriptive Name')}
					backgroundColor="gray5"
				/>
			</Row>

			<Row width="100%" padding={{ horizontal: 'small', vertical: 'small' }}>
				<Row width="48%" mainAlignment="flex-start">
					<Input background="gray5" label={t('connection.arn_name', 'Arn/Name')} />
				</Row>
				<Padding width="4%" />
				<Row width="48%" mainAlignment="flex-end">
					<Select background="gray5" label="Region" />
				</Row>
			</Row>
			<Row width="100%" padding={{ horizontal: 'small', vertical: 'small' }}>
				<Row width="48%" mainAlignment="flex-start">
					<PasswordInput background="gray5" label={t('connection.access_key', 'Access Key')} />
				</Row>
				<Padding width="4%" />
				<Row width="48%" mainAlignment="flex-end">
					<PasswordInput background="gray5" label={t('connection.secret_key', 'Secret Key')} />
				</Row>
			</Row>
			<Row padding="32px 12px 10px 12px" width="100%">
				<Input background="gray5" label={t('connection.notes', 'Notes')} />
			</Row>
		</Container>
	);
};

export default Connection;
