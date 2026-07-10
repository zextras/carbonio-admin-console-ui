/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ListRow,
  Padding,
  Switch,
  Table,
  useSnackbar,
} from '@zextras/ui-components';
import { FC, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { HsmPolicyFromServer } from '../../../../../types';
import { HSMContext } from '../hsm-context/hsm-context';

const EditHsmPolicyVolumesSection: FC<{
  currentPolicy: HsmPolicyFromServer | undefined;
}> = ({ currentPolicy }) => {
  const [t] = useTranslation();
  const context = useContext(HSMContext);
  const { form, allVolumes } = context;
  const [showSourceVolume, setShowSourceVolume] = useState<boolean>(false);
  const [showDestinationVolume, setShowDestinationVolume] = useState<boolean>(false);
  const [selectedDestinationVolume, setSelectedDestinationVolume] = useState<Array<string>>([]);
  const [selectedSourceVolume, setSelectedSourceVolume] = useState<Array<string>>([]);
  const [isVolumeLoaded, setIsVolumeLoaded] = useState<boolean>(false);
  const createSnackbar = useSnackbar();

  const updateSourceVolumeSelection = (selectedIds: Array<string>): void => {
    setSelectedSourceVolume(selectedIds);
    const sourceVol = allVolumes?.filter(
      (item) => item?.id != null && selectedIds.includes(String(item.id)),
    );
    form.setFieldValue('sourceVolume', sourceVol ?? []);
  };

  const updateDestinationVolumeSelection = (selectedIds: Array<string>): void => {
    setSelectedDestinationVolume(selectedIds);
    const destVol = Array.isArray(allVolumes)
      ? allVolumes.filter((item) => item?.id != null && selectedIds.includes(String(item.id)))
      : [];
    form.setFieldValue('destinationVolume', destVol);
  };

  const headers = [
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

  useEffect(() => {
    if (currentPolicy?.hsmQuery && isVolumeLoaded === false) {
      const queries = currentPolicy?.hsmQuery.split(' ');
      if (queries && queries.length > 0) {
        setIsVolumeLoaded(true);
        queries.forEach((element: string) => {
          if (
            element !== '' &&
            (element.startsWith('source') || element.startsWith('destination'))
          ) {
            const option = element.split(':')[0];
            const valueItem = element.split(':')[1];
            if (option.startsWith('source')) {
              updateSourceVolumeSelection(valueItem.split(','));
              setShowSourceVolume(true);
            }
            if (option.startsWith('destination')) {
              updateDestinationVolumeSelection(valueItem.split(','));
              setShowDestinationVolume(true);
            }
          }
        });
      }
    }
  }, [currentPolicy, isVolumeLoaded]);

  return (
    <Container
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      height="calc(100vh - 18.75rem)"
      background="white"
      style={{ overflow: 'auto', padding: '1rem' }}
    >
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
              headers={headers}
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
              headers={headers}
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
  );
};

export default EditHsmPolicyVolumesSection;
