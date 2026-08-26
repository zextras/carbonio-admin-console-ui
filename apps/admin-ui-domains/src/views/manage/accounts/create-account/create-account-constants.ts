/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CreateAccountFormValues } from './create-account-types';

export const CREATE_ACCOUNT_DEFAULT_VALUES: CreateAccountFormValues = {
  // Account
  name: '',
  givenName: '',
  initials: '',
  sn: '',
  displayName: '',
  password: '',
  repeatPassword: '',
  zimbraPasswordMustChange: false,
  zimbraAuthLdapExternalDn: '',

  // Settings
  defaultCOS: true,
  zimbraAccountStatus: '',
  zimbraCOSId: '',
  zimbraPrefLocale: '',
  zimbraPrefTimeZoneId: '',

  // Description & Notes
  description: '',
  zimbraNotes: '',

  // Phone
  telephoneNumber: '',
  homePhone: '',
  mobile: '',
  pager: '',
  facsimileTelephoneNumber: '',

  // Company
  company: '',
  title: '',

  // Address
  co: '',
  l: '',
  st: '',
  postalCode: '',
  street: '',

  // Internal auto-fill flags
  changeNameBool: false,
  changeDisplayNameBool: false,

  // OTP step
  generateOTP: false,
  administrationRigths: false,
  qrData: '',
  secrateCode: '',
  pinCodes: [],
  showOtpOptionSection: true,

  // Created account
  id: '',
};
