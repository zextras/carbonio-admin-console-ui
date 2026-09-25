/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { ComboboxInput } from '../combobox-input';

const SERVERS = [
	{ id: 'mail-1', label: 'mail.example.com' },
	{ id: 'store-1', label: 'store.example.com' },
	{ id: 'ldap-1', label: 'ldap.example.com' },
	{ id: 'proxy-1', label: 'proxy.example.com', disabled: true },
	{ id: 'backup-1', label: 'backup.example.com' },
];

async function getCombobox(label: string): Promise<HTMLElement> {
	return (await page.getByRole('combobox', { name: label }).element()) as HTMLElement;
}

async function getBox(label: string): Promise<HTMLElement> {
	const input = await getCombobox(label);
	return input.parentElement as HTMLElement;
}

async function getListbox(): Promise<HTMLElement> {
	return (await page.getByRole('listbox').element()) as HTMLElement;
}

async function getPopup(): Promise<HTMLElement> {
	const listbox = await getListbox();
	return listbox.parentElement as HTMLElement;
}

function formatRgba(r: number, g: number, b: number, a: number): string {
	if (a >= 1) return `rgb(${r}, ${g}, ${b})`;
	return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})`;
}

function toRgba(color: string): string {
	const normalized = color.trim().toLowerCase();
	if (normalized === 'transparent') return 'rgba(0, 0, 0, 0)';
	if (normalized.startsWith('#')) {
		let hex = normalized.slice(1);
		if (hex.length === 3 || hex.length === 4) {
			hex = hex
				.split('')
				.map((char) => char + char)
				.join('');
		}
		if (hex.length !== 6 && hex.length !== 8) {
			throw new Error(`Unsupported hex color: ${color}`);
		}
		const r = Number.parseInt(hex.slice(0, 2), 16);
		const g = Number.parseInt(hex.slice(2, 4), 16);
		const b = Number.parseInt(hex.slice(4, 6), 16);
		const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
		return formatRgba(r, g, b, a);
	}
	const match = /^rgba?\(([^)]+)\)$/.exec(normalized);
	if (!match) {
		throw new Error(`Unsupported color: ${color}`);
	}
	const parts = match[1].split(',').map((part) => part.trim());
	return formatRgba(
		Number.parseInt(parts[0], 10),
		Number.parseInt(parts[1], 10),
		Number.parseInt(parts[2], 10),
		parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1,
	);
}

function expectColor(actual: string, expected: string): void {
	expect(toRgba(actual)).toBe(toRgba(expected));
}

describe('ComboboxInput', () => {
	describe('field base', () => {
		it('renders a combobox whose accessible name is the label', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await expect.element(page.getByRole('combobox', { name: 'Server' })).toBeVisible();
			await expect.element(page.getByText('Server')).toBeVisible();
		});

		it('uses a custom id and wires the label to it', async () => {
			await render(
				<ComboboxInput label="Server" id="custom-id" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />,
			);

			const input = page.getByRole('combobox', { name: 'Server' });
			await expect.element(input).toHaveAttribute('id', 'custom-id');
			await expect.element(page.getByText('Server')).toHaveAttribute('for', 'custom-id');
		});

		it('renders a hidden red asterisk when required, outside the accessible name', async () => {
			await render(<ComboboxInput label="Server" required items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			const input = (await getCombobox('Server')) as HTMLInputElement;
			const label = input.labels?.[0] as HTMLLabelElement;
			const mark = label.querySelector('span');
			expect(mark?.textContent).toBe('*');
			expect(mark?.getAttribute('aria-hidden')).toBe('true');
			expectColor(getComputedStyle(mark as HTMLElement).color, '#BE3028');

			await expect.element(page.getByRole('combobox', { name: 'Server' })).toBeVisible();
		});

		it('renders the description and links it via aria-describedby', async () => {
			await render(
				<ComboboxInput
					label="Server"
					value=""
					onChange={() => {}}
					description="Pick the target server"
					items={SERVERS}
					onSelect={() => {}}
				/>,
			);

			const input = await getCombobox('Server');
			const describedBy = input.getAttribute('aria-describedby');
			expect(describedBy).toBeTruthy();
			const description = document.getElementById(describedBy as string);
			expect(description?.textContent).toBe('Pick the target server');
			expect(description?.tagName).toBe('P');
		});

		it('merges a caller-provided aria-describedby with the description id', async () => {
			await render(
				<ComboboxInput
					label="Server"
					value=""
					onChange={() => {}}
					description="Pick the target server"
					aria-describedby="external-hint"
					items={SERVERS}
					onSelect={() => {}}
				/>,
			);

			const input = await getCombobox('Server');
			const ids = (input.getAttribute('aria-describedby') ?? '').split(/\s+/);
			expect(ids).toContain('external-hint');
			const ownId = ids.find((id) => id !== 'external-hint') as string;
			expect(document.getElementById(ownId)?.textContent).toBe('Pick the target server');
		});

		it('marks the input invalid and shows the error border when hasError', async () => {
			await render(<ComboboxInput label="Server" hasError items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await expect
				.element(page.getByRole('combobox', { name: 'Server' }))
				.toHaveAttribute('aria-invalid', 'true');
			expectColor(getComputedStyle(await getBox('Server')).borderColor, '#D74942');
		});

		it('disables the input and applies the disabled box styling', async () => {
			await render(<ComboboxInput label="Server" disabled items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await expect.element(page.getByRole('combobox', { name: 'Server' })).toBeDisabled();
			const style = getComputedStyle(await getBox('Server'));
			expectColor(style.backgroundColor, '#F5F6F8');
			expectColor(style.borderColor, '#E6E9ED');
		});
	});

	describe('field states', () => {
		it('changes the border color on hover', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await page.getByRole('combobox', { name: 'Server' }).hover();

			expectColor(getComputedStyle(await getBox('Server')).borderColor, '#225CA8');
		});

		it('shows the focus border and halo on the field while the listbox is open', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));
			await expect.element(page.getByRole('listbox')).toBeVisible();

			const style = getComputedStyle(await getBox('Server'));
			expectColor(style.borderColor, '#225CA8');
			expect(style.boxShadow).toBe('rgba(43, 115, 210, 0.25) 0px 0px 0px 2px');
		});
	});

	describe('combobox ARIA wiring', () => {
		it('declares the combobox popup semantics while closed', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			const input = page.getByRole('combobox', { name: 'Server' });
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
			await expect.element(input).toHaveAttribute('aria-haspopup', 'listbox');
			await expect.element(input).toHaveAttribute('aria-autocomplete', 'list');
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});

		it('opens on click: aria-expanded flips, listbox appears, aria-controls wires to it', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			const input = await getCombobox('Server');
			await expect
				.element(page.getByRole('combobox', { name: 'Server' }))
				.toHaveAttribute('aria-expanded', 'true');
			const popup = await getPopup();
			expect(popup.getAttribute('id')).toBeTruthy();
			expect(input.getAttribute('aria-controls')).toBe(popup.getAttribute('id'));
		});

		it('renders options with role and accessible names', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			await expect.element(page.getByRole('option', { name: 'mail.example.com' })).toBeVisible();
			await expect.element(page.getByRole('option', { name: 'backup.example.com' })).toBeVisible();
		});

		it('marks the option matching the value as aria-selected', async () => {
			await render(
				<ComboboxInput
					label="Server"
					value="store.example.com"
					onChange={() => {}}
					items={SERVERS}
					onSelect={() => {}}
				/>,
			);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			await expect
				.element(page.getByRole('option', { name: 'store.example.com' }))
				.toHaveAttribute('aria-selected', 'true');
			await expect
				.element(page.getByRole('option', { name: 'mail.example.com' }))
				.toHaveAttribute('aria-selected', 'false');
		});

		it('opens the list while typing', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			const combobox = page.getByRole('combobox', { name: 'Server' });
			await userEvent.click(combobox);
			await userEvent.keyboard('[Escape]');
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

			await userEvent.type(combobox, 'ma');

			await expect.element(combobox).toHaveAttribute('aria-expanded', 'true');
			await expect.element(page.getByRole('listbox')).toBeVisible();
		});

		it('mirrors aria-expanded and aria-controls on the chevron button', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			const toggle = page.getByRole('button', { name: 'Toggle suggestions' });
			await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
			await userEvent.click(toggle);

			const popup = await getPopup();
			await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
			expect((await toggle.element()).getAttribute('aria-controls')).toBe(
				popup.getAttribute('id'),
			);
			expect((await getCombobox('Server')).getAttribute('aria-expanded')).toBe('true');
		});

		it('keeps the popup expanded while loading, without a listbox', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} loading onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			await expect
				.element(page.getByRole('combobox', { name: 'Server' }))
				.toHaveAttribute('aria-expanded', 'true');
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
			await expect.element(page.getByText('Loading...')).toBeVisible();
		});
	});

	describe('keyboard navigation', () => {
		it('opens with ArrowDown and activates the first option, keeping focus in the input', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			const combobox = page.getByRole('combobox', { name: 'Server' });
			await userEvent.click(combobox);
			await userEvent.keyboard('[Escape]');
			await userEvent.keyboard('[ArrowDown]');

			const input = await getCombobox('Server');
			const firstOption = await page.getByRole('option', { name: 'mail.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(firstOption.id);
			expect(firstOption.getAttribute('data-active')).toBe('true');
			expect(document.activeElement).toBe(input);
		});

		it('moves down through options and skips disabled ones', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));
			await userEvent.keyboard('[ArrowDown]');

			const input = await getCombobox('Server');
			const firstOption = await page.getByRole('option', { name: 'mail.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(firstOption.id);

			await userEvent.keyboard('[ArrowDown]');
			const secondOption = await page.getByRole('option', { name: 'store.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(secondOption.id);

			await userEvent.keyboard('[ArrowDown]');
			const thirdOption = await page.getByRole('option', { name: 'ldap.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(thirdOption.id);

			await userEvent.keyboard('[ArrowDown]');
			const disabledOption = await page
				.getByRole('option', { name: 'proxy.example.com' })
				.element();
			const lastOption = await page.getByRole('option', { name: 'backup.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).not.toBe(disabledOption.id);
			expect(input.getAttribute('aria-activedescendant')).toBe(lastOption.id);
		});

		it('opens with ArrowUp and activates the last enabled option', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			const combobox = page.getByRole('combobox', { name: 'Server' });
			await userEvent.click(combobox);
			await userEvent.keyboard('[Escape]');
			await userEvent.keyboard('[ArrowUp]');

			const input = await getCombobox('Server');
			const lastOption = await page.getByRole('option', { name: 'backup.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(lastOption.id);
		});

		it('does not wrap past the first or last option', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			const combobox = page.getByRole('combobox', { name: 'Server' });
			await userEvent.click(combobox);
			await userEvent.keyboard('[Home]');
			await userEvent.keyboard('[ArrowUp]');

			const input = await getCombobox('Server');
			const firstOption = await page.getByRole('option', { name: 'mail.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(firstOption.id);

			await userEvent.keyboard('[End]');
			await userEvent.keyboard('[ArrowDown]');

			const lastOption = await page.getByRole('option', { name: 'backup.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(lastOption.id);
		});

		it('moves to the first and last enabled options with Home and End', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));
			await userEvent.keyboard('[End]');

			const input = await getCombobox('Server');
			const lastOption = await page.getByRole('option', { name: 'backup.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(lastOption.id);

			await userEvent.keyboard('[Home]');
			const firstOption = await page.getByRole('option', { name: 'mail.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(firstOption.id);
		});

		it('selects the active option with Enter: onSelect fires and the list closes', async () => {
			const onSelect = vi.fn();
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={onSelect} />);

			const combobox = page.getByRole('combobox', { name: 'Server' });
			await userEvent.click(combobox);
			await userEvent.keyboard('[ArrowDown]');
			await userEvent.keyboard('[Enter]');

			expect(onSelect).toHaveBeenCalledTimes(1);
			expect(onSelect).toHaveBeenCalledWith(SERVERS[0]);
			await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});

		it('closes without selecting when Enter is pressed with no active option', async () => {
			const onSelect = vi.fn();
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={onSelect} />);

			const combobox = page.getByRole('combobox', { name: 'Server' });
			await userEvent.click(combobox);
			await userEvent.keyboard('[Enter]');

			expect(onSelect).not.toHaveBeenCalled();
			await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
		});

		it('closes with Escape and never clears the value', async () => {
			const ControlledCombobox = (): React.JSX.Element => {
				const [value, setValue] = useState('');
				return (
					<ComboboxInput
						label="Server"
						value={value}
						onChange={(e) => {
							setValue(e.target.value);
						}}
						items={SERVERS}
						onSelect={() => {}}
					/>
				);
			};
			await render(<ControlledCombobox />);

			const combobox = page.getByRole('combobox', { name: 'Server' });
			await userEvent.type(combobox, 'abc');
			await userEvent.keyboard('[Escape]');

			await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
			await expect.element(combobox).toHaveValue('abc');

			await userEvent.keyboard('[Escape]');

			await expect.element(combobox).toHaveValue('abc');
		});

		it('closes with Tab', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			const combobox = page.getByRole('combobox', { name: 'Server' });
			await userEvent.click(combobox);
			await userEvent.keyboard('[Tab]');

			await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});

		it('resets the active option to the selected match when opened', async () => {
			await render(
				<ComboboxInput
					label="Server"
					value="ldap.example.com"
					onChange={() => {}}
					items={SERVERS}
					onSelect={() => {}}
				/>,
			);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			const input = await getCombobox('Server');
			const matched = await page.getByRole('option', { name: 'ldap.example.com' }).element();
			expect(input.getAttribute('aria-activedescendant')).toBe(matched.id);
		});
	});

	describe('mouse interaction', () => {
		it('selects an option on click, closes the list and keeps focus in the input', async () => {
			const onSelect = vi.fn();
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={onSelect} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));
			await userEvent.click(page.getByRole('option', { name: 'store.example.com' }));

			expect(onSelect).toHaveBeenCalledTimes(1);
			expect(onSelect).toHaveBeenCalledWith(SERVERS[1]);
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
			const input = await getCombobox('Server');
			expect(document.activeElement).toBe(input);
		});

		it('does not select a disabled option on click', async () => {
			const onSelect = vi.fn();
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={onSelect} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));
			await userEvent.click(page.getByRole('option', { name: 'proxy.example.com' }), {
				force: true,
			});

			expect(onSelect).not.toHaveBeenCalled();
			await expect.element(page.getByRole('listbox')).toBeVisible();
		});

		it('closes the list on outside click', async () => {
			await render(
				<div>
					<button type="button">Outside target</button>
					<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />
				</div>,
			);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));
			await expect.element(page.getByRole('listbox')).toBeVisible();

			await userEvent.click(page.getByRole('button', { name: 'Outside target' }));

			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});

		it('toggles the list with the chevron button and flips the icon', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			const toggle = page.getByRole('button', { name: 'Toggle suggestions' });
			const toggleElement = await toggle.element();
			expect(toggleElement.querySelector('ds-icon')?.getAttribute('icon')).toBe('ChevronDown');

			await userEvent.click(toggle);

			expect(toggleElement.querySelector('ds-icon')?.getAttribute('icon')).toBe('ChevronUp');
			await expect.element(page.getByRole('listbox')).toBeVisible();

			await userEvent.click(toggle);

			expect(toggleElement.querySelector('ds-icon')?.getAttribute('icon')).toBe('ChevronDown');
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});
	});

	describe('API contract', () => {
		it('fires onChange for every keystroke while controlled', async () => {
			const changes: Array<string> = [];
			const ControlledCombobox = (): React.JSX.Element => {
				const [value, setValue] = useState('');
				return (
					<ComboboxInput
						label="Server"
						value={value}
						onChange={(e) => {
							setValue(e.target.value);
							changes.push(e.target.value);
						}}
						items={SERVERS}
						onSelect={() => {}}
					/>
				);
			};
			await render(<ControlledCombobox />);

			await userEvent.type(page.getByRole('combobox', { name: 'Server' }), 'ma');

			await expect.element(page.getByRole('combobox', { name: 'Server' })).toHaveValue('ma');
			expect(changes).toEqual(['m', 'ma']);
		});

		it('never writes the picked label back into the input', async () => {
			const ControlledCombobox = (): React.JSX.Element => {
				const [value, setValue] = useState('');
				return (
					<ComboboxInput
						label="Server"
						value={value}
						onChange={(e) => {
							setValue(e.target.value);
						}}
						items={SERVERS}
						onSelect={() => {}}
					/>
				);
			};
			await render(<ControlledCombobox />);

			const combobox = page.getByRole('combobox', { name: 'Server' });
			await userEvent.click(combobox);
			await userEvent.click(page.getByRole('option', { name: 'store.example.com' }));

			await expect.element(combobox).toHaveValue('');
		});

		it('does not render the clear button without onClear, even with a non-empty value', async () => {
			const ControlledCombobox = (): React.JSX.Element => {
				const [value, setValue] = useState('');
				return (
					<ComboboxInput
						label="Server"
						value={value}
						onChange={(e) => {
							setValue(e.target.value);
						}}
						items={SERVERS}
						onSelect={() => {}}
					/>
				);
			};
			await render(<ControlledCombobox />);

			await expect.element(page.getByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

			await userEvent.type(page.getByRole('combobox', { name: 'Server' }), 'x');

			await expect.element(page.getByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
		});

		it('renders the clear button with onClear and a non-empty value, and fires it on click', async () => {
			const onClear = vi.fn();
			await render(
				<ComboboxInput
					label="Server"
					value="abc"
					onChange={() => {}}
					items={SERVERS}
					onSelect={() => {}}
					onClear={onClear}
				/>,
			);

			const clear = page.getByRole('button', { name: 'Clear' });
			await expect.element(clear).toBeVisible();
			const clearIcon = (await clear.element()).querySelector('ds-icon');
			expect(clearIcon?.getAttribute('icon')).toBe('CloseOutline');

			await userEvent.click(clear);
			expect(onClear).toHaveBeenCalledTimes(1);
		});

		it('shows the Loading... row instead of options while loading', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} loading onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			await expect.element(page.getByText('Loading...')).toBeVisible();
			await expect
				.element(page.getByRole('option', { name: 'mail.example.com' }))
				.not.toBeInTheDocument();
		});

		it('shows the emptyMessage row when there are no items', async () => {
			await render(
				<ComboboxInput label="Server" items={[]} value="" onChange={() => {}} emptyMessage="No results" onSelect={() => {}} />,
			);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			await expect.element(page.getByText('No results')).toBeVisible();
			await expect.element(page.getByRole('option')).not.toBeInTheDocument();
		});

		it('does not open the list when disabled', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} disabled onSelect={() => {}} />);

			await userEvent.click(page.getByRole('button', { name: 'Toggle suggestions' }), {
				force: true,
			});

			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});

		it('forwards the ref to the native input element', async () => {
			const inputRef = React.createRef<HTMLInputElement>();
			await render(
				<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} ref={inputRef} />,
			);

			expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
			expect(inputRef.current?.tagName).toBe('INPUT');
		});

		it('renders a decorative leading icon on options that declare one', async () => {
			const items = [
				{ id: 'globe-1', label: 'example.com', icon: 'GlobeOutline' as const },
				{ id: 'globe-2', label: 'example.org' },
			];
			await render(<ComboboxInput label="Server" items={items} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			const withIcon = await page.getByRole('option', { name: 'example.com' }).element();
			const icon = withIcon.querySelector('ds-icon');
			expect(icon?.getAttribute('icon')).toBe('GlobeOutline');
			expect(icon?.getAttribute('aria-hidden')).toBe('true');

			const withoutIcon = await page.getByRole('option', { name: 'example.org' }).element();
			expect(withoutIcon.querySelector('ds-icon')).toBeNull();
		});
	});

	describe('popup visuals', () => {
		it('styles the popup panel per spec', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			const style = getComputedStyle(await getPopup());
			expect(style.display).toBe('flex');
			expect(style.flexDirection).toBe('column');
			expect(style.paddingTop).toBe('8px');
			expect(style.paddingBottom).toBe('8px');
			expect(style.paddingLeft).toBe('0px');
			expect(style.borderTopWidth).toBe('1px');
			expect(style.borderTopStyle).toBe('solid');
			expectColor(style.borderTopColor, '#E6E9ED');
			expect(style.borderRadius).toBe('4px');
			expectColor(style.backgroundColor, '#FFFFFF');
			expect(style.fontSize).toBe('14px');
			expect(style.fontFamily.toLowerCase()).toContain('roboto');
		});

		it('styles option rows per spec', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			const option = await page.getByRole('option', { name: 'mail.example.com' }).element();
			const style = getComputedStyle(option);
			expect(style.display).toBe('flex');
			expect(style.height).toBe('30.5px');
			expect(style.paddingTop).toBe('6px');
			expect(style.paddingBottom).toBe('6px');
			expect(style.paddingLeft).toBe('12px');
			expect(style.paddingRight).toBe('12px');
			expect(style.alignItems).toBe('center');
			expect(style.gap).toBe('4px');
			expectColor(style.color, '#333333');
		});

		it('renders the popup at the same width as the field box', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			const box = await getBox('Server');
			const popup = await getPopup();
			expect(popup.offsetWidth).toBe(box.offsetWidth);
		});

		it('sizes the popup to two rows of content', async () => {
			const two = SERVERS.slice(0, 2);
			await render(<ComboboxInput label="Server" items={two} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			expect((await getPopup()).offsetHeight).toBe(79);
		});

		it('sizes the popup to six rows of content', async () => {
			const six = [
				...SERVERS.slice(0, 4),
				{ id: 'extra-1', label: 'extra-1.example.com' },
				{ id: 'extra-2', label: 'extra-2.example.com' },
			];
			await render(<ComboboxInput label="Server" items={six} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			expect((await getPopup()).offsetHeight).toBe(201);
		});

		it('caps the popup at six rows and scrolls beyond', async () => {
			const ten = [
				...SERVERS.slice(0, 4),
				{ id: 'extra-1', label: 'extra-1.example.com' },
				{ id: 'extra-2', label: 'extra-2.example.com' },
				{ id: 'extra-3', label: 'extra-3.example.com' },
				{ id: 'extra-4', label: 'extra-4.example.com' },
				{ id: 'extra-5', label: 'extra-5.example.com' },
				{ id: 'extra-6', label: 'extra-6.example.com' },
			];
			await render(<ComboboxInput label="Server" items={ten} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			const popup = await getPopup();
			expect(popup.offsetHeight).toBe(201);
			expect(getComputedStyle(popup).overflowY).toBe('auto');
		});

		it('renders the popup in a portal attached to the document body', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			const popup = await getPopup();
			expect(popup.parentElement).toBe(document.body);
		});

		it('styles the Loading... row per spec', async () => {
			await render(<ComboboxInput label="Server" items={SERVERS} value="" onChange={() => {}} loading onSelect={() => {}} />);

			await userEvent.click(page.getByRole('combobox', { name: 'Server' }));

			const loadingRow = await page.getByText('Loading...').element();
			const style = getComputedStyle(loadingRow);
			expectColor(style.color, '#2F3941');
			expect(style.textAlign).toBe('center');
		});
	});
});
