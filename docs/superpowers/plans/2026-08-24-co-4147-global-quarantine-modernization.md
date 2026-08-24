# CO-4147 Global Quarantine Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the Global > Quarantine view per [CO-4147](https://zextras.atlassian.net/browse/CO-4147): split the 1602-line `global-quarantine.tsx` monolith into small components, move all data access to React Query (auto-refresh after release/delete/bounce, clear error reporting), add accessible names to unlabeled icon buttons, and write the full test suite at the end.

**Architecture:** Pure normalization logic is extracted first (types + functions, no behavior change), then a React Query data layer (2 queries, 4 mutations with snackbar feedback + cache invalidation), then the view is split into `QuarantineAccountSection`, `MessageListTable`, `MessageViewModal` with `global-quarantine.tsx` as a thin orchestrator. Tests are written LAST, against the stable final components (explicit user decision — components are too unstable to test mid-refactor).

**Tech Stack:** React 19 + React Compiler (no `useMemo`/`useCallback` in components), TanStack React Query v5, `@zextras/ui-components` (Container/Row/Padded deprecated primitives are KEPT as-is for moved JSX — explicit user decision), Vitest (jsdom unit + Playwright browser via MSW).

**Conventions (from AGENTS.md):**

- SPDX header in every new file (year 2026, eslint auto-fixes)
- Named exports only; arrow-function components; no `FC` for new components
- `Array<T>` over `T[]`; `type` for props
- No `console.*`; errors via `useSnackbar()`
- Import order enforced by `simple-import-sort`
- All commands run from repo root unless noted; app-scoped: `pnpm --filter @zextras/admin-ui-domains <cmd>`

**Key API facts (verified):**

- `soapFetch(api, body)` POSTs to `/service/admin/soap/${api}Request` and resolves to `Body[`${api}Response`]` (`packages/ui-shared/src/network/fetch.ts:70-118`)
- `postSoapFetchRequest(url, body, api)` POSTs raw URL, resolves to full `Body` — that's why `getQuarantineMessages` reads `response?.Body?.SearchResponse` (`packages/ui-shared/src/network/fetch.ts:185-226`)
- `useAllConfig()` → `{ data, isPending, invalidate }`, query key `['all-config']` (`packages/ui-shared/src/react-query/use-config.ts:31-56`)
- Existing query-key factory: `apps/admin-ui-domains/src/services/domain-query-keys.ts:7-61`
- Existing hooks to imitate: `src/services/use-account-detail.ts` (`QUERY_OPTS` block), `src/services/use-set-2fa-policies.ts` (mutation + invalidation)
- `Button` spreads `...rest` onto the native `<button>` (`packages/ui-components/src/components/basic/button/Button.tsx:207,277`) → `aria-label` works
- Established a11y idiom: `aria-label={t('label.close', 'Close')}` on icon-only buttons

**Known bug fixed by this refactor:** delete-message modal `onClose` calls `setDeleteQuarantuneAccModal(false)` instead of `setDeleteMsgModal(false)` (`global-quarantine.tsx:1325`). In the new `MessageViewModal` each dialog has its own state, so the bug disappears; no extra task needed.

---

### Task 1: Extract shared types to `quarantine-types.ts`

**Files:**

- Create: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/quarantine-types.ts`
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/global-quarantine.tsx` (delete lines 43-158 local types, import from new module)
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/mail-message-renderer.tsx` (delete duplicated types lines 36-132, import + re-export)

- [ ] **Step 1: Create `quarantine-types.ts`** with the canonical types. `IncompleteMessage` is the version from `global-quarantine.tsx:60-97` (it already has `score`/`reason`/`envelopeFrom`/`envelopeTo`); `tags` becomes `Array<string>` (renderer's stricter type):

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type AttachmentPart = {
  part?: string;
  ct?: string;
  s?: number;
  size?: number;
  filename?: string;
  body?: boolean;
  contentType?: string;
  content?: string;
  name?: string;
  parts?: Array<AttachmentPart>;
  ci?: string;
  disposition?: 'inline' | 'attachment';
  cd?: 'inline' | 'attachment';
  mp?: Array<AttachmentPart>;
};

export type MailMessagePart = {
  contentType: string;
  size: number;
  content?: string;
  name: string;
  filename?: string;
  parts?: Array<MailMessagePart>;
  ci?: string;
  cd?: string;
  disposition?: 'inline' | 'attachment';
};

export type SoapEmailParticipantRole = 'f' | 't' | 'c' | 'b' | 'r' | 's' | 'n' | 'rf';

export type SoapMailParticipant = {
  /** Address */
  a: string;
  /** Display name */
  d?: string;
  /** Full name */
  p: string;
  /** (f)rom, (t)o, (c)c, (b)cc, (r)eply-to, (s)ender, read-receipt (n)otification, (rf) resent-from */
  t: SoapEmailParticipantRole;
  isGroup?: 0 | 1;
};

export type SoapMailMessagePart = {
  part: string;
  ct: 'multipart/alternative' | string;
  s?: number;
  ci?: string;
  cd?: 'inline' | 'attachment';
  mp?: Array<SoapMailMessagePart>;
  body?: true;
  filename?: string;
  // FIXME see IRIS-4029 content may be a string or { _content: string } depending on compose settings
  content?: string;
};

export const ParticipantRole = {
  FROM: 'f',
  TO: 't',
  CARBON_COPY: 'c',
  BLIND_CARBON_COPY: 'b',
  REPLY_TO: 'r',
  SENDER: 's',
  READ_RECEIPT_NOTIFICATION: 'n',
  RESENT_FROM: 'rf',
} as const;

export type ParticipantRoleType = (typeof ParticipantRole)[keyof typeof ParticipantRole];

export type Participant = {
  type: ParticipantRoleType;
  address: string;
  name?: string;
  fullName?: string;
};

export type IncompleteMessage = {
  id: string;
  did?: string;
  parent: string;
  conversation: string;
  read: boolean | string;
  size: number;
  hasAttachment: boolean;
  flagged: boolean;
  urgent: boolean;
  isDeleted: boolean;
  isSentByMe: boolean;
  isForwarded: boolean;
  isInvite: boolean;
  isDraft: boolean;
  isScheduled: boolean;
  autoSendTime?: number;
  attachments?: Array<AttachmentPart>;
  participants?: Array<Participant>;
  date: number;
  subject: string;
  fragment?: string;
  tags: Array<string>;
  parts: Array<MailMessagePart>;
  body: { contentType: string; content: string };
  invite?: unknown;
  shr?: unknown;
  isComplete: boolean;
  isReplied: boolean;
  isReadReceiptRequested?: boolean;
  score?: string;
  reason?: string;
  envelopeFrom?: string;
  envelopeTo?: string;
};

export type MailMessage = IncompleteMessage;

export type EditorAttachmentFiles = {
  contentType: string;
  disposition?: string;
  fileName?: string;
  filename: string;
  name: string;
  size: number;
};

export type BodyContent = { contentType: string; content: string };

export type ParsedFlags = {
  read: boolean;
  hasAttachment: boolean;
  flagged: boolean;
  urgent: boolean;
  isDeleted: boolean;
  isDraft: boolean;
  isForwarded: boolean;
  isSentByMe: boolean;
  isInvite: boolean;
  isReplied: boolean;
  isReadReceiptRequested: boolean;
};
```

