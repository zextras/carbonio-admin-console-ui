/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useState, useContext } from 'react';

import {
	Row,
	Responsive,
	ModalManager,
	SnackbarManager,
	Modal,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AppViewContainer from './app-view-container';
import AppBoardWindow from './boards/app-board-window';
import ShellContextProvider from './shell-context-provider';
import ShellHeader from './shell-header';
import ShellNavigationBar from './shell-navigation-bar';
import { ThemeCallbacksContext } from '../boot/theme-provider';
import { useDarkReaderResultValue } from '../dark-mode/use-dark-reader-result-value';
import { useCurrentRoute } from '../history/hooks';
import { ShellUtilityBar, ShellUtilityPanel } from '../utility-bar';

const Background = styled.div`
	background: ${({ theme }) => theme.palette.gray6.regular};
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 100%;
	max-height: 100%;
	width: 100%;
	min-width: 100%;
	max-width: 100%;
`;

function DarkReaderListener() {
	const { setDarkReaderState } = useContext(ThemeCallbacksContext);
	const darkReaderResultValue = useDarkReaderResultValue();
	useEffect(() => {
		if (darkReaderResultValue) {
			setDarkReaderState(darkReaderResultValue);
		}
	}, [darkReaderResultValue, setDarkReaderState]);
	return null;
}

export function Shell() {
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [t] = useTranslation();
	const activeRoute = useCurrentRoute();
	useEffect(() => {
		if (window.innerWidth < 767) {
			setIsModalOpen(true);
		}
	}, []);
	return (
		<Background>
			<Modal
				open={isModalOpen}
				onConfirm={() => setIsModalOpen(false)}
				confirmLabel={t('message.snackbar.okay_got_it', 'Okay, got it')}
				onClose={() => setIsModalOpen(false)}
			>
				<Text overflow="break-word">
					{t(
						'message.snackbar.our_interface_does_not_support_tablets_and_smartphones',
						"Our interface does not support tablets and smartphones, which may lead to visualization issues. Please use a desktop or laptop for optimal performance. We're working on mobile compatibility for the future. Thank you."
					)}
				</Text>
			</Modal>
			<DarkReaderListener />
			{/* <MainAppRerouter /> */}
			<ShellHeader
				activeRoute={activeRoute}
				mobileNavIsOpen={mobileNavOpen}
				onMobileMenuClick={() => setMobileNavOpen(!mobileNavOpen)}
			>
				<ShellUtilityBar />
			</ShellHeader>
			<Row crossAlignment="unset" style={{ position: 'relative', flexGrow: '1' }}>
				<ShellNavigationBar activeRoute={activeRoute} mobileNavIsOpen={mobileNavOpen} />
				<AppViewContainer activeRoute={activeRoute} />
				<ShellUtilityPanel />
			</Row>
			<Responsive mode="desktop">
				<AppBoardWindow />
			</Responsive>
		</Background>
	);
}

export default function ShellView() {
	return (
		<ShellContextProvider>
			<ModalManager>
				<SnackbarManager>
					<Shell />
				</SnackbarManager>
			</ModalManager>
		</ShellContextProvider>
	);
}
