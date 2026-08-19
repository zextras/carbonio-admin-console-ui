/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MtaInboundSecurity } from '../../../../../types';
import {
  FALSE,
  REJECT_INVALID_HELO_HOSTNAME,
  REJECT_NON_FQDN_HELO_HOSTNAME,
  REJECT_NON_FQDN_SENDER,
  REJECT_SENDER_LOGIN_MISMATCH,
  REJECT_UNKNOWN_CLIENT_HOSTNAME,
  REJECT_UNKNOWN_HELO_HOSTNAME,
  REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME,
  REJECT_UNKNOWN_SENDER_DOMAIN,
  TRUE,
  ZIMBRA_MTA_BLOCKED_EXTENSION,
  ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
  ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
  ZIMBRA_MTA_RESTRICTION,
  ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
  ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
  ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
} from '../../../../constants';

type ConfigItem = Record<string, string>;

const RESTRICTION_FLAGS = [
  { flag: 'rejectUnknownClientHostname', content: REJECT_UNKNOWN_CLIENT_HOSTNAME },
  { flag: 'rejectUnknownReverseClientHostname', content: REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME },
  { flag: 'rejectInvalidHeloHostname', content: REJECT_INVALID_HELO_HOSTNAME },
  { flag: 'rejectNonFqdnHeloHostname', content: REJECT_NON_FQDN_HELO_HOSTNAME },
  { flag: 'rejectUnknownHeloHostname', content: REJECT_UNKNOWN_HELO_HOSTNAME },
  { flag: 'rejectUnknownSenderDomain', content: REJECT_UNKNOWN_SENDER_DOMAIN },
  { flag: 'rejectNonFqdnSender', content: REJECT_NON_FQDN_SENDER },
] as const;

function buildRestrictionAttributes(
  detail: MtaInboundSecurity | undefined,
): Array<Record<string, string>> {
  const restrictions = RESTRICTION_FLAGS.filter(({ flag }) => detail?.[flag]).map(({ content }) => ({
    n: ZIMBRA_MTA_RESTRICTION,
    _content: content,
  }));
  return restrictions.length > 0
    ? restrictions
    : [{ n: ZIMBRA_MTA_RESTRICTION, _content: '' }];
}

export function buildSaveAttributes(
  mtaInboundSecurityDetail: MtaInboundSecurity | undefined,
): Array<Record<string, string>> {
  const attributes: Array<Record<string, string>> = [
    ...buildRestrictionAttributes(mtaInboundSecurityDetail),
  ];

  if (mtaInboundSecurityDetail?.zimbraMtaBlockedExtension) {
    const blockedExtension = mtaInboundSecurityDetail.zimbraMtaBlockedExtension;
    if (blockedExtension.length === 0) {
      attributes.push({ n: ZIMBRA_MTA_BLOCKED_EXTENSION, _content: '' });
    } else {
      attributes.push(
        ...blockedExtension.map((item: string) => ({
          n: ZIMBRA_MTA_BLOCKED_EXTENSION,
          _content: item,
        })),
      );
    }
  }

  attributes.push(
    {
      n: ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
      _content: mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnAdmin ? TRUE : FALSE,
    },
    {
      n: ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
      _content: mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnRecipient ? TRUE : FALSE,
    },
    {
      n: ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
      _content: mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender ? 'yes' : 'no',
    },
    {
      n: ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
      _content: mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient ? 'yes' : 'no',
    },
    {
      n: ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
      _content: mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions
        ? REJECT_SENDER_LOGIN_MISMATCH
        : '',
    },
  );

  return attributes;
}

type ParseBlockExtensionResult = {
  initialBlockedExtension?: Array<string>;
  currentBlockedExtension?: Array<string>;
  mtaBlockExtension: Array<Record<string, string>>;
  commonBlockedExtensions: Array<string>;
};

