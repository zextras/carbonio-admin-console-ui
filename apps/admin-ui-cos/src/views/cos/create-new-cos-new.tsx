/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  CustomTextArea,
  DsStepperStep,
  Input,
  ListRow,
  Padding,
  Row,
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute } from '../../../types/attribute';
import { GENERAL_INFORMATION } from '../../constants';
import { useCreateCos } from '../../services/use-create-cos';
import styles from './create-new-cos.module.css';

export const CreateNewCos = () => {
  const [t] = useTranslation();
  const [zimbraNotes, setZimbraNotes] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [cosName, setCosName] = useState<string>('');
  const createCosMutation = useCreateCos();

  const onCreate = (): void => {
    const attributes: Array<Attribute> = [
      { n: 'zimbraNotes', _content: zimbraNotes },
      { n: 'description', _content: description },
      { n: 'cn', _content: cosName },
    ];
    createCosMutation.mutate(
      { name: cosName, attributes },
      {
        onSuccess: (data) => {
          const cos = data?.cos[0];
          replaceHistory(cos ? `/${cos.id}/${GENERAL_INFORMATION}` : '/');
        },
      },
    );
  };

  const onCancel = (): void => {
    replaceHistory('/');
  };

  const stepperSteps: Array<DsStepperStep> = [
    {
      label: t('label.general_information', 'General Information'),
      description: t(
        'cos.createCos.generalInfoDescription',
        'Give this Class of Service a recognizable name and pick the edition it is based on.',
      ),
    },
    {
      label: t('label.features', 'Features'),
      description: t(
        'cos.createCos.featuresDescription',
        'Choose features available for this COS based on the edition enabled.',
      ),
    },
  ];

  return (
    <div className={styles.outer}>
      <div className={styles.stepperColumn}>
        <ds-stepper steps={stepperSteps} current={0}></ds-stepper>
      </div>
      <div className={styles.contentColumn}>
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
                    <Input
                      label={t('label.cos_name', 'Cos Name')}
                      backgroundColor="gray5"
                      value={cosName}
                      onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                        setCosName(e.target.value.toLowerCase());
                      }}
                    />
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
                    <Input
                      label={t('label.description', 'Description')}
                      backgroundColor="gray5"
                      value={description}
                      onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                        setDescription(e.target.value);
                      }}
                    />
                  </Container>
                </ListRow>
                <ListRow>
                  <Container padding={{ all: 'small' }}>
                    <CustomTextArea
                      label={t('label.notes', 'Notes')}
                      backgroundColor="gray5"
                      value={zimbraNotes}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => {
                        setZimbraNotes(e.target.value);
                      }}
                    />
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
              label={t('label.create', 'Create')}
              icon="CheckmarkCircle"
              color="primary"
              disabled={cosName === ''}
              onClick={onCreate}
            />
          </Container>
        </Container>
      </div>
    </div>
  );
};
