/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { useAccountForm } from '../account-form-context';
import { EditAccountContactsSection } from '../contacts-section';
import { AccountFormTestProvider } from './account-form-test-provider';

const ContactsStoreProbe = () => {
  const { form } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, string>);
  return (
    <div>
      <p>{`probe-telephoneNumber:${values?.telephoneNumber ?? ''}`}</p>
      <p>{`probe-homePhone:${values?.homePhone ?? ''}`}</p>
      <p>{`probe-mobile:${values?.mobile ?? ''}`}</p>
      <p>{`probe-pager:${values?.pager ?? ''}`}</p>
      <p>{`probe-facsimileTelephoneNumber:${values?.facsimileTelephoneNumber ?? ''}`}</p>
      <p>{`probe-company:${values?.company ?? ''}`}</p>
      <p>{`probe-title:${values?.title ?? ''}`}</p>
      <p>{`probe-co:${values?.co ?? ''}`}</p>
      <p>{`probe-st:${values?.st ?? ''}`}</p>
      <p>{`probe-l:${values?.l ?? ''}`}</p>
      <p>{`probe-postalCode:${values?.postalCode ?? ''}`}</p>
      <p>{`probe-street:${values?.street ?? ''}`}</p>
    </div>
  );
};

function setupContactsTest(values: Record<string, string> = {}) {
  return setupBrowserTest(
    <AccountFormTestProvider values={values}>
      <>
        <EditAccountContactsSection />
        <ContactsStoreProbe />
      </>
    </AccountFormTestProvider>,
  );
}

