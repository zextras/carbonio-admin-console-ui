/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Checkbox,
  ClickableRowFactory,
  Container,
  CustomHeaderFactory,
  Input,
  LabeledValue,
  ListRow,
  Padding,
  Select,
  Table,
} from '@zextras/ui-components';
import { cloneDeep } from 'lodash-es';
import { useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import type { PolicyCriteriaItem } from '../../../../types';
import { HSMContext } from '../hsm-context/hsm-context';

type SelectOption = { label: string; value: string };

export function EditHsmPolicyDetailSection() {
  const { server } = useParams();
  const [t] = useTranslation();
  const context = useContext(HSMContext);
  const { form } = context;
  const formValues = useSelector(form.store, (s) => s.values);
  const isMessageEnable = formValues.isMessageEnabled;
  const isEventEnable = formValues.isEventEnabled;
  const isContactEnable = formValues.isContactEnabled;
  const isDocument = formValues.isDocumentEnabled;
  const all = isDocument && isContactEnable && isMessageEnable && isEventEnable;
  const policyCriteria = formValues.policyCriteria;
  const [isShowDateScale, setIsShowDateScale] = useState<boolean>(true);
  const [value, setValue] = useState<string>();
  const [selectedPolicies, setSelectedPolicies] = useState<Array<string>>([]);
  const [isUpdatePolicyCriteria, setIsUpdatePolicyCriteria] = useState<boolean>(false);

  const updatePolicyCriteria = (newCriteria: Array<PolicyCriteriaItem>): void => {
    form.setFieldValue('policyCriteria', newCriteria);
  };

  const options: Array<SelectOption> = [
    {
      label: t('hsm.after_date', 'After (Date)'),
      value: 'after',
    },
    {
      label: t('hsm.before_date', 'Before (Date)'),
      value: 'before',
    },
    {
      label: t('hsm.larger_size', 'Larger (Size)'),
      value: 'larger',
    },
    {
      label: t('hsm.smaller_size', 'Smaller (Size)'),
      value: 'small',
    },
  ];

  const dateScaleOption: Array<SelectOption> = [
    {
      label: t('hsm.minutes', 'Minutes'),
      value: 'minutes',
    },
    {
      label: t('hsm.hours', 'Hours'),
      value: 'hours',
    },
    {
      label: t('hsm.days', 'Days'),
      value: 'days',
    },
    {
      label: t('hsm.months', 'Months'),
      value: 'months',
    },
    {
      label: t('hsm.years', 'Years'),
      value: 'years',
    },
  ];

  const scaleOptions: Array<SelectOption> = [
    {
      label: t('hsm.bytes', 'Byte (B)'),
      value: 'byte',
    },
    {
      label: t('hsm.kb', 'KB'),
      value: 'kb',
    },
    {
      label: t('hsm.mb', 'MB'),
      value: 'mb',
    },
    {
      label: t('hsm.gb', 'GB'),
      value: 'gb',
    },
  ];

  const headers = [
    {
      id: 'name',
      label: t('hsm.policy_criteria', 'Policy Criteria'),
      width: '100%',
      bold: true,
    },
  ];
  const [selectedOption, setSelectedOption] = useState<SelectOption | undefined>(options[0]);
  const [selectedScale, setSelectedScale] = useState<SelectOption | undefined>(
    isShowDateScale ? dateScaleOption[2] : scaleOptions[0],
  );
  const onOptionChange = (v: string | null): void => {
    const it = options.find((item) => item.value === v);
    setSelectedOption(it);
    if (it?.value === 'after' || it?.value === 'before') {
      setIsShowDateScale(true);
      setSelectedScale(dateScaleOption[0]);
    } else {
      setIsShowDateScale(false);
      setSelectedScale(scaleOptions[0]);
    }
  };

  const onScaleChange = (v: string | null): void => {
    const it = scaleOptions.find((item) => item.value === v);
    setSelectedScale(it);
  };

  const onDateScaleChange = (v: string | null): void => {
    const it = dateScaleOption.find((item) => item.value === v);
    setSelectedScale(it);
  };

  const onClickAll = (check: boolean) => {
    form.setFieldValue('isAllEnabled', check);
    form.setFieldValue('isMessageEnabled', check);
    form.setFieldValue('isEventEnabled', check);
    form.setFieldValue('isContactEnabled', check);
    form.setFieldValue('isDocumentEnabled', check);
  };

  const policyCriteriaRows =
    policyCriteria.length > 0
      ? policyCriteria.map((item: PolicyCriteriaItem, index: number) => {
          let displayPolicy = '';
          if (item?.option === 'before' || item?.option === 'after') {
            displayPolicy = `${item?.option} ${item?.dateScale} ${item?.scale}`;
          } else if (item?.option === 'larger' || item?.option === 'smaller') {
            displayPolicy = `${item?.option}  ${item?.dateScale} ${item?.scale}`;
          }
          return {
            id: String(index),
            columns: [
              <ds-text
                as="span"
                size="small"
                weight="regular"
                key={displayPolicy}
                onClick={(): void => {
                  onCriteriaSelected([String(index)]);
                }}
              >
                {displayPolicy}
              </ds-text>,
            ],
          };
        })
      : [];

  const onAdd = () => {
    const data: PolicyCriteriaItem = {
      option: selectedOption?.value ?? '',
      scale: selectedScale?.value ?? '',
      dateScale: value ?? '',
    };
    updatePolicyCriteria([...policyCriteria, data]);
  };

  const onDeletePolicy = () => {
    const reducedArr = policyCriteria.filter(
      (item, itemIndex) => itemIndex !== Number(selectedPolicies[0]),
    );
    updatePolicyCriteria(reducedArr);
    onCriteriaSelected([]);
  };

  const onCriteriaSelected = (selectedIndices: Array<string>): void => {
    setSelectedPolicies(selectedIndices);
    if (selectedIndices.length > 0) {
      setIsUpdatePolicyCriteria(true);
      const policy = policyCriteria[Number(selectedIndices[0])];
      const it = options.find((item) => item.value === policy?.option);
      setSelectedOption(it);
      if (policy) {
        if (policy?.option === 'after' || policy?.option === 'before') {
          setIsShowDateScale(true);
          onDateScaleChange(policy?.scale);
        } else {
          setIsShowDateScale(false);
          onScaleChange(policy?.scale);
        }
        setValue(policy?.dateScale);
      }
    } else {
      setValue('');
      setIsUpdatePolicyCriteria(false);
    }
  };

  const onUpdate = () => {
    const data: PolicyCriteriaItem = {
      option: selectedOption?.value ?? '',
      scale: selectedScale?.value ?? '',
      dateScale: value ?? '',
    };
    const _policy = cloneDeep(policyCriteria);
    _policy[Number(selectedPolicies[0])] = data;
    updatePolicyCriteria(_policy);
    setIsUpdatePolicyCriteria(false);
    setValue('');
    onCriteriaSelected([]);
  };

  return (
    <Container
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      height="calc(100vh - 18.75rem)"
      background="white"
      style={{ overflow: 'auto', padding: '1rem' }}
    >
      <ListRow>
        <Container padding={{ bottom: 'large' }}>
          <LabeledValue label={t('hsm.server', 'Server')} backgroundColor="gray6" value={server} />
        </Container>
      </ListRow>
      <ListRow>
        <Padding bottom="large">
          <ds-text as="h3" size="medium" weight="bold" color="gray0">
            {<Trans i18nKey="hsm.items" defaults="Items" />}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Container mainAlignment="flex-start" crossAlignment="flex-start">
          <Checkbox
            iconColor="primary"
            size="small"
            label={t('hsm.all', 'All')}
            value={all}
            onClick={(): void => {
              onClickAll(!all);
            }}
          />
        </Container>
        <Container mainAlignment="flex-start" crossAlignment="flex-start">
          <Checkbox
            iconColor="primary"
            size="small"
            label={t('hsm.message', 'Message')}
            value={isMessageEnable}
            onClick={(): void => {
              const newValue = !isMessageEnable;
              form.setFieldValue('isMessageEnabled', newValue);
              form.setFieldValue(
                'isAllEnabled',
                newValue && isContactEnable && isEventEnable && isDocument,
              );
            }}
          />
        </Container>
        <Container mainAlignment="flex-start" crossAlignment="flex-start">
          <Checkbox
            iconColor="primary"
            size="small"
            label={t('hsm.document', 'Document')}
            value={isDocument}
            onClick={(): void => {
              const newValue = !isDocument;
              form.setFieldValue('isDocumentEnabled', newValue);
              form.setFieldValue(
                'isAllEnabled',
                isMessageEnable && isContactEnable && isEventEnable && newValue,
              );
            }}
          />
        </Container>
        <Container mainAlignment="flex-start" crossAlignment="flex-start">
          <Checkbox
            iconColor="primary"
            size="small"
            label={t('hsm.event', 'Event')}
            value={isEventEnable}
            onClick={(): void => {
              const newValue = !isEventEnable;
              form.setFieldValue('isEventEnabled', newValue);
              form.setFieldValue(
                'isAllEnabled',
                isMessageEnable && isContactEnable && newValue && isDocument,
              );
            }}
          />
        </Container>
        <Container mainAlignment="flex-start" crossAlignment="flex-start">
          <Checkbox
            iconColor="primary"
            size="small"
            label={t('hsm.contact', 'Contact')}
            value={isContactEnable}
            onClick={(): void => {
              const newValue = !isContactEnable;
              form.setFieldValue('isContactEnabled', newValue);
              form.setFieldValue(
                'isAllEnabled',
                isMessageEnable && newValue && isEventEnable && isDocument,
              );
            }}
          />
        </Container>
      </ListRow>
      <ListRow>
        <Padding bottom="large" top="large">
          <ds-text as="h3" size="medium" weight="bold" color="gray0">
            {<Trans i18nKey="hsm.criteria" defaults="Criteria" />}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ right: 'large' }}
        >
          <Select
            items={options}
            background="gray5"
            label={t('hsm.option', 'Option')}
            showCheckbox={false}
            defaultSelection={selectedOption}
            onChange={onOptionChange}
          />
        </Container>
        {isShowDateScale && (
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ right: 'large' }}
          >
            <Select
              items={dateScaleOption}
              background="gray5"
              label={t('hsm.value', 'Value')}
              showCheckbox={false}
              defaultSelection={selectedScale}
              onChange={onDateScaleChange}
            />
          </Container>
        )}
        {!isShowDateScale && (
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ right: 'large' }}
          >
            <Select
              items={scaleOptions}
              background="gray5"
              label={t('hsm.value', 'Value')}
              showCheckbox={false}
              defaultSelection={selectedScale}
              onChange={onScaleChange}
            />
          </Container>
        )}
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ right: 'large' }}
        >
          <Input
            label={t('hsm.value', 'Value')}
            backgroundColor="gray5"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setValue(e.target.value);
            }}
          />
        </Container>
        <Container>
          {!isUpdatePolicyCriteria && (
            <Button
              type="outlined"
              label={t('label.add', 'Add')}
              icon="PlusOutline"
              iconPlacement="right"
              color="primary"
              size="large"
              onClick={onAdd}
            />
          )}
          {isUpdatePolicyCriteria && (
            <Button
              type="outlined"
              label={t('label.update', 'Update')}
              icon="EditOutline"
              iconPlacement="right"
              color="primary"
              size="large"
              onClick={onUpdate}
            />
          )}
        </Container>
        <Padding left="small">
          <Container
            width="3rem"
            height="fit"
            style={{ border: '0.063rem solid #d74942', margin: '0.25rem 0 0 0' }}
          >
            <Button
              type="ghost"
              color="error"
              icon="Trash2Outline"
              size="large"
              onClick={onDeletePolicy}
              disabled={selectedPolicies.length === 0}
            />
          </Container>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding top="large">
          <Table
            rows={policyCriteriaRows}
            headers={headers}
            showCheckbox
            multiSelect={false}
            selectedRows={selectedPolicies as [] | [string]}
            onSelectionChange={(selected): void => onCriteriaSelected(selected.map(String))}
            RowFactory={ClickableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Padding>
      </ListRow>
    </Container>
  );
}
