/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */


import {
	Container,
	Padding,
	Responsive,
	useScreenMode,
	Button
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';

import { AppRoute, ConfigAttributesState } from '../../types';
import { CARBONIO_LOGO_URL } from '../constants';
import { useDarkMode } from '../dark-mode/use-dark-mode';
import { getDomainInformation } from '../network/get-domain-information';
import { SearchBar } from '../search/search-bar';
import { useUserAccount } from '../store/account';
import { useAppStore } from '../store/app';
import { useConfigStore } from '../store/config';
import { useLoginConfigStore } from '../store/login/store';
import Logo from '../svg/carbonio-admin-panel.svg';

import { CreationButton } from './creation-button';

const CustomImg = styled.img`
	height: 2rem;
`;

const slideInRight = keyframes`
  0% {
    transform: translateX(50%) scaleX(0);
  }
  100% {
    transform: translateX(0%)  scaleX(1);
  }
`;

const FeedbackDiv = styled.div`
	&.feedback {
		position: fixed;
		right: 2rem;
		bottom: 1rem;
		z-index: 3;
	}
`;

const FeedbackText = styled.div`
	padding: 0 0.5rem;
	display: none;
	font-size: 14px;
	animation: ${slideInRight} 0.1s;

	${FeedbackDiv}:hover & {
		display: inline;
	}
`;

const FeedbackContainer = styled.a`
	cursor: pointer;
	display: flex;
	flex-direction: row;
	align-items: center;
	text-decoration: none;
	color: #ffffff;
	background: #2b73d2;
	padding: 0.8rem;
	border-radius: 50px;
	background-color: #2b73d2;
	z-index: 4;
`;

const FloatingActionButton = styled(Button)`
	position: fixed;
	bottom: 2rem;
	right: 2rem;
	z-index: 4;
	width: ${(props: any): any => (props.isHelpDocButtonExpanded ? '13rem' : '2.2rem')};
	height: 2.2rem;
	transition: all 0.3s ease-in-out;
	border-width: 0.125rem;
	text-align: right;
`;

const ShellHeader: FC<{
	activeRoute: AppRoute;
	mobileNavIsOpen: boolean;
	onMobileMenuClick: () => void;
	children?: React.ReactNode;
}> = ({ activeRoute, mobileNavIsOpen, onMobileMenuClick, children }) => {
	const screenMode = useScreenMode();
	const [t] = useTranslation();
	const searchEnabled = useAppStore((s) => s.views.search.length > 0);
	const userName = useUserAccount()?.name;
	const { carbonioAdminUiAppLogo, carbonioAdminUiDarkAppLogo, carbonioLogoURL } =
		useLoginConfigStore();
	const { darkModeEnabled, darkReaderStatus } = useDarkMode();
	const [isHelpDocButtonExpanded, setIsHelpDocButtonExpanded] = useState(false);

	const updateDomainDetails = useCallback(async (name: string): Promise<void> => {
		const data = await getDomainInformation('name', name);
		const domain = data?.domain[0];
		if (domain) {
			useConfigStore.setState((prev: ConfigAttributesState) => ({
				...prev,
				domainInformation: { a: domain.a, id: domain.id, name: domain.name }
			}));
		}
	}, []);

	// Hide for now because https://app.useberry.com/embed/embed-script.js not working */
	// useEffect(() => {
	// 	const storedValue = localStorage.getItem('feedback');
	// 	if (storedValue === 'true') {
	// 		setFeedbackVisible(false);
	// 	}
	// 	const carbonioAllowFeedback = configs.find((item: any) => item?.n === 'carbonioAllowFeedback');
	// 	if (carbonioAllowFeedback) {
	// 		setFeedbackConfig(carbonioAllowFeedback?._content);
	// 	}
	// 	const script = document.createElement('script');
	// 	script.type = 'text/javascript';
	// 	script.src = 'https://app.useberry.com/embed/embed-script.js';
	// 	script.async = true;
	// 	document.body.appendChild(script);

	// 	return () => {
	// 		document.body.removeChild(script);
	// 	};
	// }, [configs]);

	useEffect(() => {
		if (userName) {
			updateDomainDetails(userName?.split('@')[1]);
		}
	}, [updateDomainDetails, userName]);

	const logoSrc = useMemo(() => {
		if (darkModeEnabled) {
			return carbonioAdminUiDarkAppLogo || carbonioAdminUiAppLogo;
		}
		return carbonioAdminUiAppLogo || carbonioAdminUiDarkAppLogo;
	}, [carbonioAdminUiDarkAppLogo, carbonioAdminUiAppLogo, darkModeEnabled]);

	const logoUrl = useMemo(() => carbonioLogoURL || CARBONIO_LOGO_URL, [carbonioLogoURL]);
	// Hide for now because https://app.useberry.com/embed/embed-script.js not working */
	// const removeFeedback = (): void => {
	// 	setFeedbackVisible(false);
	// 	saveToLocalStorage();
	// };

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
						{darkReaderStatus && (
							<a target="_blank" href={logoUrl} rel="noreferrer">
								{logoSrc ? <CustomImg src={logoSrc} /> : <Logo height="2rem" />}
							</a>
						)}
					</Container>

					<Padding horizontal="extralarge">
						<CreationButton activeRoute={activeRoute} />
					</Padding>
				</Container>

				<Responsive mode="desktop">
					{searchEnabled && (
						<SearchBar
							activeRoute={activeRoute}
							// primaryAction={primaryAction}
							// secondaryActions={secondaryActions}
						/>
					)}
				</Responsive>
			</Container>
			<Container orientation="horizontal" width="25%" mainAlignment="flex-end">
				<Responsive mode="desktop">{children}</Responsive>
				<Responsive mode="mobile">
					<Container
						orientation="horizontal"
						mainAlignment="flex-end"
						padding={{ right: 'extrasmall' }}
					>
						{/* <Dropdown items={secondaryActions} placement="bottom-start">
							<IconButton icon="Plus" />
						</Dropdown> */}
					</Container>
				</Responsive>
			</Container>
			{/* Hide for now because https://app.useberry.com/embed/embed-script.js not working */}
			{/* {feedbackVisible && feedbackConfig === 'TRUE' && (
				<FeedbackDiv className="feedback" onClick={removeFeedback}>
					<FeedbackContainer
						data-useberry-trigger="true"
						data-useberry-mode="live"
						data-useberry-test-id="mmuYb4FfdgPlom"
					>
						<FeedbackText>Tell us how are we doing</FeedbackText>
						<Icon size="medium" color="gray6" icon="SmileOutline" />
					</FeedbackContainer>
					<Icon
						style={{
							position: 'fixed',
							right: '1rem',
							bottom: '2.7rem',
							zIndex: 3,
							backgroundColor: 'transparent',
							color: '#414141',
							borderRadius: '50%',
							cursor: 'pointer',
							border: 'none'
						}}
						icon="Close"
						onClick={removeFeedback}
					/>
				</FeedbackDiv>
			)} */}
		</Container>
	);
};
export default ShellHeader;
