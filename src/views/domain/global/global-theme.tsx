/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';

import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Button,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { themeConfigStore } from '../../../../types/domain';
import { modifyConfig } from '../../../services/modify-config';
import { useConfigStore } from '../../../store/config/store';
import OverlayDivision from '../../components/overlayDivision';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { isValidHexColor } from '../../utility/utils';
import { ThemeConfigs } from '../theme/theme-configs';
import { ResetTheme } from '../theme/theme-reset';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 70.35rem;
	top: 6.5rem;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

const GlobalTheme: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [globalTheme, setGlobalTheme] = useState<themeConfigStore>({});
	const configInformation = useConfigStore((state) => state.config);
	const updateAllConfig = useConfigStore((state) => state.updateAllConfig);
	const [intialThemeConfig, setIntialThemeConfig] = useState<themeConfigStore>({});
	const [isOpenResetDialog, setIsOpenResetDialog] = useState<boolean>(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [isValidated, setIsValidated] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const setValue = useCallback(
		(key: string, value: any): void => {
			setGlobalTheme((prev: any) => ({ ...prev, [key]: value }));
			setIntialThemeConfig((prev: any) => ({ ...prev, [key]: value }));
		},
		[setGlobalTheme]
	);

	const setInitalValues = useCallback(
		(obj: any): void => {
			if (obj) {
				setValue('carbonioWebUiDarkMode', obj?.carbonioWebUiDarkMode);
				setValue('carbonioWebUiLoginLogo', obj?.carbonioWebUiLoginLogo);
				setValue('carbonioWebUiDarkLoginLogo', obj?.carbonioWebUiDarkLoginLogo);
				setValue('carbonioWebUiLoginBackground', obj?.carbonioWebUiLoginBackground);
				setValue('carbonioWebUiDarkLoginBackground', obj?.carbonioWebUiDarkLoginBackground);
				setValue('carbonioWebUiAppLogo', obj?.carbonioWebUiAppLogo);
				setValue('carbonioWebUiDarkAppLogo', obj?.carbonioWebUiDarkAppLogo);
				setValue('carbonioWebUiFavicon', obj?.carbonioWebUiFavicon);
				setValue('carbonioWebUiTitle', obj?.carbonioWebUiTitle);
				setValue('carbonioWebUiDescription', obj?.carbonioWebUiDescription);
				setValue('carbonioAdminUiLoginLogo', obj?.carbonioAdminUiLoginLogo);
				setValue('carbonioAdminUiDarkLoginLogo', obj?.carbonioAdminUiDarkLoginLogo);
				setValue('carbonioAdminUiAppLogo', obj?.carbonioAdminUiAppLogo);
				setValue('carbonioAdminUiDarkAppLogo', obj?.carbonioAdminUiDarkAppLogo);
				setValue('carbonioAdminUiBackground', obj?.carbonioAdminUiBackground);
				setValue('carbonioAdminUiDarkBackground', obj?.carbonioAdminUiDarkBackground);
				setValue('carbonioAdminUiFavicon', obj?.carbonioAdminUiFavicon);
				setValue('carbonioAdminUiTitle', obj?.carbonioAdminUiTitle);
				setValue('carbonioAdminUiDescription', obj?.carbonioAdminUiDescription);
				setValue('carbonioLogoUrl', obj?.carbonioLogoUrl);
				setValue('carbonioWebUiPrimaryColor', obj?.carbonioWebUiPrimaryColor);
				setValue('carbonioWebUiDarkPrimaryColor', obj?.carbonioWebUiDarkPrimaryColor);
				setValue('carbonioWebUILoginURL', obj?.carbonioWebUILoginURL);
				setValue('carbonioWebUILogoutURL', obj?.carbonioWebUILogoutURL);
				setValue('carbonioAdminUILoginURL', obj?.carbonioAdminUILoginURL);
				setValue('carbonioAdminUILogoutURL', obj?.carbonioAdminUILogoutURL);
				setValue('carbonioAdminDocumentationUrl', obj?.carbonioAdminDocumentationUrl);
			}
		},
		[setValue]
	);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (!!configInformation && configInformation.length > 0) {
			const obj: any = {};
			configInformation.forEach((item: any) => {
				obj[item?.n] = item._content;
			});
			if (!obj.carbonioWebUiDarkMode) {
				obj.carbonioWebUiDarkMode = 'FALSE';
			}
			if (!obj.carbonioWebUiLoginLogo) {
				obj.carbonioWebUiLoginLogo = '';
			}
			if (!obj.carbonioWebUiDarkLoginLogo) {
				obj.carbonioWebUiDarkLoginLogo = '';
			}
			if (!obj.carbonioWebUiLoginBackground) {
				obj.carbonioWebUiLoginBackground = '';
			}
			if (!obj.carbonioWebUiDarkLoginBackground) {
				obj.carbonioWebUiDarkLoginBackground = '';
			}
			if (!obj.carbonioWebUiAppLogo) {
				obj.carbonioWebUiAppLogo = '';
			}
			if (!obj.carbonioWebUiDarkAppLogo) {
				obj.carbonioWebUiDarkAppLogo = '';
			}
			if (!obj.carbonioWebUiFavicon) {
				obj.carbonioWebUiFavicon = '';
			}
			if (!obj.carbonioWebUiTitle) {
				obj.carbonioWebUiTitle = '';
			}
			if (!obj.carbonioWebUiDescription) {
				obj.carbonioWebUiDescription = '';
			}
			if (!obj.carbonioAdminUiLoginLogo) {
				obj.carbonioAdminUiLoginLogo = '';
			}
			if (!obj.carbonioAdminUiDarkLoginLogo) {
				obj.carbonioAdminUiDarkLoginLogo = '';
			}
			if (!obj.carbonioAdminUiAppLogo) {
				obj.carbonioAdminUiAppLogo = '';
			}
			if (!obj.carbonioAdminUiDarkAppLogo) {
				obj.carbonioAdminUiDarkAppLogo = '';
			}
			if (!obj.carbonioAdminUiBackground) {
				obj.carbonioAdminUiBackground = '';
			}
			if (!obj.carbonioAdminUiDarkBackground) {
				obj.carbonioAdminUiDarkBackground = '';
			}
			if (!obj.carbonioAdminUiFavicon) {
				obj.carbonioAdminUiFavicon = '';
			}
			if (!obj.carbonioAdminUiTitle) {
				obj.carbonioAdminUiTitle = '';
			}
			if (!obj.carbonioAdminUiDescription) {
				obj.carbonioAdminUiDescription = '';
			}
			if (!obj.carbonioLogoUrl) {
				obj.carbonioLogoUrl = '';
			}
			if (!obj.carbonioWebUiPrimaryColor) {
				obj.carbonioWebUiPrimaryColor = '';
			}
			if (!obj.carbonioWebUiDarkPrimaryColor) {
				obj.carbonioWebUiDarkPrimaryColor = '';
			}
			if (!obj.carbonioWebUILoginURL) {
				obj.carbonioWebUILoginURL = '';
			}
			if (!obj.carbonioWebUILogoutURL) {
				obj.carbonioWebUILogoutURL = '';
			}
			if (!obj.carbonioAdminUILoginURL) {
				obj.carbonioAdminUILoginURL = '';
			}
			if (!obj.carbonioAdminUILogoutURL) {
				obj.carbonioAdminUILogoutURL = '';
			}
			if (!obj.carbonioAdminDocumentationUrl) {
				obj.carbonioAdminDocumentationUrl = '';
			}
			setInitalValues(obj);
			setIsDirty(false);
		}
	}, [configInformation, setInitalValues]);

	const updateGlobalConfig = (attributes: Array<any>): void => {
		updateAllConfig(attributes);
	};

	useEffect(() => {
		if (globalTheme && !_.isEqual(globalTheme, intialThemeConfig)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [globalTheme, intialThemeConfig]);

	const modifyConfigRequest = (attributes: Array<any>): void => {
		setIsLoading(true);
		modifyConfig(attributes)
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				updateGlobalConfig(attributes);
				setIsLoading(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setIsLoading(false);
			});
	};

	const showErrorMessage = useCallback(
		(msg) => {
			createSnackbar({
				key: 'error',
				type: 'error',
				label: msg,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar]
	);

	const onSave = (): void => {
		const attributes: any[] = [];
		if (
			globalTheme?.carbonioWebUiPrimaryColor &&
			!isValidHexColor(globalTheme?.carbonioWebUiPrimaryColor)
		) {
			showErrorMessage(
				t('label.invalid_primary_color_light_mode', 'Primary Color for Light Mode is not valid')
			);
			return;
		}
		if (
			globalTheme?.carbonioWebUiDarkPrimaryColor &&
			!isValidHexColor(globalTheme?.carbonioWebUiDarkPrimaryColor)
		) {
			showErrorMessage(
				t('label.invalid_primary_color_dark_mode', 'Primary Color for Dark Mode is not valid')
			);
			return;
		}
		const entries = Object.entries(globalTheme);
		entries.forEach(([key, value]) => {
			attributes.push({ n: key, _content: value });
		});
		modifyConfigRequest(attributes);
	};

	const onCancel = (): void => {
		setInitalValues(intialThemeConfig);
		setIsDirty(false);
	};

	const onResetTheme = useCallback(() => {
		setIsOpenResetDialog(true);
	}, []);

	const closeHandler: () => void = useCallback(() => {
		setIsOpenResetDialog(false);
	}, []);

	const onResetHandler = (): void => {
		setIsOpenResetDialog(false);
		const attributes: any[] = [];
		const domainDefaultElements: any = {
			carbonioWebUiDarkMode: 'FALSE',
			carbonioWebUiLoginLogo: '',
			carbonioWebUiDarkLoginLogo: '',
			carbonioWebUiLoginBackground: '',
			carbonioWebUiDarkLoginBackground: '',
			carbonioWebUiAppLogo: '',
			carbonioWebUiDarkAppLogo: '',
			carbonioWebUiFavicon: '',
			carbonioWebUiTitle: '',
			carbonioWebUiDescription: '',
			carbonioAdminUiLoginLogo: '',
			carbonioAdminUiDarkLoginLogo: '',
			carbonioAdminUiAppLogo: '',
			carbonioAdminUiDarkAppLogo: '',
			carbonioAdminUiBackground: '',
			carbonioAdminUiDarkBackground: '',
			carbonioAdminUiFavicon: '',
			carbonioAdminUiTitle: '',
			carbonioAdminUiDescription: '',
			carbonioLogoUrl: '',
			carbonioWebUiPrimaryColor: '',
			carbonioWebUiDarkPrimaryColor: '',
			carbonioWebUILoginURL: '',
			carbonioWebUILogoutURL: '',
			carbonioAdminUILoginURL: '',
			carbonioAdminUILogoutURL: '',
			carbonioAdminDocumentationUrl: ''
		};
		Object.keys(domainDefaultElements).forEach((ele: any) =>
			attributes.push({ n: ele, _content: domainDefaultElements[ele] })
		);
		modifyConfigRequest(attributes);
	};

	return (
		<>
			{isLoading && <OverlayDivision ovelayStyle={ovelayStyle} />}
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
				<Container
					orientation="column"
					background="gray6"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
				>
					<Row mainAlignment="flex-start" width="100%">
						<Container orientation="vertical" mainAlignment="space-around" height="56px">
							<Row orientation="horizontal" width="100%">
								<Row
									padding={{ all: 'large' }}
									mainAlignment="flex-start"
									width="50%"
									crossAlignment="flex-start"
								>
									<Text size="medium" weight="bold" color="gray0">
										{t('label.whitelabel_settings', 'Whitelabel Settings')}
									</Text>
								</Row>
								<Row
									padding={{ all: 'large' }}
									width="50%"
									mainAlignment="flex-end"
									crossAlignment="flex-end"
								>
									<Padding right="small">
										{isDirty && (
											<Button
												label={t('label.cancel', 'Cancel')}
												color="secondary"
												onClick={onCancel}
											/>
										)}
									</Padding>
									{isDirty && (
										<Button
											label={t('label.save', 'Save')}
											color="primary"
											onClick={onSave}
											disabled={!isValidated}
										/>
									)}
								</Row>
							</Row>
						</Container>
						<Divider color="gray2" />
					</Row>
					<ThemeConfigs
						isGlobalTheme
						themeConfig={globalTheme}
						setThemeConfig={setGlobalTheme}
						setIsValidated={setIsValidated}
						onResetTheme={onResetTheme}
					/>
				</Container>
				{isOpenResetDialog && (
					<ResetTheme
						title={t('label.reset_global_whitelabel_settings', 'Reset global whitelabel settings')}
						isOpenResetDialog={isOpenResetDialog}
						isRequestInProgress={isRequestInProgress}
						closeHandler={closeHandler}
						onResetHandler={onResetHandler}
					/>
				)}
				<RouteLeavingGuard when={isDirty} onSave={onSave}>
					<Text>
						{t(
							'label.unsaved_changes_line1',
							'Are you sure you want to leave this page without saving?'
						)}
					</Text>
					<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
				</RouteLeavingGuard>
			</Container>
		</>
	);
};

export default GlobalTheme;
