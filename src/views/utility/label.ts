/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/*
 * TODO: I don't know if it is necessary to stick with this utility. Let's discuss it.
 *  Key benefits:
 * - you can replace the translation function without changing the component
 * - write once use every where
 * - use the same label in test
 * Disadvantages:
 * - over engineering instead of raw strings
 * - we will never change the i18next lib to translate.
 * 	 Also other libraries may not use the same signature of t(key, defaultValue), so it is a -1 on benefits
 *
 * eg in component:
// create label entries
 export const labelEntries: LabelEntries = {
	generalOptions: {
		key: 'cos.general_options',
		defaultValue: 'General Options'
	},
};

// then build translated labels with translation function
 	const [t] = useTranslation();
	const tLabels = createLabels(labelEntries)(t);

// then use it in component
	<Component weight="bold">
	    {tLabels.generalOptions.translation}
	</Component>
 */

type LabelInfo = {
	key: string;
	defaultValue: string;
};

type LabelWithTranslation = LabelInfo & {
	translation: string;
};

const labelWithTranslation = (
	labelInfo: LabelInfo,
	translationFn: (key: string, defaultValue: string) => string
): LabelWithTranslation => ({
	...labelInfo,
	get translation(): string {
		return translationFn(this.key, this.defaultValue);
	}
});

export type LabelEntries = Record<string, LabelInfo>;

export const createLabels =
	<T extends LabelEntries>(labelEntries: T) =>
	(
		translationFn: (key: string, defaultValue: string) => string
	): { [K in keyof T]: LabelWithTranslation } =>
		Object.fromEntries(
			Object.entries(labelEntries).map(([key, value]) => [
				key,
				labelWithTranslation(value, translationFn)
			])
		) as { [K in keyof T]: LabelWithTranslation };