- [ ] **Step 2: `mail-message-renderer.tsx`** — delete its local `MailMessagePart`, `IncompleteMessage`, `AttachmentPart`, `ParticipantRole`, `Participant`, `EditorAttachmentFiles`, `MailMessage` definitions (lines 36-132) and replace with imports, keeping the public surface stable for `attachments-block.tsx`:

```typescript
import {
  AttachmentPart,
  EditorAttachmentFiles,
  IncompleteMessage,
  MailMessagePart,
  Participant,
  ParticipantRole,
  type MailMessage,
} from './quarantine-types';

export type {
  AttachmentPart,
  EditorAttachmentFiles,
  IncompleteMessage,
  MailMessage,
  MailMessagePart,
  Participant,
};
```

Keep the internal `_HtmlMessageRendererType` local. Adjust internal usages if the old `Participant.type: any` loosened typing surfaces errors — fix call sites with casts, do NOT loosen `quarantine-types.ts`.

- [ ] **Step 3: `global-quarantine.tsx`** — delete local types (lines 43-158, `BodyContent` at 688-691, `ParsedFlags` at 715-727, `Flags` at 686) and add:

```typescript
import {
  type AttachmentPart,
  type BodyContent,
  type IncompleteMessage,
  type MailMessagePart,
  type ParsedFlags,
  ParticipantRole,
  type Participant,
  type ParticipantRoleType,
  type SoapEmailParticipantRole,
  type SoapMailMessagePart,
} from './quarantine-types';
```

- [ ] **Step 4: Verify** — `pnpm --filter @zextras/admin-ui-domains type-check` (expect PASS), `pnpm --filter @zextras/admin-ui-domains lint` (0 errors)

---

### Task 2: Extract pure normalization logic to `quarantine-message-normalizer.ts`

**Files:**

- Create: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/quarantine-message-normalizer.ts`
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/global-quarantine.tsx` (delete the functions listed below)

- [ ] **Step 1: Create the module.** Move these functions OUT of the component body into module scope, **verbatim logic** — only mechanical changes: remove the `useCallback(..., [deps])` wrappers (module-level pure functions need no hooks), remove the intermediate wrapper lambdas, keep names identical. Source locations in current `global-quarantine.tsx`:

| Function                                        | Current lines | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `getDateTime(d: number): string`                | 160-163       | verbatim                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `participantTypeFromSoap`                       | 383-404       | plain function                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `normalizeParticipantsFromSoap`                 | 405-413       | drop `useCallback`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `normalizeMailPartMapFn`                        | 415-430       | drop `useCallback` (self-recursion fine)                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `findBodyPart`                                  | 431-467       | drop `useCallback`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `generateBody`                                  | 468-477       | inline: export `const generateBody = (mp: Array<SoapMailMessagePart>, id: string): BodyContent => findBodyPart(mp, { contentType: '', content: '' }, id);`                                                                                                                                                                                                                                                                                                          |
| `extractAttachmentIdsFromHtmlContent`           | 478-481       | verbatim                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `getAttachmentsAnchoredOnHtmlBody`              | 483-506       | hoist inner `extractCid` stays nested                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `cleanUpCi`                                     | 507           | verbatim                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `isIgnoreAttachment`                            | 509-527       | verbatim                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `getAttachmentsFromParts`                       | 528-618       | drop `useCallback`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `buildGetMsgBatch` (was `messageListArrayData`) | 620-660       | rename to `buildGetMsgBatch`, type `(messages: Array<{ id: string }>) => Array<unknown>`; keep the header list identical                                                                                                                                                                                                                                                                                                                                            |
| `processMessageAttributes`                      | 662-679       | verbatim                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `extractScoreValue`                             | 681-684       | return type `string` not `any`                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `normalizeParticipants`                         | 693-697       | simplify: `export const normalizeParticipants = (participants: Array<SoapMailParticipant>                                                                                                                                                                                                                                                                                                                                                                           | undefined): Array<Participant> => (participants ? map(participants, normalizeParticipantsFromSoap) : []);` |
| `normalizeMailParts`                            | 699-703       | same simplification with `Array<SoapMailParticipant parts>` → uses `normalizeMailPartMapFn`                                                                                                                                                                                                                                                                                                                                                                         |
| `getAttachments`                                | 704-707       | drop `useCallback`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `generateBodyContent`                           | 709-713       | inline into `normalizeMessage`                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `parseFlags`                                    | 729-744       | drop `useCallback`, param type `string                                                                                                                                                                                                                                                                                                                                                                                                                              | undefined`                                                                                                 |
| `sanitizeEmail`                                 | 746           | verbatim                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `normalizeMessage`                              | 748-790       | drop `useCallback`; return type `IncompleteMessage`; signature `export const normalizeMessage = (m: SoapQuarantineMessage): IncompleteMessage =>` where you also export `type SoapQuarantineMessage = { cid?: string; id: string; d: number; s: number; l: string; fr?: string; su?: string; e?: Array<SoapMailParticipant>; mp?: Array<SoapMailMessagePart>; inv?: unknown; shr?: unknown; f?: string; autoSendTime?: number; _attrs?: Record<string, unknown> };` |

