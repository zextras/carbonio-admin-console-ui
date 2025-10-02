/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';

import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Button,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/admin-ui-bootstrap';
import { cloneDeep, isEqual, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { themeConfigStore } from '../../../../types/domain';
import { TRUE, ZIMBRA_ADMIN_URN } from '../../../constants';
import { getDomainInformation } from '../../../services/domain-information-service';
import { flushCache } from '../../../services/flush-cache-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { useConfigStore } from '../../../store/config/store';
import { useDomainStore } from '../../../store/domain/store';
import OverlayDivision from '../../components/overlayDivision';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { isValidHexColor } from '../../utility/utils';
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
	const createSnackbar = useSnackbar();
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
	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	const userSetting = useUserSettings();
	useEffect(() => {
		if (userSetting?.attrs) {
			const account = userSetting?.attrs?.zimbraIsAdminAccount;
			if (account && account === TRUE) {
				setIsGlobalAdmin(true);
			}
		}
	}, [userSetting?.attrs]);

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
					severity: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				if (isGlobalAdmin) {
					flushCache('domain', 'id', body.id);
				}
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
					severity: 'error',
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
		(msg: string) => {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: msg,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar]
	);

	const onSave = (): void => {
		if (
			domainTheme?.carbonioWebUiPrimaryColor &&
			!isValidHexColor(domainTheme?.carbonioWebUiPrimaryColor)
		) {
			showErrorMessage(
				t('label.invalid_primary_color_light_mode', 'Primary Color for Light Mode is not valid')
			);
			return;
		}
		if (
			domainTheme?.carbonioWebUiDarkPrimaryColor &&
			!isValidHexColor(domainTheme?.carbonioWebUiDarkPrimaryColor)
		) {
			showErrorMessage(
				t('label.invalid_primary_color_dark_mode', 'Primary Color for Dark Mode is not valid')
			);
			return;
		}
		const body: any = {};
		const attributes: any[] = [];
		body.id = zimbraId;
		body._jsns = ZIMBRA_ADMIN_URN;
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
		body._jsns = ZIMBRA_ADMIN_URN;
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
			carbonioAdminUILogoutURL: '',
			carbonioAdminDocumentationUrl: ''
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
