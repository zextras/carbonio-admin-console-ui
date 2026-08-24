/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ComputedLimit, QuotaSource, QuotaStatus } from '../../../../services/get-account-quota';

export type AccountDetail = Record<string, any> & {
  carbonioFeatureWscEnabled?: string;
  carbonioWscShowMessageReads?: string;
  carbonioWscShowUsersPresence?: string;
  carbonioWscVirtualBackgroundEnabled?: string;
  carbonioWscVideoCallEnabled?: string;
  carbonioWscRecordingEnabled?: string;
  carbonioWscGroupChatCreation?: string;
  carbonioWscPrivateChatCreation?: string;
  carbonioWscAttachmentUpload?: string;
  carbonioWscMessageDeleteTimeLimit?: string;
  carbonioWscMessageEditTimeLimit?: string;
  carbonioWscMaxGroupMembers?: string;
  carbonioWscMaxRoomPictureSize?: string;
  carbonioWscMaxAttachmentSize?: string;
  totalComputedQuotaLimit?: ComputedLimit;
  totalQuotaUsed?: number;
  totalQuotaUsedByModule?: Record<string, number>;
  totalQuotaSource?: QuotaSource;
  totalQuotaStatus?: QuotaStatus;
};

export type CosDetail = Record<string, any> & {
  totalComputedQuotaLimit?: ComputedLimit;
};
