/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  LabeledValue,
  Modal,
  Padding,
  Row,
  useSnackbar,
} from '@zextras/ui-components';
import { createContext, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { DeleteHsmPolicyProps, HsmPolicyFromServer } from '../../../../../types';
import { APPOINTMENT, CONTACT, DOCUMENT, MESSAGE } from '../../../../constants';

const CopyActionContext = createContext<{ onCopy: () => void }>({ onCopy: () => {} });

function CopyPolicyIcon() {
	const { onCopy } = useContext(CopyActionContext);
	return (
		<Button type="ghost" color={'grey'} icon="CopyOutline" size="large" onClick={onCopy} />
	);
}

export function DeleteHsmPolicy({
  showDeletePolicyView,
  setShowDeletePolicyView,
  selectedPolicies,
  onDeletePolicy,
  isRequestInProgress,
  policies,
}: DeleteHsmPolicyProps) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const getHSMType = (query: string): string => {
    const hsmType = policies.find((item: HsmPolicyFromServer) => item?.hsmQuery === query)?.hsmType ?? [];
    let hsmTypeString = '';
    if (hsmType && hsmType?.length > 0) {
      if (hsmType.length === 4) {
        hsmTypeString = 'document,message,contact,appointment:';
      } else {
        const item: string[] = [];
        hsmType.forEach((element: number) => {
          if (element === 5) {
            item.push(MESSAGE);
          } else if (element === 8) {
            item.push(DOCUMENT);
          } else if (element === 11) {
            item.push(APPOINTMENT);
          } else if (element === 6) {
            item.push(CONTACT);
          }
        });
        hsmTypeString = `${item.join()}:`;
      }
    }
    return hsmTypeString;
  };

  const copyToClipboard = () => {
    if (navigator) {
      navigator.clipboard.writeText(`${getHSMType(selectedPolicies)}${selectedPolicies}`);
      createSnackbar({
        severity: 'info',
        label: t('hsm.policy_has_been_coppied', 'HSM Policy has been copied to the clipboard'),
        autoHideTimeout: 2000,
        actionLabel: '',
      });
    }
  };

  const closeHandler = () => {
    setShowDeletePolicyView(false);
  };

  const onDelete = () => {
    onDeletePolicy();
  };

  return (
    <Modal
      size="medium"
      title={t('hsm.delete_hsm_policy', 'Delete HSM Policy?')}
      open={showDeletePolicyView}
      customFooter={
        <Container orientation="horizontal" mainAlignment="space-between">
          <Button
            style={{ marginLeft: '10px' }}
            type="outlined"
            label={t('label.help', 'Help')}
            color="primary"
            onClick={(): null => null}
          />
          <Row style={{ gap: '1rem' }}>
            <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={closeHandler} />
            <Button
              label={t('hsm.delete', 'Delete')}
              color="error"
              onClick={onDelete}
              disabled={isRequestInProgress}
            />
          </Row>
        </Container>
      }
      showCloseIcon
      onClose={closeHandler}
    >
      <Container padding={{ all: 'extralarge' }}>
        <Container padding={{ top: 'small' }}>
          <Padding bottom="medium">
            <ds-text as="p" size={'extralarge'} overflow="break-word">
              <Trans
                i18nKey="hsm.delete_hsm_policy_confirm_msg_1"
                defaults="If you delete this HSM policy you won`t be able to restore it. Do you want to delete HSM Policy?"
              />
            </ds-text>
          </Padding>
        </Container>

        <Container padding={{ top: 'small', bottom: 'small' }} mainAlignment="flex-start">
          <ds-text as="p" size="small">
            <Trans
              i18nKey="hsm.copy_hsm_policy_from_clipboard_msg"
              defaults="If you`re unsure you can copy the policy string to the clipboard to restore it later."
            />
          </ds-text>
        </Container>

        <Container padding={{ top: 'small', bottom: 'small' }}>
          <CopyActionContext.Provider value={{ onCopy: copyToClipboard }}>
            <LabeledValue
              backgroundColor="gray5"
              label={t('hsm.hsm_policy', 'HSM Policy')}
              value={`${getHSMType(selectedPolicies)}${selectedPolicies}`}
              CustomIcon={CopyPolicyIcon}
            />
          </CopyActionContext.Provider>
        </Container>
      </Container>
    </Modal>
  );
}
