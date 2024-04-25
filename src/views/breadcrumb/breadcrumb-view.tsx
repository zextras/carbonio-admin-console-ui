/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';

import { Container, Text, Row, Padding, Icon } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { DASHBOARD, ZIMBRA_LAST_LOGON_TIMESTAMP } from '../../constants';
import { getAccountRequest } from '../../services/get-account';

const BreadCrumbText = styled(Text)<{ isLast: boolean }>`
	color: ${({ isLast }): string => (!isLast ? '#CCCCCC' : 'gray0')};
	cursor: pointer;
`;
const BreadCrumb: FC = () => {
	const [t] = useTranslation();
	const loc = useLocation();
	const history = useHistory();
	const userSetting = useUserSettings();
	const [splitRoutes, setSplitRoutes] = useState<any[]>([]);
	const [accountLastLogin, setAccountLastLogin] = useState<any>();

	const getAccountDetails = useCallback((id) => {
		getAccountRequest(id, '', 0).then((res: any) => {
			const lastLoginTimestamp = res?.account?.[0]?.a?.find(
				(ele: any) => ele.n === ZIMBRA_LAST_LOGON_TIMESTAMP
			);
			setAccountLastLogin(
				moment(lastLoginTimestamp?._content, 'YYYYMMDDHHmmss.SSSZ').format(
					'dddd DD MMM YYYY | h:mm a'
				)
			);
		});
	}, []);

	useEffect(() => {
		if (loc?.pathname) {
			const currentRoute = loc?.pathname.substring(1);
			const splitRoute = currentRoute?.split('/');
			const _storeTempRoute: any[] = [];
			splitRoute.forEach((item: any, index: number) => {
				if (index === 0) {
					_storeTempRoute.push({
						label: <Icon icon="HomeOutline" size="large" />,
						path: `/${item}`,
						homePath: `/${DASHBOARD}`
					});
				} else {
					const path = _storeTempRoute.map((i) => i?.path);
					_storeTempRoute.push({
						/* i18next-extract-disable-next-line */
						label: t(`label.${item}`),
						path: `${path[index - 1]}/${item}`,
						homePath: `/${DASHBOARD}`
					});
					if (
						_storeTempRoute.find(
							(sr) => typeof sr?.label === 'string' && sr?.label.startsWith('label.')
						)
					) {
						_storeTempRoute.splice(index, 1);
					}
				}
			});

			setSplitRoutes(_storeTempRoute);
		}
	}, [loc, t]);

	const navigationClick = useCallback(
		(item, index) => {
			if (index === 0) {
				history.push(item?.homePath);
			} else {
				history.push(item?.path);
			}
		},
		[history]
	);

	useEffect(() => {
		if (userSetting?.attrs?.zimbraId) {
			getAccountDetails(userSetting?.attrs?.zimbraId);
		}
	}, [getAccountDetails, userSetting?.attrs?.zimbraId]);

	return (
		<Container height="fit" crossAlignment="baseline" mainAlignment="baseline">
			<Container
				orientation="horizontal"
				background="gray5"
				crossAlignment="center"
				mainAlignment="flex-start"
				height="44px"
				padding={{ left: 'large', right: 'large' }}
			>
				{splitRoutes.map((item: any, index) => (
					<Row key={item?.path}>
						<BreadCrumbText
							size="medium"
							weight="regular"
							isLast={splitRoutes.length - 1 === index}
							onClick={(): void => {
								if (splitRoutes.length - 1 !== index) {
									navigationClick(item, index);
								}
							}}
						>
							{item?.label}
						</BreadCrumbText>

						{index !== splitRoutes.length - 1 && (
							<Padding left="extrasmall" right="extrasmall">
								<BreadCrumbText size="medium" weight="regular" isLast={false}>
									&nbsp;/&nbsp;
								</BreadCrumbText>
							</Padding>
						)}
					</Row>
				))}
				{splitRoutes.length === 1 && (
					<Container mainAlignment="center" crossAlignment="flex-start" padding={{ left: 'small' }}>
						{t('label.home', 'Home')}
					</Container>
				)}
				{accountLastLogin && (
					<Container
						mainAlignment="center"
						crossAlignment="flex-end"
						width="50%"
						padding={{ right: 'small' }}
						margin={{ left: 'auto' }}
					>
						<Text color="secondary" overflow="break-word" weight="light">
							{t('label.last_access', 'Last access')} {accountLastLogin}
						</Text>
					</Container>
				)}
			</Container>
		</Container>
	);
};

export default BreadCrumb;
