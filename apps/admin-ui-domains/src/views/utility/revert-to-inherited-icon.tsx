/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IconCheckbox, Padding, Tooltip } from '@zextras/ui-components';

type RevertToInheritedIconProps = {
  label: string;
  onClick: () => void;
};

export const RevertToInheritedIcon = ({ label, onClick }: RevertToInheritedIconProps) => (
  <Tooltip
    label={
      <Padding top="small">
        <ds-text as="strong" weight="bold">
          {label}
        </ds-text>
      </Padding>
    }
  >
    <IconCheckbox
      icon="RefreshOutline"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      onChange={(): null => null}
      iconAriaLabel={label}
      onMouseDown={(e) => e.preventDefault()}
    />
  </Tooltip>
);
