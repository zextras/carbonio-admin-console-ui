/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
	Icon
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';

const DomainTheme: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [domainTheme, setDomainTheme] = useState<any>({
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

	const THEME_MODE = useMemo(
		() => [
			{ label: `${t('label.disabled', 'Disabled')}`, value: false },
			{ label: `${t('label.enabled', 'Enabled')}`, value: true }
		],
		[t]
	);
	const onThemeModeChange = useCallback(
		(v: string): void => {
			setDomainTheme((prev: any) => ({ ...prev, carbonioWebUiDarkMode: v }));
		},
		[setDomainTheme]
	);
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onSave = (): void => {};

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onCancel = (): void => {};
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
									<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
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
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							padding={{ all: 'small' }}
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
						>
							<ListRow>
								<Padding vertical="large" horizontal="large" width="100%">
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
										domainTheme?.carbonioWebUiDarkMode === ''
											? THEME_MODE[-1]
											: THEME_MODE.find(
													// eslint-disable-next-line max-len
													(item: any) => item.value === domainTheme?.carbonioWebUiDarkMode
											  )
									}
									onChange={onThemeModeChange}
								/>
							</ListRow>
							<Container padding={{ top: 'large' }}>
								<Divider color="gray2" />
							</Container>
							<ListRow>
								<Padding vertical="large" horizontal="large" width="100%">
									<Text size="small" color="gray0" weight="bold">
										{t('label.title_and_description', 'Title & Description')}
									</Text>
								</Padding>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.title', 'Title')}
										background="gray5"
										value={domainTheme.carbonioWebUiTitle}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.description', 'Description')}
										background="gray5"
										value={domainTheme.carbonioWebUiDescription}
									/>
								</Container>
							</ListRow>
							<Container padding={{ top: 'small' }}>
								<Divider color="gray2" />
							</Container>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<Text size="small" color="gray0" weight="bold">
										{t('label.end_user', 'End User')}
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
										Paste the URL of the logo for the login page. Use SVG or PNG file with
										transparent background, dimensions 240x120 pixels.
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
										<b>Light</b> Mode Logo for Login Page
									</Text>
								</Container>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Text size="small" color="gray0">
										<b>Dark</b> Mode Logo for Login Page
									</Text>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input label="" background="gray5" value={domainTheme.carbonioWebUiLoginLogo} />
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label=""
										background="gray5"
										value={domainTheme.carbonioWebUiDarkLoginLogo}
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
										<b>Light</b> Mode Logo for WebApp
									</Text>
								</Container>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Text size="small" color="gray0">
										<b>Dark</b> Mode Logo for WebApp
									</Text>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input label="" background="gray5" value={domainTheme.carbonioWebUiAppLogo} />
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input label="" background="gray5" value={domainTheme.carbonioWebUiDarkAppLogo} />
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
										Paste the URL of the favicon for the login page. Use a ICO file, dimensions
										16x16 pixels.
									</Text>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input label="" background="gray5" value={domainTheme.carbonioWebUiFavicon} />
								</Container>
							</ListRow>
							<Container padding={{ top: 'small' }}>
								<Divider color="gray2" />
							</Container>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<Text size="small" color="gray0" weight="bold">
										{t('label.background', 'Background')}
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
										Paste the URL of the image for the login page. Use a JPG file, dimensions
										2560x1440 pixels, 800 KB max.
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
										<b>Light</b> Mode Background Login Page
									</Text>
								</Container>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Text size="small" color="gray0">
										<b>Dark</b> Mode Background Login Page
									</Text>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label=""
										background="gray5"
										value={domainTheme.carbonioWebUiLoginBackground}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label=""
										background="gray5"
										value={domainTheme.carbonioWebUiDarkLoginBackground}
									/>
								</Container>
							</ListRow>
							<Container padding={{ top: 'small' }}>
								<Divider color="gray2" />
							</Container>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<Text size="small" color="gray0" weight="bold">
										{t('label.title_and_description', 'Title & Description')}
									</Text>
								</Padding>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.title', 'Title')}
										background="gray5"
										value={domainTheme.carbonioAdminUiTitle}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.description', 'Description')}
										background="gray5"
										value={domainTheme.carbonioAdminUiDescription}
									/>
								</Container>
							</ListRow>
							<Container padding={{ top: 'small' }}>
								<Divider color="gray2" />
							</Container>
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
										Paste the URL of the logo for the login page. Use SVG or PNG file with
										transparent background, dimensions 240x120 pixels.
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
										<b>Light</b> Mode Logo for Login Page
									</Text>
								</Container>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Text size="small" color="gray0">
										<b>Dark</b> Mode Logo for Login Page
									</Text>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input label="" background="gray5" value={domainTheme.carbonioAdminUiLoginLogo} />
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label=""
										background="gray5"
										value={domainTheme.carbonioAdminUiDarkLoginLogo}
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
										<b>Light</b> Mode Logo for WebApp
									</Text>
								</Container>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Text size="small" color="gray0">
										<b>Dark</b> Mode Logo for WebApp
									</Text>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input label="" background="gray5" value={domainTheme.carbonioAdminUiAppLogo} />
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label=""
										background="gray5"
										value={domainTheme.carbonioAdminUiDarkAppLogo}
									/>
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
										Paste the URL of the favicon for the login page. Use a ICO file, dimensions
										16x16 pixels.
									</Text>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input label="" background="gray5" value={domainTheme.carbonioAdminUiFavicon} />
								</Container>
							</ListRow>
							<Container padding={{ top: 'small' }}>
								<Divider color="gray2" />
							</Container>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<Text size="small" color="gray0" weight="bold">
										{t('label.background', 'Background')}
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
										Paste the URL of the image for the login page. Use a JPG file, dimensions
										2560x1440 pixels, 800 KB max.
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
										<b>Light</b> Mode Background Login Page
									</Text>
								</Container>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ all: 'small' }}
								>
									<Text size="small" color="gray0">
										<b>Dark</b> Mode Background Login Page
									</Text>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label=""
										background="gray5"
										value={domainTheme.carbonioAdminUiBackground}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label=""
										background="gray5"
										value={domainTheme.carbonioAdminUiDarkBackground}
									/>
								</Container>
							</ListRow>
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
										/>
									</Padding>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Container>
			</Container>
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

export default DomainTheme;
