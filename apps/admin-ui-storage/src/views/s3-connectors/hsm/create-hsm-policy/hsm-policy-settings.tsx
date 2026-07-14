/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Checkbox,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  LabeledValue,
  ListRow,
  Padding,
  Row,
  Select,
  Switch,
  Table,
  useSnackbar,
} from '@zextras/ui-components';
import { useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import type { PolicyCriteriaItem } from '../../../../../types';
import { HSMContext } from '../hsm-context/hsm-context';

type SelectOption = { label: string; value: string };

export function HSMpolicySettings() {
  const { server } = useParams();
  const [t] = useTranslation();
  const context = useContext(HSMContext);
  const { form, allVolumes } = context;
  const [isMessageEnable, setIsMessageEnable] = useState<boolean>(form.state.values.isMessageEnabled);
  const [isEventEnable, setIsEventEnable] = useState<boolean>(form.state.values.isEventEnabled);
  const [isContactEnable, setIsContactEnable] = useState<boolean>(form.state.values.isContactEnabled);
  const [isDocument, setIsDocument] = useState<boolean>(form.state.values.isDocumentEnabled);
  const all = isDocument && isContactEnable && isMessageEnable && isEventEnable;
  const [value, setValue] = useState<string>();
  const [selectedPolicies, setSelectedPolicies] = useState<Array<string>>([]);

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
      value: 'smaller',
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

  const [isShowDateScale, setIsShowDateScale] = useState<boolean>(true);

  const [selectedScale, setSelectedScale] = useState<SelectOption | undefined>(
    isShowDateScale ? dateScaleOption[2] : scaleOptions[0],
  );
  const [showSourceVolume, setShowSourceVolume] = useState<boolean>(
    form.state.values.sourceVolume.length > 0,
  );
  const [showDestinationVolume, setShowDestinationVolume] = useState<boolean>(
    form.state.values.destinationVolume.length > 0,
  );

  const [selectedDestinationVolume, setSelectedDestinationVolume] = useState<Array<string>>(
    form.state.values.destinationVolume.map((item) => String(item?.id)).filter((id) => id !== 'undefined'),
  );
  const [selectedSourceVolume, setSelectedSourceVolume] = useState<Array<string>>(
    form.state.values.sourceVolume.map((item) => String(item?.id)).filter((id) => id !== 'undefined'),
  );
  const createSnackbar = useSnackbar();

  const updateSourceVolumeSelection = (selectedIds: Array<string>): void => {
    setSelectedSourceVolume(selectedIds);
    const sourceVol = Array.isArray(allVolumes)
      ? allVolumes.filter((item) => item?.id != null && selectedIds.includes(String(item.id)))
      : [];
    form.setFieldValue('sourceVolume', sourceVol);
  };

  const updateDestinationVolumeSelection = (selectedIds: Array<string>): void => {
    setSelectedDestinationVolume(selectedIds);
    const destVol = Array.isArray(allVolumes)
      ? allVolumes.filter((item) => item?.id != null && selectedIds.includes(String(item.id)))
      : [];
    form.setFieldValue('destinationVolume', destVol);
  };

  const updatePolicyCriteria = (newCriteria: Array<PolicyCriteriaItem>): void => {
    setPolicyCriteria(newCriteria);
    form.setFieldValue('policyCriteria', newCriteria);
  };

  const header = [
    {
      id: 'name',
      label: t('hsm.name', 'Name'),
      width: '25%',
      bold: true,
    },
    {
      id: 'allocation',
      label: t('hsm.allocation', 'Allocation'),
      width: '25%',
      bold: true,
    },
    {
      id: 'type',
      label: t('hsm.type', 'Type'),
      width: '25%',
      bold: true,
    },
    {
      id: 'current',
      label: t('hsm.current', 'Current'),
      width: '25%',
      bold: true,
    },
  ];

  const getVoumeType = (type: number | undefined): string => {
    if (type === 1) {
      return t('hsm.primary', 'Primary');
    }
    if (type === 2) {
      return t('hsm.secondary', 'Secondary');
    }
    return t('hsm.indexes', 'Indexes');
  };

  const volumeRows =
    allVolumes && allVolumes.length > 0
      ? allVolumes.map((item) => ({
          id: String(item?.id ?? ''),
          columns: [
            <ds-text as="span" size="small" weight="regular" key={item?.id}>
              {item?.name}
            </ds-text>,
            <ds-text as="span" size="small" weight="light" key={item?.id}>
              {''}
            </ds-text>,
            <ds-text as="span" size="small" weight="light" key={item?.id}>
              {getVoumeType(item?.type)}
            </ds-text>,
            <ds-text
              as="span"
              size="small"
              weight="light"
              key={item?.id}
              color={item?.isCurrent ? 'gray0' : '#D74942'}
            >
              {item?.isCurrent ? t('hsm.yes', 'Yes') : t('hsm.no', 'No')}
            </ds-text>,
          ],
        }))
      : [];

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

  const [policyCriteria, setPolicyCriteria] = useState<Array<PolicyCriteriaItem>>(form.state.values.policyCriteria);

  const onAdd = () => {
    const newCriteria = [
      ...policyCriteria,
      {
        option: selectedOption?.value ?? '',
        scale: selectedScale?.value ?? '',
        dateScale: value ?? '',
      },
    ];
    updatePolicyCriteria(newCriteria);
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
                key={index}
                onClick={(): void => {
                  setSelectedPolicies([String(index)]);
                }}
              >
                {displayPolicy}
              </ds-text>,
            ],
          };
        })
      : [];

  const onClickAll = (check: boolean) => {
    form.setFieldValue('isAllEnabled', check);
    form.setFieldValue('isMessageEnabled', check);
    form.setFieldValue('isEventEnabled', check);
    form.setFieldValue('isContactEnabled', check);
    form.setFieldValue('isDocumentEnabled', check);
    setIsDocument(check);
    setIsContactEnable(check);
    setIsMessageEnable(check);
    setIsEventEnable(check);
  };

  const onDeletePolicy = () => {
    const reducedArr = policyCriteria.filter(
      (item, itemIndex) => itemIndex !== Number(selectedPolicies[0]),
    );
    updatePolicyCriteria(reducedArr);
    setSelectedPolicies([]);
  };

  return (
    <Container
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      height="calc(100vh - 12.5rem)"
      background="white"
      style={{ overflow: 'auto', padding: '1rem' }}
    >
      <ListRow>
        <Container padding={{ bottom: 'extralarge' }}>
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
              setIsMessageEnable(newValue);
              form.setFieldValue('isMessageEnabled', newValue);
              form.setFieldValue('isAllEnabled', newValue && isContactEnable && isEventEnable && isDocument);
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
              setIsDocument(newValue);
              form.setFieldValue('isDocumentEnabled', newValue);
              form.setFieldValue('isAllEnabled', isMessageEnable && isContactEnable && isEventEnable && newValue);
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
              setIsEventEnable(newValue);
              form.setFieldValue('isEventEnabled', newValue);
              form.setFieldValue('isAllEnabled', isMessageEnable && isContactEnable && newValue && isDocument);
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
              setIsContactEnable(newValue);
              form.setFieldValue('isContactEnabled', newValue);
              form.setFieldValue('isAllEnabled', isMessageEnable && newValue && isEventEnable && isDocument);
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
          <Button
            type="outlined"
            label={t('label.add', 'Add')}
            icon="PlusOutline"
            iconPlacement="right"
            color="primary"
            onClick={onAdd}
            size="large"
          />
        </Container>
        <Container maxWidth="5rem">
          <Button
            type="outlined"
            key="add-button"
            label={''}
            color="error"
            icon="Trash2Outline"
            iconPlacement="left"
            size="large"
            onClick={onDeletePolicy}
          />
        </Container>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ top: 'large' }}
        >
          <Table
            rows={policyCriteriaRows}
            headers={headers}
            showCheckbox={false}
            multiSelect={false}
            selectedRows={selectedPolicies as [] | [string]}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
      </ListRow>
      {policyCriteriaRows?.length === 0 && (
        <Container orientation="column" crossAlignment="center" mainAlignment="center">
          <Row
            padding={{ top: 'extralarge' }}
            orientation="vertical"
            crossAlignment="center"
            style={{ textAlign: 'center' }}
          >
            <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
              {t('label.this_list_is_empty', 'This list is empty.')}
            </ds-text>
          </Row>
          <Row
            orientation="vertical"
            crossAlignment="center"
            style={{ textAlign: 'center' }}
            padding={{ top: 'small' }}
            width="53%"
          >
            <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
              <Trans
                i18nKey="label.do_you_need_more_information"
                defaults="Do you need more information?"
              />
            </ds-text>
          </Row>
          <Row
            orientation="vertical"
            crossAlignment="center"
            style={{ textAlign: 'center' }}
            padding={{ top: 'small', bottom: 'small' }}
            width="53%"
          >
            <ds-text as="span" weight="light" color="primary">
              {t('label.click_here', 'Click here')}
            </ds-text>
          </Row>
        </Container>
      )}
      <Container padding={{ top: 'extralarge', bottom: 'extralarge' }}>
        <ds-divider></ds-divider>
      </Container>

      <Container mainAlignment="flex-start" crossAlignment="flex-start" background="white">
        <ListRow>
          <Padding bottom="large">
            <ds-text as="h3" size="medium" weight="bold" color="gray0">
              {<Trans i18nKey="hsm.source_volume" defaults="Source Volume" />}
            </ds-text>
          </Padding>
        </ListRow>
        <ListRow>
          <Padding bottom="large">
            <ds-text as="p" size="medium" color="secondary" style={{ whiteSpace: 'normal' }}>
              {t(
                'hsm.all_primary_volume_used_source_msg',
                'All primary volumes will be used as source by default. Or select manually other volumes.',
              )}
            </ds-text>
          </Padding>
        </ListRow>
        <ListRow>
          <Padding bottom="large">
            <Switch
              label={t('hsm.select_manually_source_volumes', 'Select manually source volumes')}
              value={showSourceVolume}
              onClick={(): void => {
                setShowSourceVolume(!showSourceVolume);
              }}
              iconColor="primary"
            />
          </Padding>
        </ListRow>
        <ListRow>
          <Padding bottom="large">
            {showSourceVolume && (
              <Table
                multiSelect
                rows={volumeRows}
                headers={header}
                selectedRows={selectedSourceVolume}
                onSelectionChange={(selected: Array<string | number>): void => {
                  const available = selectedDestinationVolume.filter((item) =>
                    selected?.includes(item),
                  );
                  if (available.length > 0) {
                    createSnackbar({
                      key: 'error',
                      severity: 'error',
                      label: t(
                        'hsm.volume_already_selected_in_destination',
                        'Volume already selected in destination volume',
                      ),
                      autoHideTimeout: 3000,
                      hideButton: true,
                      replace: true,
                    });
                  } else {
                    updateSourceVolumeSelection(selected.map(String));
                  }
                }}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
            )}
          </Padding>
        </ListRow>

        <ListRow>
          <Padding bottom="large">
            <ds-text as="h3" size="medium" weight="bold" color="gray0">
              {<Trans i18nKey="hsm.destination_volume" defaults="Destination Volume" />}
            </ds-text>
          </Padding>
        </ListRow>
        <ListRow>
          <Padding bottom="large">
            <ds-text as="p" size="medium" color="secondary" style={{ whiteSpace: 'normal' }}>
              {t(
                'hsm.all_secondary_volume_used_source_msg',
                'The current secondary volume will be used as a destination. Or select manually other volumes.',
              )}
            </ds-text>
          </Padding>
        </ListRow>
        <ListRow>
          <Padding bottom="large">
            <Switch
              label={t(
                'hsm.select_manually_destination_volumes',
                'Select manually destination volumes',
              )}
              value={showDestinationVolume}
              onClick={(): void => {
                setShowDestinationVolume(!showDestinationVolume);
              }}
              iconColor="primary"
            />
          </Padding>
        </ListRow>
        <ListRow>
          <Padding bottom="large">
            {showDestinationVolume && (
              <Table
                rows={volumeRows}
                headers={header}
                showCheckbox
                multiSelect
                selectedRows={selectedDestinationVolume}
                onSelectionChange={(selected: Array<string | number>): void => {
                  const available = selectedSourceVolume.filter((item) =>
                    selected?.includes(item),
                  );
                  if (available.length > 0) {
                    createSnackbar({
                      key: 'error',
                      severity: 'error',
                      label: t(
                        'hsm.volume_already_selected_in_source',
                        'Volume already selected in source volume',
                      ),
                      autoHideTimeout: 3000,
                      hideButton: true,
                      replace: true,
                    });
                  } else {
                    updateDestinationVolumeSelection(selected.map(String));
                  }
                }}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
            )}
          </Padding>
        </ListRow>
      </Container>
    </Container>
  );
}
