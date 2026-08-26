/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

import { isValidVirtualHostname } from '../../../utility/utils';

export type VirtualHostItem = {
  id: string;
  hostname: string;
};

export const virtualHostsFormSchema = z.object({
  hosts: z.array(
    z.object({
      id: z.string(),
      hostname: z.string(),
    }),
  ),
});

export type VirtualHostsFormValues = z.infer<typeof virtualHostsFormSchema>;

export const certificateUploadSchema = z
  .object({
    certificate: z.string(),
    caChain: z.string(),
    privateKey: z.string(),
    isCertificateAvailable: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.certificate === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['certificate'],
        message: 'label.required',
      });
    }
    if (values.privateKey === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['privateKey'],
        message: 'label.required',
      });
    }
    if (!values.isCertificateAvailable && values.caChain === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['caChain'],
        message: 'label.required',
      });
    }
  });

export type CertificateUploadFormValues = z.infer<typeof certificateUploadSchema>;

export function isDraftHostnameValid(hostname: string): boolean {
  return hostname !== '' && isValidVirtualHostname(hostname);
}
