/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Container, Padding, Text, Button } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import logo from '../../assets/ninja_robo.svg';
import CosOperations from './cos-detail-operation';
import { CREATE_NEW_COS_ROUTE_ID } from '../../constants';
import CreateCos from './create-new-cos';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const CosDetailPanel: FC = () => {
	const [t] = useTranslation();
	const { path } = useRouteMatch();

	const createNewCos = (): void => {
		replaceHistory(`/${CREATE_NEW_COS_ROUTE_ID}`);
	};

	return (
		<>
			<Container
				orientation="column"
				crossAlignment="center"
				mainAlignment="flex-start"
				style={{ overflowY: 'hidden' }}
				background="gray6"
			>
				<Switch>
					<Route exact path={`${path}/:cosId/:operation`}>
						<CosOperations />
					</Route>
					<Route exact path={`${path}/${CREATE_NEW_COS_ROUTE_ID}`}>
						<CreateCos />
					</Route>
					<Route exact path={`${path}`}>
						<RelativeContainer
							orientation="column"
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							style={{ overflowY: 'auto', marginLeft: '16px' }}
							background="white"
						>
							<Container>
								<Text
									overflow="break-word"
									weight="normal"
									size="large"
									style={{ whiteSpace: 'pre-line', textAlign: 'center', 'font-family': 'roboto' }}
								>
									<img src={logo} alt="logo" />
								</Text>
								<Padding all="medium" width="47%">
									<Text
										color="gray1"
										overflow="break-word"
										weight="normal"
										size="large"
										width="60%"
										style={{ whiteSpace: 'pre-line', textAlign: 'center', fontFamily: 'roboto' }}
									>
										{t(
											'select_cos_or_create_new_cos',
											'Please select a Class of Service to manage it or click Create button to create a new one.'
										)}
									</Text>
								</Padding>
								<Padding all="medium">
									<Text
										size="small"
										overflow="break-word"
										style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
									>
										<Button
											type="outlined"
											label={t('create_new_cos', 'Creat New Cos')}
											icon="Plus"
											color="info"
											onClick={createNewCos}
										/>
									</Text>
								</Padding>
							</Container>
						</RelativeContainer>
					</Route>
				</Switch>
			</Container>
		</>
	);
};

export default CosDetailPanel;
