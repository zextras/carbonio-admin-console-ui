/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { format } from 'date-fns';
import { cloneDeep, forEach, isArray, isNil, map, reduce, replace } from 'lodash-es';

import {
  type AttachmentPart,
  type BodyContent,
  type IncompleteMessage,
  type MailMessagePart,
  type ParsedFlags,
  type Participant,
  ParticipantRole,
  type ParticipantRoleType,
  type SoapEmailParticipantRole,
  type SoapMailMessagePart,
  type SoapMailParticipant,
} from './quarantine-types';

export const getDateTime = (d: number): string => {
  const date = new Date(d);
  return format(date, 'dd/MM/yy HH:mm');
};

const participantTypeFromSoap = (ta: SoapEmailParticipantRole): ParticipantRoleType => {
  switch (ta) {
    case 'f':
      return ParticipantRole.FROM;
    case 't':
      return ParticipantRole.TO;
    case 'c':
      return ParticipantRole.CARBON_COPY;
    case 'b':
      return ParticipantRole.BLIND_CARBON_COPY;
    case 'r':
      return ParticipantRole.REPLY_TO;
    case 's':
      return ParticipantRole.SENDER;
    case 'n':
      return ParticipantRole.READ_RECEIPT_NOTIFICATION;
    case 'rf':
      return ParticipantRole.RESENT_FROM;
    default:
      throw new Error(`Participant type not handled: '${ta}'`);
  }
};

const normalizeParticipantsFromSoap = (e: SoapMailParticipant): Participant => ({
  type: participantTypeFromSoap(e.t),
  address: e.a,
  name: e.d || e.a,
  fullName: e.p,
});

const normalizeMailPartMapFn = (v: SoapMailMessagePart): MailMessagePart => {
  const ret: MailMessagePart = {
    contentType: v.ct,
    size: v.s || 0,
    name: v.part,
    disposition: v.cd,
  };
  if (v.mp) {
    ret.parts = map(v.mp || [], normalizeMailPartMapFn);
  }
  if (v.filename) ret.filename = v.filename;
  if (v.content) ret.content = v.content;
  if (v.ci) ret.ci = v.ci;
  if (v.cd) ret.disposition = v.cd;
  return ret;
};

export const findBodyPart = (
  mp: Array<SoapMailMessagePart>,
  acc: { contentType: string; content: string },
  id: string,
): { contentType: string; content: string } =>
  reduce(
    mp,
    (found, part) => {
      if (part.mp) return findBodyPart(part.mp, found, id);
      if (part && part.body) {
        if (!found.contentType.length) {
          return { contentType: part.ct, content: part.content ?? '' };
        }
        if (
          part.part &&
          part.part.indexOf('.') === -1 &&
          part.cd &&
          part.cd === 'inline' &&
          !part.ci &&
          !(part.ct && part.ct === 'text/plain')
        ) {
          return {
            ...found,
            content: found.content.concat(
              `<img src='/service/home/~/?auth=co&loc=en&id=${id}&part=${part?.part}'>`,
            ),
          };
        }
        return { ...found, content: found.content.concat(part.content ?? '') };
      }
      return found;
    },
    acc,
  );

export const generateBody = (
  mp: Array<SoapMailMessagePart>,
  id: string,
): BodyContent => findBodyPart(mp, { contentType: '', content: '' }, id);

