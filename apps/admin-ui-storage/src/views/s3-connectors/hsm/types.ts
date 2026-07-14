/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

import type { PolicyCriteriaItem, Volume } from '../../../../types';

export type HsmPolicyFormValues = {
  isAllEnabled: boolean;
  isMessageEnabled: boolean;
  isEventEnabled: boolean;
  isContactEnabled: boolean;
  isDocumentEnabled: boolean;
  policyCriteria: Array<PolicyCriteriaItem>;
  sourceVolume: Array<Volume>;
  destinationVolume: Array<Volume>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HsmFormApi = ReactFormExtendedApi<
  HsmPolicyFormValues,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;
