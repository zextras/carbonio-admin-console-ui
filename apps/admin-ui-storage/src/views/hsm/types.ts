/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

import { PolicyCriteriaItem } from '../../../types/hsm';
import { Volume } from '../../../types/volume';

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
