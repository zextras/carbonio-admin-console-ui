/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TFunction } from 'i18next';

export function getPercentage(used: number, total: number): number {
  return total ? Math.floor((used / total) * 100) : 100;
}

export function getExactPercentage(used: number, total: number): number {
  return (used / total) * 100;
}

export function humanFileSize(inputSize: number, t: TFunction | undefined): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (inputSize === 0) {
    const unit = units[0];
    const unitTranslated = t ? t('size.unitMeasure', { context: unit, defaultValue: unit }) : unit;
    return `0 ${unitTranslated}`;
  }
  const i = Math.floor(Math.log(inputSize) / Math.log(1024));
  if (i >= units.length) {
    throw new Error('Unsupported inputSize');
  }
  const unit = units[i >= 0 ? i : 0];
  const unitTranslated = t ? t('size.unitMeasure', { context: unit, defaultValue: unit }) : unit;
  const sizeNum = inputSize / 1024 ** i;
  let size: string;
  const rounded = Math.round(sizeNum);
  if (Math.abs(sizeNum - rounded) < 0.01) {
    size = rounded.toString();
  } else {
    size = sizeNum.toFixed(2);
  }
  return `${size} ${unitTranslated}`;
}
