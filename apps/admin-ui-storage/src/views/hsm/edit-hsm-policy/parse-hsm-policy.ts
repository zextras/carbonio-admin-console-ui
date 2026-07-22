/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PolicyCriteriaItem } from '../../../../types';

type ParsedHsmType = {
  isMessageEnabled: boolean;
  isDocumentEnabled: boolean;
  isEventEnabled: boolean;
  isContactEnabled: boolean;
};

type ParsedHsmQueryVolumes = {
  sourceVolumeIds: Array<string>;
  destinationVolumeIds: Array<string>;
  hasSource: boolean;
  hasDestination: boolean;
};

export function parseHsmType(hsmType: Array<number> | undefined): ParsedHsmType {
  const result: ParsedHsmType = {
    isMessageEnabled: false,
    isDocumentEnabled: false,
    isEventEnabled: false,
    isContactEnabled: false,
  };
  if (!hsmType) {
    return result;
  }
  if (hsmType.length === 4) {
    return {
      isMessageEnabled: true,
      isDocumentEnabled: true,
      isEventEnabled: true,
      isContactEnabled: true,
    };
  }
  hsmType.forEach((element: number) => {
    if (element === 5) {
      result.isMessageEnabled = true;
    } else if (element === 8) {
      result.isDocumentEnabled = true;
    } else if (element === 11) {
      result.isEventEnabled = true;
    } else if (element === 6) {
      result.isContactEnabled = true;
    }
  });
  return result;
}

export function parseHsmQueryCriteria(hsmQuery: string | undefined): Array<PolicyCriteriaItem> {
  if (!hsmQuery) {
    return [];
  }
  const queries = hsmQuery.split(' ');
  if (!queries || queries.length === 0) {
    return [];
  }
  const parsedCriteria: Array<PolicyCriteriaItem> = [];
  queries.forEach((element: string) => {
    if (!element.startsWith('source') && !element.startsWith('destination')) {
      const option = element.match(/after|before|larger|small/g)?.join('');
      const scale = element.match(/minutes|hours|days|months|years/g)?.join('');
      const valueItem = element.match(/\d/g)?.join('');
      if (valueItem) {
        parsedCriteria.push({
          option: option ?? '',
          scale: scale ?? '',
          dateScale: valueItem,
        });
      }
    }
  });
  return parsedCriteria;
}

export function parseHsmQueryVolumes(hsmQuery: string | undefined): ParsedHsmQueryVolumes {
  const result: ParsedHsmQueryVolumes = {
    sourceVolumeIds: [],
    destinationVolumeIds: [],
    hasSource: false,
    hasDestination: false,
  };
  if (!hsmQuery) {
    return result;
  }
  const queries = hsmQuery.split(' ');
  if (!queries || queries.length === 0) {
    return result;
  }
  queries.forEach((element: string) => {
    if (
      element !== '' &&
      (element.startsWith('source') || element.startsWith('destination'))
    ) {
      const option = element.split(':')[0];
      const valueItem = element.split(':')[1];
      if (option.startsWith('source')) {
        result.hasSource = true;
        if (valueItem) {
          result.sourceVolumeIds.push(...valueItem.split(','));
        }
      }
      if (option.startsWith('destination')) {
        result.hasDestination = true;
        if (valueItem) {
          result.destinationVolumeIds.push(...valueItem.split(','));
        }
      }
    }
  });
  return result;
}
