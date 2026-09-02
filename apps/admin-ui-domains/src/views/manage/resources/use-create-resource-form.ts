/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';

import { RESOURCE_TYPE, SCHEDULE_POLICY_TYPE, STATUS, TRUE_FALSE } from './resource-edit-detail-view';
import { type CreateResourceFormValues,createResourceSchema } from './schema';

export const CREATE_RESOURCE_DEFAULT_VALUES: CreateResourceFormValues = {
  displayName: '',
  name: '',
  changeNameBool: false,
  zimbraCalResType: RESOURCE_TYPE.LOCATION,
  zimbraAccountStatus: STATUS.ACTIVE,
  zimbraCOSId: '',
  zimbraCalResAutoDeclineRecurring: TRUE_FALSE.FALSE,
  zimbraCalResMaxNumConflictsAllowed: '',
  zimbraCalResMaxPercentConflictsAllowed: '',
  zimbraNotes: '',
  schedulePolicyType: SCHEDULE_POLICY_TYPE.AUTO_ACCEPT,
  password: '',
  repeatPassword: '',
  sendInviteList: [],
  zimbraPrefCalendarAutoAcceptSignatureId: { value: '', label: '' },
  zimbraPrefCalendarAutoDeclineSignatureId: { value: '', label: '' },
  zimbraPrefCalendarAutoDenySignatureId: { value: '', label: '' },
  signaturelist: [],
};

export function useCreateResourceForm() {
  return useForm({
    defaultValues: CREATE_RESOURCE_DEFAULT_VALUES,
    validators: {
      onChange: createResourceSchema,
    },
    onSubmit: async () => {},
  });
}
