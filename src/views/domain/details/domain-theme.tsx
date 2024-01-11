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
import { cloneDeep, isEqual, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { themeConfigStore } from '../../../../types/domain';
import { getDomainInformation } from '../../../services/domain-information-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { useConfigStore } from '../../../store/config/store';
import { useDomainStore } from '../../../store/domain/store';
import OverlayDivision from '../../components/overlayDivision';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { ThemeConfigs } from '../theme/theme-configs';
import { ResetTheme } from '../theme/theme-reset';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: calc(100% - 19rem);
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

const DomainTheme: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [domainTheme, setDomainTheme] = useState<themeConfigStore>({});
	const [globalTheme, setGlobalTheme] = useState<themeConfigStore>({});
	const configInformation = useConfigStore((state) => state.config);
	const domainInformation = useDomainStore((state) => state.domainWithoutConfig?.a);
	const setDomain = useDomainStore((state) => state.setDomain);
	const setDomainWioutConfig = useDomainStore((state) => state.setDomainWioutConfig);
	const domainName = useDomainStore((state) => state.domain?.name);
	const [intialThemeConfig, setIntialThemeConfig] = useState<themeConfigStore>({});
	const [isOpenResetDialog, setIsOpenResetDialog] = useState<boolean>(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [isValidated, setIsValidated] = useState<boolean>(true);
	const [zimbraId, setZimbraId] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// const setValue = useCallback(
	// 	(key: string, value: any, forDomain: boolean): void => {
	// 		setIntialThemeConfig((prev: any) => ({ ...prev, [key]: value }));
	// 		if (forDomain) {
	// 			setDomainTheme((prev: any) => ({ ...prev, [key]: value }));
	// 		} else {
	// 			setGlobalTheme((prev: any) => ({ ...prev, [key]: value }));
	// 		}
	// 	},
	// 	[setDomainTheme, setGlobalTheme]
	// );

	// const setInitalValues = useCallback(
	// 	(obj: any, forDomain: boolean): void => {
	// 		if (obj) {
	// 			setValue('carbonioWebUiDarkMode', obj?.carbonioWebUiDarkMode, forDomain);
	// 			setValue('carbonioWebUiLoginLogo', obj?.carbonioWebUiLoginLogo, forDomain);
	// 			setValue('carbonioWebUiDarkLoginLogo', obj?.carbonioWebUiDarkLoginLogo, forDomain);
	// 			setValue('carbonioWebUiLoginBackground', obj?.carbonioWebUiLoginBackground, forDomain);
	// 			setValue(
	// 				'carbonioWebUiDarkLoginBackground',
	// 				obj?.carbonioWebUiDarkLoginBackground,
	// 				forDomain
	// 			);
	// 			setValue('carbonioWebUiAppLogo', obj?.carbonioWebUiAppLogo, forDomain);
	// 			setValue('carbonioWebUiDarkAppLogo', obj?.carbonioWebUiDarkAppLogo, forDomain);
	// 			setValue('carbonioWebUiFavicon', obj?.carbonioWebUiFavicon, forDomain);
	// 			setValue('carbonioWebUiTitle', obj?.carbonioWebUiTitle, forDomain);
	// 			setValue('carbonioWebUiDescription', obj?.carbonioWebUiDescription, forDomain);
	// 			setValue('carbonioAdminUiLoginLogo', obj?.carbonioAdminUiLoginLogo, forDomain);
	// 			setValue('carbonioAdminUiDarkLoginLogo', obj?.carbonioAdminUiDarkLoginLogo, forDomain);
	// 			setValue('carbonioAdminUiAppLogo', obj?.carbonioAdminUiAppLogo, forDomain);
	// 			setValue('carbonioAdminUiDarkAppLogo', obj?.carbonioAdminUiDarkAppLogo, forDomain);
	// 			setValue('carbonioAdminUiBackground', obj?.carbonioAdminUiBackground, forDomain);
	// 			setValue('carbonioAdminUiDarkBackground', obj?.carbonioAdminUiDarkBackground, forDomain);
	// 			setValue('carbonioAdminUiFavicon', obj?.carbonioAdminUiFavicon, forDomain);
	// 			setValue('carbonioAdminUiTitle', obj?.carbonioAdminUiTitle, forDomain);
	// 			setValue('carbonioAdminUiDescription', obj?.carbonioAdminUiDescription, forDomain);
	// 			setValue('carbonioLogoUrl', obj?.carbonioLogoUrl, forDomain);
	// 			setValue('carbonioWebUiPrimaryColor', obj?.carbonioWebUiPrimaryColor, forDomain);
	// 			setValue('carbonioWebUiDarkPrimaryColor', obj?.carbonioWebUiDarkPrimaryColor, forDomain);
	// 			setValue('carbonioWebUILoginURL', obj?.carbonioWebUILoginURL, forDomain);
	// 			setValue('carbonioWebUILogoutURL', obj?.carbonioWebUILogoutURL, forDomain);
	// 			setValue('carbonioAdminUILoginURL', obj?.carbonioAdminUILoginURL, forDomain);
	// 			setValue('carbonioAdminUILogoutURL', obj?.carbonioAdminUILogoutURL, forDomain);
	// 		}
	// 	},
	// 	[setValue]
	// );

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
			domainInformation.forEach((item: any) => {
				obj[item?.n] = item._content;
			});
			setZimbraId(obj?.zimbraId);
			setIntialThemeConfig(cloneDeep(obj));
			setDomainTheme(cloneDeep(obj));
			setIsDirty(false);
		}
		if (!!configInformation && configInformation.length > 0) {
			const obj: any = {};
			configInformation.forEach((item: any) => {
				obj[item?.n] = item._content;
			});
			setGlobalTheme(cloneDeep(obj));
		}
	}, [configInformation, domainInformation]);

	useEffect(() => {
		if (domainTheme && !isEqual(domainTheme, intialThemeConfig)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [domainTheme, intialThemeConfig]);

	const modifyDomainRequest = (body: any): void => {
		setIsLoading(true);
		modifyDomain(body)
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const domain: any = data?.domain[0];
				if (domain) {
					setDomain(domain);
					getDomainInformation(domain.id, 0).then((res) => {
						const domainData = res?.domain[0];
						if (domainData) {
							setDomainWioutConfig(domainData);
						}
					});
				}
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

	const onSave = (): void => {
		const body: any = {};
		const attributes: any[] = [];
		body.id = zimbraId;
		body._jsns = 'urn:zimbraAdmin';
		const modifiedKeys: any = reduce(
			domainTheme,
			function (result, value, key): any {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				return isEqual(value, intialThemeConfig[key]) ? result : [...result, key];
			},
			[]
		);
		modifiedKeys.forEach((ele: any) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			attributes.push({ n: ele, _content: domainTheme[ele] });
		});
		body.a = attributes;
		modifyDomainRequest(body);
	};

	const onCancel = (): void => {
		setDomainTheme(cloneDeep(intialThemeConfig));
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
		const body: any = {};
		const attributes: any[] = [];
		body.id = zimbraId;
		body._jsns = 'urn:zimbraAdmin';
		const domainDefaultElements: any = {
			carbonioWebUiDarkMode: '',
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
			carbonioAdminUILogoutURL: ''
		};
		Object.keys(domainDefaultElements).forEach((ele: any) =>
			attributes.push({ n: ele, _content: domainDefaultElements[ele] })
		);
		body.a = attributes;
		modifyDomainRequest(body);
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
						themeConfig={domainTheme}
						globalTheme={globalTheme}
						setThemeConfig={setDomainTheme}
						setIsValidated={setIsValidated}
						onResetTheme={onResetTheme}
					/>
				</Container>
				{isOpenResetDialog && (
					<ResetTheme
						title={t(
							'label.reset_domain_whitelabel_settings',
							'Reset {{name}} whitelabel settings',
							{
								name: domainName
							}
						)}
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

export default DomainTheme;
