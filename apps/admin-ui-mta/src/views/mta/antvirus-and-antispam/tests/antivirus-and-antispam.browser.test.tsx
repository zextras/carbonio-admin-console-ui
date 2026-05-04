/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
    createBrowserSoapAPIInterceptor,
    grantUserConfigRights,
    resetMockWorker,
    setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import MTAAntiVirusAndAntiSpam from '../antivirus-and-antispam';

function getAllConfigResponse() {
    return {
        a: [
            { n: 'zimbraSpamSubjectTag', _content: '***SPAM***' },
            { n: 'zimbraSpamTagPercent', _content: '20' },
            { n: 'zimbraAmavisFinalSpamDestiny', _content: 'D_DISCARD' },
            { n: 'zimbraSpamKillPercent', _content: '75' },
            { n: 'zimbraAmavisOriginatingBypassSA', _content: 'TRUE' },
            { n: 'zimbraAmavisEnableDKIMVerification', _content: 'TRUE' },
            { n: 'zimbraVirusWarnRecipient', _content: 'FALSE' },
            { n: 'zimbraVirusBlockEncryptedArchive', _content: 'FALSE' },
            { n: 'zimbraVirusWarnAdmin', _content: 'TRUE' },
            { n: 'zimbraClamAVDatabaseMirror', _content: 'db.local.clamav.net' },
            { n: 'zimbraVirusDefinitionsUpdateFrequency', _content: '2h' },
            { n: 'carbonioAmavisDisableVirusCheck', _content: 'FALSE' },
            { n: 'carbonioClamAVDatabaseCustomURL', _content: 'https://custom.av.example.com/db' },
        ],
    };
}

async function expectAntispamSectionVisible() {
    await expect.element(page.getByText('Antispam', { exact: true })).toBeVisible();
    await expect
        .element(page.getByText('Add this prefix to the Spam mail subject'))
        .toBeVisible();
    await expect.element(page.getByText('Tolerance for Spam Delivery')).toBeVisible();
    await expect.element(page.getByText('Block Spam destiny')).toBeVisible();
    await expect.element(page.getByText('Tolerance for Spam Blocking')).toBeVisible();
    await expect.element(page.getByText('Also check outbound messages')).toBeVisible();
    await expect.element(page.getByText('Verify DKIM validity')).toBeVisible();
}

async function expectAntivirusDefinitionsSectionVisible() {
    await expect
        .element(page.getByText('Antivirus Definitions', { exact: true }))
        .toBeVisible();
    await expect.element(page.getByText('Disable Virus Check')).toBeVisible();
    await expect.element(page.getByText('Definition Mirrors')).toBeVisible();
    await expect.element(page.getByText('Antivirus Mirrors')).toBeVisible();
    await expect
        .element(page.getByText('Definition Update Frenquency'))
        .toBeVisible();
}

async function expectAntivirusWarningsSwitchesVisible() {
    await expect
        .element(page.getByText('Warn recipients when something is quarantined'))
        .toBeVisible();
    await expect
        .element(page.getByText('Virus Block Encrypted Archive'))
        .toBeVisible();
    await expect
        .element(page.getByText('Warn admins when something is quarantined'))
        .toBeVisible();
}

describe('MTAAntiVirusAndAntiSpam', () => {
    beforeEach(() => {
        grantUserConfigRights();
        createBrowserSoapAPIInterceptor('GetAllConfig', getAllConfigResponse());
    });

    afterEach(() => {
        resetMockWorker();
    });

    it('renders the page title', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        await expect
            .element(page.getByText('Antivirus & Antispam', { exact: true }))
            .toBeVisible();
    });

    it('renders the Antispam section with all controls', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        await expectAntispamSectionVisible();
    });

    it('renders the Antivirus Definitions section with all controls', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        await expectAntivirusDefinitionsSectionVisible();
    });

    it('renders antivirus warning switches', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        await expectAntivirusWarningsSwitchesVisible();
    });

    it('renders the antivirus mirrors table with data', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        await expect.element(page.getByText('Antivirus Mirrors')).toBeVisible();
        await expect.element(page.getByText('db.local.clamav.net')).toBeVisible();
    });

    it('renders the additional virus definitions table with data', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        await expect
            .element(page.getByText('Additional Virus Definitions'))
            .toBeVisible();
        await expect
            .element(page.getByText('https://custom.av.example.com/db'))
            .toBeVisible();
    });

    it('renders Add and Remove buttons for both definition tables', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        const addButtons = page.getByRole('button', { name: 'Add' }).all();
        expect(addButtons.length).toBe(2);

        const removeButtons = page.getByRole('button', { name: 'Remove' }).all();
        expect(removeButtons.length).toBe(2);
    });

    it('does not render Save and Cancel buttons when no changes are made', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        await expect
            .element(page.getByText('Antivirus & Antispam', { exact: true }))
            .toBeVisible();
        expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
        expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
    });

    it('shows Save and Cancel when a switch changes', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        const dkimSwitch = page.getByText('Verify DKIM validity');
        await expect.element(dkimSwitch).toBeVisible();
        await dkimSwitch.click();

        await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
        await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('resets dirty state when Cancel is clicked', async () => {
        await setupBrowserTest(<MTAAntiVirusAndAntiSpam />);

        await page.getByText('Verify DKIM validity').click();
        await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect
            .poll(() => page.getByRole('button', { name: 'Save' }).elements().length)
            .toBe(0);
        await expect
            .poll(() => page.getByRole('button', { name: 'Cancel' }).elements().length)
            .toBe(0);
    });
}, 20_000);
