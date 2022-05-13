/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Select,
	Padding,
	PasswordInput,
	Button
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const Connection: FC<{
	isActive: any;
	getData: any;
	onSelection: any;
	title: string;
}> = ({ isActive, getData, onSelection, title }) => {
	const [t] = useTranslation();
	const regions = [
		{
			label: 'EU | Milan',
			value: 'eu-milan'
		}
	];

	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start">
			<Row padding={{ top: 'extralarge' }} width="100%">
				<Input
					label={t('buckets.bucket_type', 'Buckets Type')}
					backgroundColor="gray5"
					value={'S3 AWS'}
					readOnly
				/>
			</Row>
			<Row padding={{ top: 'large' }} width="100%">
				<Input
					label={t('buckets.connection.descriptive_name', 'Descriptive Name')}
					backgroundColor="gray5"
					value="s3aws"
				/>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Row width="48%" mainAlignment="flex-start">
					<Input
						background="gray5"
						label={t('buckets.connection.arn_name', 'Arn / Name')}
						value="s3aws"
					/>
				</Row>
				<Padding width="4%" />
				<Row width="48%" mainAlignment="flex-end">
					<Select background="gray5" label="Region" items={regions} showCheckbox={false} />
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Row width="48%" mainAlignment="flex-start">
					<PasswordInput
						background="gray5"
						label={t('buckets.connection.access_key', 'Access Key')}
						value="ABC123"
					/>
				</Row>
				<Padding width="4%" />
				<Row width="48%" mainAlignment="flex-end">
					<PasswordInput
						background="gray5"
						label={t('buckets.connection.secret_key', 'Secret Key')}
						value="ABC123"
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Input
					background="gray5"
					label={t('buckets.connection.notes', 'Notes')}
					value="This is my notes"
				/>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Button
					type="outlined"
					label={t('buckets.connection.verify_connector', 'VERIFY CONNECTOR')}
					icon="ActivityOutline"
					iconPlacement="right"
					color="primary"
					width="100%"
				/>
			</Row>
		</Container>
	);
};

export default Connection;