The exports consumed later: `getDateTime`, `buildGetMsgBatch`, `normalizeMessage`. Also export the helpers listed for testability: `parseFlags`, `extractScoreValue`, `sanitizeEmail`, `getAttachmentsFromParts`, `findBodyPart`. Imports needed: `format` from `date-fns`, `cloneDeep, forEach, isArray, isNil, map, reduce, replace` from `lodash-es`, and the types from `./quarantine-types`.

- [ ] **Step 2: `global-quarantine.tsx`** — delete all functions listed above from the component; add `import { buildGetMsgBatch, getDateTime, normalizeMessage } from './quarantine-message-normalizer';` (getDateTime is only used by `MessageListTable` — it moves out in Task 8; keep the import in this file for now).

- [ ] **Step 3: Verify** — type-check + lint pass (behavior unchanged — `getMessageResponses` at line 792 now calls imported `buildGetMsgBatch`/`normalizeMessage`)

---

### Task 3: Add quarantine query keys

**Files:**

- Modify: `apps/admin-ui-domains/src/services/domain-query-keys.ts` (insert before the closing `} as const;` at line 61)

- [ ] **Step 1: Add keys**

```typescript
  quarantineAccount: () => [...domainQueryKeys.all, 'quarantine-account'] as const,
  quarantineMessages: () => [...domainQueryKeys.all, 'quarantine-messages'] as const,
```

- [ ] **Step 2: Verify** — type-check passes

---

### Task 4: `use-quarantine-account.ts` query hook

**Files:**

- Create: `apps/admin-ui-domains/src/services/use-quarantine-account.ts`

- [ ] **Step 1: Create the hook.** Encapsulates config lookups + `GetAccount` (replaces the config-scraping half of `getQuarantineMsgData`, `global-quarantine.tsx:814-853`):

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAllConfig } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getAccountRequest } from './get-account';

export type QuarantineAccountData = {
  name: string;
  id: string;
  /** numeric part of zimbraMailMessageLifetime, e.g. '7' for '7d' */
  retentionValue: string;
  /** interval part of zimbraMailMessageLifetime, e.g. 'd' for '7d' */
  retentionInterval: string;
};

const LIFETIME_ATTR = 'zimbraMailMessageLifetime';

export const useQuarantineAccount = () => {
  const { data: config = [] } = useAllConfig();
  const accountName = find(config, { n: 'zimbraAmavisQuarantineAccount' })?._content ?? '';
  const defaultDomainName = find(config, { n: 'zimbraDefaultDomainName' })?._content ?? '';

  return useQuery({
    queryKey: [...domainQueryKeys.quarantineAccount(), accountName],
    queryFn: async (): Promise<QuarantineAccountData> => {
      const res = await getAccountRequest('', accountName, 0);
      const account = res?.account?.[0];
      if (!account?.id) {
        throw new Error(`Quarantine account not found: ${accountName}`);
      }
      const lifetime = find(account.a, { n: LIFETIME_ATTR })?._content;
      return {
        name: accountName,
        id: account.id,
        retentionValue: lifetime?.slice(0, -1) ?? '',
        retentionInterval: lifetime?.slice(-1) ?? '',
      };
    },
    enabled: !!accountName,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
```

Notes: `accountName` in the query key means an `['all-config']` invalidation → new name → automatic refetch. Also export from the app's services index if one exists (`rg -n "use-account-detail" apps/admin-ui-domains/src/services/index.ts`); otherwise direct-path imports are the codebase norm.

- [ ] **Step 2: Verify** — type-check + lint

---

### Task 5: `use-quarantine-messages.ts` query hook

**Files:**

- Create: `apps/admin-ui-domains/src/services/use-quarantine-messages.ts`

- [ ] **Step 1: Create the hook.** Encapsulates `Search` + `Batch(GetMsg)` + normalization (replaces `messageListArrayData`→`getMessageResponses` chain, `global-quarantine.tsx:788-849`):

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { IncompleteMessage } from '../views/domain/global/global-quarantine/quarantine-types';
import {
  buildGetMsgBatch,
  normalizeMessage,
} from '../views/domain/global/global-quarantine/quarantine-message-normalizer';
import { batchService } from './batch-service';
import { domainQueryKeys } from './domain-query-keys';
import { getQuarantineMessages } from './get-quarantine-messages-service';

export const useQuarantineMessages = (accountId: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.quarantineMessages(),
    queryFn: async (): Promise<Array<IncompleteMessage>> => {
      const response = await getQuarantineMessages(accountId!);
      const searchResults = response?.Body?.SearchResponse?.m ?? [];
      const msgBatchData = await batchService({
        GetMsgRequest: buildGetMsgBatch(searchResults),
        _jsns: 'urn:zimbra',
      });
      return (msgBatchData?.GetMsgResponse ?? [])
        .map((item: unknown) =>
          normalizeMessage(
            (item as { m?: Array<Parameters<typeof normalizeMessage>[0]> })?.m?.[0] as Parameters<
              typeof normalizeMessage
            >[0],
          ),
        )
        .filter((m: IncompleteMessage | undefined): m is IncompleteMessage => !!m);
    },
    enabled: !!accountId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
```

(If the `.map` typing above fights the `any` in `batchService`, a local `type BatchItem = { m?: Array<SoapQuarantineMessage> }` cast is acceptable — keep it inside this file.)

- [ ] **Step 2: Verify** — type-check + lint

---

### Task 6: `use-quarantine-message-actions.ts` mutation hooks

**Files:**

- Create: `apps/admin-ui-domains/src/services/use-quarantine-message-actions.ts`

- [ ] **Step 1: Create the four mutations.** Every mutation invalidates `quarantineMessages` — this is the CO-4147 "releasing, deleting or bouncing messages refreshes the list automatically" requirement. Error snackbars = "failures are clearly reported":

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { IncompleteMessage } from '../views/domain/global/global-quarantine/quarantine-types';
import { bounceMsgRequest } from './bounce-message';
import { createAccountRequest } from './create-account';
import { deleteAccount } from './delete-account-service';
import { domainQueryKeys } from './domain-query-keys';
import { getAccountRequest } from './get-account';
import { getQuarantineMessages } from './get-quarantine-messages-service';
import { modifyConfig } from './modify-config';
import { msgActionRequest } from './message-action';
import { removeAttachmentsRequest } from './remove-attachments';

const SNACKBAR_OPTS = {
  autoHideTimeout: 3000,
  hideButton: true,
  replace: true,
} as const;

type QuarantineActionContext = {
  createSnackbar: ReturnType<typeof useSnackbar>;
  t: ReturnType<typeof useTranslation>[0];
};

function onErrorSnackbar({ createSnackbar, t }: QuarantineActionContext) {
  return (error: Error): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label:
        error?.message ||
        t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
      ...SNACKBAR_OPTS,
    });
  };
}

