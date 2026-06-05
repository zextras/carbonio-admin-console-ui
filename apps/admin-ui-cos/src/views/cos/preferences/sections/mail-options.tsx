/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Container,
  Input,
  ListRow,
  Padding,
  Row,
  Select,
  SelectItem,
  Switch,
} from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { bytesToHumanReadable, charactorSet, conversationGroupBy } from '../../../utility/utils';
import { CosPreferencesFormApi } from '../types';

type MailOptionsProps = {
  form: CosPreferencesFormApi;
  readonlyCOS: boolean;
};

const bytesToHumanFriendlyFileUploadMaxSizePerFile = (
  bytes: string | number,
  t: (key: string, defaultValue: string) => string,
): string => {
  const parsedBytes = Number(bytes);
  return parsedBytes === 0
    ? t('cos.unlimited', 'Unlimited')
    : `~${bytesToHumanReadable(parsedBytes)}`;
};

export const MailOptions = ({ form, readonlyCOS }: MailOptionsProps) => {
  const [t] = useTranslation();
  const GROUP_BY: SelectItem[] = conversationGroupBy(t);
  const CHARACTOR_SET: SelectItem[] = charactorSet();

  const fileUploadMaxSizePerFile = useSelector(
    form.store,
    (s) => s.values.zimbraFileUploadMaxSizePerFile,
  );
  const humanFriendlyLabel = bytesToHumanFriendlyFileUploadMaxSizePerFile(
    fileUploadMaxSizePerFile,
    t,
  );

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
      width="100%"
    >
      <ds-text as="strong" weight="bold">
        {t('label.mailing_options', 'Mail Options')}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <form.Field name="zimbraPrefMessageViewHtmlPreferred">
            {(field) => (
              <Switch
                value={field.state.value === 'TRUE'}
                onClick={() => field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')}
                label={t('cos.view_mail_as_html', 'View mail as HTML (when possible)')}
                iconColor="primary"
                disabled={readonlyCOS}
              />
            )}
          </form.Field>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container padding={{ right: 'small' }}>
              <form.Field name="zimbraPrefGroupMailBy">
                {(field) => (
                  <Select
                    background={'gray5'}
                    label={t('cos.display_by', 'Display by')}
                    showCheckbox={false}
                    items={GROUP_BY}
                    selection={
                      GROUP_BY.find((item) => item.value === field.state.value) || GROUP_BY[0]
                    }
                    onChange={(value): void => {
                      const newValue =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(newValue);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small' }}>
              <form.Field name="zimbraPrefMailDefaultCharset">
                {(field) => (
                  <Select
                    background={'gray5'}
                    label={t('cos.default_charset', 'Default Charset')}
                    showCheckbox={false}
                    items={CHARACTOR_SET}
                    selection={
                      CHARACTOR_SET.find((item) => item.value === field.state.value) ||
                      CHARACTOR_SET[0]
                    }
                    onChange={(value): void => {
                      const newValue =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(newValue);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large', bottom: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start" padding={{ right: 'small' }}>
              <form.Field name="zimbraPrefMessageIdDedupingEnabled">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.auto_delete_duplicate_messages',
                      'Auto-Delete duplicate messages',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container crossAlignment="flex-start" padding={{ left: 'small' }}>
              <form.Field name="zimbraPrefMailToasterEnabled">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.enable_new_mail_toast_notification',
                      'Enable New Mail Toast Notification',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container height="fit" crossAlignment="flex-start" width="50%">
          <Row mainAlignment="flex-start" width="100%">
            <Container width="75%" crossAlignment="flex-start">
              <form.Field name="zimbraFileUploadMaxSizePerFile">
                {(field) => (
                  <Input
                    type="number"
                    label={t(
                      'cos.upload_max_size_per_file',
                      'Maximum size (bytes) allowed for each attachment',
                    )}
                    value={field.state.value}
                    backgroundColor={'gray5'}
                    disabled={readonlyCOS}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                      if (
                        ![
                          'Backspace',
                          'Delete',
                          'ArrowLeft',
                          'ArrowRight',
                          'ArrowUp',
                          'ArrowDown',
                          '0',
                          '1',
                          '2',
                          '3',
                          '4',
                          '5',
                          '6',
                          '7',
                          '8',
                          '9',
                        ].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                      field.handleChange(e.target.value);
                    }}
                  />
                )}
              </form.Field>
            </Container>
            <Container width="25%" crossAlignment="flex-start">
              <Padding left="small">
                <ds-text as="span" size="medium" color="gray1">
                  {humanFriendlyLabel}
                </ds-text>
              </Padding>
            </Container>
          </Row>
        </Container>
      </Row>
    </Row>
  );
};
