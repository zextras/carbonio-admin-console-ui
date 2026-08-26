/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

import { isValidPhoneNumber } from '../../../utility/utils';

export const CREATE_ACCOUNT_VALIDATION_MESSAGES: Record<string, string> = {
  'label.surname_required': 'Surname is required',
  'label.password_length_msg': 'Password should be more than 5 character',
  'label.password_and_repeat_password_not_match': 'Passwords do not match',
  'domain.accounts.phoneNumber.tooltip': 'allowed chars are whitespaces, numbers and symbols -+()/,.',
};

const isValidPhoneNumberOrEmpty = (value: string): boolean => value === '' || isValidPhoneNumber(value);

const isPasswordLengthValidOrEmpty = (value: string): boolean => value === '' || value.length >= 6;

const phoneFieldSchema = (messageKey: string) =>
  z.string().refine(isValidPhoneNumberOrEmpty, { message: messageKey });

export const createAccountSchema = z
  .object({
    // Account
    name: z.string(),
    givenName: z.string(),
    initials: z.string(),
    sn: z.string().refine((value) => value.trim() !== '', {
      message: 'label.surname_required',
    }),
    displayName: z.string(),
    password: z.string().refine(isPasswordLengthValidOrEmpty, {
      message: 'label.password_length_msg',
    }),
    repeatPassword: z.string(),
    zimbraPasswordMustChange: z.boolean(),
    zimbraAuthLdapExternalDn: z.string(),

    // Settings
    defaultCOS: z.boolean(),
    zimbraAccountStatus: z.string(),
    zimbraCOSId: z.string(),
    zimbraPrefLocale: z.string(),
    zimbraPrefTimeZoneId: z.string(),

    // Description & Notes
    description: z.string(),
    zimbraNotes: z.string(),

    // Phone
    telephoneNumber: phoneFieldSchema('domain.accounts.phoneNumber.tooltip'),
    homePhone: phoneFieldSchema('domain.accounts.phoneNumber.tooltip'),
    mobile: phoneFieldSchema('domain.accounts.phoneNumber.tooltip'),
    pager: phoneFieldSchema('domain.accounts.phoneNumber.tooltip'),
    facsimileTelephoneNumber: phoneFieldSchema('domain.accounts.phoneNumber.tooltip'),

    // Company
    company: z.string(),
    title: z.string(),

    // Address
    co: z.string(),
    l: z.string(),
    st: z.string(),
    postalCode: z.string(),
    street: z.string(),

    // Internal auto-fill flags
    changeNameBool: z.boolean(),
    changeDisplayNameBool: z.boolean(),

    // OTP step
    generateOTP: z.boolean(),
    administrationRigths: z.boolean(),
    qrData: z.string(),
    secrateCode: z.string(),
    pinCodes: z.array(z.object({ code: z.string() })),
    showOtpOptionSection: z.boolean(),

    // Created account (filled after CreateAccount succeeds)
    id: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'label.password_and_repeat_password_not_match',
    path: ['repeatPassword'],
  });