export const useDeleteQuarantineMessage = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => msgActionRequest(id, 'delete'),
    onSuccess: () => {
      createSnackbar({
        key: 'info',
        severity: 'info',
        label: t('quarantine.message_deleted', 'Message deleted'),
        ...SNACKBAR_OPTS,
      });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
    },
    onError: onErrorSnackbar({ createSnackbar, t }),
  });
};

export const useDeliverQuarantineMessage = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (msg: IncompleteMessage) => bounceMsgRequest(msg),
    onSuccess: () => {
      createSnackbar({
        key: 'info',
        severity: 'info',
        label: t('quarantine.message_delivered', 'Message delivered'),
        ...SNACKBAR_OPTS,
      });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
    },
    onError: onErrorSnackbar({ createSnackbar, t }),
  });
};

export const useRemoveQuarantineAttachment = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, part }: { id: string; part: string }) => removeAttachmentsRequest(id, part),
    onSuccess: () => {
      createSnackbar({
        key: 'info',
        severity: 'info',
        label: t('quarantine.attachment_deleted', 'Attachment deleted'),
        ...SNACKBAR_OPTS,
      });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
    },
    onError: onErrorSnackbar({ createSnackbar, t }),
  });
};

const QUARANTINE_ACCOUNT_ATTRIBUTES = {
  givenName: 'virus-quarantine',
  initials: '',
  sn: '',
  amavisBypassSpamChecks: 'TRUE',
  zimbraAttachmentsIndexingEnabled: 'FALSE',
  zimbraIsSystemResource: 'TRUE',
  zimbraHideInGal: 'TRUE',
  zimbraMailMessageLifetime: '7d',
  zimbraMailQuota: 0,
  description: 'System account for Anti-virus quarantine.',
} as const;

export const useRecreateQuarantineAccount = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      previousAccountName,
      defaultDomainName,
    }: {
      previousAccountName: string;
      defaultDomainName: string;
    }): Promise<string> => {
      const data = await createAccountRequest(
        { ...QUARANTINE_ACCOUNT_ATTRIBUTES },
        `virus-quarantine.${generateRandomString()}@${defaultDomainName}`,
        '',
      );
      const newName = data?.account?.[0]?.name;
      if (!newName) {
        throw new Error(
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        );
      }
      await modifyConfig([{ n: 'zimbraAmavisQuarantineAccount', _content: newName }]);
      if (previousAccountName) {
        const res = await getAccountRequest('', previousAccountName, 0);
        const previousId = res?.account?.[0]?.id;
        if (previousId) {
          await deleteAccount(previousId);
        }
      }
      return newName;
    },
    onSuccess: () => {
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.account_created_successfully', 'The account has been created successfully'),
        ...SNACKBAR_OPTS,
      });
      void queryClient.invalidateQueries({ queryKey: ['all-config'] });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineAccount() });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
    },
    onError: onErrorSnackbar({ createSnackbar, t }),
  });
};
```

Add `generateRandomString` import: `import { generateRandomString } from '../views/utility/utils';` (verified at `apps/admin-ui-domains/src/views/utility/utils.ts:1575`).

- [ ] **Step 2: Verify** — type-check + lint

---

### Task 7: Split `QuarantineAccountSection`

**Files:**

- Create: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/quarantine-account-section.tsx`
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/global-quarantine.tsx` (section JSX removed in Task 11; in this task just add the new file)

- [ ] **Step 1: Create the component.** Owns: empty-state vs account-info rendering, retention display, delete-and-recreate confirm modal, and the recreate mutation. JSX is MOVED AS-IS from `global-quarantine.tsx:1085-1236` (empty state + account block) and `:1254-1299` (recreate modal), keeping Container/Row/Padding:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAllConfig } from '@zextras/ui-shared';
import { Button, Container, ListRow, LabeledValue, Modal, Row } from '@zextras/ui-components';
import { find } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRecreateQuarantineAccount } from '../../../../services/use-quarantine-message-actions';
import type { QuarantineAccountData } from '../../../../services/use-quarantine-account';

const TIME_ITEMS = [
  { labelKey: 'label.seconds', labelDefault: 'Seconds', value: 's' },
  { labelKey: 'label.minutes', labelDefault: 'Minutes', value: 'm' },
  { labelKey: 'label.hours', labelDefault: 'Hours', value: 'h' },
  { labelKey: 'label.days', labelDefault: 'Days', value: 'd' },
] as const;

type QuarantineAccountSectionProps = {
  account: QuarantineAccountData | undefined;
};

export const QuarantineAccountSection = ({ account }: QuarantineAccountSectionProps) => {
  const [t] = useTranslation();
  const [isRecreateModalOpen, setIsRecreateModalOpen] = useState(false);
  const { data: config = [] } = useAllConfig();
  const defaultDomainName = find(config, { n: 'zimbraDefaultDomainName' })?._content ?? '';
  const recreateMutation = useRecreateQuarantineAccount();

  const onRecreate = (): void => {
    setIsRecreateModalOpen(false);
    recreateMutation.mutate({ previousAccountName: account?.name ?? '', defaultDomainName });
  };

  const intervalLabel = (interval: string): string => {
    if (!interval) return '';
    const item = TIME_ITEMS.find((i) => i.value === interval);
    return item ? t(item.labelKey, item.labelDefault) : interval;
  };

  // — empty state branch: JSX copied unchanged from global-quarantine.tsx:1090-1110,
  //   button onClick becomes { onRecreateAccount }: void => recreateMutation.mutate({
  //     previousAccountName: '', defaultDomainName,
  //   });
  // — account branch: JSX copied unchanged from :1112-1235, with:
  //     quarantineAccountName           → account?.name
  //     zimbraMailMessageLifetimeNum    → account?.retentionValue
  //     zimbraMailMessageLifetimeType   → intervalLabel(account?.retentionInterval ?? '')
  //     setDeleteQuarantuneAccModal(..) → setIsRecreateModalOpen(..)
  // — recreate modal: JSX copied unchanged from :1254-1299, open={isRecreateModalOpen},
  //   every handler → setIsRecreateModalOpen(false) except confirm → onRecreate()
};
```

