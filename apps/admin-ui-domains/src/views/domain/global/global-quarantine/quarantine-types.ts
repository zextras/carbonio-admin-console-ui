/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type AttachmentPart = {
  part?: string;
  ct?: string;
  s?: number;
  size?: number;
  filename?: string;
  body?: boolean;
  contentType?: string;
  content?: string;
  name?: string;
  parts?: Array<AttachmentPart>;
  ci?: string;
  disposition?: 'inline' | 'attachment';
  cd?: 'inline' | 'attachment';
  mp?: Array<AttachmentPart>;
};

export type MailMessagePart = {
  contentType: string;
  size: number;
  content?: string;
  name: string;
  filename?: string;
  parts?: Array<MailMessagePart>;
  ci?: string;
  cd?: string;
  disposition?: 'inline' | 'attachment';
};

export type SoapEmailParticipantRole = 'f' | 't' | 'c' | 'b' | 'r' | 's' | 'n' | 'rf';

export type SoapMailParticipant = {
  /** Address */
  a: string;
  /** Display name */
  d?: string;
  /** Full name */
  p: string;
  /** (f)rom, (t)o, (c)c, (b)cc, (r)eply-to, (s)ender, read-receipt (n)otification, (rf) resent-from */
  t: SoapEmailParticipantRole;
  isGroup?: 0 | 1;
};

export type SoapMailMessagePart = {
  part: string;
  ct: 'multipart/alternative' | string;
  s?: number;
  ci?: string;
  cd?: 'inline' | 'attachment';
  mp?: Array<SoapMailMessagePart>;
  body?: true;
  filename?: string;
  // FIXME see IRIS-4029 content may be a string or { _content: string } depending on compose settings
  content?: string;
};

export const ParticipantRole = {
  FROM: 'f',
  TO: 't',
  CARBON_COPY: 'c',
  BLIND_CARBON_COPY: 'b',
  REPLY_TO: 'r',
  SENDER: 's',
  READ_RECEIPT_NOTIFICATION: 'n',
  RESENT_FROM: 'rf',
} as const;

export type ParticipantRoleType = (typeof ParticipantRole)[keyof typeof ParticipantRole];

export type Participant = {
  type: ParticipantRoleType;
  address: string;
  name?: string;
  fullName?: string;
};

export type IncompleteMessage = {
  id: string;
  did?: string;
  parent: string;
  conversation: string;
  read: boolean | string;
  size: number;
  hasAttachment: boolean;
  flagged: boolean;
  urgent: boolean;
  isDeleted: boolean;
  isSentByMe: boolean;
  isForwarded: boolean;
  isInvite: boolean;
  isDraft: boolean;
  isScheduled: boolean;
  autoSendTime?: number;
  attachments?: Array<AttachmentPart>;
  participants?: Array<Participant>;
  date: number;
  subject: string;
  fragment?: string;
  tags: Array<string>;
  parts: Array<MailMessagePart>;
  body: { contentType: string; content: string };
  invite?: unknown;
  shr?: unknown;
  isComplete: boolean;
  isReplied: boolean;
  isReadReceiptRequested?: boolean;
  score?: string;
  reason?: string;
  envelopeFrom?: string;
  envelopeTo?: string;
};

export type MailMessage = IncompleteMessage;

export type EditorAttachmentFiles = {
  contentType: string;
  disposition?: string;
  fileName?: string;
  filename: string;
  name: string;
  size: number;
};

export type BodyContent = { contentType: string; content: string };

export type ParsedFlags = {
  read: boolean;
  hasAttachment: boolean;
  flagged: boolean;
  urgent: boolean;
  isDeleted: boolean;
  isDraft: boolean;
  isForwarded: boolean;
  isSentByMe: boolean;
  isInvite: boolean;
  isReplied: boolean;
  isReadReceiptRequested: boolean;
};
