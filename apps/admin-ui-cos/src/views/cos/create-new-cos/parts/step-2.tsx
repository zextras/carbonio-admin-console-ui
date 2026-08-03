/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  CustomTextArea,
  getFieldErrorProps,
  Input,
  ListRow,
  Padding,
  Row,
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { CREATE_COS_VALIDATION_MESSAGES } from '../schema';
import type { CreateCosFormApi } from '../types';

type CreateNewCosStep2Props = {
  form: CreateCosFormApi;
};

export const CreateNewCosStep2 = ({ form }: CreateNewCosStep2Props) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);

  const onCancel = (): void => {
    replaceHistory('/');
  };

  return (
    <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        background="gray6"
        height="58px"
      >
        <Row width="100%" mainAlignment="flex-start">
          <Padding all="large">
            <ds-text as="strong" size="medium" weight="bold" color="gray0">
              {t('label.new_cos', 'New COS')}
            </ds-text>
          </Padding>
          <ds-divider></ds-divider>
        </Row>
      </Container>
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflow: 'auto' }}
        width="100%"
        height="calc(100vh - 150px)"
        padding={{ top: 'large' }}
      >
        <Row mainAlignment="flex-start" width="100%">
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <Row
              mainAlignment="flex-start"
              width="100%"
              background="gray6"
              padding={{ left: 'large', top: 'large' }}
            >
              <ds-text as="strong" size="small" weight="bold" color="gray0">
                {t('label.general_information', 'General Information')}
              </ds-text>
            </Row>
            <ListRow>
              <Container padding={{ all: 'small' }} crossAlignment="flex-start">
                <form.Field name="cn">
                  {(field) => {
                    const error = getFieldErrorProps(
                      field,
                      isSubmitted,
                      t,
                      CREATE_COS_VALIDATION_MESSAGES,
                    );
                    return (
                      <Input
                        label={t('label.cos_name', 'Cos Name')}
                        backgroundColor="gray5"
                        value={field.state.value}
                        hasError={error.hasError}
                        description={error.description}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                          field.handleChange(e.target.value.toLowerCase());
                        }}
                      />
                    );
                  }}
                </form.Field>
                <Padding top="small">
                  <ds-text as="span" size="small" color="gray1">
                    {t(
                      'cos.creatCOS.cosNameLowerCaseInfo',
                      'COS name must contain only lowercase letters.',
                    )}
                  </ds-text>
                </Padding>
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <form.Field name="description">
                  {(field) => {
                    const error = getFieldErrorProps(
                      field,
                      isSubmitted,
                      t,
                      CREATE_COS_VALIDATION_MESSAGES,
                    );
                    return (
                      <Input
                        label={t('label.description', 'Description')}
                        backgroundColor="gray5"
                        value={field.state.value}
                        hasError={error.hasError}
                        description={error.description}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                          field.handleChange(e.target.value);
                        }}
                      />
                    );
                  }}
                </form.Field>
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <form.Field name="zimbraNotes">
                  {(field) => (
                    <CustomTextArea
                      label={t('label.notes', 'Notes')}
                      backgroundColor="gray5"
                      value={field.state.value}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => {
                        field.handleChange(e.target.value);
                      }}
                    />
                  )}
                </form.Field>
              </Container>
            </ListRow>
          </Container>
        </Row>
      </Container>
      <Container
        orientation="horizontal"
        crossAlignment="flex-start"
        mainAlignment="flex-end"
        background="gray6"
        height="58px"
        padding={{ top: 'small', right: 'large' }}
      >
        <Padding right="medium">
          <Button
            label={t('label.cancel', 'Cancel')}
            icon="Close"
            color="secondary"
            onClick={onCancel}
          />
        </Padding>

        <Button
          label={t('label.next', 'Next')}
          icon="CheckmarkCircle"
          color="primary"
          disabled={!form.state.canSubmit}
          onClick={() => form.handleSubmit()}
        />
      </Container>
    </Container>
  );
};
