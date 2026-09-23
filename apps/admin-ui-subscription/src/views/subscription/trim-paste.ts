/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

function handleTrimmedPaste(
	event: React.ClipboardEvent<HTMLInputElement>,
	onValue: (value: string) => void,
): void {
	event.preventDefault();
	onValue(event.clipboardData.getData('text').trim());
}

export { handleTrimmedPaste };
