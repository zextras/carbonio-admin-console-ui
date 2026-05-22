/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, ListRow, Row } from '@zextras/ui-components';
import { useModuleLicenseInfo } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { MANAGE_APP_ID, SUBSCRIPTIONS_ROUTE_ID } from '../../constants';

function getDescriptionToShow(options: {
  maintenanceStatus: string;
  bannerExpiringDescription: string;
  bannerExpiredDescription: string;
  bannerInvalidDescription: string;
}): string {
  if (options.maintenanceStatus === 'expiring') {
    return options.bannerExpiringDescription;
  }
  if (options.maintenanceStatus === 'expired') {
    return options.bannerExpiredDescription;
  }
  return options.bannerInvalidDescription;
}

function getLabelToShow(options: {
  maintenanceStatus: string;
  maxCarbonioVersion: string;
  bannerExpiringLabel: string;
  bannerExpiringWithoutMaxVersionLabel: string;
  bannerExpiredLabel: string;
  bannerExpiredWithoutMaxVersionLabel: string;
  bannerInvalidLabel: string;
}): string {
  if (options.maintenanceStatus === 'expiring') {
    return options.maxCarbonioVersion
      ? options.bannerExpiringLabel
      : options.bannerExpiringWithoutMaxVersionLabel;
  }
  if (options.maintenanceStatus === 'expired') {
    return options.maxCarbonioVersion
      ? options.bannerExpiredLabel
      : options.bannerExpiredWithoutMaxVersionLabel;
  }
  return options.bannerInvalidLabel;
}

type licenseBannerProps = {
  redirectButtonHasToAppear?: boolean;
};

export const LicenseBanner: FC<licenseBannerProps> = ({ redirectButtonHasToAppear }) => {
  const { moduleLicenseInfo, licenseBannerShouldBeDisplayed, setIsLicenseBannerOpen } =
    useModuleLicenseInfo();

  const maintenanceStatus = moduleLicenseInfo?.maintenanceStatus ?? 'active';
  const maintenanceEndDate = moduleLicenseInfo?.maintenanceEndDate ?? 0;
  const [t] = useTranslation();
  const maintenanceEndDateFormatted = format(maintenanceEndDate, 'dd MMM yyyy');
  const carbonioVersion = moduleLicenseInfo?.carbonioVersion;
  const maxCarbonioVersion = moduleLicenseInfo?.maxCarbonioVersion ?? '';
  const updateTime = moduleLicenseInfo?.updateTime ?? 0;
  const updateTimeFormatted = format(updateTime ?? 0, 'dd MMM yyyy HH:mm');

  const bannerExpiringDescription = t(
    'banner.maintenance-expiring-description',
    'Maintenance expires on {{maintenanceEndDate}}.',
    { maintenanceEndDate: maintenanceEndDateFormatted },
  );
  const bannerExpiringLabel = t(
    'banner.maintenance-expiring-label',
    'Renew to continue receiving updates.\nYour maintenance supports upgrades up to Carbonio {{maxCarbonioVersion}}.\nPlease contact your licensing provider to plan your maintenance renewal.\nLast license update: {{updateTime}}',
    { maxCarbonioVersion: maxCarbonioVersion, updateTime: updateTimeFormatted },
  );
  const bannerExpiringWithoutMaxVersionLabel = t(
    'banner.maintenance-expiring-empty-max-version-label',
    'Renew to continue receiving updates.\nYour maintenance supports upgrades up to Carbonio Not defined.\nPlease contact your licensing provider to plan your maintenance renewal.\nLast license update: {{updateTime}}',
    { updateTime: updateTimeFormatted },
  );
  const bannerExpiredDescription = t(
    'banner.maintenance-expired-description',
    'Maintenance has expired.',
  );
  const bannerExpiredLabel = t(
    'banner.maintenance-expired-label',
    'Your maintenance supports Carbonio versions up to {{maxCarbonioVersion}}. Installed version: {{carbonioVersion}}.\nDo not upgrade beyond {{maxCarbonioVersion}} to avoid service disruption.\nTo continue receiving updates, please contact your licensing provider to renew your maintenance.\nLast license update: {{updateTime}}',
    {
      maxCarbonioVersion: maxCarbonioVersion,
      carbonioVersion: carbonioVersion,
      updateTime: updateTimeFormatted,
    },
  );
  const bannerExpiredWithoutMaxVersionLabel = t(
    'banner.maintenance-expired-empty-max-version-label',
    'Your maintenance supports Carbonio versions up to Not defined. Installed version: {{carbonioVersion}}.\nDo not upgrade beyond Not defined to avoid service disruption.\nTo continue receiving updates, please contact your licensing provider to renew your maintenance.\nLast license update: {{updateTime}}',
    { carbonioVersion: carbonioVersion, updateTime: updateTimeFormatted },
  );
  const bannerInvalidDescription = t(
    'banner.maintenance-invalid-description',
    'Your maintenance does not support Carbonio version {{carbonioVersion}}.',
    { carbonioVersion: carbonioVersion },
  );
  const bannerInvalidLabel = t(
    'banner.maintenance-invalid-label',
    'Maximum supported version: {{maxCarbonioVersion}}.\nPlease contact your licensing provider to update or renew your maintenance.\nLast license update: {{updateTime}}',
    { maxCarbonioVersion: maxCarbonioVersion, updateTime: updateTimeFormatted },
  );

  const detailsButton = t('button.view_subscription_details', 'View Subscription Details');

  const labelToShow = getLabelToShow({
    maintenanceStatus,
    maxCarbonioVersion,
    bannerExpiringLabel,
    bannerExpiringWithoutMaxVersionLabel,
    bannerExpiredLabel,
    bannerExpiredWithoutMaxVersionLabel,
    bannerInvalidLabel,
  });

  const descriptionToShow = getDescriptionToShow({
    maintenanceStatus,
    bannerExpiringDescription,
    bannerExpiredDescription,
    bannerInvalidDescription,
  });

  const onClose = () => setIsLicenseBannerOpen(false);
  const navigate = useNavigate();

  return licenseBannerShouldBeDisplayed ? (
    <ListRow padding={redirectButtonHasToAppear ? '1.5rem' : { top: '1.5rem' }}>
      <Container
        width={'fill'}
        background={maintenanceStatus === 'invalid' ? 'error' : 'warning'}
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
            <ds-icon size="large" icon="AlertTriangleOutline" color="gray6"></ds-icon>
          </Row>
          <Container
            width="fill"
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="vertical"
            gap="0.5rem"
          >
            <ds-text as="p" color="gray6" overflow="break-word" style={{ whiteSpace: 'pre-line' }}>
              {descriptionToShow}
            </ds-text>
            <ds-text as="p" color="gray6" overflow="break-word" style={{ whiteSpace: 'pre-line' }}>
              {labelToShow}
            </ds-text>
          </Container>
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
            onClick={() => navigate(`/${MANAGE_APP_ID}/${SUBSCRIPTIONS_ROUTE_ID}`)}
          />
        )}
      </Container>
    </ListRow>
  ) : (
    <></>
  );
};