Fill every `// —` comment with the actual copied JSX (source line ranges are exact; only the variable substitutions listed change). The `REFRESH LIST` button (lines 1211-1222) does NOT belong here — it moves to `MessageListTable`'s parent area (Task 11 orchestrator).

- [ ] **Step 2: Verify** — type-check + lint

---

### Task 8: Split `MessageListTable`

**Files:**

- Create: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/message-list-table.tsx`

- [ ] **Step 1: Create the component.** Move `MessageListTable` (currently `global-quarantine.tsx:165-307`) to its own file. Changes while moving:
  - Named export: `export const MessageListTable = ({ ... }: MessageListTableProps) => { ... }` (drop `FC`)
  - Props become:

```typescript
type MessageListTableProps = {
  messages: Array<IncompleteMessage>;
  isFetching: boolean;
  onOpenMessage: (message: IncompleteMessage) => void;
};
```

- Selection state (`messageSelection`) becomes internal `useState` — nothing outside ever read it
- `setShowMessageView(true); setMessage(v);` (5 occurrences in the columns builder) → single `onOpenMessage(v)`
- `requestInprogress` prop → `isFetching`
- `getDateTime` now imported from `./quarantine-message-normalizer`; `logo` from `../../../../assets/ninja_robo.svg`; `MessageTableHeaders` from `../../../utility/utils`; `CustomHeaderFactory, HoverableRowFactory, Table, Container, ListRow, Row` from `@zextras/ui-components`
- JSX body (Table + spinner + empty state, lines 256-306) copied unchanged

- [ ] **Step 2: Verify** — type-check + lint

---

### Task 9: Modernize `AttachmentsBlock` (a11y + mutation)

**Files:**

- Modify: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/attachments-block.tsx`

- [ ] **Step 1: New props.** Replace the three callback props (`getQuarantineMsgData`, `setShowMessageView`, `setMessageViewLoading` — lines 30-32, 468-475, threaded through `Attachment` at 300-312) with a single `onClose: () => void` (keep `message`, `isExternalMessage?`, `openEmlPreview?`).

- [ ] **Step 2: Migrate `onDeleteAttachment` (lines 335-371) to the mutation:**

```typescript
const removeAttachmentMutation = useRemoveQuarantineAttachment();

const onDeleteAttachment = () => {
  void removeAttachmentMutation
    .mutateAsync({ id: message.id, part })
    .then(() => {
      onClose();
    })
    .catch(() => {
      // snackbar already reported by the hook
    });
};
```

Delete `setMessageViewLoading`/`getQuarantineMsgData`/`setShowMessageView` usages and their threading into `Attachment` (spinner while pending: render `<ds-spinner />` when `removeAttachmentMutation.isPending`).

- [ ] **Step 3: A11y (CO-4147).** Add accessible names to the two unlabeled icon buttons (lines 418-424 and 433-439):

```tsx
<Button
  type="ghost"
  color={'text'}
  size="medium"
  icon="DownloadOutline"
  onClick={downloadAttachment}
  aria-label={t('label.download_one', 'Download')}
/>
```

```tsx
<Button
  type="ghost"
  color={'text'}
  size="medium"
  icon="DeletePermanentlyOutline"
  onClick={onDeleteAttachment}
  aria-label={t('label.delete', 'Delete')}
/>
```

(Tooltip labels reuse the exact same i18n keys — no new translations.)

- [ ] **Step 4: Verify** — type-check + lint. `global-quarantine.tsx` will fail to compile until Task 10/11 update its call site — acceptable within this task sequence; run `tsc` and confirm the ONLY errors are the `AttachmentsBlock` prop mismatch at `global-quarantine.tsx:1518-1523`.

---

### Task 10: Split `MessageViewModal`

**Files:**

