/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import {
  CARBONIO_ALLOW_FEEDBACK,
  CARBONIO_SEND_ANALYTICS,
  CARBONIO_SEND_FULL_ERROR_STACK,
  FALSE,
  TRUE,
} from '../constants';

export type ModifyPrivacyConfigInput = {
  allowFeedback: boolean;
  sendAnalytics: boolean;
  sendFullError: boolean;
};

export async function modifyPrivacyConfig(value: ModifyPrivacyConfigInput): Promise<unknown> {
  return soapFetch('ModifyConfig', {
    _jsns: 'urn:zimbraAdmin',
    a: [
      { n: CARBONIO_ALLOW_FEEDBACK, _content: value.allowFeedback ? TRUE : FALSE },
      { n: CARBONIO_SEND_FULL_ERROR_STACK, _content: value.sendFullError ? TRUE : FALSE },
      { n: CARBONIO_SEND_ANALYTICS, _content: value.sendAnalytics ? TRUE : FALSE },
    ],
  });
}
