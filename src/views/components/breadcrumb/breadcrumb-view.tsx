/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Container, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const BreadCrumb: FC = () => {
	const [t] = useTranslation();
	return (
		<Container height="fit" crossAlignment="baseline" mainAlignment="baseline">
			<Container
				background="gray5"
				crossAlignment="flex-start"
				mainAlignment="center"
				height="44px"
				padding={{ left: 'large', right: 'large' }}
			>
				<Text size="medium" weight="regular" color="gray0">
					{t('home', 'Home')}
				</Text>
			</Container>
		</Container>
	);
};

export default BreadCrumb;
