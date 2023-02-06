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
import { Trans, useTranslation } from 'react-i18next';
import _ from 'lodash';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { modifyConfig } from '../../../services/modify-config';
import { useConfigStore } from '../../../store/config/store';
import { ResetTheme } from '../theme/theme-reset';
import { ThemeConfigs } from '../theme/theme-configs';
import { themeConfigStore } from '../../../../types/domain';

const GlobalTheme: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [globalTheme, setGlobalTheme] = useState<themeConfigStore>({});
	const configInformation = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const [intialThemeConfig, setIntialThemeConfig] = useState<themeConfigStore>({});
	const [isOpenResetDialog, setIsOpenResetDialog] = useState<boolean>(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	const [isValidated, setIsValidated] = useState<boolean>(true);

	const setValue = useCallback(
		(key: string, value: any): void => {
			setIntialThemeConfig((prev: any) => ({ ...prev, [key]: value }));
			setGlobalTheme((prev: any) => ({ ...prev, [key]: value }));
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
			}
		},
		[setValue]
	);

	useEffect(() => {
		if (!!configInformation && configInformation.length > 0) {
			const obj: any = {};
			configInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
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
			setInitalValues(obj);
			setIsDirty(false);
		}
	}, [configInformation, setInitalValues]);

	const updateGlobalConfig = (attributes: Array<any>): void => {
		attributes.forEach((ele: any) => {
			updateConfig(ele?.n, ele._content);
		});
	};

	useEffect(() => {
		if (globalTheme && !_.isEqual(globalTheme, intialThemeConfig)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [globalTheme, intialThemeConfig]);

	const modifyConfigRequest = (attributes: Array<any>): void => {
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
			});
	};

	const onSave = (): void => {
		const attributes: any[] = [];
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

	const closeHandler = useCallback(() => {
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
			carbonioAdminUiDescription: ''
		};
		Object.keys(domainDefaultElements).map((ele: any) =>
			attributes.push({ n: ele, _content: domainDefaultElements[ele] })
		);
		modifyConfigRequest(attributes);
	};

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="56px">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.theme', 'Theme')}
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
					themeConfig={globalTheme}
					setThemeConfig={setGlobalTheme}
					setIsValidated={setIsValidated}
					onResetTheme={onResetTheme}
				/>
			</Container>
			{isOpenResetDialog && (
				<ResetTheme
					title={t('label.reset_global_theme', 'Reset global theme')}
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
	);
};

export default GlobalTheme;
