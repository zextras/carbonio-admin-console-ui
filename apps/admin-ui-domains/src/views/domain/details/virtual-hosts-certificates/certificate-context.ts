/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext, type Dispatch, type SetStateAction } from 'react';

type CertificateContextValue = {
  isCertificateAvailable: boolean;
  setIsCertificateAvailable: Dispatch<SetStateAction<boolean>>;
};

export const CertificateContext = createContext<CertificateContextValue>({
  isCertificateAvailable: false,
  setIsCertificateAvailable: () => {},
});
