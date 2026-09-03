/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

type WscCosFormValues = {
	carbonioFeatureWscEnabled: string;
	carbonioWscShowMessageReads: string;
	carbonioWscShowUsersPresence: string;
	carbonioWscMessageDeleteTimeLimit: string;
	carbonioWscMessageEditTimeLimit: string;
	carbonioWscPrivateChatCreation: string;
	carbonioWscGroupChatCreation: string;
	carbonioWscMaxGroupMembers: string;
	carbonioWscMaxRoomPictureSize: string;
	carbonioWscVideoCallEnabled: string;
	carbonioWscRecordingEnabled: string;
	carbonioWscVirtualBackgroundEnabled: string;
	carbonioWscAttachmentUpload: string;
	carbonioWscMaxAttachmentSize: string;
};

type WscCosFormApi = ReactFormExtendedApi<
	WscCosFormValues,
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

export type { WscCosFormApi, WscCosFormValues };
