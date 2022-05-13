/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Container, Padding, Text, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
// import logo from '../../assets/ninja_robo.svg';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import DomainHeader from './domain-header';
import DomainOperations from './domain-detail-operation';

const DomainDetailPanel: FC = () => {
	const [t] = useTranslation();
	const { path } = useRouteMatch();
	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			style={{ overflowY: 'hidden' }}
			background="gray5"
		>
			<DomainHeader />
			<Switch>
				{/* <Route exact path={`${path}/:domainId`}>
					<TestPanel />
				</Route> */}
				<Route exact path={`${path}/:domainId/:operation`}>
					<DomainOperations />
				</Route>
				<Route exact path={`${path}`}>
					<Container>
						<Text
							overflow="break-word"
							weight="normal"
							size="large"
							style={{ whiteSpace: 'pre-line', textAlign: 'center', 'font-family': 'roboto' }}
						>
							{/* <img src={logo} alt="logo" /> */}
						</Text>
						<Padding all="medium" width="47%">
							<Text
								color="gray1"
								overflow="break-word"
								weight="normal"
								size="large"
								width="60%"
								style={{ whiteSpace: 'pre-line', textAlign: 'center', 'font-family': 'roboto' }}
							>
								{t(
									'select_domain_or_create_new',
									'Please select a domain to manage it or click Create button to create a new one.'
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
									label={t('create_new_domain', 'Creat New Domain')}
									icon="Plus"
									color="info"
								/>
							</Text>
						</Padding>
					</Container>
				</Route>
			</Switch>
		</Container>
	);
};
export default DomainDetailPanel;
