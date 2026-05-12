/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, HorizontalWizard, WizardInSection } from '@zextras/ui-components';
import { type FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { ConnectionStepData, NewBucketProps } from '../../../types';
import Connection from './connection';

const NewBucket: FC<NewBucketProps> = ({ setToggleWizardSection, setDetailsBucket, bucketType, setConnectionData }) => {
  const { t } = useTranslation();

  const wizardSteps = [
    {
      name: 'connection',
      label: t('new_bucket_connection', 'CONNECTION'),
      icon: 'Link2Outline',
      view: Connection,
      canGoNext: (): boolean => true,
      CancelButton: (props: Record<string, unknown>) => (
        <Button
          {...props}
          type="outlined"
          key="wizard-cancel"
          label={t('label.bucket_need_help_button', 'NEED HELP?')}
          color="secondary"
          onClick={(): void => setToggleWizardSection(true)}
        />
      ),
      PrevButton: ({ completeLoading, disabled }: { completeLoading?: boolean; disabled?: boolean }): React.ReactElement => (
        <>
          {!completeLoading ? (
            <Button
              key="wizard-cancel"
              label={t('label.bucket_cancel_button', 'CANCEL')}
              color="secondary"
              icon="ChevronLeftOutline"
              iconPlacement="left"
              disabled={!!disabled}
              onClick={(): void => setToggleWizardSection(false)}
            />
          ) : (
            ''
          )}
        </>
      ),
      NextButton: ({ completeLoading }: { completeLoading?: boolean }): React.ReactElement => (
        <Button
          label={t('label.bucket_done_button', 'Done')}
          icon={'CheckmarkCircleOutline'}
          iconPlacement="right"
          disabled={!!completeLoading}
          style={{ marginLeft: '16px' }}
          onClick={(): void => {
            setToggleWizardSection(false);
          }}
        />
      ),
    },
  ];

  const onComplete = useCallback(
    (data: { steps: { connection: ConnectionStepData } }) => {
      setConnectionData(data.steps.connection);
      setToggleWizardSection(false);
      setDetailsBucket(false);
    },
    [setToggleWizardSection, setDetailsBucket, setConnectionData],
  );

  return (
    <HorizontalWizard
      steps={wizardSteps}
      title={t('buckets.new.bucket_connection', 'Bucket Connection')}
      Wrapper={WizardInSection}
      onComplete={onComplete}
      setToggleWizardSection={setToggleWizardSection}
      externalData={bucketType}
    />
  );
};
export default NewBucket;
