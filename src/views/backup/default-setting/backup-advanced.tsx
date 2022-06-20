/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Input,
	Button,
	SnackbarManagerContext,
	Switch,
	Select
} from '@zextras/carbonio-design-system';
import ListRow from '../../list/list-row';

const BackupAdvanced: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const compressLevelItems = useMemo(
		() => [
			{
				label: 1,
				value: 1
			},
			{
				label: 2,
				value: 2
			},
			{
				label: 3,
				value: 3
			}
		],
		[]
	);
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onCancel = (): void => {};
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onSave = (): void => {};
	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="56px">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.advanced', 'Advanced')}
								</Text>
							</Row>
							<Row
								padding={{ all: 'large' }}
								width="50%"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
							>
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
					<Divider color="gray2" />
				</Row>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					style={{ overflow: 'auto' }}
					width="100%"
					height="calc(100vh - 200px)"
					padding={{ top: 'extralarge' }}
				>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('backup.latency_high_threshold', 'Latency High Threshold')}
										value="300000 ms"
										background="gray5"
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('backup.latency_low_threshold', 'Latency Low Threshold')}
										value="60000 ms"
										background="gray5"
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container
									orientation="horizontal"
									mainAlignment="space-between"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Switch value label={t('backup.ldap_dump', 'LDAP Dump')} />
								</Container>
							</ListRow>
							<ListRow>
								<Container
									orientation="horizontal"
									mainAlignment="space-between"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Switch
										value
										label={t('backup.server_configurations', 'Server Configurations')}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container
									orientation="horizontal"
									mainAlignment="space-between"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Switch
										value
										label={t('backup.purge_old_configurations', 'Purge Old Configurations')}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container
									orientation="horizontal"
									mainAlignment="space-between"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Switch value label={t('backup.save_index', 'Save Index')} />
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('backup.metatdata_size', 'Metadata Size')}
										value="20"
										background="gray5"
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('backup.max_waiting_time', 'Max Waiting Time')}
										value="6000 ms"
										background="gray5"
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('backup.max_operations_account', 'Max Operations / Account')}
										value="50"
										background="gray5"
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={compressLevelItems}
										background="gray5"
										label={t('backup.compression_level', 'Compression Level')}
										defaultSelection={compressLevelItems[0]}
										showCheckbox={false}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('backup.threads_for_items', 'Threads For Items')}
										value="5"
										background="gray5"
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('backup.threads_for_account', 'Threads For Account')}
										value="5"
										background="gray5"
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container
									orientation="horizontal"
									mainAlignment="space-between"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Switch value label={t('backup.on_the_fly_metadata', 'On the Fly Metadata')} />
								</Container>
							</ListRow>
							<ListRow>
								<Container
									orientation="horizontal"
									mainAlignment="space-between"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Switch value label={t('backup.metadata_archiving', 'Metadata Archiving')} />
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Container>
			</Container>
		</Container>
	);
};
export default BackupAdvanced;
