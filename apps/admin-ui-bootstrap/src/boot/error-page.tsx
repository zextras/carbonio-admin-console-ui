/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Row, Text } from '@zextras/carbonio-design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ErrorSVG from '../svg/carbonio-load-app-error.svg';

// Very silly that lint asks me to not duplicate this constant
const flexStart = 'flex-start';

export const ErrorPage = (): React.JSX.Element => {
	const [t] = useTranslation();
	return (
		<Container gap={'10px'} orientation={'vertical'} mainAlignment={'center'} background={'gray5'}>
			<Container gap={'70px'} orientation={'horizontal'} height={'fit'} mainAlignment={'center'}>
				<Container width={'fit'}>
					<ErrorSVG />
				</Container>
				<Container
					width={'fit'}
					gap={'104px'}
					orientation={'column'}
					crossAlignment={flexStart}
					mainAlignment={'space-evenly'}
					style={{ marginTop: '64px' }}
				>
					<Container width={'fit'} gap={'32px'} orientation={'column'} crossAlignment={flexStart}>
						<Text style={{ fontSize: '64px' }} weight={'medium'} color={'primary'}>
							{t('error.something_went_wrong', 'Something went wrong')}
						</Text>
						<Text
							overflow={'break-word'}
							style={{ fontSize: '40px' }}
							weight={'light'}
							color={'secondary'}
						>
							{t(
								'error.loading_page',
								'We’re sorry, but there was an error trying to load this page.'
							)}
						</Text>
					</Container>
					<Container crossAlignment={flexStart} height={'fit'}>
						<Row gap={'16px'}>
							<Text style={{ fontSize: '24px' }} weight={'regular'} color={'secondary'}>
								{t('error.contact_support', 'Contact support or try refreshing the page')}
							</Text>
							<Button
								iconPlacement={'left'}
								icon="Refresh"
								label={t('button.refresh_page', 'REFRESH')}
								type={'outlined'}
								onClick={(): void => window.location.reload()}
								color="primary"
							/>
						</Row>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};