const extractAttachmentIdsFromHtmlContent = (content: string): Array<string> => {
  const matches = content.match(/cid:(.*?)(?="|&)/g);
  return matches ? map(matches, (match) => match.replace('cid:', '')) : [];
};

const getAttachmentsAnchoredOnHtmlBody = (
  multipart: Array<SoapMailMessagePart> | undefined | AttachmentPart | Array<AttachmentPart>,
): Array<string> => {
  const result: Array<string> = [];

  const extractCid = (
    mp: Array<SoapMailMessagePart> | undefined | AttachmentPart | Array<AttachmentPart>,
  ): void => {
    forEach(mp, (item: SoapMailMessagePart) => {
      if (item.mp) {
        extractCid(item.mp);
      }
      if (item.content) {
        result.push(...extractAttachmentIdsFromHtmlContent(item.content));
      }
    });
  };

  extractCid(multipart);
  return result;
};

const cleanUpCi = (id: string): string => id.slice(1, id.indexOf('@'));

const isIgnoreAttachment = (item: AttachmentPart): boolean => {
  if ((item && item.ct === 'multipart/appledouble') || item.ct === 'application/applefile') {
    return true;
  }
  if (item.body && (item.ct === 'text/html' || item.ct === 'text/plain')) {
    return true;
  }
  if (item.ct === 'multipart/digest') {
    return true;
  }
  if (item.ci && item.ci === 'text-body') {
    return true;
  }

  if (item.ct === 'text/calendar' && !item.filename) {
    return true;
  }
  return false;
};

export const getAttachmentsFromParts = (
  mailParts: Array<AttachmentPart> | AttachmentPart,
): Array<AttachmentPart> => {
  const anchoredAttachmentsList = getAttachmentsAnchoredOnHtmlBody(mailParts);
  let results: Array<AttachmentPart> = [];
  if (mailParts) {
    if (isArray(mailParts)) {
      forEach(mailParts, (part) => {
        const attachmentParts = getAttachmentsFromParts(part);
        forEach(attachmentParts, (attachmentPart: AttachmentPart) => {
          if (!isIgnoreAttachment(attachmentPart)) {
            const item = {
              ...attachmentPart,
              contentType: attachmentPart.ct,
              name: attachmentPart?.part,
              size: attachmentPart?.s,
            };
            if (
              (item.cd && item.cd === 'attachment') ||
              (item.ct && (item.ct === 'message/rfc822' || item.ct === 'text/calendar')) ||
              item.filename ||
              item.ci
            ) {
              if (
                item.cd &&
                item.cd === 'inline' &&
                item.ci &&
                anchoredAttachmentsList.includes(cleanUpCi(item.ci))
              ) {
                item.cd = 'inline';
              } else if (
                part.ct === 'multipart/related' &&
                item.ci &&
                item.cd &&
                item.cd === 'attachment' &&
                anchoredAttachmentsList.includes(cleanUpCi(item.ci))
              ) {
                item.cd = 'inline';
              } else {
                item.cd = 'attachment';
              }
              if (item.ct === 'message/rfc822' && !item.filename) {
                item.filename = 'Unknown <message/rfc822>';
              }
              if (item.ct === 'text/html' && !item.filename) {
                item.filename = 'Unknown <text/html>';
              }
              if (item.ct && item.ct !== 'application/pkcs7-signature') {
                results.push(item);
              }
            }
          }
        });
      });
    } else if (
      (mailParts && mailParts.cd && mailParts.cd === 'attachment') ||
      (mailParts.ct &&
        (mailParts.ct === 'message/rfc822' || mailParts.ct === 'text/calendar')) ||
      mailParts.filename ||
      mailParts.ci
    ) {
      const updatedMailPart: AttachmentPart = { ...mailParts };
      if (isIgnoreAttachment(mailParts)) {
        extractAttachmentIdsFromHtmlContent(updatedMailPart.content || '');
        if (
          updatedMailPart.cd &&
          updatedMailPart.cd === 'inline' &&
          updatedMailPart.ci &&
          anchoredAttachmentsList.includes(cleanUpCi(updatedMailPart.ci))
        ) {
          updatedMailPart.cd = 'inline';
        } else if (
          updatedMailPart.ct === 'multipart/related' &&
          updatedMailPart.ci &&
          updatedMailPart.cd &&
          updatedMailPart.cd === 'attachment' &&
          anchoredAttachmentsList.includes(cleanUpCi(updatedMailPart.ci))
        ) {
          updatedMailPart.cd = 'inline';
        } else {
          updatedMailPart.cd = 'attachment';
        }
      }
      results.push(updatedMailPart);
    } else if (mailParts.mp) {
      results = results.concat(getAttachmentsFromParts(mailParts.mp));
    }
  }
  return results;
};

export const buildGetMsgBatch = (messages: Array<{ id: string }>): Array<unknown> => {
  const data = messages;
  const messageListArr: any = [];
  data?.forEach((item: any): any =>
    messageListArr.push({
      _jsns: 'urn:zimbraMail',
      m: {
        html: 1,
        id: item.id,
        needExp: 1,
        header: [
          {
            n: 'X-Envelope-From',
          },
          {
            n: 'X-Envelope-To',
          },
          {
            n: 'X-Envelope-To-Blocked',
          },
          {
            n: 'X-Amavis-Alert',
          },
          {
            n: 'X-Spam-Flag',
          },
          {
            n: 'X-Spam-Score',
          },
          {
            n: 'X-Spam-Level',
          },
          {
            n: 'X-Spam-Status',
          },
        ],
      },
    }),
  );
  return messageListArr;
};

const processMessageAttributes = (args: any): any => {
  const attrs = cloneDeep(args);
  const singleValueKeys = [
    'X-Spam-Status',
    'X-Spam-Score',
    'X-Amavis-Alert',
    'X-Envelope-From',
    'X-Envelope-To',
  ];

  singleValueKeys.forEach((key) => {
    if (Array.isArray(attrs[key])) {
      attrs[key] = attrs[key].pop();
    }
  });

  return attrs;
};

export const extractScoreValue = (spamStatus: string): string => {
  const scoreValueArr = (spamStatus || '')?.split('score=');
  return scoreValueArr.length > 1 ? scoreValueArr[1]?.split(' ')?.[0] || '' : '';
};

export const normalizeParticipants = (
  participants: Array<SoapMailParticipant> | undefined,
): Array<Participant> => (participants ? map(participants, normalizeParticipantsFromSoap) : []);

const normalizeMailParts = (
  parts: Array<SoapMailMessagePart> | undefined,
): Array<MailMessagePart> => (parts ? map(parts, normalizeMailPartMapFn) : []);

const getAttachments = (parts: Array<AttachmentPart> | undefined): Array<AttachmentPart> =>
  parts ? getAttachmentsFromParts(parts) : [];

export const parseFlags = (flags: string | undefined): ParsedFlags => ({
  read: !isNil(flags) ? !/u/.test(flags) : true,
  hasAttachment: !isNil(flags) ? /a/.test(flags) : false,
  flagged: !isNil(flags) ? /f/.test(flags) : false,
  urgent: !isNil(flags) ? /!/.test(flags) : false,
  isDeleted: !isNil(flags) ? /x/.test(flags) : false,
  isDraft: !isNil(flags) ? /d/.test(flags) : false,
  isForwarded: !isNil(flags) ? /w/.test(flags) : false,
  isSentByMe: !isNil(flags) ? /s/.test(flags) : false,
  isInvite: !isNil(flags) ? /v/.test(flags) : false,
  isReplied: !isNil(flags) ? /r/.test(flags) : false,
  isReadReceiptRequested: !isNil(flags) ? !/n/.test(flags) : true,
});

export const sanitizeEmail = (email: string | undefined): string =>
  replace(email ?? '', /[<>]/g, '');

export type SoapQuarantineMessage = {
  cid?: string;
  id: string;
  d: number;
  s: number;
  l: string;
  fr?: string;
  su?: string;
  e?: Array<SoapMailParticipant>;
  mp?: Array<SoapMailMessagePart>;
  inv?: unknown;
  shr?: unknown;
  f?: string;
  autoSendTime?: number;
  _attrs?: Record<string, unknown>;
};

export const normalizeMessage = (m: SoapQuarantineMessage): IncompleteMessage => {
  const attrs = processMessageAttributes(m?._attrs || {});
  const flags = parseFlags(m.f);
  const scoreValueString = extractScoreValue(attrs['X-Spam-Status']);

  return {
    conversation: m.cid ?? '',
    id: m.id,
    date: m.d,
    size: m.s,
    parent: m.l,
    fragment: m.fr,
    subject: m.su ?? '',
    participants: normalizeParticipants(m.e),
    tags: [],
    parts: normalizeMailParts(m.mp),
    attachments: getAttachments(m.mp),
    invite: m.inv,
    shr: m.shr,
    body: m.mp ? generateBody(m.mp, m.id) : { contentType: '', content: '' },
    isComplete: true,
    isScheduled: !!m.autoSendTime,
    autoSendTime: m.autoSendTime,
    read: flags.read,
    hasAttachment: flags.hasAttachment,
    flagged: flags.flagged,
    urgent: flags.urgent,
    isDeleted: flags.isDeleted,
    isDraft: flags.isDraft,
    isForwarded: flags.isForwarded,
    isSentByMe: flags.isSentByMe,
    isInvite: flags.isInvite,
    isReplied: flags.isReplied,
    isReadReceiptRequested: flags.isReadReceiptRequested,
    score: attrs['X-Spam-Score'] || scoreValueString || '',
    reason: attrs['X-Amavis-Alert'] || '',
    envelopeFrom: sanitizeEmail(attrs['X-Envelope-From']),
    envelopeTo: sanitizeEmail(attrs['X-Envelope-To']),
  };
};
