/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import { noop } from 'lodash-es';
import { useState } from 'react';

import { type RestoreAccountRequestParams } from '../../../services/restore-delete-account-service';
import { useRestoreDeleteAccount } from '../../../services/use-restore-delete-account';
import RestoreAccountWizard from './restore-delete-account-wizard';

export const RestoreDeleteAccount = () => {
  const [wizardKey, setWizardKey] = useState(0);

  // Remounts the wizard (resetting its internal state to the first step) without
  // any URL manipulation. Used on successful restore and on cancel.
  const resetWizard = () => {
    setWizardKey((state) => state + 1);
  };

  const restoreMutation = useRestoreDeleteAccount({ onRestored: resetWizard });

  const restoreAccountRequest = (params: RestoreAccountRequestParams) => {
    restoreMutation.mutate(params);
  };

  return (
    <Container background="gray5" mainAlignment="flex-start">
      <Container
        orientation="column"
        background="gray5"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
      >
        <Container
          orientation="column"
          background="gray6"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
        >
          <RestoreAccountWizard
            key={wizardKey}
            setShowRestoreAccountWizard={noop}
            restoreAccountRequest={restoreAccountRequest}
            onReset={resetWizard}
          />
        </Container>
      </Container>
    </Container>
  );
};
