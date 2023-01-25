/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Container, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';

const CarbonioVersionInformation: FC<{
	userName: string;
}> = ({ userName }) => {
	const [t] = useTranslation();
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
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
				style={{ fontSize: '2.25rem', fontFamily: 'roboto' }}
			>
				{t('welcome', 'Welcome')}
			</Text>
			<Text
				color="secondary"
				overflow="break-word"
				weight="light"
				size="large"
				style={{ fontSize: '2.25rem', fontFamily: 'roboto' }}
			>
				{userName}
			</Text>
			{!isAdvanced && (
				<Text
					color="secondary"
					overflow="break-word"
					weight="light"
					size="large"
					style={{ fontSize: '2.25rem', fontFamily: 'roboto' }}
				>
					{t('cumminity_edition', 'Community Edition!')}
				</Text>
			)}
		</Container>
	);
};

export default CarbonioVersionInformation;
