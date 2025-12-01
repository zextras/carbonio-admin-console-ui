/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import VirtualHostSection from '../virtual-host-section';
import { t } from 'i18next';

function VirtualHostSectionWrapper() {
    const [items, setItems] = useState([
        { id: '1', columns: ['virtual1.test-domain.com'], clickable: true },
        { id: '2', columns: ['virtual2.test-domain.com'], clickable: true }
    ]);

    return <VirtualHostSection items={items} setItems={setItems} />;
}

function EmptyVirtualHostSectionWrapper() {
    const [items, setItems] = useState<any[]>([]);

    return <VirtualHostSection items={items} setItems={setItems} />;
}

describe('VirtualHostSection (browser)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render the input field for adding virtual hosts', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const input = page.getByText('Type a new Virtual Host Name and click on “Add +” to add it to the list');
            await expect.element(input).toBeInTheDocument();

        });

        it('should render existing virtual hosts in the list', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            await expect.element(page.getByText('virtual1.test-domain.com')).toBeVisible();
            await expect.element(page.getByText('virtual2.test-domain.com')).toBeVisible();
        });

        it('should render the header with Virtual Host Name label', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            await expect.element(page.getByText('Virtual Host Name', { exact: true })).toBeVisible();
        });

        it('should show empty state when there are no virtual hosts', async () => {
            setupBrowserTest(<EmptyVirtualHostSectionWrapper />);

            await expect
                .element(page.getByText("There aren’t any virtual hosts yet."))
                .toBeVisible();
        });

        it('should render the Add button', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const addButton = page.getByRole('button', { name: /add/i });
            await expect.element(addButton).toBeVisible();
        });
    });

    describe('Adding Virtual Hosts', () => {
        it('should have Add button disabled initially', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const addButton = page.getByRole('button', { name: /add/i });
            await expect.element(addButton).toBeDisabled();
        });

        it('should enable Add button when valid hostname is entered', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);


            // Get the input by role textbox (there should be only one)
            const input = page.getByRole('textbox');
            const addButton = page.getByRole('button', { name: /add/i });

            await userEvent.fill(input, 'virtual3.test-domain.com');
            await expect.element(addButton).toBeEnabled();
        });

        it('should not enable Add button for invalid hostname', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const input = page.getByRole('textbox');
            const addButton = page.getByRole('button', { name: /add/i });

            await userEvent.fill(input, 'invalid hostname');
            await expect.element(addButton).toBeDisabled();
        });

        it('should add a new virtual host when Add button is clicked', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const input = page.getByRole('textbox');
            const addButton = page.getByRole('button', { name: /add/i });

            await userEvent.fill(input, 'virtual3.test-domain.com');
            await userEvent.click(addButton);

            await expect.element(page.getByText('virtual3.test-domain.com')).toBeVisible();
        });

        it('should clear input field after adding a virtual host', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const input = page.getByRole('textbox');
            const addButton = page.getByRole('button', { name: /add/i });

            await userEvent.fill(input, 'virtual3.test-domain.com');
            await userEvent.click(addButton);

            await expect.element(input).toHaveValue('');
        });

        it('should disable Add button after adding a virtual host', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const input = page.getByRole('textbox');
            const addButton = page.getByRole('button', { name: /add/i });

            await userEvent.fill(input, 'virtual3.test-domain.com');
            await userEvent.click(addButton);

            await expect.element(addButton).toBeDisabled();
        });
    });

    describe('Selection and Removal', () => {
        it('should show checkbox when hovering over a row', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const firstRow = page.getByText('virtual1.test-domain.com');
            await userEvent.hover(firstRow);

            const checkboxes = page.getByTestId('icon: SquareOutline').elements();
            expect(checkboxes.length).toBeGreaterThan(0);
        });

        it('should select a row when clicked', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const firstRow = page.getByText('virtual1.test-domain.com');
            await userEvent.click(firstRow);

            const checkedIcon = page.getByTestId('icon: CheckmarkSquareOutline').elements();
            expect(checkedIcon.length).toBeGreaterThan(0);
        });

        it('should show Remove button when a single row is selected and hovered', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const firstRow = page.getByText('virtual1.test-domain.com');
            await userEvent.click(firstRow);
            await userEvent.hover(firstRow);

            const removeButtons = page.getByRole('button', { name: /remove/i }).elements();
            expect(removeButtons.length).toBeGreaterThan(0);
        });

        it('should remove a single item when Remove button is clicked', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const firstRow = page.getByText('virtual1.test-domain.com');
            await userEvent.click(firstRow);
            await userEvent.hover(firstRow);

            const removeButton = page.getByRole('button', { name: /^remove$/i });
            await userEvent.click(removeButton);

            const removedItem = page.getByText('virtual1.test-domain.com').query();
            expect(removedItem).toBeNull();
        });

        it('should show "Remove selected items" button when multiple rows are selected', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const firstRow = page.getByText('virtual1.test-domain.com');
            const secondRow = page.getByText('virtual2.test-domain.com');

            await userEvent.click(firstRow);
            await userEvent.click(secondRow);

            await expect
                .element(page.getByRole('button', { name: /remove selected items/i }))
                .toBeVisible();
        });

        it('should remove multiple selected items when "Remove selected items" is clicked', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const firstRow = page.getByText('virtual1.test-domain.com');
            const secondRow = page.getByText('virtual2.test-domain.com');

            await userEvent.click(firstRow);
            await userEvent.click(secondRow);

            const removeSelectedButton = page.getByRole('button', {
                name: /remove selected items/i
            });
            await userEvent.click(removeSelectedButton);

            const removedItem1 = page.getByText('virtual1.test-domain.com').query();
            const removedItem2 = page.getByText('virtual2.test-domain.com').query();

            expect(removedItem1).toBeNull();
            expect(removedItem2).toBeNull();
        });

        it('should deselect a row when clicked again', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const firstRow = page.getByText('virtual1.test-domain.com');
            await userEvent.click(firstRow);
            await userEvent.click(firstRow);

            // After deselecting, there should be no checked icons for that specific row
            const checkedIcons = page.getByTestId('icon: CheckmarkSquareOutline').elements();
            expect(checkedIcons.length).toBe(0);
        });
    });

    describe('Select All Functionality', () => {
        it('should select all items when header is clicked', async () => {
            setupBrowserTest(<VirtualHostSectionWrapper />);

            const header = page.getByText('Virtual Host Name', { exact: true });
            await userEvent.click(header);

            const checkedIcons = page.getByTestId('icon: CheckmarkSquareOutline').elements();
            // Should have 3 checkboxes: 1 in header + 2 items
            expect(checkedIcons.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Empty State', () => {
        it('should show helmet logo when there are no items', async () => {
            setupBrowserTest(<EmptyVirtualHostSectionWrapper />);

            const logo = page.getByRole('img', { name: /logo/i });
            await expect.element(logo).toBeVisible();
        });
    });
});
