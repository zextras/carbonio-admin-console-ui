/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Icon, Row, Text } from '@zextras/carbonio-design-system';
import moment from 'moment';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { SUBSCRIPTIONS_ROUTE_ID, MANAGE_APP_ID } from '../../constants';
import { useModuleLicenseInfo } from '../../hooks/use-subscription';
import ListRow from '../list/list-row';

type licenseBannerProps = {
	redirectButtonHasToAppear?: boolean;
};

export const LicenseBanner: FC<licenseBannerProps> = ({ redirectButtonHasToAppear }) => {
	const { moduleLicenseInfo, licenseBannerShouldBeDisplayed, setIsLicenseBannerOpen } =
		useModuleLicenseInfo();

	const maintenanceStatus = moduleLicenseInfo?.maintenanceStatus ?? 'active';
	const maintenanceEndDate = moduleLicenseInfo?.maintenanceEndDate ?? 0;
	const [t] = useTranslation();

	const maintenanceEndDateFormatted = moment(maintenanceEndDate).format('DD MMM YYYY');

	const bannerExpiredDescription = t(
		'banner.maintenance-expired-description',
		'Your maintenance expired on {{maintenanceEndDate}}.',
		{ maintenanceEndDate: maintenanceEndDateFormatted }
	);
	const bannerExpiringDescription = t(
		'banner.maintenance-expiring-description',
		'Your maintenance will expire on {{maintenanceEndDate}}.',
		{ maintenanceEndDate: maintenanceEndDateFormatted }
	);
	const bannerExpiringLabel = t(
		'banner.maintenance-expiring-label',
		'After expiration, you will still be notified of new updates, but you won’t be allowed to install them without risking service issues. Renew on time to ensure smooth, safe upgrades and full support coverage.'
	);
	const bannerExpiredLabel = t(
		'banner.maintenance-expired-label',
		'Your current version will continue to function normally, but you must not install any new Carbonio updates — doing so may cause service disruption. Renew maintenance to safely upgrade and keep your system fully supported.'
	);
	const detailsButton = t('button.view_subscription_details', 'View Subscription Details');

	const labelToShow = useMemo(
		() => (maintenanceStatus === 'expiring' ? bannerExpiringLabel : bannerExpiredLabel),
		[bannerExpiringLabel, bannerExpiredLabel, maintenanceStatus]
	);

	const descriptionToShow = useMemo(
		() => (maintenanceStatus === 'expiring' ? bannerExpiringDescription : bannerExpiredDescription),
		[bannerExpiringDescription, bannerExpiredDescription, maintenanceStatus]
	);

	const onClose = () => setIsLicenseBannerOpen(false);
	const history = useHistory();

	return licenseBannerShouldBeDisplayed ? (
		<ListRow padding={redirectButtonHasToAppear ? '1.5rem' : { top: '1.5rem' }}>
			<Container
				width={'fill'}
				background={'warning'}
				height={'fit-content'}
				crossAlignment="flex-end"
				padding={{ vertical: '0.5rem', horizontal: '1rem' }}
				gap="0.5rem"
			>
				<Container
					width={'fill'}
					height={'fit-content'}
					orientation="horizontal"
					style={{ borderRadius: '0.5rem' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					gap="0.5rem"
				>
					<Row padding={{ right: '0.5rem' }}>
						<Icon size="large" icon="AlertTriangleOutline" color="gray6" />
					</Row>
					<Row takeAvailableSpace mainAlignment="flex-start" crossAlignment="flex-start">
						<Text color="gray6" overflow="break-word">
							{descriptionToShow}
						</Text>
						<Text color="gray6" overflow="break-word">
							{labelToShow}
						</Text>
					</Row>
					<Row>
						<Button
							type="ghost"
							data-testid="license-banner-close-button"
							icon="CloseOutline"
							color="gray6"
							onClick={onClose}
						/>
					</Row>
				</Container>
				{redirectButtonHasToAppear && (
					<Button
						type="outlined"
						backgroundColor="transparent"
						color="gray6"
						label={detailsButton}
						onClick={() => history.push(`/${MANAGE_APP_ID}/${SUBSCRIPTIONS_ROUTE_ID}`)}
					/>
				)}
			</Container>
		</ListRow>
	) : (
		<></>
	);
};
