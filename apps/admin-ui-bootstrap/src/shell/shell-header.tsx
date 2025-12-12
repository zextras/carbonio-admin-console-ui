/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Button,
	Container,
	Padding,
	Responsive,
	useScreenMode} from '@zextras/carbonio-design-system';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';

import { AppRoute } from '../../types';
import { CARBONIO_LOGO_URL } from '../constants';
import { useLoginConfigStore } from '../store/login/store';
import Logo from '../svg/carbonio-admin-panel.svg';
import { CreationButton } from './creation-button';

const CustomImg = styled.img`
	height: 2rem;
`;

const ShellHeader: FC<{
	activeRoute: AppRoute;
	mobileNavIsOpen: boolean;
	onMobileMenuClick: () => void;
	children?: React.ReactNode;
}> = ({ activeRoute, mobileNavIsOpen, onMobileMenuClick, children }) => {
	const screenMode = useScreenMode();
	const { carbonioAdminUiAppLogo, carbonioAdminUiDarkAppLogo, carbonioLogoURL } =
		useLoginConfigStore();
	const logoSrc = useMemo(() => {
		return carbonioAdminUiAppLogo || carbonioAdminUiDarkAppLogo;
	}, [carbonioAdminUiDarkAppLogo, carbonioAdminUiAppLogo]);

	const logoUrl = useMemo(() => carbonioLogoURL || CARBONIO_LOGO_URL, [carbonioLogoURL]);

	return (
		<Container
			orientation="horizontal"
			background="gray3"
			width="fill"
			height="60px"
			minHeight="60px"
			maxHeight="60px"
			mainAlignment="space-between"
			padding={{
				left: screenMode === 'desktop' ? 'large' : 'small',
				right: screenMode === 'desktop' ? 'large' : 'extrasmall',
				vertical: 'small'
			}}
		>
			<Responsive mode="mobile">
				<Padding right="small">
					<Button
						type="ghost"
						color={'text'}
						icon={mobileNavIsOpen ? 'Close' : 'Menu'}
						onClick={onMobileMenuClick}
					/>
				</Padding>
			</Responsive>
			<Container
				orientation="horizontal"
				width="75%"
				maxWidth="75%"
				mainAlignment="space-between"
				crossAlignment="center"
			>
				<Container
					orientation="horizontal"
					mainAlignment="flex-start"
					crossAlignment="center"
					width="auto"
				>
					<Container width="auto" height={32} crossAlignment="flex-start">
						<a target="_blank" href={logoUrl} rel="noreferrer">
							{logoSrc ? <CustomImg src={logoSrc} /> : <Logo height="2rem" />}
						</a>
					</Container>

					<Padding horizontal="extralarge">
						<CreationButton activeRoute={activeRoute} />
					</Padding>
				</Container>
			</Container>
			<Container orientation="horizontal" width="25%" mainAlignment="flex-end">
				<Responsive mode="desktop">{children}</Responsive>
				<Responsive mode="mobile">
					<Container
						orientation="horizontal"
						mainAlignment="flex-end"
						padding={{ right: 'extrasmall' }}
					></Container>
				</Responsive>
			</Container>
		</Container>
	);
};
export default ShellHeader;
