/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

const signatureIdField = z.object({ value: z.string(), label: z.string() });

const sendInviteItemSchema = z.object({
  id: z.string(),
  n: z.string(),
  _content: z.string(),
});

const signatureSchema = z.object({
  name: z.string(),
  content: z.array(z.object({ _content: z.string() })),
});

export const createResourceSchema = z
  .object({
    displayName: z.string(),
    name: z.string(),
    changeNameBool: z.boolean(),
    domain: z.string(),
    zimbraCalResType: z.string(),
    zimbraAccountStatus: z.string(),
    zimbraCOSId: z.string(),
    zimbraCalResAutoDeclineRecurring: z.string(),
    zimbraCalResMaxNumConflictsAllowed: z.string(),
    zimbraCalResMaxPercentConflictsAllowed: z.string(),
    zimbraNotes: z.string(),
    schedulePolicyType: z.number(),
    password: z.string(),
    repeatPassword: z.string(),
    sendInviteList: z.array(sendInviteItemSchema),
    zimbraPrefCalendarAutoAcceptSignatureId: signatureIdField,
    zimbraPrefCalendarAutoDeclineSignatureId: signatureIdField,
    zimbraPrefCalendarAutoDenySignatureId: signatureIdField,
    signaturelist: z.array(signatureSchema),
  })
  .superRefine((d, ctx) => {
    if (!d.displayName || d.displayName.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['displayName'],
        message: 'Resource name is required',
      });
    }
    if (!d.name || d.name.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['name'],
        message: 'Name is required',
      });
    }
    if (d.password !== '' && d.password.length < 6) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Password must be at least 6 characters',
      });
    }
    if (d.password !== d.repeatPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['repeatPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export type CreateResourceFormValues = z.infer<typeof createResourceSchema>;
