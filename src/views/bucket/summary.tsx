/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Container, Input, Row, Padding, PasswordInput } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line @typescript-eslint/ban-types

const Summary: FC<{
	isActive: any;
	getData: any;
	onSelection: any;
	title: string;
}> = ({ isActive, getData, onSelection, title }) => {
	const [t] = useTranslation();

	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start">
			<Row padding={{ top: 'extralarge' }} width="100%">
				<Input label={t('buckets.bucket_type', 'Buckets Type')} value={'S3 AWS'} />
			</Row>
			<Row padding={{ top: 'large' }} width="100%">
				<Input label={t('buckets.connection.descriptive_name', 'Descriptive Name')} value="s3aws" />
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Row width="48%" mainAlignment="flex-start">
					<Input label={t('buckets.connection.arn_name', 'Arn / Name')} value="s3aws" />
				</Row>
				<Padding horizontal={'small'} />
				<Row width="48%" mainAlignment="flex-end">
					<Input label={t('buckets.connection.arn_name', 'Arn / Name')} value="EU | Milan" />
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Row width="48%" mainAlignment="flex-start">
					<PasswordInput label={t('buckets.connection.access_key', 'Access Key')} value="" />
				</Row>
				<Padding horizontal={'small'} />
				<Row width="48%" mainAlignment="flex-end">
					<PasswordInput label={t('buckets.connection.secret_key', 'Secret Key')} value="" />
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Input label={t('buckets.connection.notes', 'Notes')} value="This is my notes" />
			</Row>
		</Container>
	);
};
export default Summary;