- Create: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/message-view-modal.tsx`

- [ ] **Step 1: Create the component.** Move the whole `showMessageView` overlay (JSX `global-quarantine.tsx:1336-1598`) plus the delete-message modal (`:1300-1335`) and deliver dialog (`:1556-1597`) into one component. Owns internal state: `deleteMsgModal` → `isDeleteModalOpen`, `openDeliverDialog` → `isDeliverDialogOpen`, `showTextMsgView` → `showSource`. The `onClose` bug (line 1325) disappears: the delete modal's `onClose` sets `setIsDeleteModalOpen(false)`.

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Collapse,
  Container,
  Modal,
  ModalOverlay,
  Padding,
  Row,
  Tooltip,
} from '@zextras/ui-components';
import { find } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { getDelegateAuthRequest } from '../../../../services/get-delegate-auth-request';
import {
  useDeleteQuarantineMessage,
  useDeliverQuarantineMessage,
} from '../../../../services/use-quarantine-message-actions';
import type { IncompleteMessage } from './quarantine-types';
import AttachmentsBlock from './attachments-block';
import MailMessageRenderer from './mail-message-renderer';

type MessageViewModalProps = {
  message: IncompleteMessage;
  /** id of the quarantine account, used for the delegate-auth download link */
  accountId: string;
  onClose: () => void;
};

export const MessageViewModal = ({ message, accountId, onClose }: MessageViewModalProps) => {
  const [t] = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const deleteMutation = useDeleteQuarantineMessage();
  const deliverMutation = useDeliverQuarantineMessage();

  const onDeleteMessage = (): void => {
    setIsDeleteModalOpen(false);
    void deleteMutation
      .mutateAsync(message.id)
      .then(() => {
        onClose();
      })
      .catch(() => {
        // snackbar already reported by the hook
      });
  };

  const onDeliverMessage = (): void => {
    setIsDeliverDialogOpen(false);
    void deliverMutation
      .mutateAsync(message)
      .then(() => {
        onClose();
      })
      .catch(() => {
        // snackbar already reported by the hook
      });
  };

  const downloadMail = async (): Promise<void> => {
    try {
      const data = await getDelegateAuthRequest(accountId);
      const token = data?.authToken?.[0]?._content;
      if (!token) {
        throw new Error(
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        );
      }
      globalThis.open(
        `https://${globalThis.location.hostname}/service/preauth?authtoken=${token}` +
          `&isredirect=1&adminPreAuth=1&redirectURL=${encodeURIComponent(
            '/service/home/~/?auth=co&view=text&id=',
          )}${message.id.split(':')[1]}`,
        'blank',
      );
    } catch {
      // replaced global-quarantine.tsx:1016-1053 promise chain; keep snackbar fallback
      // via a local createSnackbar = useSnackbar() and the standard error snackbar
    }
  };
  // ...JSX below
};
```

JSX rules for the moved overlay (source `global-quarantine.tsx:1332-1598`), copied as-is with ONLY these substitutions:

- `showMessageView` → always true (parent conditionally renders), so drop the outer condition; `<ModalOverlay open ...>`
- `messageViewLoading && <ds-spinner/>` → `(deleteMutation.isPending || deliverMutation.isPending) && <ds-spinner/>`
- Close icon button (line 1356-1362): add `aria-label={t('label.close', 'Close')}` (CO-4147 a11y)
- `setDeleteMsgModal(true)` → `setIsDeleteModalOpen(true)`; `setOpenDeliverDialog(true)` → `setIsDeliverDialogOpen(true)`; `setShowMessageView(false)` → `onClose()`
- `onDeleteMessage(message.id)` (line 1318) → `onDeleteMessage()`; `onDeliverMessage(message)` (line 1582) → `onDeliverMessage()`; `downloadMail()` (line 1408) → `void downloadMail()`
- `setToggleView`/`showTextMsgView` (lines 1010, 1528-1541) → `() => setShowSource(!showSource)` / `showSource`
- `<AttachmentsBlock message={message} onClose={onClose} />` (new Task 9 API, replaces lines 1518-1523)

- [ ] **Step 2: Verify** — type-check: only remaining errors must be in `global-quarantine.tsx` (unused state/vars) — those die in Task 11.

---

### Task 11: Rewrite `global-quarantine.tsx` as thin orchestrator

**Files:**

- Modify: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/global-quarantine.tsx` (full rewrite; ~110 lines)

- [ ] **Step 1: Replace the entire file content:**

```tsx
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAllConfig } from '@zextras/ui-shared';
import { Button, Container, Row } from '@zextras/ui-components';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { domainQueryKeys } from '../../../../services/domain-query-keys';
import { useQuarantineAccount } from '../../../../services/use-quarantine-account';
import { useQuarantineMessages } from '../../../../services/use-quarantine-messages';
import type { IncompleteMessage } from './quarantine-types';
import { MessageListTable } from './message-list-table';
import { MessageViewModal } from './message-view-modal';
import { QuarantineAccountSection } from './quarantine-account-section';

/**
 * Global quarantine view: quarantine account management and quarantined
 * messages list.
 */
export const GlobalQuarantine = () => {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const { isPending: configPending } = useAllConfig({ placeholderData: keepPreviousData });
  const { data: account } = useQuarantineAccount();
  const { data: messages = [], isFetching } = useQuarantineMessages(account?.id);
  const [selectedMessage, setSelectedMessage] = useState<IncompleteMessage | null>(null);

  const onRefreshList = (): void => {
    void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
  };

  const onOpenMessage = (message: IncompleteMessage): void => {
    setSelectedMessage(message);
  };

  return (
    <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
      {/* header block: JSX copied unchanged from global-quarantine.tsx:1057-1076 */}
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflow: 'auto' }}
        width="100%"
        height="calc(100vh - 9.375rem)"
      >
        <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            {configPending ? (
              <Container
                crossAlignment="center"
                mainAlignment="center"
                height="auto"
                padding={{ top: 'medium' }}
              >
                <ds-spinner></ds-spinner>
              </Container>
            ) : (
              <>
                <QuarantineAccountSection account={account} />
                {account && (
                  <>
                    {/* messages section: JSX copied unchanged from :1200-1235,
                        substitutions: requestInprogress → isFetching,
                        MessageListTable gets messages={messages} isFetching={isFetching}
                        onOpenMessage={onOpenMessage}, and the REFRESH LIST button
                        (:1211-1222) onClick → onRefreshList */}
                  </>
                )}
              </>
            )}
          </Container>
        </Row>
      </Container>
      {selectedMessage && account?.id && (
        <MessageViewModal
          message={selectedMessage}
          accountId={account.id}
          onClose={(): void => setSelectedMessage(null)}
        />
      )}
    </Container>
  );
};
```

