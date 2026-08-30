/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Chip, type ChipProps } from './Chip';

type CustomChipProps = ChipProps & { value?: unknown };

function copyClipboard(label: string): void {
  navigator.clipboard.writeText(label);
}

export const CustomChip = (props: Readonly<CustomChipProps>) => {
  const label = typeof props?.label === 'string' ? props.label : '';
  const actions: ChipProps['actions'] = props?.actions ?? [
    {
      id: 'copy-to-clipboard',
      type: 'button' as const,
      icon: 'CopyOutline' as const,
      onClick: (): void => copyClipboard(label),
    },
  ];
  return <Chip {...props} actions={actions} color="black"></Chip>;
};
