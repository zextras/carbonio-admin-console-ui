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
	Switch,
	Input
} from '@zextras/carbonio-design-system';
import ListRow from '../../list/list-row';

const BackupServerConfig: FC = () => {
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
								{t('label.server_config', 'Server Config')}
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
				height="calc(100vh - 200px)"
				padding={{ top: 'extralarge', left: 'small', right: 'small' }}
			>
				<ListRow>
					<Container padding={{ bottom: 'large' }}>
						<Input label={t('backup.backup_path', 'Backup Path')} value={''} background="gray5" />
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ bottom: 'large' }}>
						<Input
							label={t('backup.minimum_space_threshold', 'Minimum Space Threshold')}
							value={''}
							background="gray5"
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ bottom: 'large' }}>
						<Input
							label={t('backup.local_metadata_threshold', 'Local Metadata Threshold')}
							value={''}
							background="gray5"
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ top: 'large', bottom: 'large' }}>
						<Divider />
					</Container>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Switch
							value={false}
							label={t('backup.smart_scan_scheduling', 'SmartScan Scheduling')}
						/>
					</Padding>
				</ListRow>
				<ListRow>
					<Container padding={{ bottom: 'large' }}>
						<Input label={t('backup.schedule', 'Schedule')} value={''} background="gray5" />
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ top: 'large', bottom: 'extralarge' }}>
						<Divider />
					</Container>
				</ListRow>

				<ListRow>
					<Padding bottom="medium">
						<Text size="medium" weight="regular">
							{t('backup.backup_purge', 'Backup Purge')}
						</Text>
					</Padding>
				</ListRow>

				<ListRow>
					<Container padding={{ bottom: 'large' }}>
						<Input label={t('backup.schedule', 'Schedule')} value={''} background="gray5" />
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ bottom: 'small' }}>
						<Input
							label={t('backup.keep_delted_items_backup', 'Keep deleted items in the backup')}
							value={''}
							background="gray5"
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Text size="extrasmall" weight="regular" color="secondary">
							{t(
								'backup.set_backup_forever_msg',
								'If you set 0, your data will be kept in backup forever'
							)}
						</Text>
					</Padding>
				</ListRow>

				<ListRow>
					<Container padding={{ bottom: 'small' }}>
						<Input
							label={t(
								'backup.keep_delete_accounts_in_backup',
								'Keep deleted accounts in the backup'
							)}
							value={''}
							background="gray5"
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Text size="extrasmall" weight="regular" color="secondary">
							{t(
								'backup.set_backup_forever_msg',
								'If you set 0, your data will be kept in backup forever'
							)}
						</Text>
					</Padding>
				</ListRow>
			</Container>
		</Container>
	);
};
export default BackupServerConfig;
