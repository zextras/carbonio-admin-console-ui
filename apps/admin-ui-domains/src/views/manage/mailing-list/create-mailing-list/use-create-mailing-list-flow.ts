/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FALSE, TRUE } from '../../../../constants';
import { addDistributionListMember } from '../../../../services/add-distributionlist-member-service';
import { createMailingList } from '../../../../services/create-mailing-list-service';
import { distributionListAction } from '../../../../services/distribution-list-action-service';
import { domainQueryKeys } from '../../../../services/domain-query-keys';
import { type OwnerTypeSource,resolveOwnerType } from '../edit-distribution-list/owners-tab/owner-type';
import { buildCreateGrantAction } from './build-create-grant-action';

/** Shape of the wizard's `mailingListDetail` consumed by the create flow. */
export type CreateMailingListDetail = {
	prefixName: string;
	suffixName: string;
	description: string;
	dynamic: boolean;
	displayName: string;
	zimbraHideInGal: boolean;
	zimbraMailStatus: boolean;
	zimbraNotes: string;
	memberURL: string;
	members: Array<string>;
	zimbraDistributionListSendShareMessageToNewMembers: boolean;
	owners: Array<string>;
	allOwnersList: Array<any>;
	ownerGrantEmailType: { value?: string } | undefined;
	ownerGrantEmails: Array<string>;
};

function toOwnerTypeSources(contacts: Array<any>): Array<OwnerTypeSource> {
	return (contacts ?? []).map((contact) => ({
		id: contact?.id,
		type: contact?._attrs?.type,
		email: contact?._attrs?.email
	}));
}

/**
 * Owns the "create distribution list" flow fired at the end of the wizard:
 * creates the list, then adds its initial members/owners and sets the
 * send-to rights. Failures in the follow-up requests are surfaced as error
 * snackbars (the original implementation silently swallowed them).
 */
export function useCreateMailingListFlow(onClose: () => void) {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const queryClient = useQueryClient();
	const [isCreating, setIsCreating] = useState(false);

	function showRequestError(label: string): void {
		createSnackbar({
			key: 'error',
			severity: 'error',
			label,
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
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
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
				);
			});
	}

	function addMembersAndOwners(
		members: Array<string>,
		owners: Array<string>,
		listId: string,
		allOwnersList: Array<any>
	): void {
		const requests: Array<Promise<any>> = [];
		if (members.length > 0 && listId) {
			members.forEach((item) => {
				requests.push(
					addDistributionListMember(
						{ n: 'id', _content: listId },
						{ n: 'dlm', _content: item }
					)
				);
			});
		}

		if (owners.length > 0 && listId) {
			const ownerTypeSources = toOwnerTypeSources(allOwnersList);
			owners.forEach((item) => {
				requests.push(
					distributionListAction(
						{ by: 'id', _content: listId },
						{
							op: 'addOwners',
							owner: {
								by: 'name',
								type: resolveOwnerType(ownerTypeSources, item),
								_content: item
							}
						}
					)
				);
			});
		}

		if (requests.length > 0) {
			callAllRequests(requests);
		} else {
			invalidateLists();
		}
	}

	function createList(detail: CreateMailingListDetail): void {
		const name = `${detail.prefixName}@${detail.suffixName}`;
		setIsCreating(true);

		const attributes: Array<any> = [
			{ n: 'displayName', _content: detail.displayName },
			{ n: 'zimbraNotes', _content: detail.zimbraNotes },
			{ n: 'zimbraHideInGal', _content: detail.zimbraHideInGal ? TRUE : FALSE },
			{ n: 'zimbraMailStatus', _content: detail.zimbraMailStatus ? 'enabled' : 'disabled' }
		];
		if (detail.dynamic) {
			attributes.push({
				n: 'zimbraIsACLGroup',
				_content: detail.memberURL !== '' ? FALSE : TRUE
			});
			attributes.push({ n: 'memberURL', _content: detail.memberURL });
		} else {
			attributes.push({
				n: 'zimbraDistributionListSendShareMessageToNewMembers',
				_content: detail.zimbraDistributionListSendShareMessageToNewMembers ? TRUE : FALSE
			});
		}
		attributes.push({ n: 'description', _content: detail.description });

		const grant = buildCreateGrantAction(
			name,
			detail.ownerGrantEmailType?.value,
			detail.ownerGrantEmails
		);

		createMailingList(detail.dynamic, name, attributes)
			.then((data) => {
				const listId = data?.dl[0]?.id;
				addMembersAndOwners(detail.members, detail.owners, listId, detail.allOwnersList);
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
						defaultValue: 'The {{name}} has been created successfully'
					}),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setIsCreating(false);
			})
			.catch((error: any) => {
				let message = '';
				if (error?.message) {
					const text = error?.message;
					if (text.includes('no such domain')) {
						message = t('label.specified_domain_not_exist', 'Specified domain does not exist');
					} else if (text.includes('email address already exists')) {
						message = t('label.email_addready_exists', {
							name,
							defaultValue: 'Email address {{name}} already exists'
						});
					} else {
						message = text;
					}
				}
				showRequestError(
					message ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
				);
				setIsCreating(false);
			});
	}

	return { createList, isCreating };
}
