/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Dispatch, SetStateAction } from 'react';

import type { GetDistributionListResponse } from '../../../../../../types';

export type SelectedMailingList = GetDistributionListResponse['dl'][number];

export type MailingListRightOption = {
  label: string;
  value: 'TRUE' | 'FALSE';
};

export type GrantTypeValue = 'pub' | 'grp' | 'all' | 'usr' | 'edom' | 'gst' | 'email';

export type GrantTypeOption = {
  label: string;
  value: GrantTypeValue;
};

export type MailAliasChip = {
  label: string;
};

export type GranteeEntry = {
  id: string;
  name: string;
};

export type OwnerEntry = GranteeEntry & {
  type?: string;
  email?: string;
};

export type DistributionListMembershipEntry = GranteeEntry & {
  label: string;
  background: string;
  color: string;
};

export type SendAclRight = 'sendAsDistList' | 'sendOnBehalfOfDistList';

export type SendAclEntry = {
  id?: string;
  name: string;
  sendAcl: SendAclRight;
};

export type MailingListFormSnapshot = {
  displayName?: string;
  distributionName?: string;
  zimbraHideInGal?: boolean;
  zimbraNotes?: string;
  description?: string;
  zimbraDistributionListSendShareMessageToNewMembers?: boolean;
  zimbraDistributionListSendShareMessageToNewMember?: boolean;
  zimbraMailStatus?: MailingListRightOption;
  memberURL?: string;
  dlm?: Array<string>;
  dlMembershipList?: Array<DistributionListMembershipEntry>;
  ownersList?: Array<GranteeEntry>;
  ownerOfList?: Array<GranteeEntry>;
  ownerOffset?: Array<GranteeEntry>;
  grantEmails?: Array<GranteeEntry | string>;
  sendEmails?: Array<SendAclEntry>;
  sendEmailsList?: Array<SendAclEntry>;
  grantType?: GrantTypeOption;
};

export type EditMailingListViewProps = {
  selectedMailingList: SelectedMailingList;
  setIsUpdateRecord: Dispatch<SetStateAction<boolean>>;
  setShowMailingListDetailView: Dispatch<SetStateAction<boolean>>;
};
