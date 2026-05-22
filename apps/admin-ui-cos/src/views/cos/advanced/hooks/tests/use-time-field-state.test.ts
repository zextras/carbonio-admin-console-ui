/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import { type ChangeEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useTimeFieldState } from '../use-time-field-state';

function createNumEvent(value: string): ChangeEvent<HTMLInputElement> {
  return { target: { value } } as ChangeEvent<HTMLInputElement>;
}

describe('useTimeFieldState', () => {
  describe('initial state', () => {
    it('should return undefined num and type', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      expect(result.current.num).toBeUndefined();
      expect(result.current.type).toBeUndefined();
    });
  });

  describe('onNumChange', () => {
    it('should set num and call onChange with combined value', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.onTypeChange('m');
      });

      onChange.mockClear();

      act(() => {
        result.current.onNumChange(createNumEvent('5'));
      });

      expect(result.current.num).toBe('5');
      expect(onChange).toHaveBeenCalledWith('5m');
    });

    it('should call onChange with empty string when num is empty', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.onTypeChange('m');
      });

      onChange.mockClear();

      act(() => {
        result.current.onNumChange(createNumEvent(''));
      });

      expect(result.current.num).toBe('');
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should append empty string for type when type is undefined', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.onNumChange(createNumEvent('5'));
      });

      expect(onChange).toHaveBeenCalledWith('5');
    });
  });

  describe('onTypeChange', () => {
    it('should set type and call onChange with combined value', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.onNumChange(createNumEvent('5'));
      });

      onChange.mockClear();

      act(() => {
        result.current.onTypeChange('m');
      });

      expect(result.current.type).toBe('m');
      expect(onChange).toHaveBeenCalledWith('5m');
    });

    it('should call onChange with empty string when num is empty', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.onTypeChange('m');
      });

      expect(result.current.type).toBe('m');
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should not update state or call onChange when value is null', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.onTypeChange('m');
      });

      expect(result.current.type).toBe('m');
      onChange.mockClear();

      act(() => {
        result.current.onTypeChange(null);
      });

      expect(result.current.type).toBe('m');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('combined flow', () => {
    it('should produce correct combined value when setting type then num', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.onTypeChange('h');
      });

      expect(onChange).toHaveBeenCalledWith('');

      onChange.mockClear();

      act(() => {
        result.current.onNumChange(createNumEvent('3'));
      });

      expect(onChange).toHaveBeenCalledWith('3h');
      expect(result.current.num).toBe('3');
      expect(result.current.type).toBe('h');
    });

    it('should produce correct combined value when setting num then type', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.onNumChange(createNumEvent('10'));
      });

      expect(onChange).toHaveBeenCalledWith('10');

      onChange.mockClear();

      act(() => {
        result.current.onTypeChange('d');
      });

      expect(onChange).toHaveBeenCalledWith('10d');
      expect(result.current.num).toBe('10');
      expect(result.current.type).toBe('d');
    });
  });

  describe('reset', () => {
    it('should parse value into num and type', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.reset('5m');
      });

      expect(result.current.num).toBe('5');
      expect(result.current.type).toBe('m');
    });

    it('should set num and type to empty when value is undefined', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.onNumChange(createNumEvent('5'));
        result.current.onTypeChange('m');
      });

      act(() => {
        result.current.reset(undefined);
      });

      expect(result.current.num).toBeUndefined();
      expect(result.current.type).toBe('');
    });

    it('should use defaultType when value has no suffix', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.reset(undefined, 'm');
      });

      expect(result.current.num).toBeUndefined();
      expect(result.current.type).toBe('m');
    });

    it('should use suffix from value over defaultType', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.reset('7d', 'm');
      });

      expect(result.current.num).toBe('7');
      expect(result.current.type).toBe('d');
    });

    it('should use defaultType when value is empty string', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTimeFieldState(onChange));

      act(() => {
        result.current.reset('', 'h');
      });

      expect(result.current.num).toBe('');
      expect(result.current.type).toBe('h');
    });
  });
});
