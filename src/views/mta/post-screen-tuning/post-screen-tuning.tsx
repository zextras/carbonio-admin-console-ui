/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	SnackbarManagerContext,
	Row,
	Padding,
	Text,
	Button,
	Divider,
	Icon,
	IconButton,
	Select,
	Input,
	Switch
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useConfigStore } from '../../../store/config/store';
import ListRow from '../../list/list-row';

const CustomIcon = styled(Icon)`
	width: 1.25rem;
	height: 1.25rem;
`;

const MTAPostScreenTuning: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const configInformation = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const onCancel = useCallback(() => {
		console.log('xxxxx');
	}, []);
	const onSave = useCallback(() => {
		console.log('xxxxx');
	}, []);
	return (
		<Container background="gray6" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray6"
				width="fill"
				height="3.5rem"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.postscreen_tuning', 'Postscreen Tuning')}
					</Text>
				</Row>
				<Row>
					{isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
						>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										height={36}
										onClick={onCancel}
									/>
								)}
							</Padding>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.save', 'Save')}
										color="primary"
										height={36}
										onClick={onSave}
									/>
								)}
							</Padding>
						</Container>
					)}
				</Row>
			</Row>
			<ListRow>
				<Divider />
			</ListRow>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 10.5rem)"
				style={{ overflow: 'auto' }}
			>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.blacklisting', 'Blacklisting')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="100%"
					background="#D3EBF8"
					padding={{ all: 'small' }}
					style={{
						borderRadius: '0.125rem 0.125rem 0 0',
						borderBottom: '0.063rem solid #2196D3',
						marginTop: '15px',
						marginBottom: '15px'
					}}
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="100%"
					>
						<Container width="5%" padding={{ left: 'extralarge', right: 'extralarge' }}>
							<Padding horizontal="small">
								<CustomIcon icon="InfoOutline" color="#2196D3"></CustomIcon>
							</Padding>
						</Container>
						<Container
							padding={{
								top: 'small',
								bottom: 'small'
							}}
							crossAlignment="flex-start"
						>
							<Text overflow="break-word">
								{t(
									'mta.graylisting_disabled_warning_message',
									'This is a form of greylisting, so you need to disable other forms of greylisting.'
								)}
							</Text>
						</Container>
					</Container>

					<Container width="auto" padding={{ right: 'small' }}>
						<IconButton icon="CloseOutline" size="large" />
					</Container>
				</Container>
				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Select
							items={[]}
							background="gray5"
							label={t('mta.black_list_action', 'Blacklist Action')}
							showCheckbox={false}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Input label={t('mta.access_list_path', 'Access List Path')} background="gray5" />
					</Container>
				</Container>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.dns_black_listing', 'DNS Blacklisting')}
					</Text>
				</Container>
				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ top: 'large', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Select
							items={[]}
							background="gray5"
							label={t('mta.dns_blacklist_sites', 'DNS Blacklist Sites')}
							showCheckbox={false}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Select
							items={[]}
							background="gray5"
							label={t('mta.dns_blacklist_action', 'DNS Blacklist Action')}
							showCheckbox={false}
						/>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Input
							label={t('mta.dns_blacklist_threshold_value', 'DNS Blacklist Threshold (value)')}
							background="gray5"
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Input
							label={t(
								'mta.dns_blacklist_whitelist_threshold_value',
								'DNS Blacklist Whitelist Threshold  (value)'
							)}
							background="gray5"
						/>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
					width="100%"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
						width="46%"
					>
						<Container
							padding={{ right: 'medium' }}
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							width="75%"
						>
							<Input
								label={t(
									'mta.dns_blacklist_min_time_to_live',
									'DNS Blacklist Min Time to Live (value)'
								)}
								background="gray5"
							/>
						</Container>
						<Container crossAlignment="flex-start" mainAlignment="flex-start" width="25%">
							<Select
								items={[]}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="54%"
					>
						<Container padding={{ right: 'medium' }} width="75%">
							<Input
								label={t(
									'mta.dns_blacklist_max_time_to_live',
									'DNS Blacklist Max Time to Live (value)'
								)}
								background="gray5"
							/>
						</Container>
						<Container width="25%">
							<Select
								items={[]}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
					width="100%"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="82%"
					>
						<Container padding={{ right: 'small' }} width="75%">
							<Input
								label={t('mta.dns_blacklist_time_to_live', 'DNS Blacklist Time to Live (value)')}
								background="gray5"
							/>
						</Container>
						<Container width="25%">
							<Select
								items={[]}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
					<Container></Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium', bottom: 'medium' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.tuning', 'Tuning')}
					</Text>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Switch label={t('mta.bare_newline', 'Bare Newline')} value={false} />
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={[]}
								background="gray5"
								label={t('mta.action', 'Action')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Input
								label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
								background="gray5"
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={[]}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Switch label={t('mta.non_smtp_command', 'NonSMTP Command')} value={false} />
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={[]}
								background="gray5"
								label={t('mta.action', 'Action')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Input
								label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
								background="gray5"
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={[]}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Switch label={t('mta.pipelining', 'Pipelining')} value={false} />
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={[]}
								background="gray5"
								label={t('mta.action', 'Action')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Input
								label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
								background="gray5"
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={[]}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
							/>
						</Container>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAPostScreenTuning;