export function parseBlockExtensionData(configInformation: Array<ConfigItem>): ParseBlockExtensionResult {
  const result: ParseBlockExtensionResult = {
    mtaBlockExtension: [],
    commonBlockedExtensions: [],
  };

  const findBlockExtension = configInformation.filter(
    (item) => item?.n === ZIMBRA_MTA_BLOCKED_EXTENSION,
  );
  if (findBlockExtension && findBlockExtension.length > 0) {
    const allExtensions: Array<Record<string, string>> = [];
    findBlockExtension.forEach((item) => {
      allExtensions.push({ label: item?._content });
    });
    result.initialBlockedExtension = findBlockExtension.map((item) => item?._content);
    result.currentBlockedExtension = allExtensions.map((item) => item?.label);
    result.mtaBlockExtension = allExtensions;
  }

  const findCommonBlockExtension = configInformation.filter(
    (item) => item?.n === 'zimbraMtaCommonBlockedExtension',
  );
  if (findCommonBlockExtension && findCommonBlockExtension.length > 0) {
    result.commonBlockedExtensions = findCommonBlockExtension.map((item) => item?._content);
  }

  return result;
}

export function parseBlockExtensionWarningData(
  configInformation: Array<ConfigItem>,
): Partial<MtaInboundSecurity> {
  const result: Partial<MtaInboundSecurity> = {};
  const warnAdmin = configInformation.find(
    (item) => item?.n === ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
  );
  if (warnAdmin?._content) {
    result.zimbraMtaBlockedExtensionWarnAdmin = warnAdmin._content === TRUE;
  }

  const warnRecipient = configInformation.find(
    (item) => item?.n === ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
  );
  if (warnRecipient?._content) {
    result.zimbraMtaBlockedExtensionWarnRecipient = warnRecipient._content === TRUE;
  }

  return result;
}

export function parseSmtpdRejectionData(
  configInformation: Array<ConfigItem>,
): Partial<MtaInboundSecurity> {
  const result: Partial<MtaInboundSecurity> = {};
  const rejectUnlistedSender = configInformation.find(
    (item) => item?.n === ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
  );

  if (rejectUnlistedSender?._content) {
    result.zimbraMtaSmtpdRejectUnlistedSender = rejectUnlistedSender._content === 'yes';
  }

  const rejectUnlistedRecipient = configInformation.find(
    (item) => item?.n === ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
  );
  if (rejectUnlistedRecipient?._content) {
    result.zimbraMtaSmtpdRejectUnlistedRecipient = rejectUnlistedRecipient._content === 'yes';
  }

  const senderRestrictions = configInformation.find(
    (item) => item?.n === ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
  );
  result.zimbraMtaSmtpdSenderRestrictions =
    senderRestrictions?._content === REJECT_SENDER_LOGIN_MISMATCH;

  return result;
}

export function parseMtaRestrictionData(
  configInformation: Array<ConfigItem>,
): Partial<MtaInboundSecurity> {
  const result: Partial<MtaInboundSecurity> = {};
  const restrictions = configInformation.filter((item) => item?.n === ZIMBRA_MTA_RESTRICTION);

  result.rejectUnknownClientHostname = restrictions.some(
    (item) => item?._content === REJECT_UNKNOWN_CLIENT_HOSTNAME,
  );
  result.rejectUnknownReverseClientHostname = restrictions.some(
    (item) => item?._content === REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME,
  );
  result.rejectInvalidHeloHostname = restrictions.some(
    (item) => item?._content === REJECT_INVALID_HELO_HOSTNAME,
  );
  result.rejectNonFqdnHeloHostname = restrictions.some(
    (item) => item?._content === REJECT_NON_FQDN_HELO_HOSTNAME,
  );
  result.rejectUnknownHeloHostname = restrictions.some(
    (item) => item?._content === REJECT_UNKNOWN_HELO_HOSTNAME,
  );
  result.rejectUnknownSenderDomain = restrictions.some(
    (item) => item?._content === REJECT_UNKNOWN_SENDER_DOMAIN,
  );
  result.rejectNonFqdnSender = restrictions.some(
    (item) => item?._content === REJECT_NON_FQDN_SENDER,
  );

  return result;
}
