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

import MTAPostScreenTuning from '../post-screen-tuning';

function getAllConfigResponse() {
    return {
        a: [
            { n: 'zimbraMtaPostscreenBlacklistAction', _content: 'ignore' },
            { n: 'zimbraMtaPostscreenAccessList', _content: 'permit_mynetworks' },
            { n: 'zimbraMtaPostscreenDnsblAction', _content: 'enforce' },
            { n: 'zimbraMtaPostscreenDnsblSites', _content: 'zen.spamhaus.org*3' },
            { n: 'zimbraMtaPostscreenDnsblThreshold', _content: '3' },
            { n: 'zimbraMtaPostscreenDnsblWhitelistThreshold', _content: '-1' },
            { n: 'zimbraMtaPostscreenDnsblMinTTL', _content: '60s' },
            { n: 'zimbraMtaPostscreenDnsblMaxTTL', _content: '1h' },
            { n: 'zimbraMtaPostscreenDnsblTTL', _content: '1h' },
            { n: 'zimbraMtaPostscreenBareNewlineEnable', _content: 'no' },
            { n: 'zimbraMtaPostscreenBareNewlineAction', _content: 'ignore' },
            { n: 'zimbraMtaPostscreenBareNewlineTTL', _content: '30d' },
            { n: 'zimbraMtaPostscreenNonSmtpCommandEnable', _content: 'no' },
            { n: 'zimbraMtaPostscreenNonSmtpCommandAction', _content: 'drop' },
            { n: 'zimbraMtaPostscreenNonSmtpCommandTTL', _content: '30d' },
            { n: 'zimbraMtaPostscreenPipeliningEnable', _content: 'no' },
            { n: 'zimbraMtaPostscreenPipeliningAction', _content: 'enforce' },
            { n: 'zimbraMtaPostscreenPipeliningTTL', _content: '30d' },
        ],
    };
}

async function expectBlacklistingSectionVisible() {
    await expect.element(page.getByText('Blacklisting', { exact: true })).toBeVisible();
    await expect
        .element(page.getByText('Blacklist Action', { exact: true }))
        .toBeVisible();
    await expect
        .element(page.getByText('Access List Path', { exact: true }))
        .toBeVisible();
}

async function expectDnsBlacklistingSectionVisible() {
    await expect.element(page.getByText('DNS Blacklisting', { exact: true })).toBeVisible();
    await expect.element(page.getByText('DNS Blacklist Sites')).toBeVisible();
    await expect.element(page.getByText('DNS Blacklist Action')).toBeVisible();
    await expect
        .element(page.getByText('DNS Blacklist Threshold (value)'))
        .toBeVisible();
    await expect
        .element(page.getByText('DNS Blacklist Whitelist Threshold  (value)'))
        .toBeVisible();
    await expect
        .element(page.getByText('DNS Blacklist Min Time to Live (value)'))
        .toBeVisible();
    await expect
        .element(page.getByText('DNS Blacklist Max Time to Live (value)'))
        .toBeVisible();
    await expect
        .element(page.getByText('DNS Blacklist Time to Live (value)'))
        .toBeVisible();
}

async function expectTuningSectionVisible() {
    await expect.element(page.getByText('Tuning', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Bare Newline')).toBeVisible();
    await expect.element(page.getByText('NonSMTP Command')).toBeVisible();
    await expect.element(page.getByText('Pipelining')).toBeVisible();
}

describe('MTAPostScreenTuning', () => {
    beforeEach(() => {
        grantUserConfigRights();
        createBrowserSoapAPIInterceptor('GetAllConfig', getAllConfigResponse());
    });

    afterEach(() => {
        resetMockWorker();
    });

    it('renders the page title', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        await expect
            .element(page.getByText('Postscreen Tuning', { exact: true }))
            .toBeVisible();
    });

    it('renders the greylisting info banner', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        await expect
            .element(
                page.getByText(
                    'This is a form of greylisting, so you need to disable other forms of greylisting.',
                ),
            )
            .toBeVisible();
    });

    it('renders all three sections with their controls', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        await expectBlacklistingSectionVisible();
        await expectDnsBlacklistingSectionVisible();
        await expectTuningSectionVisible();
    });

    it('renders Blacklisting section with inputs and select', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        await expect.element(page.getByText('Blacklisting', { exact: true })).toBeVisible();
        await expect.element(page.getByText('Blacklist Action', { exact: true })).toBeVisible();
        await expect.element(page.getByText('Access List Path', { exact: true })).toBeVisible();
    });

    it('renders DNS Blacklisting section with all inputs and selects', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        await expect.element(page.getByText('DNS Blacklisting', { exact: true })).toBeVisible();
        await expect.element(page.getByText('DNS Blacklist Sites')).toBeVisible();
        await expect.element(page.getByText('DNS Blacklist Action')).toBeVisible();
        await expect.element(page.getByText('DNS Blacklist Threshold (value)')).toBeVisible();
        await expect
            .element(page.getByText('DNS Blacklist Whitelist Threshold  (value)'))
            .toBeVisible();
        await expect
            .element(page.getByText('DNS Blacklist Min Time to Live (value)'))
            .toBeVisible();
        await expect
            .element(page.getByText('DNS Blacklist Max Time to Live (value)'))
            .toBeVisible();
        await expect
            .element(page.getByText('DNS Blacklist Time to Live (value)'))
            .toBeVisible();
    });

    it('renders Tuning section with all three switches', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        await expect.element(page.getByText('Tuning', { exact: true })).toBeVisible();
        await expect.element(page.getByText('Bare Newline')).toBeVisible();
        await expect.element(page.getByText('NonSMTP Command')).toBeVisible();
        await expect.element(page.getByText('Pipelining')).toBeVisible();
    });

    it('renders Action selects and Command Time to Live inputs in the Tuning section', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        const actionLabels = page.getByText('Action', { exact: true }).all();
        expect(actionLabels.length).toBeGreaterThanOrEqual(3);

        const ttlLabels = page.getByText('Command Time to Live (value)').all();
        expect(ttlLabels.length).toBeGreaterThanOrEqual(3);

        const intervalLabels = page.getByText('Interval', { exact: true }).all();
        expect(intervalLabels.length).toBeGreaterThanOrEqual(3);
    });

    it('does not render Save and Cancel buttons when no changes are made', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        await expect
            .element(page.getByText('Postscreen Tuning', { exact: true }))
            .toBeVisible();
        expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
        expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
    });

    it('shows Save and Cancel when a switch changes', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        const bareNewlineSwitch = page.getByText('Bare Newline');
        await expect.element(bareNewlineSwitch).toBeVisible();
        await bareNewlineSwitch.click();

        await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
        await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('resets dirty state when Cancel is clicked', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        await page.getByText('Bare Newline').click();
        await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect
            .poll(() => page.getByRole('button', { name: 'Save' }).elements().length)
            .toBe(0);
        await expect
            .poll(() => page.getByRole('button', { name: 'Cancel' }).elements().length)
            .toBe(0);
    });

    it('dismisses the greylisting info banner when close is clicked', async () => {
        await setupBrowserTest(<MTAPostScreenTuning />);

        await expect
            .element(
                page.getByText(
                    'This is a form of greylisting, so you need to disable other forms of greylisting.',
                ),
            )
            .toBeVisible();

        await page.getByTestId('icon: CloseOutline').click();

        await expect
            .poll(
                () =>
                    page
                        .getByText(
                            'This is a form of greylisting, so you need to disable other forms of greylisting.',
                        )
                        .elements().length,
            )
            .toBe(0);
    });
}, 20_000);
