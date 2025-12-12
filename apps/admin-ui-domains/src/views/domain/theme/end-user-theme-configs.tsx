/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Divider, Padding, Text } from '@zextras/carbonio-design-system';
import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { themeConfigStore } from '../../../../types';
import ListRow from '../../list/list-row';
import InheritedInput from '../../utility/inherited-components/inherited-input';
import { isValidHttpsUrl } from '../../utility/utils';

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
const EndUserThemeConfigs: FC<{
	themeConfig: themeConfigStore;
	globalTheme?: themeConfigStore;
	onChangeDomainThemeDetail: any;
	setEmptyValue: any;
	isGlobalTheme?: boolean;
	hasModifyRights: any;
	allData: any;
	setAllData: any;
}> = ({
	themeConfig,
	globalTheme,
	onChangeDomainThemeDetail,
	setEmptyValue,
	isGlobalTheme,
	hasModifyRights,
	allData,
	setAllData
}) => {
	const [t] = useTranslation();

	return (
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
						{t('label.title_and_copyrights_information', 'Title & Copyrights Information')}
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
							'label.title_theme_note',
							'The title is the name that will appear on the browser tab'
						)}
					</Text>
				</Container>
			</ListRow>
			<ListRow>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label={t('label.title', 'Title')}
						subValue={themeConfig.carbonioWebUiTitle}
						inheritedValue={globalTheme?.carbonioWebUiTitle}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUiTitle : ''}
						inputName="carbonioWebUiTitle"
						onChange={onChangeDomainThemeDetail}
						onChangeReset={(): void => setEmptyValue('carbonioWebUiTitle')}
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
			<ListRow>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label={t('label.copyrights_information', 'Copyrights information')}
						subValue={themeConfig.carbonioWebUiDescription}
						inheritedValue={globalTheme?.carbonioWebUiDescription}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUiDescription : ''}
						inputName="carbonioWebUiDescription"
						onChange={onChangeDomainThemeDetail}
						onChangeReset={(): void => setEmptyValue('carbonioWebUiDescription')}
					/>
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
						{t(
							
							'label.logo_for_login_page',
							
							'Logo for Login Page'
						)}
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
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioWebUiLoginLogo}
						inheritedValue={globalTheme?.carbonioWebUiLoginLogo}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUiLoginLogo : ''}
						inputName="carbonioWebUiLoginLogo"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioWebUiLoginLogo: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioWebUiLoginLogo: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioWebUiLoginLogo')}
						hasError={!allData?.isValidCarbonioWebUiLoginLogo}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioWebUiLoginLogo && <HttpsErrorMessage />}
				</Container>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioWebUiDarkLoginLogo}
						inheritedValue={globalTheme?.carbonioWebUiDarkLoginLogo}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUiDarkLoginLogo : ''}
						inputName="carbonioWebUiDarkLoginLogo"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioWebUiDarkLoginLogo: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioWebUiDarkLoginLogo: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioWebUiDarkLoginLogo')}
						hasError={!allData?.isValidCarbonioWebUiLoginLogo}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioWebUiDarkLoginLogo && <HttpsErrorMessage />}
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
						{t(
							
							'label.logo_for_webapp',
							
							'Logo for WebApp'
						)}
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
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioWebUiAppLogo}
						inheritedValue={globalTheme?.carbonioWebUiAppLogo}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUiAppLogo : ''}
						inputName="carbonioWebUiAppLogo"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioWebUiAppLogo: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioWebUiAppLogo: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioWebUiAppLogo')}
						hasError={!allData?.isValidCarbonioWebUiAppLogo}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioWebUiAppLogo && <HttpsErrorMessage />}
				</Container>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioWebUiDarkAppLogo}
						inheritedValue={globalTheme?.carbonioWebUiDarkAppLogo}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUiDarkAppLogo : ''}
						inputName="carbonioWebUiDarkAppLogo"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioWebUiDarkAppLogo: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioWebUiDarkAppLogo: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioWebUiDarkAppLogo')}
						hasError={!allData?.isValidCarbonioWebUiDarkAppLogo}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioWebUiDarkAppLogo && <HttpsErrorMessage />}
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
							'Paste the URL of the favicon for the login page. Use an ICO file, dimension 32x32 pixels.'
						)}
					</Text>
				</Container>
			</ListRow>
			<ListRow>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioWebUiFavicon}
						inheritedValue={globalTheme?.carbonioWebUiFavicon}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUiFavicon : ''}
						inputName="carbonioWebUiFavicon"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioWebUiFavicon: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioWebUiFavicon: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioWebUiFavicon')}
						hasError={!allData?.isValidCarbonioWebUiFavicon}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioWebUiFavicon && <HttpsErrorMessage />}
				</Container>
			</ListRow>
			<Container padding={{ top: 'small' }}>
				<Divider color="gray2" />
			</Container>
			<ListRow>
				<Padding vertical="large" horizontal="small" width="100%">
					<Text size="small" color="gray0" weight="bold">
						{t('label.background_for_the_login_page', 'Background for the Login Page')}
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
							'Paste the URL of the image for the login page. Use a JPG or a PNG file, with a minimum resolution of 1280x720 pixels, a ratio of 16:9 and smaller than 800KB.'
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
						{t(
							
							'label.background_login_page',
							
							'Background Login Page'
						)}
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
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioWebUiLoginBackground}
						inheritedValue={globalTheme?.carbonioWebUiLoginBackground}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUiLoginBackground : ''}
						inputName="carbonioWebUiLoginBackground"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioWebUiLoginBackground: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioWebUiLoginBackground: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioWebUiLoginBackground')}
						hasError={!allData?.isValidCarbonioWebUiLoginBackground}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioWebUiLoginBackground && <HttpsErrorMessage />}
				</Container>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioWebUiDarkLoginBackground}
						inheritedValue={globalTheme?.carbonioWebUiDarkLoginBackground}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUiDarkLoginBackground : ''}
						inputName="carbonioWebUiDarkLoginBackground"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioWebUiDarkLoginBackground: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioWebUiDarkLoginBackground: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioWebUiDarkLoginBackground')}
						hasError={!allData?.isValidCarbonioWebUiDarkLoginBackground}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioWebUiDarkLoginBackground && <HttpsErrorMessage />}
				</Container>
			</ListRow>
			<Container padding={{ top: 'small' }}>
				<Divider color="gray2" />
			</Container>
			<ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ vertical: 'large', horizontal: 'small' }}
					>
						<Text size="small" color="gray0">
							<Trans
								i18nKey="label.please_note"
								defaults="<bold>Please note</bold>"
								components={{ bold: <strong /> }}
							/>{' '}
							{t(
								'label.virtualhost_avaibility_helpertext',
								'that in order to make the virtualHost available, nginx configuration must be reloaded on all the proxyes first.'
							)}
						</Text>
					</Container>
				</ListRow>
			</ListRow>
			<ListRow>
				<Container padding={{ bottom: 'small', horizontal: 'small' }}>
					<ListRow>
						<Padding bottom="large" horizontal="small" width="100%">
							<Text size="small" color="gray0" weight="bold">
								{t('label.login', 'Login')}
							</Text>
						</Padding>
					</ListRow>
					<InheritedInput
						label={t('label.enduser_login_redirect_url', 'LogIn redirect destination (URL)')}
						subValue={themeConfig.carbonioWebUILoginURL}
						inheritedValue={globalTheme?.carbonioWebUILoginURL}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUILoginURL : ''}
						inputName="carbonioWebUILoginURL"
						onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioWebClientLogoutURL: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioWebClientLogoutURL: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioWebUILoginURL')}
						hasError={!allData?.isValidCarbonioWebClientLogoutURL}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioWebClientLogoutURL && <HttpsErrorMessage />}
				</Container>
				<Container padding={{ bottom: 'small', horizontal: 'small' }}>
					<ListRow>
						<Padding bottom="large" horizontal="small" width="100%">
							<Text size="small" color="gray0" weight="bold">
								{t('label.logout', 'Logout')}
							</Text>
						</Padding>
					</ListRow>
					<InheritedInput
						label={t('label.enduser_logout_redirect_url', 'On Logout, redirect the User to (URL)')}
						subValue={themeConfig.carbonioWebUILogoutURL}
						inheritedValue={globalTheme?.carbonioWebUILogoutURL}
						fromSubValue={globalTheme ? themeConfig.carbonioWebUILogoutURL : ''}
						inputName="carbonioWebUILogoutURL"
						onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioWebClientLogoutURL: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioWebClientLogoutURL: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioWebUILogoutURL')}
						hasError={!allData?.isValidCarbonioWebClientLogoutURL}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioWebClientLogoutURL && <HttpsErrorMessage />}
				</Container>
			</ListRow>
		</>
	);
};

export default EndUserThemeConfigs;
