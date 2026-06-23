/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TrialBanner } from './parts/trial-banner';
import { RegularSubscription } from './regular-subscription';

export const TrialSubscription = () => {
  return (
    <>
      <TrialBanner />
      <RegularSubscription />
    </>
  );
};
