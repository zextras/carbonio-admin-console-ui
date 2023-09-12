/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Row,
	Text,
	Button,
	Divider,
	IconButton,
	Input
} from '@zextras/carbonio-design-system';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { mtaStats } from '../../../../types';

const MTAStatsDetail: FC<{
	serverState: mtaStats | undefined;
	setSelectedServer: (server: Array<any>) => void;
	flushQueues: () => void;
	requestInprogress: boolean;
	flushRequestInProgress: boolean;
}> = ({
	serverState,
	setSelectedServer,
	flushQueues,
	requestInprogress,
	flushRequestInProgress
}) => {
	const [t] = useTranslation();

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				top: '0rem',
				height: 'auto',
				width: 'auto',
				overflow: 'hidden',
				transition: 'left 0.2s ease-in-out',
				boxShadow: '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)',
				right: 0
			}}
		>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="3.5rem"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{serverState?.serverName}
					</Text>
				</Row>
				<Row></Row>
				<Row padding={{ right: 'extrasmall', left: 'small' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => setSelectedServer([])}
					/>
				</Row>
			</Row>
			<Container>
				<Divider className="xxxxx" />
			</Container>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 3.5rem)"
				style={{ overflow: 'auto' }}
				background="white"
			>
				<Container mainAlignment="flex-end" crossAlignment="flex-end" height="auto">
					<Button
						type="outlined"
						size="large"
						label={t('mta.flush_queues', 'Flush queues')}
						color="primary"
						onClick={flushQueues}
						disabled={requestInprogress || flushRequestInProgress}
						loading={requestInprogress || flushRequestInProgress}
					/>
				</Container>
				<Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.current_status', 'Current Status')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large', bottom: 'medium' }}
					height="auto"
				>
					<Container height="auto" padding={{ right: 'medium' }}>
						<Input
							label={t('mta.queued_messages', 'Queued Messages')}
							backgroundColor="gray5"
							value={serverState?.active}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								null;
							}}
						/>
					</Container>
					<Container height="auto">
						<Input
							label={t('mta.corrupted', 'Corrupted')}
							backgroundColor="gray5"
							value={serverState?.corrupt}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								null;
							}}
						/>
					</Container>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'medium' }}
					height="auto"
				>
					<Container height="auto" padding={{ right: 'medium' }}>
						<Input
							label={t('mta.deferred', 'Deferred')}
							backgroundColor="gray5"
							value={serverState?.deferred}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								null;
							}}
						/>
					</Container>
					<Container height="auto" padding={{ right: 'medium' }}>
						<Input
							label={t('mta.incoming', 'Incoming')}
							backgroundColor="gray5"
							value={serverState?.incoming}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								null;
							}}
						/>
					</Container>
					<Container height="auto">
						<Input
							label={t('mta.onhold', 'On Hold')}
							backgroundColor="gray5"
							value={serverState?.hold}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								null;
							}}
						/>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};
export default MTAStatsDetail;
