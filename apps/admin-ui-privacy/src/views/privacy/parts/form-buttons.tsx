/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Padding } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type FormButtonsProps = {
  onSave: () => void;
  onCancel: () => void;
};

export function FormButtons({ onCancel, onSave }: FormButtonsProps) {
  const [t] = useTranslation();
  return (
    <>
      <Padding right="large">
        <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
      </Padding>
      <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
    </>
  );
}
