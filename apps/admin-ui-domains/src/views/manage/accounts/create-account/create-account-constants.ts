/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CreateAccountFormValues } from './create-account-types';

export const CREATE_ACCOUNT_DEFAULT_VALUES: CreateAccountFormValues = {

  name: '',
  givenName: '',
  initials: '',
  sn: '',
  displayName: '',
  password: '',
  repeatPassword: '',
  zimbraPasswordMustChange: false,
  zimbraAuthLdapExternalDn: '',

  defaultCOS: true,
  zimbraAccountStatus: '',
  zimbraCOSId: '',
  zimbraPrefLocale: '',
  zimbraPrefTimeZoneId: '',

  description: '',
  zimbraNotes: '',

  telephoneNumber: '',
  homePhone: '',
  mobile: '',
  pager: '',
  facsimileTelephoneNumber: '',

  company: '',
  title: '',

  co: '',
  l: '',
  st: '',
  postalCode: '',
  street: '',

  changeNameBool: false,
  changeDisplayNameBool: false,

  generateOTP: false,
  administrationRigths: false,
  qrData: '',
  secrateCode: '',
  pinCodes: [],
  showOtpOptionSection: true,

  id: '',
};
