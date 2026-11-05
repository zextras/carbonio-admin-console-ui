/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { SelectItem } from '@zextras/ui-components';
import { format } from 'date-fns';

const SLOT_MINUTES = 15;
const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;

export const RESTORE_TIME_VALUE_FORMAT = 'HH:mm';

export function withRestoreTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
}

export function clampRestoreDate(date: Date, now: Date): Date {
  if (date <= now) return date;
  const minutes = now.getMinutes() - (now.getMinutes() % SLOT_MINUTES);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), minutes);
}

export function getRestoreTimeSlots(date: Date, now: Date): Array<SelectItem> {
  return Array.from({ length: SLOTS_PER_DAY }, (_, index) => {
    const slot = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      index * SLOT_MINUTES,
    );
    return {
      label: format(slot, 'hh:mm a'),
      value: format(slot, RESTORE_TIME_VALUE_FORMAT),
      disabled: slot > now,
    };
  });
}
