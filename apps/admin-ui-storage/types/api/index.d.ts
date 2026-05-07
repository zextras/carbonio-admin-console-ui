/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type SoapResponse = {
    Body: {
        response: {
            content: string;
        };
    };
};

export type ZextrasResponse = {
    ok: boolean;
    error?: string;
    response: Record<string, unknown>;
};

export type CoreAttributeResponse = {
    errors?: Array<{ error: string }>;
    error?: string;
};
