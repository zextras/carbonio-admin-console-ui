/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@zextras/carbonio-design-system';
import { HorizontalWizard } from '../app/component/hwizard';
import Connection from './connection';
import { Section } from '../app/component/section';

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleBucket }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('buckets.new.bucket_connection', 'Bucket Connection')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose
			onClose={(): void => {
				setToggleBucket(false);
			}}
		>
			{wizard}
		</Section>
	);
};

// eslint-disable-next-line no-empty-pattern
const NewBucket: FC<{
	setToggleBucket: any;
	title: string;
	setDetailsBucket: any;
	bucketType: any;
	setConnectionData: any;
}> = ({ setToggleBucket, title, setDetailsBucket, bucketType, setConnectionData }) => {
	const { t } = useTranslation();
	const [wizardData, setWizardData] = useState();

	const wizardSteps = [
		{
			name: 'connection',
			label: t('new_bucket_connection', 'CONNECTION'),
			icon: 'Link2Outline',
			view: Connection,
			canGoNext: (): any => true
		}
	];

	const onComplete = useCallback(
		(data) => {
			setConnectionData(data.steps.connection);
			setToggleBucket(false);
			setDetailsBucket(false);
		},
		[setToggleBucket, setDetailsBucket, setConnectionData]
	);

	return (
		<HorizontalWizard
			steps={wizardSteps}
			Wrapper={WizardInSection}
			onChange={setWizardData}
			onComplete={onComplete}
			setToggleBucket={setToggleBucket}
			bucketType={bucketType}
		/>
	);
};
export default NewBucket;
