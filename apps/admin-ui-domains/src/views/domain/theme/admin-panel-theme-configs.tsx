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

const AdminPanelThemeConfig: FC<{
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
						subValue={themeConfig.carbonioAdminUiTitle}
						inheritedValue={globalTheme?.carbonioAdminUiTitle}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUiTitle : ''}
						inputName="carbonioAdminUiTitle"
						onChange={onChangeDomainThemeDetail}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUiTitle')}
						disabled={isGlobalTheme && !hasModifyRights}
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
						subValue={themeConfig.carbonioAdminUiDescription}
						inheritedValue={globalTheme?.carbonioAdminUiDescription}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUiDescription : ''}
						inputName="carbonioAdminUiDescription"
						onChange={onChangeDomainThemeDetail}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUiDescription')}
						disabled={isGlobalTheme && !hasModifyRights}
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
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioAdminUiLoginLogo}
						inheritedValue={globalTheme?.carbonioAdminUiLoginLogo}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUiLoginLogo : ''}
						inputName="carbonioAdminUiLoginLogo"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminUiLoginLogo: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminUiLoginLogo: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUiLoginLogo')}
						hasError={!allData?.isValidCarbonioAdminUiLoginLogo}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminUiLoginLogo && <HttpsErrorMessage />}
				</Container>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioAdminUiDarkLoginLogo}
						inheritedValue={globalTheme?.carbonioAdminUiDarkLoginLogo}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUiDarkLoginLogo : ''}
						inputName="carbonioAdminUiDarkLoginLogo"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminUiDarkLoginLogo: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminUiDarkLoginLogo: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUiDarkLoginLogo')}
						hasError={!allData?.isValidCarbonioAdminUiDarkLoginLogo}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminUiDarkLoginLogo && <HttpsErrorMessage />}
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
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioAdminUiAppLogo}
						inheritedValue={globalTheme?.carbonioAdminUiAppLogo}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUiAppLogo : ''}
						inputName="carbonioAdminUiAppLogo"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminUiAppLogo: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminUiAppLogo: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUiAppLogo')}
						hasError={!allData?.isValidCarbonioAdminUiAppLogo}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminUiAppLogo && <HttpsErrorMessage />}
				</Container>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioAdminUiDarkAppLogo}
						inheritedValue={globalTheme?.carbonioAdminUiDarkAppLogo}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUiDarkAppLogo : ''}
						inputName="carbonioAdminUiDarkAppLogo"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminUiDarkAppLogo: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminUiDarkAppLogo: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUiDarkAppLogo')}
						hasError={!allData?.isValidCarbonioAdminUiDarkAppLogo}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminUiDarkAppLogo && <HttpsErrorMessage />}
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
						subValue={themeConfig.carbonioAdminUiFavicon}
						inheritedValue={globalTheme?.carbonioAdminUiFavicon}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUiFavicon : ''}
						inputName="carbonioAdminUiFavicon"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminUiFavicon: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminUiFavicon: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUiFavicon')}
						hasError={!allData?.isValidCarbonioAdminUiFavicon}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminUiFavicon && <HttpsErrorMessage />}
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
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioAdminUiBackground}
						inheritedValue={globalTheme?.carbonioAdminUiBackground}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUiBackground : ''}
						inputName="carbonioAdminUiBackground"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminUiBackground: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminUiBackground: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUiBackground')}
						hasError={!allData?.isValidCarbonioAdminUiBackground}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminUiBackground && <HttpsErrorMessage />}
				</Container>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label="Ex. https://upload.yourlogo.com/"
						subValue={themeConfig.carbonioAdminUiDarkBackground}
						inheritedValue={globalTheme?.carbonioAdminUiDarkBackground}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUiDarkBackground : ''}
						inputName="carbonioAdminUiDarkBackground"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminUiDarkBackground: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminUiDarkBackground: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUiDarkBackground')}
						hasError={!allData?.isValidCarbonioAdminUiDarkBackground}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminUiDarkBackground && <HttpsErrorMessage />}
				</Container>
			</ListRow>
			<Container padding={{ top: 'small' }}>
				<Divider color="gray2" />
			</Container>
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
						subValue={themeConfig.carbonioAdminUILoginURL}
						inheritedValue={globalTheme?.carbonioAdminUILoginURL}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUILoginURL : ''}
						inputName="carbonioAdminUILoginURL"
						onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminLogoutURL: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminLogoutURL: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUILoginURL')}
						hasError={!allData?.isValidCarbonioAdminLogoutURL}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminLogoutURL && <HttpsErrorMessage />}
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
						subValue={themeConfig.carbonioAdminUILogoutURL}
						inheritedValue={globalTheme?.carbonioAdminUILogoutURL}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminUILogoutURL : ''}
						inputName="carbonioAdminUILogoutURL"
						onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminLogoutURL: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminLogoutURL: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminUILogoutURL')}
						hasError={!allData?.isValidCarbonioAdminLogoutURL}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminLogoutURL && <HttpsErrorMessage />}
				</Container>
			</ListRow>
			<Container padding={{ top: 'small' }}>
				<Divider color="gray2" />
			</Container>
			<ListRow>
				<Padding top="large" bottom="small" horizontal="small" width="100%">
					<Text size="small" color="gray0" weight="bold">
						{t('label.help_documentation_url', 'Help documentation URL')}
					</Text>
				</Padding>
			</ListRow>
			<ListRow>
				<Container padding={{ all: 'small' }}>
					<InheritedInput
						label={'Ex. https://upload.yourdocs.com/'}
						subValue={themeConfig.carbonioAdminDocumentationUrl}
						inheritedValue={globalTheme?.carbonioAdminDocumentationUrl}
						fromSubValue={globalTheme ? themeConfig.carbonioAdminDocumentationUrl : ''}
						inputName="carbonioAdminDocumentationUrl"
						onChange={(e: any): any => {
							if (e.target.value) {
								const isValid = isValidHttpsUrl(e.target.value);
								setAllData({
									...allData,
									isValidCarbonioAdminDocumentationUrl: isValid
								});
							} else {
								setAllData({
									...allData,
									isValidCarbonioAdminDocumentationUrl: true
								});
							}
							onChangeDomainThemeDetail(e);
						}}
						onChangeReset={(): void => setEmptyValue('carbonioAdminDocumentationUrl')}
						hasError={!allData?.isValidCarbonioAdminDocumentationUrl}
						disabled={isGlobalTheme && !hasModifyRights}
					/>
					{!allData?.isValidCarbonioAdminDocumentationUrl && <HttpsErrorMessage />}
				</Container>
			</ListRow>
		</>
	);
};

export default AdminPanelThemeConfig;
