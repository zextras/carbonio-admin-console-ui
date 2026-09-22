/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { SHARES_ENABLED } from '../../../constants';
import { useFilesConfigDefaults } from '../../../services/use-files-config-defaults';

function defaultLabel(
  value: string | null | undefined,
  t: (k: string, d: string) => string,
): string {
  if (value === 'true') {
    return t('files_sharing.state_enabled', 'Enabled');
  }
  if (value === 'false') {
    return t('files_sharing.state_disabled', 'Disabled');
  }
  return t('files_sharing.default_not_configured', 'Not configured');
}

/**
 * Read-only reference of the immutable base defaults (application.properties) exposed by
 * GET /config/raw/default. It is the `default`-tier fallback; it is not editable and it is
 * overridden per Class of Service or per account.
 */
function GlobalFiles() {
  const [t] = useTranslation();
  const { data, isPending } = useFilesConfigDefaults();

  if (isPending) {
    return <ds-spinner></ds-spinner>;
  }

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflowY: 'auto', position: 'relative' }}
      background="white"
    >
      <Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
        <ds-text as="h1" weight="bold">
          {t('files_sharing.title', 'File Sharing')}
        </ds-text>
      </Row>
      <ds-divider></ds-divider>
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        width="100%"
        padding={{ top: 'extralarge', right: 'large', bottom: 'large', left: 'large' }}
      >
        <Row mainAlignment="flex-start" width="100%" background="gray6" padding={{ bottom: 'small' }}>
          <ds-text as="h2" size="small" weight="bold" color="gray0">
            {t('files_sharing.base_default', 'Base default (read-only)')}
          </ds-text>
        </Row>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            height="auto"
            gap="0.25rem"
          >
            <ds-text as="span" size="medium">
              {`${t('files_sharing.shares_enabled', 'Allow users to share files')}: ${defaultLabel(
                data?.defaults?.[SHARES_ENABLED],
                t,
              )}`}
            </ds-text>
            <ds-text as="span" size="small" color="secondary">
              {t(
                'files_sharing.base_default_hint',
                'The immutable base default from the service configuration. It is not editable here and is overridden per Class of Service or account.',
              )}
            </ds-text>
          </Container>
        </ListRow>
      </Container>
    </Container>
  );
}

export default GlobalFiles;
