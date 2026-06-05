/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { checkCreateCosRight, checkShowCOS } from '../check-rights';

const COS_RIGHTS_WITH_GET_ATTRS = [
  {
    type: 'cos',
    all: [{ getAttrs: [{ all: true }] }],
  },
];

const COS_RIGHTS_WITH_SET_ATTRS = [
  {
    type: 'cos',
    all: [{ setAttrs: [{ all: true }] }],
  },
];

const COS_RIGHTS_WITH_LIST_COS = [
  {
    type: 'cos',
    all: [{ right: [{ n: 'listCos' }] }],
  },
];

const COS_RIGHTS_EMPTY = [
  {
    type: 'cos',
    all: [{ getAttrs: [{ all: false }], setAttrs: [{ all: false }], right: [] }],
  },
];

const GLOBAL_RIGHTS_WITH_GET_ATTRS = [
  {
    type: 'global',
    all: [{ getAttrs: [{ all: true }] }],
  },
];

const GLOBAL_RIGHTS_WITH_SET_ATTRS = [
  {
    type: 'global',
    all: [{ setAttrs: [{ all: true }] }],
  },
];

const GLOBAL_RIGHTS_WITH_CREATE_COS = [
  {
    type: 'global',
    all: [{ right: [{ n: 'createCos' }] }],
  },
];

const GLOBAL_RIGHTS_EMPTY = [
  {
    type: 'global',
    all: [{ getAttrs: [{ all: false }], setAttrs: [{ all: false }], right: [] }],
  },
];

describe('checkShowCOS', () => {
  it('should return true when COS rights have getAttrs.all set to true', () => {
    expect(checkShowCOS(COS_RIGHTS_WITH_GET_ATTRS)).toBe(true);
  });

  it('should return true when COS rights have setAttrs.all set to true', () => {
    expect(checkShowCOS(COS_RIGHTS_WITH_SET_ATTRS)).toBe(true);
  });

  it('should return true when COS rights contain listCos right', () => {
    expect(checkShowCOS(COS_RIGHTS_WITH_LIST_COS)).toBe(true);
  });

  it('should return false when COS entry exists but no matching attrs or rights', () => {
    expect(checkShowCOS(COS_RIGHTS_EMPTY)).toBe(false);
  });

  it('should return false when rights is undefined', () => {
    expect(checkShowCOS(undefined)).toBe(false);
  });

  it('should return false when no COS type entry exists in rights', () => {
    const rights = [{ type: 'account', all: [{ getAttrs: [{ all: true }] }] }];
    expect(checkShowCOS(rights)).toBe(false);
  });

  it('should fall through to listCos check when getAttrs and setAttrs are absent', () => {
    const rights = [
      {
        type: 'cos',
        all: [{ right: [{ n: 'listCos' }] }],
      },
    ];
    expect(checkShowCOS(rights)).toBe(true);
  });

  it('should return false when COS all array is empty', () => {
    const rights = [{ type: 'cos', all: [] }];
    expect(checkShowCOS(rights)).toBe(false);
  });

  it('should return false when COS all is undefined', () => {
    const rights = [{ type: 'cos' }];
    expect(checkShowCOS(rights)).toBe(false);
  });

  it('should ignore non-COS type entries', () => {
    const rights = [
      { type: 'domain', all: [{ getAttrs: [{ all: true }] }] },
      { type: 'cos', all: [] },
    ];
    expect(checkShowCOS(rights)).toBe(false);
  });
});

describe('checkCreateCosRight', () => {
  it('should return true when GLOBAL rights have getAttrs.all set to true', () => {
    expect(checkCreateCosRight(GLOBAL_RIGHTS_WITH_GET_ATTRS)).toBe(true);
  });

  it('should return true when GLOBAL rights have setAttrs.all set to true', () => {
    expect(checkCreateCosRight(GLOBAL_RIGHTS_WITH_SET_ATTRS)).toBe(true);
  });

  it('should return true when GLOBAL rights contain createCos right', () => {
    expect(checkCreateCosRight(GLOBAL_RIGHTS_WITH_CREATE_COS)).toBe(true);
  });

  it('should return false when GLOBAL entry exists but no matching attrs or rights', () => {
    expect(checkCreateCosRight(GLOBAL_RIGHTS_EMPTY)).toBe(false);
  });

  it('should return false when rights is undefined', () => {
    expect(checkCreateCosRight(undefined)).toBe(false);
  });

  it('should return false when no GLOBAL type entry exists in rights', () => {
    const rights = [{ type: 'account', all: [{ getAttrs: [{ all: true }] }] }];
    expect(checkCreateCosRight(rights)).toBe(false);
  });

  it('should fall through to createCos check when getAttrs and setAttrs are absent', () => {
    const rights = [
      {
        type: 'global',
        all: [{ right: [{ n: 'createCos' }] }],
      },
    ];
    expect(checkCreateCosRight(rights)).toBe(true);
  });

  it('should return false when GLOBAL all array is empty', () => {
    const rights = [{ type: 'global', all: [] }];
    expect(checkCreateCosRight(rights)).toBe(false);
  });

  it('should return false when GLOBAL all is undefined', () => {
    const rights = [{ type: 'global' }];
    expect(checkCreateCosRight(rights)).toBe(false);
  });

  it('should ignore non-GLOBAL type entries', () => {
    const rights = [
      { type: 'cos', all: [{ getAttrs: [{ all: true }] }] },
      { type: 'global', all: [] },
    ];
    expect(checkCreateCosRight(rights)).toBe(false);
  });
});
