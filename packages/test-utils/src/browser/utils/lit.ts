/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Lit issues its "dev mode" warning once per page via a microtask when its
// reactive-element module loads, and skips it if the warning code is present in
// globalThis.litIssuedWarnings. Under vitest browser isolation each test file
// gets its own page, so the warning repeats; seed the code to silence it.
export function suppressLitDevModeWarning(): void {
  const g = globalThis as { litIssuedWarnings?: Set<unknown> };
  g.litIssuedWarnings ??= new Set();
  g.litIssuedWarnings.add('dev-mode');
}
