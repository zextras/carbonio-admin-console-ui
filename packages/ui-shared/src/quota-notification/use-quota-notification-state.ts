/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
	deleteQuotaNotificationContent,
	deleteQuotaNotificationInterval,
	putQuotaNotificationContent,
	putQuotaNotificationInterval,
	QuotaNotificationApiError,
} from './quota-notification-service';
import type {
	QuotaNotificationField,
	QuotaNotificationValidationError,
} from './quota-notification-validation';
import {
	QUOTA_NOTIFICATION_FIELD_MAX_LENGTH,
	truncateToCodePoints,
	validateBody,
	validateSubject,
} from './quota-notification-validation';
import type {
	QuotaNotificationConfig,
	QuotaNotificationFieldError,
	QuotaNotificationIntervalDays,
	QuotaNotificationTarget,
} from './types';
import { quotaNotificationQueryKey } from './use-quota-notification-config';

/**
 * `inherit` means: no override on this target. On a COS it is the Carbonio default text,
 * on an account it is the text of its COS (or the Carbonio default if the COS has no override).
 */
export type QuotaNotificationContentOption = 'inherit' | 'custom';

/** On a COS the interval is always a number: there is no "inherit" entry in its select. */
export type QuotaNotificationIntervalChoice = 'inherit' | QuotaNotificationIntervalDays;

export type QuotaNotificationFieldErrors = Partial<
	Record<QuotaNotificationField, QuotaNotificationValidationError>
>;

export type QuotaNotificationPartResult = 'unchanged' | 'saved' | 'failed';

export type QuotaNotificationSaveResult = {
	content: QuotaNotificationPartResult;
	interval: QuotaNotificationPartResult;
	/** Set when the backend rejected a field of the content: the UI must focus it. */
	focusField?: QuotaNotificationField;
};

type Draft = {
	option: QuotaNotificationContentOption;
	subject: string;
	body: string;
	interval: QuotaNotificationIntervalChoice;
};

type OpenCards = Partial<Record<QuotaNotificationContentOption, boolean>>;

type Params = {
	target: QuotaNotificationTarget;
	/** Id of the account or of the COS. */
	id: string | undefined;
	config: QuotaNotificationConfig | undefined;
};

export type QuotaNotificationState = {
	option: QuotaNotificationContentOption;
	subject: string;
	body: string;
	interval: QuotaNotificationIntervalChoice;
	errors: QuotaNotificationFieldErrors;
	isDirty: boolean;
	isContentDirty: boolean;
	isIntervalDirty: boolean;
	/** The selected card is expanded, the other one collapsed, unless the admin toggled it. */
	isCardOpen: (option: QuotaNotificationContentOption) => boolean;
	toggleCard: (option: QuotaNotificationContentOption) => void;
	setOption: (option: QuotaNotificationContentOption) => void;
	setSubject: (value: string) => void;
	setBody: (value: string) => void;
	setInterval: (choice: QuotaNotificationIntervalChoice) => void;
	/** Validates the content when it is a changed custom message. Returns the first invalid field. */
	validate: () => QuotaNotificationField | null;
	/** Calls only the parts that changed. Never throws: failures are reported per part. */
	save: () => Promise<QuotaNotificationSaveResult>;
	reset: () => void;
};

const DEFAULT_COS_INTERVAL: QuotaNotificationIntervalDays = 7;

function deriveBaseline(
	target: QuotaNotificationTarget,
	config: QuotaNotificationConfig | undefined,
): Draft {
	const defaultInterval = target === 'cos' ? DEFAULT_COS_INTERVAL : 'inherit';
	if (!config) {
		return { option: 'inherit', subject: '', body: '', interval: defaultInterval };
	}
	const ownSourceType = target === 'accounts' ? 'ACCOUNT' : 'COS';
	const hasContentOverride = config.content.source.type === ownSourceType;
	const hasIntervalOverride = config.interval.source.type === ownSourceType;
	const showsOwnInterval = hasIntervalOverride || target === 'cos';
	return {
		option: hasContentOverride ? 'custom' : 'inherit',
		subject: hasContentOverride ? config.content.subject : '',
		body: hasContentOverride ? config.content.body : '',
		interval: showsOwnInterval
			? (config.interval.days as QuotaNotificationIntervalDays)
			: defaultInterval,
	};
}

function isContentChanged(draft: Draft, baseline: Draft): boolean {
	if (draft.option !== baseline.option) {
		return true;
	}
	return (
		draft.option === 'custom' &&
		(draft.subject !== baseline.subject || draft.body !== baseline.body)
	);
}

function mapServerErrors(errors: Array<QuotaNotificationFieldError>): QuotaNotificationFieldErrors {
	const mapped: QuotaNotificationFieldErrors = {};
	errors.forEach(({ field, code, detail }) => {
		if (field === 'content.subject') {
			mapped.subject = { code, detail };
		} else if (field === 'content.body') {
			mapped.body = { code, detail };
		}
	});
	return mapped;
}

