/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import { Container, Padding, Text } from '@zextras/carbonio-design-system';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const CarbonioVersionInformation: FC<{
	userName: string;
	serverVersion: any;
}> = ({ userName, serverVersion }) => {
	const [t] = useTranslation();
	const isAdvanced = useIsAdvanced();
	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'extralarge' }}
		>
			<Text
				color="secondary"
				overflow="break-word"
				weight="light"
				size="large"
				style={{ fontSize: '2.25rem' }}
			>
				{t('welcome', 'Welcome')}
			</Text>
			<Text
				color="secondary"
				overflow="break-word"
				weight="light"
				size="large"
				style={{ fontSize: '2.25rem' }}
			>
				{userName}
			</Text>
			{!isAdvanced && (
				<Text
					color="secondary"
					overflow="break-word"
					weight="light"
					size="large"
					style={{ fontSize: '2.25rem' }}
				>
					{t('cumminity_edition', 'Community Edition!')}
				</Text>
			)}
			{serverVersion?.majorversion && (
				<Padding left="0.3rem" top="1rem">
					<Text
						color="secondary"
						overflow="break-word"
						weight="light"
						style={{ fontSize: '1.2rem' }}
					>
						{`Version ${serverVersion?.majorversion}.${serverVersion?.minorversion}.${serverVersion?.microversion}`}
					</Text>
				</Padding>
			)}
		</Container>
	);
};

export default CarbonioVersionInformation;
