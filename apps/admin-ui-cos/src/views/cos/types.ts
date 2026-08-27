/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

type CosFeaturesFormValues = {
  carbonioFeatureMailsAppEnabled: string;
  zimbraFeatureOutOfOfficeReplyEnabled: string;
  zimbraFeatureSignaturesEnabled: string;
  zimbraFeatureImportFolderEnabled: string;
  zimbraFeatureExportFolderEnabled: string;
  zimbraFeatureMobileSyncEnabled: string;
  zimbraFeatureContactsEnabled: string;
  zimbraFeatureCalendarEnabled: string;
  carbonioFeatureFilesAppEnabled: string;
  carbonioFeatureFilesEnabled: string;
  carbonioFeatureTasksEnabled: string;
  zimbraFeatureOptionsEnabled: string;
  carbonioOtpWizardFromUntrusted: string;
  carbonioFeatureOTPMgmtEnabled: string;
  carbonioOtpGracePeriodEndingTime: string;
  carbonioOtpGracePeriodEnabled: string;
  mobileContactFeatureSync: string;
  mobileCalendarFeatureSync: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CosFeaturesFormApi = ReactFormExtendedApi<
  CosFeaturesFormValues,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

export type { CosFeaturesFormApi, CosFeaturesFormValues };
