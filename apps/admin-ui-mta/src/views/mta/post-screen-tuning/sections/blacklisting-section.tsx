/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Input, Padding, Select, SelectItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaPostTuningFormApi } from '../types';

type BlacklistingSectionProps = Readonly<{
  form: MtaPostTuningFormApi;
  isShowBanner: boolean;
  setIsShowBanner: (value: boolean) => void;
  ignoreEnforceDropOptions: Array<SelectItem>;
}>;

const containerStyle = {
  borderRadius: '0.125rem 0.125rem 0 0',
  borderBottom: '0.063rem solid #2196D3',
  marginTop: '0.938rem',
  marginBottom: '0.938rem',
};

export function BlacklistingSection({
  form,
  isShowBanner,
  setIsShowBanner,
  ignoreEnforceDropOptions,
}: BlacklistingSectionProps) {
  const [t] = useTranslation();

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'medium', bottom: isShowBanner ? 'extrasmall' : 'large' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('mta.blacklisting', 'Blacklisting')}
        </ds-text>
      </Container>
      {isShowBanner && (
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          width="100%"
          background="#D3EBF8"
          padding={{ all: 'small' }}
          style={containerStyle}
          height="auto"
        >
          <Container
            crossAlignment="flex-start"
            orientation="horizontal"
            mainAlignment="space-between"
            width="100%"
          >
            <Container width="5%" padding={{ left: 'extralarge', right: 'extralarge' }}>
              <Padding horizontal="small">
                <ds-icon
                  icon="InfoOutline"
                  color="#2196D3"
                  style={{ width: '1.25rem', height: '1.25rem' }}
                ></ds-icon>
              </Padding>
            </Container>
            <Container
              padding={{
                top: 'small',
                bottom: 'small',
              }}
              crossAlignment="flex-start"
            >
              <ds-text as="p" overflow="break-word">
                {t(
                  'mta.graylisting_disabled_warning_message',
                  'This is a form of greylisting, so you need to disable other forms of greylisting.',
                )}
              </ds-text>
            </Container>
          </Container>

          <Container width="auto" padding={{ right: 'small' }}>
            <Button
              type="ghost"
              color={'text'}
              icon="CloseOutline"
              size="large"
              onClick={(): void => {
                setIsShowBanner(false);
              }}
            />
          </Container>
        </Container>
      )}
      <Container
        crossAlignment="flex-start"
        orientation="horizontal"
        mainAlignment="space-between"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
          <form.Field name="zimbraMtaPostscreenBlacklistAction">
            {(field) => (
              <Select
                items={ignoreEnforceDropOptions}
                background="gray5"
                label={t('mta.black_list_action', 'Blacklist Action')}
                showCheckbox={false}
                selection={ignoreEnforceDropOptions.find(
                  (item) => item.value === field.state.value,
                )}
                // @ts-expect-error - needs a fix
                onChange={(v: string) => field.handleChange(v)}
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraMtaPostscreenAccessList">
            {(field) => (
              <Input
                isRequired
                label={t('mta.access_list_path', 'Access List Path')}
                backgroundColor="gray5"
                value={field.state.value ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
      </Container>
    </>
  );
}
