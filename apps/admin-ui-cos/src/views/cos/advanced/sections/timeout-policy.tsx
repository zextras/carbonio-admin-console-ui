/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { TimeItems } from '../../../../../types/general';
import { TimeFieldGroup } from '../fields/time-field-group';
import { CosFormApi } from '../types';

type TimeoutPolicyProps = {
  form: CosFormApi;
  readonlyCOS: boolean;
  timeItems: TimeItems;
};

export const COSTimeoutPolicy = ({ form, readonlyCOS, timeItems }: TimeoutPolicyProps) => {
  const [t] = useTranslation();
  const labels = {
    timeoutPolicy: t('cos.timeout_policy', 'Timeout Policy'),
    adminAuthTokenLifetime: t(
      'cos.admin_console_auth_token_lifetime',
      'Admin console auth token lifetime',
    ),
    authTokenLifetime: t('cos.auth_token_lifetime', 'Auth token lifetime'),
    mailIdleSessionTimeout: t('cos.session_idle_timeout', 'Session idle timeout'),
  };
  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'large' }}
      width="100%"
    >
      <ds-text as="strong" weight="bold">
        {labels.timeoutPolicy}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <TimeFieldGroup
            form={form}
            name="zimbraAdminAuthTokenLifetime"
            label={labels.adminAuthTokenLifetime}
            readonlyCOS={readonlyCOS}
            timeItems={timeItems}
          />
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <TimeFieldGroup
            form={form}
            name="zimbraAuthTokenLifetime"
            label={labels.authTokenLifetime}
            readonlyCOS={readonlyCOS}
            timeItems={timeItems}
          />
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large', bottom: 'large' }}
        >
          <TimeFieldGroup
            form={form}
            name="zimbraMailIdleSessionTimeout"
            label={labels.mailIdleSessionTimeout}
            readonlyCOS={readonlyCOS}
            timeItems={timeItems}
          />
        </Container>
      </Row>
      <ds-divider></ds-divider>
    </Row>
  );
};