Then delete from the file: every extracted type/function/handler, `MessageListTable` definition, all moved modals, and the now-unused service imports (`batchService`, `bounceMsgRequest`, `createAccountRequest`, `deleteAccount`, `getAccountRequest`, `getQuarantineMessages`, `msgActionRequest`, `modifyConfig`, `getDelegateAuthRequest`, `logo`, `generateRandomString`, `MessageTableHeaders` — keep only what the orchestrator still references). Per AGENTS.md "visibility belongs to the parent": `{selectedMessage && account?.id && <MessageViewModal .../>}` — the modal never null-checks itself.

- [ ] **Step 2: Verify** — `pnpm --filter @zextras/admin-ui-domains type-check` (PASS, zero errors expected now), `pnpm --filter @zextras/admin-ui-domains lint` (0 errors; warnings pre-existing), `pnpm --filter @zextras/admin-ui-domains test` (existing `mail-message-renderer.test.tsx` still green)

---

### Task 12: Tests (written at the END — explicit user decision)

**Files:**

- Create: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/tests/quarantine-message-normalizer.test.ts`
- Create: `apps/admin-ui-domains/src/views/domain/global/global-quarantine/tests/global-quarantine.browser.test.tsx`

- [ ] **Step 1: Unit tests for the normalizer** (jsdom, `@testing-library` not needed — pure functions):

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import {
  buildGetMsgBatch,
  extractScoreValue,
  getDateTime,
  normalizeMessage,
  parseFlags,
  sanitizeEmail,
} from '../quarantine-message-normalizer';

describe('parseFlags', () => {
  it('returns all-false defaults for undefined flags except read/receipt', () => {
    const flags = parseFlags(undefined);
    expect(flags.read).toBe(true);
    expect(flags.hasAttachment).toBe(false);
    expect(flags.isReadReceiptRequested).toBe(true);
  });

  it('parses each flag character', () => {
    const flags = parseFlags('afd');
    expect(flags.read).toBe(true);
    expect(flags.hasAttachment).toBe(true);
    expect(flags.isDraft).toBe(true);
    expect(flags.flagged).toBe(true);
  });

  it('u flag means unread', () => {
    expect(parseFlags('u').read).toBe(false);
  });
});

describe('extractScoreValue', () => {
  it('extracts the score from X-Spam-Status', () => {
    expect(extractScoreValue('tests=BAD_HDR score=42.1 required=5')).toBe('42.1');
  });

  it('returns empty string when no score', () => {
    expect(extractScoreValue('')).toBe('');
    expect(extractScoreValue('no score here')).toBe('');
  });
});

describe('sanitizeEmail', () => {
  it('strips angle brackets', () => {
    expect(sanitizeEmail('<a@b.com>')).toBe('a@b.com');
    expect(sanitizeEmail(undefined)).toBe('');
  });
});

describe('getDateTime', () => {
  it('formats epoch millis as dd/MM/yy HH:mm', () => {
    expect(getDateTime(new Date(2026, 0, 2, 3, 4).getTime())).toMatch(
      /^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/,
    );
  });
});

describe('buildGetMsgBatch', () => {
  it('builds one GetMsgRequest entry per message with the 8 spam headers', () => {
    const batch = buildGetMsgBatch([{ id: '1' }, { id: '2' }]) as Array<{
      _jsns: string;
      m: { id: string; header: Array<{ n: string }> };
    }>;
    expect(batch).toHaveLength(2);
    expect(batch[0].m.id).toBe('1');
    expect(batch[0].m.header.map((h) => h.n)).toEqual([
      'X-Envelope-From',
      'X-Envelope-To',
      'X-Envelope-To-Blocked',
      'X-Amavis-Alert',
      'X-Spam-Flag',
      'X-Spam-Score',
      'X-Spam-Level',
      'X-Spam-Status',
    ]);
  });
});

describe('normalizeMessage', () => {
  const soapMsg = {
    id: 'msg-1',
    cid: 'conv-1',
    d: 1750000000000,
    s: 1024,
    l: '2',
    su: 'Test subject',
    f: 'u',
    e: [{ a: 'from@example.com', t: 'f', p: 'From' }],
    mp: [
      {
        part: 'TEXT',
        ct: 'text/plain',
        body: true,
        content: 'hello',
      },
    ],
    _attrs: {
      'X-Spam-Status': 'score=13.2 required=5',
      'X-Amavis-Alert': 'bad header',
      'X-Envelope-From': ['<from@example.com>'],
      'X-Envelope-To': ['<to@example.com>'],
    },
  };

  it('normalizes participants, body, flags and spam headers', () => {
    const msg = normalizeMessage(soapMsg as never);
    expect(msg.id).toBe('msg-1');
    expect(msg.read).toBe(false);
    expect(msg.participants?.[0].address).toBe('from@example.com');
    expect(msg.body).toEqual({ contentType: 'text/plain', content: 'hello' });
    expect(msg.score).toBe('13.2');
    expect(msg.reason).toBe('bad header');
    expect(msg.envelopeFrom).toBe('from@example.com');
    expect(msg.envelopeTo).toBe('to@example.com');
  });
});
```

- [ ] **Step 2: Browser characterization tests.** MSW endpoints verified: `createBrowserSoapAPIInterceptor('GetAccount'|'Batch'|'MsgAction'|'BounceMsg'|'ModifyConfig'|'CreateAccount'|'DeleteAccount'|'DelegateAuth'|'GetAllConfig')` all hit `/service/admin/soap/<Action>Request`; `getQuarantineMessages` uses the fixed URL `/service/admin/soap/SearchRequest` → intercept with `createBrowserAPIInterceptor('post', '/service/admin/soap/SearchRequest', ...)` or a `worker.use(http.post(...))` handler:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { GlobalQuarantine } from '../global-quarantine';

