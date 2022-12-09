/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	FC,
	ReactElement,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react';
import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Input,
	Button,
	SnackbarManagerContext,
	Select,
	Icon,
	Modal,
	DefaultTabBarItem,
	TabBar
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';
import { isValidHttpsUrl } from '../../utility/utils';
import { modifyConfig } from '../../../services/modify-config';
import { useConfigStore } from '../../../store/config/store';

const HttpsErrorMessage: FC = () => {
	const [t] = useTranslation();
	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
			<Padding top="small">
				<Text size="extrasmall" weight="regular" color="error">
					{t('label.use_https_protocol_message', 'You need to use the HTTPS protocol')}
				</Text>
			</Padding>
		</Container>
	);
};

const ReusedDefaultTabBar: FC<{
	item: any;
	index: any;
	selected: any;
	onClick: any;
}> = ({ item, index, selected, onClick }): ReactElement => (
	<DefaultTabBarItem
		item={item}
		index={index}
		selected={selected}
		onClick={onClick}
		orientation="horizontal"
	>
		<Row padding="small">
			<Text size="small" color={selected ? 'primary' : 'gray'}>
				{item.label}
			</Text>
		</Row>
	</DefaultTabBarItem>
);

const GlobalTheme: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [globalTheme, setGlobalTheme] = useState<any>({
		carbonioWebUiDarkMode: false,
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
	});
	const configInformation = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const [globalData, setGlobalData]: any = useState({});
	const [isOpenResetDialog, setIsOpenResetDialog] = useState<boolean>(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	const [isValidCarbonioWebUiLoginLogo, setIsValidCarbonioWebUiLoginLogo] = useState<boolean>(true);
	const [isValidCarbonioWebUiDarkLoginLogo, setIsValidCarbonioWebUiDarkLoginLogo] =
		useState<boolean>(true);
	const [isValidCarbonioWebUiLoginBackground, setIsValidCarbonioWebUiLoginBackground] =
		useState<boolean>(true);
	const [isValidCarbonioWebUiDarkLoginBackground, setIsValidCarbonioWebUiDarkLoginBackground] =
		useState<boolean>(true);
	const [isValidCarbonioWebUiAppLogo, setIsValidCarbonioWebUiAppLogo] = useState<boolean>(true);
	const [isValidCarbonioWebUiDarkAppLogo, setIsValidCarbonioWebUiDarkAppLogo] =
		useState<boolean>(true);
	const [isValidCarbonioWebUiFavicon, setIsValidCarbonioWebUiFavicon] = useState<boolean>(true);

	const [isValidCarbonioAdminUiLoginLogo, setIsValidCarbonioAdminUiLoginLogo] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiDarkLoginLogo, setIsValidCarbonioAdminUiDarkLoginLogo] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiAppLogo, setIsValidCarbonioAdminUiAppLogo] = useState<boolean>(true);
	const [isValidCarbonioAdminUiDarkAppLogo, setIsValidCarbonioAdminUiDarkAppLogo] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiBackground, setIsValidCarbonioAdminUiBackground] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiDarkBackground, setIsValidCarbonioAdminUiDarkBackground] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiFavicon, setIsValidCarbonioAdminUiFavicon] = useState<boolean>(true);

	const [isValidated, setIsValidated] = useState<boolean>(true);

	const [change, setChange] = useState('end_user');
	const [click, setClick] = useState('');

	const items = [
		{
			id: 'end_user',
			label: t('label.end_user_title', 'END USER'),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'admin_panel',
			label: t('label.admin_panel_title', 'ADMIN PANEL'),
			CustomComponent: ReusedDefaultTabBar
		}
	];

	const THEME_MODE = useMemo(
		() => [
			{ label: `${t('label.disabled', 'Disabled')}`, value: 'FALSE' },
			{ label: `${t('label.enabled', 'Enabled')}`, value: 'TRUE' }
		],
		[t]
	);
	const onThemeModeChange = useCallback(
		(v: string): void => {
			const prevValue = globalTheme?.carbonioWebUiDarkMode;
			setGlobalTheme((prev: any) => ({ ...prev, carbonioWebUiDarkMode: v }));
			if (prevValue !== v) {
				setIsDirty(true);
			}
		},
		[setGlobalTheme, globalTheme?.carbonioWebUiDarkMode]
	);

	const setValue = useCallback(
		(key: string, value: any): void => {
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
			setGlobalData(obj);
			setIsDirty(false);
		}
	}, [configInformation, setInitalValues]);

	const onChangeGlobalThemeDetail = useCallback(
		(e) => {
			setGlobalTheme((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
			setIsDirty(true);
		},
		[setGlobalTheme]
	);

	const updateGlobalConfig = (attributes: Array<any>): void => {
		attributes.forEach((ele: any) => {
			updateConfig(ele?.n, ele._content);
		});
	};

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
		Object.keys(globalTheme).map((ele: any) =>
			attributes.push({ n: ele, _content: globalTheme[ele] })
		);
		modifyConfigRequest(attributes);
	};

	const onCancel = (): void => {
		setInitalValues(globalData);
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

	useEffect(() => {
		if (
			isValidCarbonioAdminUiAppLogo &&
			isValidCarbonioAdminUiBackground &&
			isValidCarbonioAdminUiDarkAppLogo &&
			isValidCarbonioAdminUiDarkBackground &&
			isValidCarbonioAdminUiDarkLoginLogo &&
			isValidCarbonioAdminUiFavicon &&
			isValidCarbonioAdminUiLoginLogo &&
			isValidCarbonioWebUiAppLogo &&
			isValidCarbonioWebUiDarkAppLogo &&
			isValidCarbonioWebUiDarkLoginBackground &&
			isValidCarbonioWebUiDarkLoginLogo &&
			isValidCarbonioWebUiFavicon &&
			isValidCarbonioWebUiLoginBackground &&
			isValidCarbonioWebUiLoginLogo
		) {
			setIsValidated(true);
		} else {
			setIsValidated(false);
		}
	}, [
		isValidCarbonioAdminUiAppLogo,
		isValidCarbonioAdminUiBackground,
		isValidCarbonioAdminUiDarkAppLogo,
		isValidCarbonioAdminUiDarkBackground,
		isValidCarbonioAdminUiDarkLoginLogo,
		isValidCarbonioAdminUiFavicon,
		isValidCarbonioAdminUiLoginLogo,
		isValidCarbonioWebUiAppLogo,
		isValidCarbonioWebUiDarkAppLogo,
		isValidCarbonioWebUiDarkLoginBackground,
		isValidCarbonioWebUiDarkLoginLogo,
		isValidCarbonioWebUiFavicon,
		isValidCarbonioWebUiLoginBackground,
		isValidCarbonioWebUiLoginLogo
	]);

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
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					style={{ overflow: 'auto' }}
					width="100%"
					height="calc(100vh - 150px)"
				>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'small' }}
					>
						<Container
							padding={{ all: 'small' }}
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
						>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<Text size="small" color="gray0" weight="bold">
										{t('label.apperance', 'Apperance')}
									</Text>
								</Padding>
							</ListRow>
							<ListRow>
								<Select
									background="gray5"
									label={t('cos.dark_mode', 'Dark Mode')}
									showCheckbox={false}
									items={THEME_MODE}
									selection={
										globalTheme?.carbonioWebUiDarkMode === ''
											? THEME_MODE[-1]
											: THEME_MODE.find(
													// eslint-disable-next-line max-len
													(item: any) => item.value === globalTheme?.carbonioWebUiDarkMode
											  )
									}
									onChange={onThemeModeChange}
								/>
							</ListRow>
							<Row
								width="100%"
								mainAlignment="center"
								crossAlignment="center"
								padding={{ top: 'large' }}
							>
								<TabBar
									items={items}
									defaultSelected="end_user"
									onChange={setChange}
									onItemClick={setClick}
									width={300}
								/>
							</Row>
							<Row width="100%">
								<Divider color="gray2" />
							</Row>
							<Container crossAlignment="flex-start" padding={{ all: '0px' }}>
								{change === 'end_user' && (
									<>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.end_user_webapp', 'End User Webapp')}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.end_user_theme_description',
														'In this section you can customize the WebApp with your company logo and image.'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t(
														'label.title_and_copyrights_information',
														'Title & Copyrights Information'
													)}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.title', 'Title')}
													background="gray5"
													value={globalTheme.carbonioWebUiTitle}
													inputName="carbonioWebUiTitle"
													onChange={onChangeGlobalThemeDetail}
												/>
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.title_theme_note',
														'The title is the name that will appear on the browser tab'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.copyrights_information', 'Copyrights information')}
													background="gray5"
													value={globalTheme.carbonioWebUiDescription}
													inputName="carbonioWebUiDescription"
													onChange={onChangeGlobalThemeDetail}
												/>
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.copyrights_theme_note',
														'The copyrights information will appear on the login box footer'
													)}
												</Text>
											</Container>
										</ListRow>
										<Container padding={{ top: 'small' }}>
											<Divider color="gray2" />
										</Container>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.logo', 'Logo')}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.logo_description',
														'Paste the URL of the logo for the login page. Use SVG or PNG file with transparent background, dimension 240x120 pixels.'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.light_mode"
														defaults="<bold>Light</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.logo_for_login_page', 'Logo for Login Page')}
												</Text>
											</Container>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.dark_mode"
														defaults="<bold>Dark</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.logo_for_login_page', 'Logo for Login Page')}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.logo_path', 'Logo Path')}
													background="gray5"
													value={globalTheme.carbonioWebUiLoginLogo}
													inputName="carbonioWebUiLoginLogo"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioWebUiLoginLogo(isValid);
														} else {
															setIsValidCarbonioWebUiLoginLogo(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioWebUiLoginLogo}
												/>
												{!isValidCarbonioWebUiLoginLogo && <HttpsErrorMessage />}
											</Container>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.logo_path', 'Logo Path')}
													background="gray5"
													value={globalTheme.carbonioWebUiDarkLoginLogo}
													inputName="carbonioWebUiDarkLoginLogo"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioWebUiDarkLoginLogo(isValid);
														} else {
															setIsValidCarbonioWebUiDarkLoginLogo(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioWebUiDarkLoginLogo}
												/>
												{!isValidCarbonioWebUiDarkLoginLogo && <HttpsErrorMessage />}
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.light_mode"
														defaults="<bold>Light</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.logo_for_webapp', 'Logo for WebApp')}
												</Text>
											</Container>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.dark_mode"
														defaults="<bold>Dark</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.logo_for_webapp', 'Logo for WebApp')}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.logo_path', 'Logo Path')}
													background="gray5"
													value={globalTheme.carbonioWebUiAppLogo}
													inputName="carbonioWebUiAppLogo"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioWebUiAppLogo(isValid);
														} else {
															setIsValidCarbonioWebUiAppLogo(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioWebUiAppLogo}
												/>
												{!isValidCarbonioWebUiAppLogo && <HttpsErrorMessage />}
											</Container>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.logo_path', 'Logo Path')}
													background="gray5"
													value={globalTheme.carbonioWebUiDarkAppLogo}
													inputName="carbonioWebUiDarkAppLogo"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioWebUiDarkAppLogo(isValid);
														} else {
															setIsValidCarbonioWebUiDarkAppLogo(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioWebUiDarkAppLogo}
												/>
												{!isValidCarbonioWebUiDarkAppLogo && <HttpsErrorMessage />}
											</Container>
										</ListRow>
										<Container padding={{ top: 'small' }}>
											<Divider color="gray2" />
										</Container>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.favicon', 'Favicon')}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.favicon_description',
														'Paste the URL of the favicon for the login page. Use a ICO file, dimension 16x16 pixels.'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.favicon_path', 'Favicon Path')}
													background="gray5"
													value={globalTheme.carbonioWebUiFavicon}
													inputName="carbonioWebUiFavicon"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioWebUiFavicon(isValid);
														} else {
															setIsValidCarbonioWebUiFavicon(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioWebUiFavicon}
												/>
												{!isValidCarbonioWebUiFavicon && <HttpsErrorMessage />}
											</Container>
										</ListRow>
										<Container padding={{ top: 'small' }}>
											<Divider color="gray2" />
										</Container>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t(
														'label.background_for_the_login_page',
														'Background for the Login Page'
													)}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.background_description',
														'Paste the URL of the image for the login page. Use a JPG file, dimension 2560x1440 pixels, 800 KB max.'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.light_mode"
														defaults="<bold>Light</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.background_login_page', 'Background Login Page')}
												</Text>
											</Container>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.dark_mode"
														defaults="<bold>Dark</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.background_login_page', 'Background Login Page')}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.image_path', 'Image Path')}
													background="gray5"
													value={globalTheme.carbonioWebUiLoginBackground}
													inputName="carbonioWebUiLoginBackground"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioWebUiLoginBackground(isValid);
														} else {
															setIsValidCarbonioWebUiLoginBackground(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioWebUiLoginBackground}
												/>
												{!isValidCarbonioWebUiLoginBackground && <HttpsErrorMessage />}
											</Container>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.image_path', 'Image Path')}
													background="gray5"
													value={globalTheme.carbonioWebUiDarkLoginBackground}
													inputName="carbonioWebUiDarkLoginBackground"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioWebUiDarkLoginBackground(isValid);
														} else {
															setIsValidCarbonioWebUiDarkLoginBackground(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioWebUiDarkLoginBackground}
												/>
												{!isValidCarbonioWebUiDarkLoginBackground && <HttpsErrorMessage />}
											</Container>
										</ListRow>
									</>
								)}
								{change === 'admin_panel' && (
									<>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.admin_panel', 'Admin Panel')}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.admin_panel_theme_description',
														'In this section you can customize the Admin Panel with your company logo and image.'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t(
														'label.title_and_copyrights_information',
														'Title & Copyrights Information'
													)}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.title', 'Title')}
													background="gray5"
													value={globalTheme.carbonioAdminUiTitle}
													inputName="carbonioAdminUiTitle"
													onChange={onChangeGlobalThemeDetail}
												/>
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.title_theme_note',
														'The title is the name that will appear on the browser tab'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.copyrights_information', 'Copyrights information')}
													background="gray5"
													value={globalTheme.carbonioAdminUiDescription}
													inputName="carbonioAdminUiDescription"
													onChange={onChangeGlobalThemeDetail}
												/>
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.copyrights_theme_note',
														'The copyrights information will appear on the login box footer'
													)}
												</Text>
											</Container>
										</ListRow>
										<Container padding={{ top: 'small' }}>
											<Divider color="gray2" />
										</Container>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.logo', 'Logo')}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.logo_description',
														'Paste the URL of the logo for the login page. Use SVG or PNG file with transparent background, dimension 240x120 pixels.'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.light_mode"
														defaults="<bold>Light</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.logo_for_login_page', 'Logo for Login Page')}
												</Text>
											</Container>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.dark_mode"
														defaults="<bold>Dark</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.logo_for_login_page', 'Logo for Login Page')}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.logo_path', 'Logo Path')}
													background="gray5"
													value={globalTheme.carbonioAdminUiLoginLogo}
													inputName="carbonioAdminUiLoginLogo"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioAdminUiLoginLogo(isValid);
														} else {
															setIsValidCarbonioAdminUiLoginLogo(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioAdminUiLoginLogo}
												/>
												{!isValidCarbonioAdminUiLoginLogo && <HttpsErrorMessage />}
											</Container>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.logo_path', 'Logo Path')}
													background="gray5"
													value={globalTheme.carbonioAdminUiDarkLoginLogo}
													inputName="carbonioAdminUiDarkLoginLogo"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioAdminUiDarkLoginLogo(isValid);
														} else {
															setIsValidCarbonioAdminUiDarkLoginLogo(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioAdminUiDarkLoginLogo}
												/>
												{!isValidCarbonioAdminUiDarkLoginLogo && <HttpsErrorMessage />}
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.light_mode"
														defaults="<bold>Light</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.logo_for_webapp', 'Logo for WebApp')}
												</Text>
											</Container>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.dark_mode"
														defaults="<bold>Dark</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.logo_for_webapp', 'Logo for WebApp')}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.logo_path', 'Logo Path')}
													background="gray5"
													value={globalTheme.carbonioAdminUiAppLogo}
													inputName="carbonioAdminUiAppLogo"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioAdminUiAppLogo(isValid);
														} else {
															setIsValidCarbonioAdminUiAppLogo(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioAdminUiAppLogo}
												/>
												{!isValidCarbonioAdminUiAppLogo && <HttpsErrorMessage />}
											</Container>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.logo_path', 'Logo Path')}
													background="gray5"
													value={globalTheme.carbonioAdminUiDarkAppLogo}
													inputName="carbonioAdminUiDarkAppLogo"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioAdminUiDarkAppLogo(isValid);
														} else {
															setIsValidCarbonioAdminUiDarkAppLogo(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioAdminUiDarkAppLogo}
												/>
												{!isValidCarbonioAdminUiDarkAppLogo && <HttpsErrorMessage />}
											</Container>
										</ListRow>
										<Container padding={{ top: 'small' }}>
											<Divider color="gray2" />
										</Container>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.favicon', 'Favicon')}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.favicon_description',
														'Paste the URL of the favicon for the login page. Use a ICO file, dimension 16x16 pixels.'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.favicon_path', 'Favicon Path')}
													background="gray5"
													value={globalTheme.carbonioAdminUiFavicon}
													inputName="carbonioAdminUiFavicon"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioAdminUiFavicon(isValid);
														} else {
															setIsValidCarbonioAdminUiFavicon(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioAdminUiFavicon}
												/>
												{!isValidCarbonioAdminUiFavicon && <HttpsErrorMessage />}
											</Container>
										</ListRow>
										<Container padding={{ top: 'small' }}>
											<Divider color="gray2" />
										</Container>
										<ListRow>
											<Padding vertical="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t(
														'label.background_for_the_login_page',
														'Background for the Login Page'
													)}
												</Text>
											</Padding>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													{t(
														'label.background_description',
														'Paste the URL of the image for the login page. Use a JPG file, dimension 2560x1440 pixels, 800 KB max.'
													)}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.light_mode"
														defaults="<bold>Light</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.background_login_page', 'Background Login Page')}
												</Text>
											</Container>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												padding={{ all: 'small' }}
											>
												<Text size="small" color="gray0">
													<Trans
														i18nKey="label.dark_mode"
														defaults="<bold>Dark</bold> Mode"
														components={{ bold: <strong /> }}
													/>{' '}
													{t('label.background_login_page', 'Background Login Page')}
												</Text>
											</Container>
										</ListRow>
										<ListRow>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.image_path', 'Image Path')}
													background="gray5"
													value={globalTheme.carbonioAdminUiBackground}
													inputName="carbonioAdminUiBackground"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioAdminUiBackground(isValid);
														} else {
															setIsValidCarbonioAdminUiBackground(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioAdminUiBackground}
												/>
												{!isValidCarbonioAdminUiBackground && <HttpsErrorMessage />}
											</Container>
											<Container padding={{ all: 'small' }}>
												<Input
													label={t('label.image_path', 'Image Path')}
													background="gray5"
													value={globalTheme.carbonioAdminUiDarkBackground}
													inputName="carbonioAdminUiDarkBackground"
													onChange={(e: any): any => {
														if (e.target.value) {
															const isValid = isValidHttpsUrl(e.target.value);
															setIsValidCarbonioAdminUiDarkBackground(isValid);
														} else {
															setIsValidCarbonioAdminUiDarkBackground(true);
														}
														onChangeGlobalThemeDetail(e);
													}}
													hasError={!isValidCarbonioAdminUiDarkBackground}
												/>
												{!isValidCarbonioAdminUiDarkBackground && <HttpsErrorMessage />}
											</Container>
										</ListRow>
									</>
								)}
							</Container>
							<Container padding={{ top: 'small' }}>
								<Divider color="gray2" />
							</Container>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Padding vertical="large" width="100%">
										<Button
											type="outlined"
											label={t('label.reset', 'Reset')}
											color="error"
											size="fill"
											onClick={onResetTheme}
										/>
									</Padding>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Container>
			</Container>
			{isOpenResetDialog && (
				<Modal
					size="medium"
					title={t('label.reset_global_theme', 'Reset global theme')}
					open={isOpenResetDialog}
					customFooter={
						<Container orientation="horizontal" mainAlignment="space-between">
							<Button
								style={{ marginLeft: '10px' }}
								type="outlined"
								label={t('label.help', 'Help')}
								color="primary"
							/>
							<Row style={{ gap: '8px' }}>
								<Button
									label={t('label.cancel', 'Cancel')}
									color="secondary"
									onClick={closeHandler}
								/>
								<Button
									label={t('label.yes', 'Yes')}
									color="error"
									onClick={onResetHandler}
									disabled={isRequestInProgress}
								/>
							</Row>
						</Container>
					}
					showCloseIcon
					onClose={closeHandler}
				>
					<Container>
						<Padding bottom="medium" top="medium">
							<Text size={'extralarge'} overflow="break-word">
								<Trans
									i18nKey="label.reset_theme_content_1"
									defaults="You are you sure to reset the theme ?"
									components={{}}
								/>
							</Text>
						</Padding>
						<Padding bottom="medium">
							<Text size="extralarge" overflow="break-word">
								<Trans
									i18nKey="label.reset_theme_content_2"
									defaults="If you click YES button all data will be lost."
									components={{}}
								/>
							</Text>
						</Padding>
						<Row padding={{ bottom: 'large' }}>
							<Icon
								icon="AlertTriangleOutline"
								size="large"
								style={{ height: '48px', width: '48px' }}
							/>
						</Row>
					</Container>
				</Modal>
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
