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

export function buildSaveAttributes(
  mtaInboundSecurityDetail: MtaInboundSecurity | undefined,
): Array<Record<string, string>> {
  const attributes: Array<Record<string, string>> = [];

  if (mtaInboundSecurityDetail?.rejectUnknownClientHostname) {
    attributes.push({ n: ZIMBRA_MTA_RESTRICTION, _content: REJECT_UNKNOWN_CLIENT_HOSTNAME });
  }
  if (mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname) {
    attributes.push({
      n: ZIMBRA_MTA_RESTRICTION,
      _content: REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME,
    });
  }
  if (mtaInboundSecurityDetail?.rejectInvalidHeloHostname) {
    attributes.push({ n: ZIMBRA_MTA_RESTRICTION, _content: REJECT_INVALID_HELO_HOSTNAME });
  }
  if (mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname) {
    attributes.push({ n: ZIMBRA_MTA_RESTRICTION, _content: REJECT_NON_FQDN_HELO_HOSTNAME });
  }
  if (mtaInboundSecurityDetail?.rejectUnknownHeloHostname) {
    attributes.push({ n: ZIMBRA_MTA_RESTRICTION, _content: REJECT_UNKNOWN_HELO_HOSTNAME });
  }
  if (mtaInboundSecurityDetail?.rejectUnknownSenderDomain) {
    attributes.push({ n: ZIMBRA_MTA_RESTRICTION, _content: REJECT_UNKNOWN_SENDER_DOMAIN });
  }
  if (mtaInboundSecurityDetail?.rejectNonFqdnSender) {
    attributes.push({ n: ZIMBRA_MTA_RESTRICTION, _content: REJECT_NON_FQDN_SENDER });
  }

  if (!attributes.find((item) => item?.n === ZIMBRA_MTA_RESTRICTION)) {
    attributes.push({ n: ZIMBRA_MTA_RESTRICTION, _content: '' });
  }

  if (mtaInboundSecurityDetail?.zimbraMtaBlockedExtension) {
    const blockedExtension = mtaInboundSecurityDetail?.zimbraMtaBlockedExtension;
    if (blockedExtension.length === 0) {
      attributes.push({ n: ZIMBRA_MTA_BLOCKED_EXTENSION, _content: '' });
    } else {
      blockedExtension.forEach((item: string) => {
        attributes.push({ n: ZIMBRA_MTA_BLOCKED_EXTENSION, _content: item });
      });
    }
  }

  attributes.push({
    n: ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
    _content: mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnAdmin ? TRUE : FALSE,
  });
  attributes.push({
    n: ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
    _content: mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnRecipient ? TRUE : FALSE,
  });
  attributes.push({
    n: ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
    _content: mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender ? 'yes' : 'no',
  });
  attributes.push({
    n: ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
    _content: mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient ? 'yes' : 'no',
  });
  attributes.push({
    n: ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
    _content: mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions
      ? REJECT_SENDER_LOGIN_MISMATCH
      : '',
  });

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
  const zimbraMtaBlockedExtensionWarnAdmin = configInformation.filter(
    (item) => item?.n === ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
  );
  const zimbraMtaBlockedExtensionWarnRecipient = configInformation.filter(
    (item) => item?.n === ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
  );

  if (zimbraMtaBlockedExtensionWarnAdmin && zimbraMtaBlockedExtensionWarnAdmin[0]?._content) {
    result.zimbraMtaBlockedExtensionWarnAdmin =
      zimbraMtaBlockedExtensionWarnAdmin[0]?._content === TRUE;
  }

  if (
    zimbraMtaBlockedExtensionWarnRecipient &&
    zimbraMtaBlockedExtensionWarnRecipient[0]?._content
  ) {
    result.zimbraMtaBlockedExtensionWarnRecipient =
      zimbraMtaBlockedExtensionWarnRecipient[0]?._content === TRUE;
  }

  return result;
}

