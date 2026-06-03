/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
type CosFeaturesFormValues = {
  carbonioFeatureMailsAppEnabled: string;
  zimbraFeatureOutOfOfficeReplyEnabled: string;
  zimbraFeatureSignaturesEnabled: string;
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

export type { CosFeaturesFormValues };
