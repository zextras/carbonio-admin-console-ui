/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useUserSettings } from '@zextras/ui-shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import MailMessageRenderer from '../mail-message-renderer';

vi.mock('@zextras/ui-shared', async () => {
  const actual = await vi.importActual<typeof import('@zextras/ui-shared')>('@zextras/ui-shared');
  return {
    ...actual,
    useUserSettings: vi.fn(),
  };
});

const mockUseUserSettings = vi.mocked(useUserSettings);

type MailMessage = Parameters<typeof MailMessageRenderer>[0]['mailMsg'];

function createMailMessage(overrides: Partial<MailMessage> = {}): MailMessage {
  return {
    id: 'msg-1',
    did: 'domain-1',
    parent: 'parent-1',
    conversation: 'conv-1',
    read: true,
    size: 1024,
    hasAttachment: false,
    flagged: false,
    urgent: false,
    isDeleted: false,
    isSentByMe: false,
    isForwarded: false,
    isInvite: false,
    isDraft: false,
    isScheduled: false,
    date: Date.now(),
    subject: 'Test Subject',
    tags: [],
    parts: [],
    body: {
      contentType: 'text/plain',
      content: 'Hello world',
    },
    isComplete: true,
    isReplied: false,
    ...overrides,
  } as MailMessage;
}

const HTML_WITH_EXTERNAL_IMAGES = `<html><body><img dfsrc="https://evil.com/track.gif" /></body></html>`;
const HTML_WITHOUT_EXTERNAL_IMAGES = `<html><body><p>Hello</p></body></html>`;
const PLAIN_TEXT = 'Hello world';

