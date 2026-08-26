/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';

import { sendMail } from './send-mail-service';

export type SendOtpEmailBody = {
  _jsns: 'urn:zimbraMail';
  m: Record<string, unknown>;
};

export const useSendOtpEmail = () =>
  useMutation({
    mutationFn: (body: SendOtpEmailBody) => sendMail('SendMsgRequest', body),
  });
