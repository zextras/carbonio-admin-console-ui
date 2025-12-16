/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceHistory, useDomainStore } from '@zextras/admin-ui-bootstrap';
import { Button, Container, Icon,Padding, Row, Text } from '@zextras/carbonio-design-system';
import { cloneDeep, find } from 'lodash-es';
import { FC, useCallback, useEffect,useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Route, Switch, useLocation,useRouteMatch } from 'react-router-dom';

import logo from '../../assets/ninja_robo.svg';
import { CREATE_NEW_DOMAIN_ROUTE_ID, GLOBAL_ROUTE } from '../../constants';
import { useLocalStorage } from '../utility/utils';
import CreateDomain from './create-new-domain';
import DomainOperations from './domain-detail-operation';
import GlobalDetailPanel from './global/global-detail-panel';
import GlobalOperations from './global-operation';

const DomainDetailPanel: FC = () => {
	const [t] = useTranslation();
	const { path } = useRouteMatch();
	const location = useLocation();
	const domain = useDomainStore((state) => state.domain);
	const closeDomainBanner = useDomainStore((state) => state.closeDomainBanner);
	const setCloseDomainBanner = useDomainStore((state) => state.setCloseDomainBanner);
	const [domainLocalValue, setDomainLocalValue] = useLocalStorage('close_domain_never_show', {});

	const [showDomainClose, setShowDomainClose] = useState<boolean>(
		domain.name ? !domainLocalValue[domain.name] : true
	);

	const createNewDomain = (): void => {
		replaceHistory(`/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
	};
	const isDomainClosed = useMemo(() => {
		const domainStatus = find(domain?.a, { n: 'zimbraDomainStatus' });
		return !!(
			domainStatus?._content === 'closed' &&
			domain.name &&
			!domainLocalValue[domain.name] &&
			!location.pathname.includes('domains/global') &&
			closeDomainBanner !== domain.name
		);
	}, [closeDomainBanner, domain?.a, domain.name, domainLocalValue, location.pathname]);
	const setCloseDomainNameBanner = useCallback(
		(domainName: string) => {
			setCloseDomainBanner(domainName);
		},
		[setCloseDomainBanner]
	);
	useEffect(() => {
		if (domain?.name !== closeDomainBanner) {
			setCloseDomainNameBanner('');
		}
	}, [closeDomainBanner, domain, setCloseDomainNameBanner]);
	return (
		<Container
			orientation="column"
			crossAlignment="center"
			mainAlignment="flex-start"
			style={{ overflowY: 'hidden' }}
			background="gray6"
		>
			{isDomainClosed && showDomainClose ? (
				<Row background="warning" width="100%" padding="small" mainAlignment="space-between">
					<Row mainAlignment="flex-start">
						<Icon icon="CloseCircleOutline" size="large" color="white" />
						<Padding left="large">
							<Trans
								i18nKey="label.this_domain_is_closed"
								defaults="<text>The domain  <bold> {{domain}} </bold>  is closed</text>"
								components={{ bold: <strong />, text: <Text color="white" /> }}
								values={{
									domain: domain?.name ?? ''
								}}
							/>
						</Padding>
					</Row>

					<Row mainAlignment="flex-end">
						<Padding right="large">
							<Button
								type="outlined"
								label={t('label.never_show_this_again', 'NEVER SHOW THIS AGAIN')}
								color="white"
								backgroundColor="warning"
								onClick={(): void => {
									setShowDomainClose(false);
									const domainLocal = cloneDeep(domainLocalValue);
									if (domain?.name) {
										domainLocal[domain.name] = true;
									}
									setDomainLocalValue(domainLocal);
								}}
							/>
						</Padding>
						<Icon
							icon="Close"
							size="large"
							color="white"
							style={{ cursor: 'pointer' }}
							onClick={(): void => {
								setShowDomainClose(false);
								setCloseDomainNameBanner(domain?.name || '');
							}}
						/>
					</Row>
				</Row>
			) : (
				<></>
			)}
			<Switch>
				<Route exact path={`${path}/${GLOBAL_ROUTE}`}>
					<GlobalDetailPanel />
				</Route>
				<Route exact path={`${path}/${GLOBAL_ROUTE}/:operation`}>
					<GlobalOperations />
				</Route>
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
							weight="regular"
							size="large"
							style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
						>
							<img src={logo} alt="logo" />
						</Text>
						<Padding all="medium" width="47%">
							<Text
								color="gray1"
								overflow="break-word"
								weight="regular"
								size="large"
								style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
							>
								{t(
									'select_domain_or_create_new',
									'Please select a domain from the menu on the left or click on the "Create" button to create a new one.'
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
									color="primary"
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
