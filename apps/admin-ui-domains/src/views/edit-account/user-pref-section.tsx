/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';

import { CalendarOptionsSection } from './user-pref-section/calendar-options';
import { ContactOptions } from './user-pref-section/contact-options';
import { EmailPreferences } from './user-pref-section/email-preferences';
import { SendingOptions } from './user-pref-section/sending-options';

const EditAccountUserPreferencesSection = () => (
  <Container
    mainAlignment="flex-start"
    padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
    style={{ overflow: 'auto' }}
  >
    <EmailPreferences />
    <SendingOptions />
    <ContactOptions />
    <CalendarOptionsSection />
  </Container>
);

export default EditAccountUserPreferencesSection;
