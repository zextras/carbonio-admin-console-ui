/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Container,
	Row,
	Padding,
	Button,
	Text,
	Divider,
	Switch
} from '@zextras/carbonio-design-system';
import ListRow from '../../list/list-row';

const BackupServiceStatus: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const onCancel = (): void => {
		console.log('onCancel');
	};
	const onSave = (): void => {
		console.log('onSave');
	};
	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.service_status', 'Service Status')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onCancel}
									/>
								)}
							</Padding>
							{isDirty && (
								<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
							)}
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
				padding={{ top: 'extralarge' }}
			>
				<ListRow>
					<Switch value={false} label={t('backup.realtime_scanner', 'RealTime Scanner')} />
				</ListRow>
				<ListRow>
					<Switch
						value={false}
						label={t('backup.module_enable_at_startup', 'Module Enabled at Startup')}
					/>
				</ListRow>
				<ListRow>
					<Switch value={false} label={t('backup.smart_scan_at_startup', 'SmartScan at Startup')} />
				</ListRow>
			</Container>
		</Container>
	);
};
export default BackupServiceStatus;
