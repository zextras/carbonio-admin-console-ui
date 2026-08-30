/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { createMailingList } from '../../../../services/create-mailing-list-service';
import { distributionListAction } from '../../../../services/distribution-list-action-service';
import { addDistributionListMember } from '../../../../services/distribution-list-member';
import { domainQueryKeys } from '../../../../services/domain-query-keys';
import { useGalContactTypeResolver } from '../edit-distribution-list/gal-contact-type-resolver';
import { buildCreateGrantAction } from './build-create-grant-action';
import {
  buildCreateListAttributes,
  type CreateMailingListDetail,
} from './build-create-list-attributes';
import { mapCreateListError } from './map-create-list-error';

/**
 * Owns the "create distribution list" flow fired at the end of the wizard:
 * a `useMutation` creates the list, then the follow-up requests (initial
 * members/owners and send-to rights) are fired without blocking the success
 * path — their faults are surfaced as error snackbars. Creation failures are
 * mapped to localized messages by `mapCreateListError`.
 */
export function useCreateMailingListFlow(onClose: () => void) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const resolveOwnerType = useGalContactTypeResolver();

  function showRequestError(label: string): void {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  }

  function invalidateLists(): void {
    queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionLists() });
  }

  function callAllRequests(requests: Array<Promise<any>>): void {
    Promise.all(requests)
      .then((responses) => {
        invalidateLists();
        const fault = responses.find((item: any) => item?.Fault);
        if (fault) {
          showRequestError(fault?.Fault?.Reason?.Text);
        }
      })
      .catch((error: any) => {
        invalidateLists();
        showRequestError(
          error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        );
      });
  }

  function addMembersAndOwners(
    members: Array<string>,
    owners: Array<string>,
    listId: string,
  ): void {
    const requests: Array<Promise<any>> = [];
    if (members.length > 0 && listId) {
      members.forEach((item) => {
        requests.push(
          addDistributionListMember({ n: 'id', _content: listId }, { n: 'dlm', _content: item }),
        );
      });
    }

    if (owners.length > 0 && listId) {
      owners.forEach((item) => {
        requests.push(
          distributionListAction(
            { by: 'id', _content: listId },
            {
              op: 'addOwners',
              owner: {
                by: 'name',
                type: resolveOwnerType(item),
                _content: item,
              },
            },
          ),
        );
      });
    }

    if (requests.length > 0) {
      callAllRequests(requests);
    } else {
      invalidateLists();
    }
  }

  const createListMutation = useMutation({
    mutationFn: async (detail: CreateMailingListDetail) => {
      const name = `${detail.prefixName}@${detail.suffixName}`;
      const data = await createMailingList(detail.dynamic, name, buildCreateListAttributes(detail));
      return { detail, name, listId: (data?.dl[0]?.id ?? '') as string };
    },
    onSuccess: ({ detail, name, listId }) => {
      addMembersAndOwners(detail.members, detail.owners, listId);
      const grant = buildCreateGrantAction(
        name,
        detail.ownerGrantEmailType?.value,
        detail.ownerGrantEmails,
      );
      if (grant) {
        callAllRequests([distributionListAction(grant.dl, grant.action)]);
      } else {
        invalidateLists();
      }
      onClose();
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.the_has_been_created_success', {
          name,
          defaultValue: 'The {{name}} has been created successfully',
        }),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
    onError: (error, variables) => {
      showRequestError(
        mapCreateListError(error, `${variables.prefixName}@${variables.suffixName}`, t),
      );
    },
  });

  const createList = (detail: CreateMailingListDetail): void => {
    createListMutation.mutate(detail);
  };

  return { createList, isCreating: createListMutation.isPending };
}
