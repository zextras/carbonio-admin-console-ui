/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useDomainStore } from '@zextras/admin-ui-bootstrap';
import { createBrowserSoapAPIInterceptor, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import CreateDomain from '../create-new-domain';

describe('createDomain Integration (browser)', () => {
    beforeEach(() => {
        // Setup minimal store state
        useDomainStore.setState({
            domain: undefined,
            cosList: []
        });

        // Setup interceptors for API calls made during component mount
        createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
        createBrowserSoapAPIInterceptor('SearchDirectory', { cos: [] });
        createBrowserSoapAPIInterceptor('GetCreateObjectAttrs', { setAttrs: [{ a: [] }] });
    });

    afterEach(() => {
        useDomainStore.setState({});
    });

    it('should create domain with basic data (domain name only)', async () => {
        // Setup API interceptor
        const createDomainInterceptor = createBrowserSoapAPIInterceptor('CreateDomain', {
            domain: [
                {
                    id: 'domain-id-123',
                    name: 'test-domain.com'
                }
            ]
        });

        setupBrowserTest(<CreateDomain />);

        // Wait for component to render
        await expect.element(page.getByText('New Domain')).toBeVisible();

        // Fill domain name
        const domainNameInput = page.getByRole('textbox', {
            name: /Type the name your domain will have/i
        });
        await userEvent.type(domainNameInput, 'test-domain.com');

        // Find and click Create button
        const createButton = page.getByRole('button', { name: /Create/i });
        await createButton.click();

        // Wait for API call
        const requestParams = (await createDomainInterceptor) as any;

        // Verify API was called with correct domain name
        expect(requestParams.name).toBe('test-domain.com');
        expect(requestParams.a).toBeDefined();
        expect(Array.isArray(requestParams.a)).toBe(true);
    });

    it('should create domain with description and notes', async () => {
        const createDomainInterceptor = createBrowserSoapAPIInterceptor('CreateDomain', {
            domain: [
                {
                    id: 'domain-id-456',
                    name: 'company.com'
                }
            ]
        });

        setupBrowserTest(<CreateDomain />);

        await expect.element(page.getByText('New Domain')).toBeVisible();

        // Fill domain name
        const domainNameInput = page.getByRole('textbox', {
            name: /Type the name your domain will have/i
        });
        await userEvent.type(domainNameInput, 'company.com');

        // Fill description
        const descriptionInput = page.getByLabelText(/Description/i);
        await userEvent.type(descriptionInput, 'Corporate domain for company');

        // Fill notes
        const notesInput = page.getByLabelText(/Notes/i);
        await userEvent.type(notesInput, 'Main production domain');

        // Submit
        const createButton = page.getByRole('button', { name: /Create/i });
        await createButton.click();

        const requestParams = (await createDomainInterceptor) as any;

        // Verify domain name
        expect(requestParams.name).toBe('company.com');

        // Verify attributes contain description and notes
        expect(requestParams.a).toBeDefined();
        const attributes = requestParams.a;

        const descriptionAttr = attributes.find((attr: any) => attr.n === 'description');
        const notesAttr = attributes.find((attr: any) => attr.n === 'zimbraNotes');

        expect(descriptionAttr).toBeDefined();
        expect(descriptionAttr._content).toBe('Corporate domain for company');
        expect(notesAttr).toBeDefined();
        expect(notesAttr._content).toBe('Main production domain');
    });

    it('should create domain with description and notes', async () => {
        const createDomainInterceptor = createBrowserSoapAPIInterceptor('CreateDomain', {
            domain: [
                {
                    id: 'domain-id-456',
                    name: 'company.com'
                }
            ]
        });

        setupBrowserTest(<CreateDomain />);

        await expect.element(page.getByText('New Domain')).toBeVisible();

        // Fill domain name
        const domainNameInput = page.getByRole('textbox', {
            name: /Type the name your domain will have/i
        });
        await userEvent.type(domainNameInput, 'company.com');

        // Fill description
        const descriptionInput = page.getByLabelText(/Description/i);
        await userEvent.type(descriptionInput, 'Corporate domain for company');

        // Fill notes
        const notesInput = page.getByLabelText(/Notes/i);
        await userEvent.type(notesInput, 'Main production domain');

        // Submit
        const createButton = page.getByRole('button', { name: /Create/i });
        await createButton.click();

        const requestParams = (await createDomainInterceptor) as any;

        // Verify domain name
        expect(requestParams.name).toBe('company.com');

        // Verify attributes contain description and notes
        expect(requestParams.a).toBeDefined();
        const attributes = requestParams.a;

        const descriptionAttr = attributes.find((attr: any) => attr.n === 'description');
        const notesAttr = attributes.find((attr: any) => attr.n === 'zimbraNotes');

        expect(descriptionAttr).toBeDefined();
        expect(descriptionAttr._content).toBe('Corporate domain for company');
        expect(notesAttr).toBeDefined();
        expect(notesAttr._content).toBe('Main production domain');
    });
});
