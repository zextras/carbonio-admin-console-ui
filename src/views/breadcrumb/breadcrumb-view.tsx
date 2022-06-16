/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Container, Text, Row, Padding } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { DASHBOARD } from '../../constants';

const BreadCrumbText = styled(Text)<{ isLast: boolean }>`
	color: ${({ isLast }): string => (!isLast ? '#CCCCCC' : '#414141')};
	cursor: pointer;
`;
const BreadCrumb: FC = () => {
	const [t] = useTranslation();
	const loc = useLocation();
	const history = useHistory();
	const [splitRoutes, setSplitRoutes] = useState<any[]>([]);

	useEffect(() => {
		if (loc?.pathname) {
			const currentRoute = loc?.pathname.substring(1);
			const splitRoute = currentRoute?.split('/');
			const _storeTempRoute: any[] = [];
			splitRoute.forEach((item: any, index: number) => {
				if (index === 0) {
					_storeTempRoute.push({
						label: t('label.home', 'Home'),
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
					if (_storeTempRoute.find((sr) => sr?.label.startsWith('label.'))) {
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

	return (
		<Container height="fit" crossAlignment="baseline" mainAlignment="baseline">
			<Container
				orientation="horizontal"
				background="gray5"
				mainAlignment="flex-start"
				crossAlignment="center"
				height="44px"
				padding={{ left: 'large', right: 'large' }}
			>
				{splitRoutes.map((item: any, index) => (
					<Row key={index}>
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
									/
								</BreadCrumbText>
							</Padding>
						)}
					</Row>
				))}
			</Container>
		</Container>
	);
};

export default BreadCrumb;
