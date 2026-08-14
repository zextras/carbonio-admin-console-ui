/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Row, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type StatusTextProps = {
  readonly value: string | undefined;
};

export const StatusText = ({ value }: StatusTextProps) => {
  const [t] = useTranslation();
  const naLabel = t('label.na', 'N/A');
  return (
    <ds-text as="span" size="small" weight="light" color={value ? 'gray0' : 'error'}>
      {value || naLabel}
    </ds-text>
  );
};

type TooltipTextProps = {
  readonly value: string | undefined;
  readonly tooltip: string | undefined;
};

export const TooltipText = ({ value, tooltip }: TooltipTextProps) => {
  const [t] = useTranslation();
  const naLabel = t('label.na', 'N/A');
  return (
    <Tooltip placement="bottom" label={tooltip || naLabel}>
      <ds-text as="span" size="small" weight="light" color={value ? 'gray0' : 'error'}>
        {value || naLabel}
      </ds-text>
    </Tooltip>
  );
};

type SpaceCellProps = {
  readonly value: string | undefined;
  readonly tooltip: string | undefined;
};

export const SpaceCell = ({ value, tooltip }: SpaceCellProps) => {
  const [t] = useTranslation();
  const naLabel = t('label.na', 'N/A');
  return (
    <Row mainAlignment="flex-start" width="100%">
      <ds-icon icon="FolderOutline"></ds-icon>
      <Row padding={{ left: 'small' }}>
        <Tooltip placement="bottom" label={tooltip || naLabel}>
          <ds-text as="span" size="small" weight="light" color={value ? 'gray0' : 'error'}>
            {value || naLabel}
          </ds-text>
        </Tooltip>
      </Row>
    </Row>
  );
};