export function parseSmtpdRejectionData(
  configInformation: Array<ConfigItem>,
): Partial<MtaInboundSecurity> {
  const result: Partial<MtaInboundSecurity> = {};
  const zimbraMtaSmtpdRejectUnlistedSender = configInformation.filter(
    (item) => item?.n === ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
  );

  if (zimbraMtaSmtpdRejectUnlistedSender && zimbraMtaSmtpdRejectUnlistedSender[0]?._content) {
    result.zimbraMtaSmtpdRejectUnlistedSender =
      zimbraMtaSmtpdRejectUnlistedSender[0]?._content === 'yes';
  }

  const zimbraMtaSmtpdRejectUnlistedRecipient = configInformation.filter(
    (item) => item?.n === ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
  );
  if (
    zimbraMtaSmtpdRejectUnlistedRecipient &&
    zimbraMtaSmtpdRejectUnlistedRecipient[0]?._content
  ) {
    result.zimbraMtaSmtpdRejectUnlistedRecipient =
      zimbraMtaSmtpdRejectUnlistedRecipient[0]?._content === 'yes';
  }

  const zimbraMtaSmtpdSenderRestrictions = configInformation.filter(
    (item) => item?.n === ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
  );
  if (zimbraMtaSmtpdSenderRestrictions) {
    result.zimbraMtaSmtpdSenderRestrictions =
      zimbraMtaSmtpdSenderRestrictions.length > 0 &&
      zimbraMtaSmtpdSenderRestrictions[0]?._content === REJECT_SENDER_LOGIN_MISMATCH;
  }

  return result;
}

export function parseMtaRestrictionData(
  configInformation: Array<ConfigItem>,
): Partial<MtaInboundSecurity> {
  const result: Partial<MtaInboundSecurity> = {};
  const zimbraMtaRestriction = configInformation.filter(
    (item) => item?.n === ZIMBRA_MTA_RESTRICTION,
  );

  if (zimbraMtaRestriction) {
    const rejectUnknownClientHostname = zimbraMtaRestriction.filter(
      (item) => item?._content === REJECT_UNKNOWN_CLIENT_HOSTNAME,
    );
    result.rejectUnknownClientHostname =
      rejectUnknownClientHostname?.[0]?._content === REJECT_UNKNOWN_CLIENT_HOSTNAME;

    const rejectUnknownReverseClientHostname = zimbraMtaRestriction.filter(
      (item) => item?._content === REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME,
    );
    result.rejectUnknownReverseClientHostname =
      rejectUnknownReverseClientHostname?.[0]?._content === REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME;

    const rejectInvalidHeloHostname = zimbraMtaRestriction.filter(
      (item) => item?._content === REJECT_INVALID_HELO_HOSTNAME,
    );
    result.rejectInvalidHeloHostname =
      rejectInvalidHeloHostname?.[0]?._content === REJECT_INVALID_HELO_HOSTNAME;

    const rejectNonFqdnHeloHostname = zimbraMtaRestriction.filter(
      (item) => item?._content === REJECT_NON_FQDN_HELO_HOSTNAME,
    );
    result.rejectNonFqdnHeloHostname =
      rejectNonFqdnHeloHostname?.[0]?._content === REJECT_NON_FQDN_HELO_HOSTNAME;

    const rejectUnknownHeloHostname = zimbraMtaRestriction.filter(
      (item) => item?._content === REJECT_UNKNOWN_HELO_HOSTNAME,
    );
    result.rejectUnknownHeloHostname =
      rejectUnknownHeloHostname?.[0]?._content === REJECT_UNKNOWN_HELO_HOSTNAME;

    const rejectUnknownSenderDomain = zimbraMtaRestriction.filter(
      (item) => item?._content === REJECT_UNKNOWN_SENDER_DOMAIN,
    );
    result.rejectUnknownSenderDomain =
      rejectUnknownSenderDomain?.[0]?._content === REJECT_UNKNOWN_SENDER_DOMAIN;

    const rejectNonFqdnSender = zimbraMtaRestriction.filter(
      (item) => item?._content === REJECT_NON_FQDN_SENDER,
    );
    result.rejectNonFqdnSender = rejectNonFqdnSender?.[0]?._content === REJECT_NON_FQDN_SENDER;
  }

  return result;
}
