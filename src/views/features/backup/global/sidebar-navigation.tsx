/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';
import { Container, Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';

const LinkText = styled(Text)`
	user-select: none;
`;
const NavigationLink = styled(Row)`
	cursor: pointer;
	background: ${({ theme, isActive }): string => isActive && theme.palette.highlight.regular};
	transition: 0.2s ease-out;
	&:hover {
		background: ${({ theme, isActive }): string =>
			theme.palette[isActive ? 'highlight' : 'gray5'].hover};
	}
`;

export const SidebarNavigation = ({ links }: { links: any }): ReactElement => {
	const history = useHistory();
	const location = useLocation();

	return (
		<Container
			width="auto"
			height="100%"
			mainAlignment="flex-start"
			crossAlignment="stretch"
			background="gray5"
			style={{ width: '265px', overflow: 'auto', 'border-top': '1px solid #FFFFFF' }}
		>
			{links.map((link: any) => (
				<NavigationLink
					key={link.url}
					width="100%"
					padding={{ horizontal: 'large', vertical: 'medium' }}
					mainAlignment="flex-start"
					onClick={(): void => history.push(link.url)}
					isActive={location.pathname.startsWith(link.url)}
				>
					<Padding right="large">
						<Icon size="large" icon={link.icon} />
					</Padding>
					<LinkText size="large">{link.label}</LinkText>
				</NavigationLink>
			))}
		</Container>
	);
};