function getFirstInvalidField(errors: QuotaNotificationFieldErrors): QuotaNotificationField | null {
	if (errors.subject) {
		return 'subject';
	}
	return errors.body ? 'body' : null;
}

async function runPart(action: () => Promise<void>): Promise<'saved' | { error: unknown }> {
	try {
		await action();
		return 'saved';
	} catch (error) {
		return { error };
	}
}

export function useQuotaNotificationState({ target, id, config }: Params): QuotaNotificationState {
	const queryClient = useQueryClient();

	const [draftOverride, setDraftOverride] = useState<Draft | null>(null);
	const [errors, setErrors] = useState<QuotaNotificationFieldErrors>({});
	const [openCards, setOpenCards] = useState<OpenCards>({});
	const [prevKey, setPrevKey] = useState(`${target}:${id}`);

	const key = `${target}:${id}`;
	if (key !== prevKey) {
		// another account / COS: forget the draft of the previous one
		setPrevKey(key);
		setDraftOverride(null);
		setErrors({});
		setOpenCards({});
	}

	const baseline = deriveBaseline(target, config);
	const draft = draftOverride ?? baseline;

	const isContentDirty = isContentChanged(draft, baseline);
	const isIntervalDirty = draft.interval !== baseline.interval;

	function update(patch: Partial<Draft>): void {
		setDraftOverride((prev) => ({ ...(prev ?? baseline), ...patch }));
	}

	function clearError(field: QuotaNotificationField): void {
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	}

	function setOption(option: QuotaNotificationContentOption): void {
		update({ option });
		setOpenCards({});
		if (option === 'inherit') {
			setErrors({});
		}
	}

	function setSubject(value: string): void {
		update({ subject: truncateToCodePoints(value, QUOTA_NOTIFICATION_FIELD_MAX_LENGTH.subject) });
		clearError('subject');
	}

	function setBody(value: string): void {
		update({ body: truncateToCodePoints(value, QUOTA_NOTIFICATION_FIELD_MAX_LENGTH.body) });
		clearError('body');
	}

	function setInterval(choice: QuotaNotificationIntervalChoice): void {
		update({ interval: choice });
	}

	function isCardOpen(option: QuotaNotificationContentOption): boolean {
		return openCards[option] ?? draft.option === option;
	}

	function toggleCard(option: QuotaNotificationContentOption): void {
		setOpenCards((prev) => ({ ...prev, [option]: !(prev[option] ?? draft.option === option) }));
	}

	function validate(): QuotaNotificationField | null {
		if (draft.option !== 'custom' || !isContentDirty) {
			setErrors({});
			return null;
		}
		const next: QuotaNotificationFieldErrors = {
			subject: validateSubject(draft.subject) ?? undefined,
			body: validateBody(draft.body) ?? undefined,
		};
		setErrors(next);
		const firstInvalid = getFirstInvalidField(next);
		if (firstInvalid) {
			setOpenCards((prev) => ({ ...prev, custom: true }));
		}
		return firstInvalid;
	}

	function reset(): void {
		setDraftOverride(null);
		setErrors({});
		setOpenCards({});
	}

	async function saveContent(): Promise<void> {
		if (draft.option === 'custom') {
			await putQuotaNotificationContent(target, id!, { subject: draft.subject, body: draft.body });
		} else {
			await deleteQuotaNotificationContent(target, id!);
		}
	}

	async function saveInterval(): Promise<void> {
		if (draft.interval === 'inherit') {
			await deleteQuotaNotificationInterval(target, id!);
		} else {
			await putQuotaNotificationInterval(target, id!, draft.interval);
		}
	}

	async function save(): Promise<QuotaNotificationSaveResult> {
		const result: QuotaNotificationSaveResult = { content: 'unchanged', interval: 'unchanged' };
		if (!id) {
			return result;
		}

		if (isContentDirty) {
			const outcome = await runPart(saveContent);
			if (outcome === 'saved') {
				result.content = 'saved';
			} else {
				result.content = 'failed';
				if (outcome.error instanceof QuotaNotificationApiError) {
					const mapped = mapServerErrors(outcome.error.errors);
					setErrors(mapped);
					result.focusField = getFirstInvalidField(mapped) ?? undefined;
				}
			}
		}

		if (isIntervalDirty) {
			const outcome = await runPart(saveInterval);
			result.interval = outcome === 'saved' ? 'saved' : 'failed';
		}

		if (result.content === 'saved' || result.interval === 'saved') {
			await queryClient.invalidateQueries({ queryKey: quotaNotificationQueryKey(target, id) });
		}
		if (result.content !== 'failed' && result.interval !== 'failed') {
			reset();
		}
		return result;
	}

	return {
		option: draft.option,
		subject: draft.subject,
		body: draft.body,
		interval: draft.interval,
		errors,
		isDirty: isContentDirty || isIntervalDirty,
		isContentDirty,
		isIntervalDirty,
		isCardOpen,
		toggleCard,
		setOption,
		setSubject,
		setBody,
		setInterval,
		validate,
		save,
		reset,
	};
}
