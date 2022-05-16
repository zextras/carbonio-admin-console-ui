/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@zextras/carbonio-design-system';
import { VerticalWizard } from '../app/component/hwizard';
import Connection from './connection';
import Summary from './summary';
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
			onClose={(): any => setToggleBucket(false)}
		>
			{wizard}
		</Section>
	);
};

// eslint-disable-next-line no-empty-pattern
const NewBucket: FC<{ setToggleBucket: any; title: string }> = ({ setToggleBucket, title }) => {
	const { t } = useTranslation();
	const [wizardData, setWizardData] = useState();

	const wizardSteps = [
		{
			name: 'connection',
			label: t('new_bucket_connection', 'CONNECTION'),
			icon: 'Link2Outline',
			view: Connection,
			canGoNext: (): any => true
		},
		{
			name: 'summary',
			label: t('new_bucket_summary', 'SUMMARY'),
			icon: 'AtOutline',
			view: Summary,
			NextButton: (props: any) => (
				<Button
					{...props}
					label={t('commons.confirm_connection', 'CONFIRM CONNECTION')}
					icon="Link2Outline"
					iconPlacement="right"
				/>
			)
		}
	];

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onComplete = useCallback(() => {}, []);

	return (
		<VerticalWizard
			steps={wizardSteps}
			Wrapper={WizardInSection}
			onChange={setWizardData}
			onComplete={onComplete}
			setToggleBucket={setToggleBucket}
		/>
	);
};
export default NewBucket;
