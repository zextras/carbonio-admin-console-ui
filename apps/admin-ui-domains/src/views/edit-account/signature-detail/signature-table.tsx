/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ListRow,
  Row,
  Table,
} from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import { buildSignatureRows, type Signature } from './utils';

type SignatureTableProps = {
  signatureList: Array<Signature>;
  selectedSignature: Array<string>;
  onSelectionChange: (selected: Array<string>) => void;
};

/** Signature list table with its empty state. */
export const SignatureTable = ({
  signatureList,
  selectedSignature,
  onSelectionChange,
}: SignatureTableProps) => {
  const [t] = useTranslation();

  const signatureHeaders = [
    {
      id: 'name',
      label: t('label.name', 'Name'),
      width: '100%',
      bold: true,
    },
  ];

  const rows = buildSignatureRows(signatureList);

  return (
    <ListRow>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        orientation="horizontal"
        padding={{ top: 'large' }}
      >
        {rows.length > 0 && (
          <Table
            rows={rows}
            headers={signatureHeaders}
            showCheckbox={false}
            style={{ overflow: 'auto', height: '100%' }}
            selectedRows={selectedSignature}
            onSelectionChange={(selected: any): void => onSelectionChange(selected)}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        )}
        {rows.length === 0 && (
          <Container orientation="column" crossAlignment="center" mainAlignment="center">
            <Row>
              <img src={logo} alt="logo" />
            </Row>
            <Row
              padding={{ top: 'extralarge' }}
              orientation="vertical"
              crossAlignment="center"
              style={{ textAlign: 'center' }}
            >
              <ds-text weight="light" color="#828282" size="large" overflow="break-word" as="p">
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
              <ds-text weight="light" color="#828282" size="large" overflow="break-word" as="p">
                {t('label.do_you_need_more_information', 'Do you need more information?')}
              </ds-text>
            </Row>
            <Row
              orientation="vertical"
              crossAlignment="center"
              style={{ textAlign: 'center' }}
              padding={{ top: 'small' }}
              width="53%"
            >
              <ds-text weight="light" color="primary" as="span">
                {t('label.click_here', 'Click here')}
              </ds-text>
            </Row>
          </Container>
        )}
      </Container>
    </ListRow>
  );
};