describe('EditAccountContactsSection (browser)', () => {
  it('renders every contact input seeded from the stored account values', async () => {
    setupContactsTest({
      telephoneNumber: '+39 025 551 234',
      homePhone: '025 551 235',
      mobile: '+39 333 555 1234',
      pager: '025 551 236',
      facsimileTelephoneNumber: '025 551 237',
      company: 'Zextras',
      title: 'Software Developer',
      co: 'Italy',
      st: 'TS',
      l: 'Trieste',
      postalCode: '34100',
      street: "Via dell'Industria 1",
    });

    await expect
      .element(page.getByRole('textbox', { name: 'Phone', exact: true }))
      .toHaveValue('+39 025 551 234');
    await expect
      .element(page.getByRole('textbox', { name: 'Home', exact: true }))
      .toHaveValue('025 551 235');
    await expect
      .element(page.getByRole('textbox', { name: 'Mobile', exact: true }))
      .toHaveValue('+39 333 555 1234');
    await expect
      .element(page.getByRole('textbox', { name: 'Pager', exact: true }))
      .toHaveValue('025 551 236');
    await expect
      .element(page.getByRole('textbox', { name: 'Fax Number', exact: true }))
      .toHaveValue('025 551 237');
    await expect
      .element(page.getByRole('textbox', { name: 'Company', exact: true }))
      .toHaveValue('Zextras');
    await expect
      .element(page.getByRole('textbox', { name: 'Job Title', exact: true }))
      .toHaveValue('Software Developer');
    await expect
      .element(page.getByRole('textbox', { name: 'Country', exact: true }))
      .toHaveValue('Italy');
    await expect
      .element(page.getByRole('textbox', { name: 'State', exact: true }))
      .toHaveValue('TS');
    await expect
      .element(page.getByRole('textbox', { name: 'City', exact: true }))
      .toHaveValue('Trieste');
    await expect
      .element(page.getByRole('textbox', { name: 'Postal Code', exact: true }))
      .toHaveValue('34100');
    await expect
      .element(page.getByRole('textbox', { name: 'Address', exact: true }))
      .toHaveValue("Via dell'Industria 1");
    await expect.element(page.getByText('probe-company:Zextras')).toBeVisible();
    await expect.element(page.getByText('probe-street:Via dell\'Industria 1')).toBeVisible();
  });

  it('commits valid phone numbers typed into each phone input', async () => {
    setupContactsTest();

    await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('+39 02 555 1234');
    await expect.element(page.getByText('probe-telephoneNumber:+39 02 555 1234')).toBeVisible();
    await page.getByRole('textbox', { name: 'Home', exact: true }).fill('02 555 1235');
    await expect.element(page.getByText('probe-homePhone:02 555 1235')).toBeVisible();
    await page.getByRole('textbox', { name: 'Mobile', exact: true }).fill('+39 333 555 1236');
    await expect.element(page.getByText('probe-mobile:+39 333 555 1236')).toBeVisible();
    await page.getByRole('textbox', { name: 'Pager', exact: true }).fill('555-1237');
    await expect.element(page.getByText('probe-pager:555-1237')).toBeVisible();
    await page.getByRole('textbox', { name: 'Fax Number', exact: true }).fill('02/555,1238');
    await expect.element(page.getByText('probe-facsimileTelephoneNumber:02/555,1238')).toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'Fax Number', exact: true }))
      .toHaveValue('02/555,1238');
  });

  it('rejects invalid phone numbers and leaves the stored values untouched', async () => {
    setupContactsTest();

    await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('abc12');
    await expect
      .element(page.getByRole('textbox', { name: 'Phone', exact: true }))
      .toHaveValue('');
    await expect
      .element(page.getByText('probe-telephoneNumber:', { exact: true }))
      .toBeVisible();

    await page.getByRole('textbox', { name: 'Home', exact: true }).fill('not-a-phone');
    await expect
      .element(page.getByRole('textbox', { name: 'Home', exact: true }))
      .toHaveValue('');
    await expect.element(page.getByText('probe-homePhone:', { exact: true })).toBeVisible();

    await page.getByRole('textbox', { name: 'Mobile', exact: true }).fill('12#34');
    await expect
      .element(page.getByRole('textbox', { name: 'Mobile', exact: true }))
      .toHaveValue('');
    await expect.element(page.getByText('probe-mobile:', { exact: true })).toBeVisible();

    await page.getByRole('textbox', { name: 'Pager', exact: true }).fill('call me');
    await expect
      .element(page.getByRole('textbox', { name: 'Pager', exact: true }))
      .toHaveValue('');
    await expect.element(page.getByText('probe-pager:', { exact: true })).toBeVisible();

    await page.getByRole('textbox', { name: 'Fax Number', exact: true }).fill('555123@9');
    await expect
      .element(page.getByRole('textbox', { name: 'Fax Number', exact: true }))
      .toHaveValue('');
    await expect
      .element(page.getByText('probe-facsimileTelephoneNumber:', { exact: true }))
      .toBeVisible();
  });

  it('clears stored phone numbers when the phone inputs are emptied', async () => {
    setupContactsTest({
      telephoneNumber: '+39 025 551 234',
      homePhone: '025 551 235',
      mobile: '+39 333 555 1234',
      pager: '025 551 236',
      facsimileTelephoneNumber: '025 551 237',
    });

    const phone = page.getByRole('textbox', { name: 'Phone', exact: true });
    await expect.element(phone).toHaveValue('+39 025 551 234');

    await phone.fill('');
    await expect.element(phone).toHaveValue('');
    await expect.element(page.getByText('probe-telephoneNumber:', { exact: true })).toBeVisible();

    await page.getByRole('textbox', { name: 'Home', exact: true }).fill('');
    await expect.element(page.getByText('probe-homePhone:', { exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Mobile', exact: true }).fill('');
    await expect.element(page.getByText('probe-mobile:', { exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Pager', exact: true }).fill('');
    await expect.element(page.getByText('probe-pager:', { exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Fax Number', exact: true }).fill('');
    await expect
      .element(page.getByText('probe-facsimileTelephoneNumber:', { exact: true }))
      .toBeVisible();
  });

  it('commits edits to the company and address fields', async () => {
    setupContactsTest();

    await page.getByRole('textbox', { name: 'Company', exact: true }).fill('Acme Inc.');
    await expect.element(page.getByText('probe-company:Acme Inc.')).toBeVisible();
    await page.getByRole('textbox', { name: 'Job Title', exact: true }).fill('CTO');
    await expect.element(page.getByText('probe-title:CTO')).toBeVisible();
    await page.getByRole('textbox', { name: 'Country', exact: true }).fill('France');
    await expect.element(page.getByText('probe-co:France')).toBeVisible();
    await page.getByRole('textbox', { name: 'State', exact: true }).fill('IdF');
    await expect.element(page.getByText('probe-st:IdF')).toBeVisible();
    await page.getByRole('textbox', { name: 'City', exact: true }).fill('Paris');
    await expect.element(page.getByText('probe-l:Paris')).toBeVisible();
    await page.getByRole('textbox', { name: 'Postal Code', exact: true }).fill('75001');
    await expect.element(page.getByText('probe-postalCode:75001')).toBeVisible();
    await page.getByRole('textbox', { name: 'Address', exact: true }).fill('1 Rue de la Paix');
    await expect.element(page.getByText('probe-street:1 Rue de la Paix')).toBeVisible();
  });
});
