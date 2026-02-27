/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useLocalStorage } from "../../utility/utils";

const LOCAL_STORAGE_KEY = 'storages-ui'; // Same key for the user ui for convenience

export const useTotalQuotaActive = (): boolean => {
    return useLocalStorage(LOCAL_STORAGE_KEY, false)[0]; 
};