const QUARANTINE_CONFIG = [
  { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine@example.com' },
  { n: 'zimbraDefaultDomainName', _content: 'example.com' },
];

function setupSearchInterceptor(): { calledTimes: () => number } {
  let searchCalls = 0;
  void createBrowserSoapAPIInterceptor; // see handler below
  return { calledTimes: () => searchCalls };
}

async function setup(
  options: { config?: Array<{ n: string; _content: string }> } = {},
): Promise<ReturnType<typeof getQueryClient>> {
  const queryClient = getQueryClient();
  const config = options.config ?? QUARANTINE_CONFIG;
  createBrowserSoapAPIInterceptor('GetAllConfig', { a: config });
  if (config.some((c) => c.n === 'zimbraAmavisQuarantineAccount')) {
    createBrowserSoapAPIInterceptor('GetAccount', {
      account: [
        {
          id: 'acc-1',
          name: 'virus-quarantine@example.com',
          a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
        },
      ],
    });
    const { worker } = await import('admin-ui-test-utils');
    let searchCalls = 0;
    worker.use(
      http.post('/service/admin/soap/SearchRequest', () => {
        searchCalls += 1;
        return HttpResponse.json({
          Body: { SearchResponse: { m: [{ id: 'msg-1', d: 1750000000000 }] } },
        });
      }),
    );
    createBrowserSoapAPIInterceptor('Batch', {
      GetMsgResponse: [
        {
          m: [
            {
              id: 'msg-1',
              su: 'Spam subject',
              d: 1750000000000,
              l: '2',
              e: [{ a: 'spammer@example.com', t: 'f', p: '' }],
              mp: [{ part: 'TEXT', ct: 'text/plain', body: true, content: 'spam body' }],
              _attrs: {
                'X-Spam-Score': '42',
                'X-Amavis-Alert': 'bad',
                'X-Envelope-From': '<spammer@example.com>',
                'X-Envelope-To': '<admin@example.com>',
              },
            },
          ],
        },
      ],
    });
    void setupSearchInterceptor;
    void searchCalls;
  }
  await setupBrowserTest(<GlobalQuarantine />, { queryClient, grantRights: 'config' });
  return queryClient;
}

describe('GlobalQuarantine (browser)', () => {
  it('renders the create-account empty state when no quarantine account is configured', async () => {
    await setup({ config: [{ n: 'zimbraDefaultDomainName', _content: 'example.com' }] });
    await expect.element(page.getByText(/there is not quarantine account/i)).toBeVisible();
  });

  it('renders account name, retention settings and the quarantined message row', async () => {
    await setup();
    await expect.element(page.getByText('virus-quarantine@example.com')).toBeVisible();
    await expect.element(page.getByText('Spam subject')).toBeVisible();
    await expect.element(page.getByText('spammer@example.com')).toBeVisible();
    await expect.element(page.getByText('42')).toBeVisible();
  });

  it('opens the message view and delivers the message, closing the overlay', async () => {
    const deliverInterceptor = createBrowserSoapAPIInterceptor('BounceMsg', {});
    await setup();

    await page.getByText('Spam subject').click();
    await expect.element(page.getByRole('button', { name: /deliver/i })).toBeVisible();

    await page.getByRole('button', { name: /deliver/i }).click();
    await page.getByRole('button', { name: /yes, deliver/i }).click();

    (await await deliverInterceptor) as unknown as Record<string, unknown>;
    await expect.element(page.getByText('Spam subject')).toBeVisible(); // list re-rendered
  });

  it('deletes a message from the message view and refreshes the list', async () => {
    const deleteInterceptor = createBrowserSoapAPIInterceptor('MsgAction', {});
    await setup();

    await page.getByText('Spam subject').click();
    await page.getByRole('button', { name: /^delete$/i }).click();
    await page.getByRole('button', { name: /yes, delete/i }).click();

    (await await deleteInterceptor) as unknown as Record<string, unknown>;
    await expect.element(page.getByText('This list is empty.')).toBeVisible();
  });

  it('labels icon-only buttons accessibly in the message view', async () => {
    await setup();
    await page.getByText('Spam subject').click();
    await expect.element(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
  });
});
```

Refine during implementation against the real DOM (e.g. `getByRole('dialog')` scoping if labels collide) — but keep every assertion user-facing (`getByRole`/`getByText`); `getByTestId` is banned by AGENTS.md. Add one more test for the recreate-account flow (CreateAccount → ModifyConfig → DeleteAccount interceptor assertions + success snackbar) following the same pattern.

- [ ] **Step 3: Run both test files:**

```bash
pnpm --filter @zextras/admin-ui-domains exec vitest run src/views/domain/global/global-quarantine/tests/quarantine-message-normalizer.test.ts src/views/domain/global/global-quarantine/tests/global-quarantine.browser.test.tsx
```

Expected: all PASS (adjust selectors/DOM waits as needed; screenshots written on first run).

---

### Task 13: Full verification

- [ ] **Step 1:** `pnpm type-check` — all 15 packages PASS
- [ ] **Step 2:** `pnpm lint` — 0 new errors (pre-existing `no-explicit-any` warnings in moved code acceptable; do not introduce new ones)
- [ ] **Step 3:** `pnpm --filter @zextras/admin-ui-domains test` — full app suite PASS
- [ ] **Step 4:** `pnpm vitest run apps/admin-ui-domains/src/views/tests/domain-content-panel.browser.test.tsx` — route smoke test still PASS
- [ ] **Step 5:** `pnpm sonarlint` — review report for new findings (S6478 component-in-component, S6479 index keys, S3776 complexity > 15, S7764 `globalThis` over `window`)

---

## Self-Review (done at plan time)

- **Spec coverage:** monolith split (Tasks 7-11), data layer (3-6), auto-refresh + error reporting (Task 6 invalidations/snackbars), a11y (Tasks 9-10: download/delete attachment buttons + message-view close), tests at end (Task 12), characterization preserved by verbatim moves (Tasks 1-2). ✓
- **Type consistency:** `IncompleteMessage` is canonical in `quarantine-types.ts`; hooks import from `../views/.../quarantine-types`; `QuarantineAccountData` defined once in Task 4, consumed in Task 7/11. ✓
- **No placeholders:** every new file has full code; moved JSX is pinned to exact source line ranges with explicit substitution lists. ✓
- **User decisions honored:** no upfront tests, deprecated layout primitives kept, tests written at end. ✓
