/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

import { isValidHexColor, isValidHttpsUrl } from '../../utility/utils';

export const HTTPS_URL_ERROR_LABEL = 'label.use_https_protocol_message';
export const LIGHT_PRIMARY_COLOR_ERROR_LABEL = 'label.invalid_primary_color_light_mode';
export const DARK_PRIMARY_COLOR_ERROR_LABEL = 'label.invalid_primary_color_dark_mode';

/** Empty string or undefined passes; non-empty must be a valid https URL. */
const optionalHttpsUrl = () =>
  z
    .string()
    .optional()
    .refine((value) => !value || isValidHttpsUrl(value), { message: HTTPS_URL_ERROR_LABEL });

/** Empty string or undefined passes; non-empty must be a #RGB / #RRGGBB hex code. */
const optionalHexColor = (message: string) =>
  z
    .string()
    .optional()
    .refine((value) => !value || isValidHexColor(value), { message });

/**
 * Validation for the white-label settings form. Applied form-level with
 * `validators: { onChange, onSubmit }`; zod assigns issues per key so they
 * surface in `form.state.fieldMeta[field].errors`.
 */
export const whiteLabelSchema = z.object({
  carbonioWebUiDarkMode: z.string().optional(),
  carbonioWebUiLoginLogo: optionalHttpsUrl(),
  carbonioWebUiDarkLoginLogo: optionalHttpsUrl(),
  carbonioWebUiLoginBackground: optionalHttpsUrl(),
  carbonioWebUiDarkLoginBackground: optionalHttpsUrl(),
  carbonioWebUiAppLogo: optionalHttpsUrl(),
  carbonioWebUiDarkAppLogo: optionalHttpsUrl(),
  carbonioWebUiFavicon: optionalHttpsUrl(),
  carbonioWebUiTitle: z.string().optional(),
  carbonioWebUiDescription: z.string().optional(),
  carbonioAdminUiLoginLogo: optionalHttpsUrl(),
  carbonioAdminUiDarkLoginLogo: optionalHttpsUrl(),
  carbonioAdminUiAppLogo: optionalHttpsUrl(),
  carbonioAdminUiDarkAppLogo: optionalHttpsUrl(),
  carbonioAdminUiBackground: optionalHttpsUrl(),
  carbonioAdminUiDarkBackground: optionalHttpsUrl(),
  carbonioAdminUiFavicon: optionalHttpsUrl(),
  carbonioAdminUiTitle: z.string().optional(),
  carbonioAdminUiDescription: z.string().optional(),
  carbonioLogoUrl: z.string().optional(),
  carbonioWebUiPrimaryColor: optionalHexColor(LIGHT_PRIMARY_COLOR_ERROR_LABEL),
  carbonioWebUiDarkPrimaryColor: optionalHexColor(DARK_PRIMARY_COLOR_ERROR_LABEL),
  carbonioWebUILoginURL: optionalHttpsUrl(),
  carbonioWebUILogoutURL: optionalHttpsUrl(),
  carbonioAdminUILoginURL: optionalHttpsUrl(),
  carbonioAdminUILogoutURL: optionalHttpsUrl(),
  carbonioAdminDocumentationUrl: optionalHttpsUrl(),
});
