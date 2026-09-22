/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { SHARES_ENABLED } from '../../../constants';
import { useFilesConfigDefaults } from '../../../services/use-files-config-defaults';

/**
 * Read-only view of the base defaults for the files config. The `raw/default` endpoint is
 * read-only (there is no default-scope write endpoint); defaults come from the service
 * configuration and are overridden per COS, domain or account.
 */
function GlobalFilesDefaults() {
  const [t] = useTranslation();
  const { data, isPending } = useFilesConfigDefaults();

  const baseline = data?.defaults?.[SHARES_ENABLED];
  const sharesEnabled = baseline === 'true';

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
        <ListRow>
          <Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
            <Switch
              label={t('files_sharing.shares_enabled', 'Allow users to share files')}
              value={sharesEnabled}
              disabled
            />
          </Container>
        </ListRow>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            height="auto"
            padding={{ top: 'small' }}
          >
            <ds-text as="span" size="small" color="secondary">
              {t(
                'files_sharing.default_read_only_hint',
                'This is the base default. Override it per Class of Service, domain or account.',
              )}
            </ds-text>
          </Container>
        </ListRow>
      </Container>
    </Container>
  );
}

export default GlobalFilesDefaults;