beforeEach(() => {
  mockUseUserSettings.mockReturnValue({
    prefs: { zimbraPrefMailTrustedSenderList: '' },
  } as never);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('MailMessageRenderer', () => {
  describe('EmptyBody rendering', () => {
    it('renders EmptyBody when body content is empty string', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/plain', content: '' },
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/This message has no text content/)).toBeTruthy();
    });

    it('renders EmptyBody when body is undefined', () => {
      const msg = createMailMessage({ body: undefined } as never);
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/This message has no text content/)).toBeTruthy();
    });

    it('renders EmptyBody when body content is null', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/plain', content: null as never },
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/This message has no text content/)).toBeTruthy();
    });

    it('renders EmptyBody for unknown content type even if content exists', () => {
      const msg = createMailMessage({
        body: { contentType: 'application/json', content: '{"key": "value"}' },
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/This message has no text content/)).toBeTruthy();
    });
  });

  describe('TextMessageRenderer', () => {
    it('renders plain text content', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/plain', content: PLAIN_TEXT },
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(PLAIN_TEXT)).toBeTruthy();
    });

    it('escapes HTML characters in plain text', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/plain', content: '<script>alert("xss")</script>' },
      });
      const { container } = render(<MailMessageRenderer mailMsg={msg} />);
      const dsText = container.querySelector('ds-text');
      expect(dsText?.getAttribute('dangerouslySetInnerHTML')).toBeNull();
      expect(container.innerHTML).toContain('&lt;script&gt;');
    });

    it('converts line breaks to br tags', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/plain', content: 'line1\nline2\rline3\r\nline4' },
      });
      const { container } = render(<MailMessageRenderer mailMsg={msg} />);
      expect(container.innerHTML).toContain('<br');
    });

    it('converts URLs to anchor tags in plain text', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/plain', content: 'Visit https://example.com for info' },
      });
      const { container } = render(<MailMessageRenderer mailMsg={msg} />);
      expect(container.innerHTML).toContain('<a ');
      expect(container.innerHTML).toContain('href="https://example.com"');
      expect(container.innerHTML).toContain('target="_blank"');
    });

    it('handles www. URLs by prepending http://', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/plain', content: 'Visit www.example.com' },
      });
      const { container } = render(<MailMessageRenderer mailMsg={msg} />);
      expect(container.innerHTML).toContain('http://www.example.com');
    });

    it('handles empty plain text content', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/plain', content: '' },
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/This message has no text content/)).toBeTruthy();
    });
  });

  describe('HtmlMessageRenderer', () => {
    it('renders an iframe for HTML content', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITHOUT_EXTERNAL_IMAGES },
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      const iframe = screen.getByTestId('message-renderer-iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.getAttribute('title')).toBe('msg-1');
    });

    it('does not show external image banner when no external images', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITHOUT_EXTERNAL_IMAGES },
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.queryByText(/External images have been blocked/)).toBeNull();
    });

    it('shows banner when participants is undefined because from is not in trust list', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITH_EXTERNAL_IMAGES },
        participants: undefined,
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/External images have been blocked/)).toBeTruthy();
    });

    it('shows external image banner when HTML has external images and sender not trusted', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITH_EXTERNAL_IMAGES },
        participants: [{ type: 'f', address: 'sender@evil.com' }],
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/External images have been blocked/)).toBeTruthy();
    });

    it('does not show banner when sender address is in trusted list', () => {
      mockUseUserSettings.mockReturnValue({
        prefs: { zimbraPrefMailTrustedSenderList: 'sender@trusted.com' },
      } as never);
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITH_EXTERNAL_IMAGES },
        participants: [{ type: 'f', address: 'sender@trusted.com' }],
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.queryByText(/External images have been blocked/)).toBeNull();
    });

    it('does not show banner when sender domain is in trusted list', () => {
      mockUseUserSettings.mockReturnValue({
        prefs: { zimbraPrefMailTrustedSenderList: 'trusted.com' },
      } as never);
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITH_EXTERNAL_IMAGES },
        participants: [{ type: 'f', address: 'sender@trusted.com' }],
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.queryByText(/External images have been blocked/)).toBeNull();
    });

    it('shows banner when trusted list does not include sender', () => {
      mockUseUserSettings.mockReturnValue({
        prefs: { zimbraPrefMailTrustedSenderList: 'other.com' },
      } as never);
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITH_EXTERNAL_IMAGES },
        participants: [{ type: 'f', address: 'sender@evil.com' }],
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/External images have been blocked/)).toBeTruthy();
    });

    it('shows banner when trusted list is an array that does not include sender', () => {
      mockUseUserSettings.mockReturnValue({
        prefs: { zimbraPrefMailTrustedSenderList: ['other.com'] as never },
      } as never);
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITH_EXTERNAL_IMAGES },
        participants: [{ type: 'f', address: 'sender@evil.com' }],
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/External images have been blocked/)).toBeTruthy();
    });

    it('does not show banner when trusted list is an array that includes sender domain', () => {
      mockUseUserSettings.mockReturnValue({
        prefs: { zimbraPrefMailTrustedSenderList: ['evil.com'] as never },
      } as never);
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITH_EXTERNAL_IMAGES },
        participants: [{ type: 'f', address: 'sender@evil.com' }],
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.queryByText(/External images have been blocked/)).toBeNull();
    });
  });

  describe('findAttachments (via props)', () => {
    it('renders HtmlMessageRenderer when parts contain attachments', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITHOUT_EXTERNAL_IMAGES },
        parts: [
          {
            contentType: 'image/png',
            size: 500,
            name: 'image.png',
            disposition: 'attachment',
            filename: 'image.png',
          },
        ],
      });
      const { container } = render(<MailMessageRenderer mailMsg={msg} />);
      expect(container.querySelector('iframe[data-testid="message-renderer-iframe"]')).toBeTruthy();
    });

    it('renders with nested parts', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITHOUT_EXTERNAL_IMAGES },
        parts: [
          {
            contentType: 'multipart/mixed',
            size: 1000,
            name: 'multipart',
            parts: [
              {
                contentType: 'application/pdf',
                size: 500,
                name: 'doc.pdf',
                disposition: 'attachment',
                filename: 'doc.pdf',
              },
            ],
          },
        ],
      });
      const { container } = render(<MailMessageRenderer mailMsg={msg} />);
      expect(container.querySelector('iframe[data-testid="message-renderer-iframe"]')).toBeTruthy();
    });
  });

  describe('fragment handling', () => {
    it('does not render EmptyBody when fragment is present even with empty body content', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/plain', content: '' },
        fragment: 'some fragment',
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.queryByText(/This message has no text content/)).toBeNull();
    });
  });

  describe('banner interactions', () => {
    it('hides the banner and shows images when Show Images is clicked', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITH_EXTERNAL_IMAGES },
        participants: [{ type: 'f', address: 'sender@evil.com' }],
      });
      render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/External images have been blocked/)).toBeTruthy();

      fireEvent.click(screen.getByRole('button', { name: /show images/i }));

      expect(screen.queryByText(/External images have been blocked/)).toBeNull();
    });

    it('hides the banner when the close icon is clicked', () => {
      const msg = createMailMessage({
        body: { contentType: 'text/html', content: HTML_WITH_EXTERNAL_IMAGES },
        participants: [{ type: 'f', address: 'sender@evil.com' }],
      });
      const { container } = render(<MailMessageRenderer mailMsg={msg} />);
      expect(screen.getByText(/External images have been blocked/)).toBeTruthy();

      const closeButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
        (button) => button.textContent === '' && button.querySelector('ds-icon'),
      );
      expect(closeButton).toBeTruthy();
      fireEvent.click(closeButton as HTMLButtonElement);

      expect(screen.queryByText(/External images have been blocked/)).toBeNull();
    });
  });
});
