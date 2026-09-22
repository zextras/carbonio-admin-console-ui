/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PlainInput } from '../PlainInput';

async function getBox(label: string): Promise<HTMLElement> {
	const input = await page.getByRole('textbox', { name: label }).element();
	return input.parentElement as HTMLElement;
}

describe('PlainInput', () => {
	describe('label association', () => {
		it('renders a textbox whose accessible name is the label', async () => {
			await render(<PlainInput label="Display Name" />);

			const input = page.getByRole('textbox', { name: 'Display Name' });
			await expect.element(input).toBeVisible();
		});

		it('renders the label as a visible element', async () => {
			await render(<PlainInput label="Display Name" />);

			await expect.element(page.getByText('Display Name')).toBeVisible();
		});

		it('uses a custom id and wires the label to it', async () => {
			await render(<PlainInput label="Display Name" id="custom-id" />);

			const input = page.getByRole('textbox', { name: 'Display Name' });
			await expect.element(input).toHaveAttribute('id', 'custom-id');
			await expect.element(page.getByText('Display Name')).toHaveAttribute('for', 'custom-id');
		});
	});

	describe('value handling', () => {
		it('renders the controlled value', async () => {
			await render(<PlainInput label="Name" value="Alice" onChange={() => {}} />);

			await expect.element(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Alice');
		});

		it('fires onChange with e.target.value and stays controlled while typing', async () => {
			const changes: Array<string> = [];
			const ControlledNameInput = (): React.JSX.Element => {
				const [value, setValue] = useState('');
				return (
					<PlainInput
						label="Name"
						value={value}
						onChange={(e) => {
							setValue(e.target.value);
							changes.push(e.target.value);
						}}
					/>
				);
			};
			await render(<ControlledNameInput />);

			await userEvent.type(page.getByRole('textbox', { name: 'Name' }), 'Hi');

			await expect.element(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Hi');
			expect(changes).toEqual(['H', 'Hi']);
		});

		it('updates its own value in uncontrolled mode', async () => {
			await render(<PlainInput label="Name" defaultValue="Bob" />);

			const input = page.getByRole('textbox', { name: 'Name' });
			await expect.element(input).toHaveValue('Bob');
			await userEvent.type(input, 'x');
			await expect.element(input).toHaveValue('Bobx');
		});
	});

	describe('disabled state', () => {
		it('cannot be interacted with when disabled', async () => {
			await render(<PlainInput label="Name" defaultValue="Bob" disabled />);

			const input = page.getByRole('textbox', { name: 'Name' });
			await expect.element(input).toBeDisabled();
			await expect.element(input).toHaveValue('Bob');
		});

		it('applies disabled styling to the field box', async () => {
			await render(<PlainInput label="Name" disabled />);

			const input = await page.getByRole('textbox', { name: 'Name' }).element();
			const box = input.parentElement as HTMLElement;
			const style = getComputedStyle(box);
			expect(style.cursor).toBe('not-allowed');
			expect(style.backgroundColor).toBe('rgb(245, 246, 248)');
		});

		it('does not apply disabled styling when enabled', async () => {
			await render(<PlainInput label="Name" />);

			const input = await page.getByRole('textbox', { name: 'Name' }).element();
			const box = input.parentElement as HTMLElement;
			const style = getComputedStyle(box);
			expect(style.cursor).not.toBe('not-allowed');
		});
	});

	describe('visual states', () => {
		it('shows the resting border', async () => {
			await render(<PlainInput label="Name" />);

			const style = getComputedStyle(await getBox('Name'));
			expect(style.borderColor).toBe('rgb(133, 140, 147)');
		});

		it('changes the border color on hover', async () => {
			await render(<PlainInput label="Name" />);

			await page.getByRole('textbox', { name: 'Name' }).hover();

			const style = getComputedStyle(await getBox('Name'));
			expect(style.borderColor).toBe('rgb(34, 92, 168)');
		});

		it('shows the focus ring when the input is focused', async () => {
			await render(<PlainInput label="Name" />);

			await page.getByRole('textbox', { name: 'Name' }).click();

			const style = getComputedStyle(await getBox('Name'));
			expect(style.borderColor).toBe('rgba(43, 115, 210, 0.25)');
			expect(style.boxShadow).toBe('rgba(43, 115, 210, 0.25) 0px 0px 0px 2px');
		});

		it('does not show the focus ring when the input is disabled', async () => {
			await render(<PlainInput label="Name" disabled />);

			await page.getByRole('textbox', { name: 'Name' }).click({ force: true });

			const style = getComputedStyle(await getBox('Name'));
			expect(style.boxShadow).toBe('none');
		});

		it('renders the native input without its own chrome', async () => {
			await render(<PlainInput label="Name" />);

			const input = (await page.getByRole('textbox', { name: 'Name' }).element()) as HTMLInputElement;
			const style = getComputedStyle(input);
			expect(style.borderStyle).toBe('none');
			expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
			expect(style.flexGrow).toBe('1');
		});

		it('keeps a caller-provided className on the input', async () => {
			await render(<PlainInput label="Name" className="custom-class" />);

			await expect
				.element(page.getByRole('textbox', { name: 'Name' }))
				.toHaveClass(/custom-class/);
		});
	});

	describe('native passthrough', () => {
		it('passes placeholder, type, autoComplete and name to the input', async () => {
			await render(
				<PlainInput
					label="Search Bind User"
					placeholder="Type here"
					type="email"
					autoComplete="off"
					name="bind-user"
				/>
			);

			const input = page.getByRole('textbox', { name: 'Search Bind User' });
			await expect.element(input).toHaveAttribute('placeholder', 'Type here');
			await expect.element(input).toHaveAttribute('type', 'email');
			await expect.element(input).toHaveAttribute('autocomplete', 'off');
			await expect.element(input).toHaveAttribute('name', 'bind-user');
		});

		it('marks the input as required when required is passed', async () => {
			await render(<PlainInput label="Name" required />);

			await expect
				.element(page.getByRole('textbox', { name: 'Name' }))
				.toHaveAttribute('required');
		});

		it('forwards the ref to the native input element', async () => {
			const inputRef = React.createRef<HTMLInputElement>();
			await render(<PlainInput label="Name" ref={inputRef} />);

			expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
			expect(inputRef.current?.tagName).toBe('INPUT');
		});
	});
});
