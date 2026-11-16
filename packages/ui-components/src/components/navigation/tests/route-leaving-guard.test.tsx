/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  useNavigate,
} from 'react-router';

import { RouteLeavingGuard } from '../route-leaving-guard';

function NavButton(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/b')}>
      go-b
    </button>
  );
}

function guard(when: boolean): React.JSX.Element {
  return (
    <RouteLeavingGuard when={when} onSave={vi.fn()}>
      <div>guard-body</div>
    </RouteLeavingGuard>
  );
}

function discard(): void {
  const buttons = within(screen.getByTestId('modal'))
    .getAllByRole('button')
    .filter((b) => !b.className.includes('focusSentinel'));
  const closeButton = buttons.find((b) => b.querySelector('[class*="icon"]')) ?? buttons[0];
  fireEvent.click(closeButton);
}

describe('RouteLeavingGuard under a plain router (production shell shape)', () => {
  function renderUnderPlainRouter(when: boolean): void {
    render(
      <MemoryRouter initialEntries={['/a']}>
        {guard(when)}
        <NavButton />
        <Routes>
          <Route path="/a" element={<div>page-a</div>} />
          <Route path="/b" element={<div>page-b</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('does not throw under a non-data router', () => {
    renderUnderPlainRouter(true);
    expect(screen.getByText('page-a')).toBeTruthy();
  });

  it('reverts the navigation and shows the modal while dirty', () => {
    renderUnderPlainRouter(true);
    fireEvent.click(screen.getByRole('button', { name: 'go-b' }));
    expect(screen.getByText('page-a')).toBeTruthy();
    expect(screen.getByText('guard-body')).toBeTruthy();
  });

  it('navigates away when the user discards the changes', () => {
    renderUnderPlainRouter(true);
    fireEvent.click(screen.getByRole('button', { name: 'go-b' }));
    discard();
    expect(screen.getByText('page-b')).toBeTruthy();
  });

  it('does not block when when is false', () => {
    renderUnderPlainRouter(false);
    fireEvent.click(screen.getByRole('button', { name: 'go-b' }));
    expect(screen.getByText('page-b')).toBeTruthy();
  });
});

describe('RouteLeavingGuard under a data router (test harness shape)', () => {
  function renderUnderDataRouter(when: boolean): void {
    const router = createMemoryRouter(
      [
        {
          path: '/a',
          element: (
            <>
              {guard(when)}
              <NavButton />
            </>
          ),
        },
        { path: '/b', element: <div>page-b</div> },
      ],
      { initialEntries: ['/a'] },
    );
    render(<RouterProvider router={router} />);
  }

  it('blocks the navigation and shows the modal while dirty', () => {
    renderUnderDataRouter(true);
    fireEvent.click(screen.getByRole('button', { name: 'go-b' }));
    expect(screen.getByText('guard-body')).toBeTruthy();
  });

  it('navigates away when the user discards the changes', () => {
    renderUnderDataRouter(true);
    fireEvent.click(screen.getByRole('button', { name: 'go-b' }));
    discard();
    expect(screen.getByText('page-b')).toBeTruthy();
  });

  it('does not block when when is false', () => {
    renderUnderDataRouter(false);
    fireEvent.click(screen.getByRole('button', { name: 'go-b' }));
    expect(screen.getByText('page-b')).toBeTruthy();
  });
});
