/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Container, Padding, Text, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import logo from '../../assets/ninja_robo.svg';
import DomainOperations from './domain-detail-operation';
import { CREATE_NEW_DOMAIN_ROUTE_ID } from '../../constants';
import CreateDomain from './create-new-domain';

const DomainDetailPanel: FC = () => {
	const [t] = useTranslation();
	const { path } = useRouteMatch();

	const createNewDomain = (): void => {
		replaceHistory(`/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
	};

	return (
		<Container
			orientation="column"
			crossAlignment="center"
			mainAlignment="flex-start"
			style={{ overflowY: 'hidden' }}
			background="gray6"
		>
			<Switch>
				<Route exact path={`${path}/:domainId/:operation`}>
					<DomainOperations />
				</Route>
				<Route exact path={`${path}/${CREATE_NEW_DOMAIN_ROUTE_ID}`}>
					<CreateDomain />
				</Route>
				<Route exact path={`${path}`}>
					<Container>
						<Text
							overflow="break-word"
							weight="normal"
							size="large"
							style={{ whiteSpace: 'pre-line', textAlign: 'center', fontFamily: 'roboto' }}
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
									'select_domain_or_create_new',
									'Please select a domain from the menu on the left or click on the Create Button to create a new one.'
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
									label={t('label.create_new_domain', 'Creat New Domain')}
									icon="Plus"
									color="info"
									onClick={createNewDomain}
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
