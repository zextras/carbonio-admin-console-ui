/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState } from 'react';
import {
	Container,
	Padding,
	Text,
	Button,
	Row,
	Divider,
	Select
} from '@zextras/carbonio-design-system';
import { Spinner, getBridgedFunctions, ACTION_TYPES } from '@zextras/carbonio-shell-ui';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import logo from '../../assets/ninja_robo.svg';
import NewBucket from './new-bucket';

const RelativeContainer = styled(Container)`
	position: relative;
`;
const AbsoluteContainer = styled(Container)`
	position: absolute;
	max-width: 630px;
	right: 0;
	z-index: 1;
	box-shadow: 0 0 12px -1px #888;
`;

const BucketDetailPanel: FC = () => {
	const [t] = useTranslation();

	const [selected, setSelected]: any = useState(4);
	const [toggleBucket, setToggleBucket] = useState(false);

	const items = [
		{
			label: 'S3 AWS',
			value: 's3-aws'
		}
	];

	return (
		<Container
			orientation="column"
			crossAlignment="center"
			mainAlignment="flex-start"
			style={{ overflowY: 'hidden' }}
			background="gray6"
		>
			<Container
				padding={{ all: 'large' }}
				mainAlignment="flex-start"
				background="gray6"
				style={{ maxWidth: '982px' }}
			>
				<RelativeContainer
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					style={{ overflowY: 'auto' }}
					background="grey6"
				>
					{toggleBucket && (
						<AbsoluteContainer orientation="vertical" background="gray5">
							<NewBucket setToggleBucket={setToggleBucket} title="Bucket Connection" />
						</AbsoluteContainer>
					)}
					<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
						<Text size="extralarge" weight="bold">
							{t('buckets.bucket_list', 'Buckets List')}
						</Text>
					</Row>
					<Divider />
					<Row padding="32px 12px 10px 12px" width="100%">
						<Select
							items={items}
							background="gray5"
							label={t('buckets.bucket_type', 'Buckets Type')}
							onChange={setSelected}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					</Row>
					<Container>
						<Text
							overflow="break-word"
							weight="normal"
							size="large"
							style={{ whiteSpace: 'pre-line', textAlign: 'center', 'font-family': 'roboto' }}
						>
							<img src={logo} alt="logo" />
						</Text>
						<Padding all="medium" width="47%">
							<Text
								color="gray1"
								overflow="break-word"
								weight="normal"
								size="large"
								width="60%"
								style={{ whiteSpace: 'pre-line', textAlign: 'center', 'font-family': 'roboto' }}
							>
								{t(
									'select_bucket_or_create_new_bucket',
									"It seems like you haven't setup a bucket type. Click NEW BUCKET button to create a new one."
								)}
							</Text>
						</Padding>
						<Padding all="medium">
							<Text
								size="small"
								overflow="break-word"
								style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
							>
								<Button
									type="outlined"
									label={t('label.create_new_bucket', 'NEW BUCKET')}
									icon="Plus"
									color="info"
									onClick={(): any => setToggleBucket(!toggleBucket)}
								/>
							</Text>
						</Padding>
					</Container>
				</RelativeContainer>
			</Container>
		</Container>
	);
};
export default BucketDetailPanel;
