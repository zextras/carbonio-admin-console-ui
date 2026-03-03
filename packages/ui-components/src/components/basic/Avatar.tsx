/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HTMLAttributes, useMemo } from 'react';

import { resolveThemeColor } from '../../theme/theme-utils';
import styles from './Avatar.module.css';

type ShapeType = 'round' | 'square';

type AvatarSize = 'small' | 'medium' | 'large' | 'extralarge';

type AvatarPropTypes = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
  /** size of the Avatar circle */
  size?: AvatarSize;
  /** url to the profile picture */
  picture?: string;
  /** string to be used as capitals, or for its calculation */
  label: string;
  /** string to be used for the background color calculation */
  colorLabel?: string;
  /** used to force a background color */
  background?: string;
  /** used to force a color for the avatar text/icon color */
  color?: string;
  /** avatar selection mode */
  selecting?: boolean;
  /** avatar selected */
  selected?: boolean;
  /** Shape of the avatar */
  shape?: ShapeType;
  /** disabled status */
  disabled?: boolean;
};

function getAvatarColorVar(colorKey: string): string {
  const num = colorKey.replace('avatar_', '');
  return `var(--color-avatar-${num})`;
}

const SPECIAL_CHARS_REGEX = /[&/\\#,+()$~%.'":*?!<>{}@^_`=]/g;
const WHITESPACE_REGEX = / /g;
const WHITESPACE_REGEX_2 = / /;

function calcCapitals(label: string): string | null {
  const noSpecString = label.replace(SPECIAL_CHARS_REGEX, '');
  if (noSpecString.replace(WHITESPACE_REGEX, '').length !== 0) {
    label = noSpecString;
  } else {
    return null;
  }

  if (label.length <= 2) {
    return label;
  }
  if (WHITESPACE_REGEX_2.test(label)) {
    let words = label.split(' ');
    words = words.filter((word) => word !== '');

    if (words.length < 2) {
      return words[0][0] + words[0][words[0].length - 1];
    }

    return words[0][0] + words[words.length - 1][0];
  }
  return label[0] + label[label.length - 1];
}

function calcColor(label: string): string {
  let sum = 0;
  for (let i = 0; i < label.length; i += 1) {
    sum += label.charCodeAt(i);
  }
  return `avatar_${(sum % 50) + 1}`;
}

const Avatar = ({
  size = 'medium',
  label,
  color,
  colorLabel,
  picture,
  background,
  selecting,
  selected,
  shape = 'round',
  disabled,
  ...rest
}: AvatarPropTypes) => {
  const calculatedColor = useMemo(() => calcColor(colorLabel ?? label), [colorLabel, label]);

  const capitals = useMemo(() => calcCapitals(label.toUpperCase()), [label]);

  const containerStyle = useMemo(
    () =>
      ({
        '--avatar-diameter': `var(--avatar-${size}-diameter)`,
        '--avatar-bg':
          (selecting && resolveThemeColor(selected ? 'primary' : 'gray6', 'regular')) ||
          (background && resolveThemeColor(background, disabled ? 'disabled' : 'regular')) ||
          getAvatarColorVar(calculatedColor),
        '--avatar-picture': picture && !selecting ? `url(${picture})` : 'none',
        '--avatar-radius': shape === 'round' ? '50%' : '15%',
        '--avatar-border': selecting
          ? `0.125rem solid ${resolveThemeColor('primary', 'regular')}`
          : 'none',
      } as React.CSSProperties),
    [size, selecting, selected, background, disabled, calculatedColor, picture, shape],
  );

  const capitalsStyle = useMemo(
    () =>
      ({
        '--avatar-font': `var(--avatar-${size}-font)`,
        '--capitals-color': resolveThemeColor(color ?? 'gray6', 'regular'),
      } as React.CSSProperties),
    [size, color],
  );

  const symbol = useMemo(() => {
    if (selecting) {
      if (selected) {
        return (
          <icon-wc
            size={size === 'extralarge' ? 'large' : size}
            icon="Checkmark"
            color="gray6"
            disabled={disabled}
          ></icon-wc>
        );
      }
      return null;
    }

    return (
      <p className={styles.capitals} style={capitalsStyle}>
        {capitals}
      </p>
    );
  }, [selecting, capitals, size, selected, color, disabled, capitalsStyle]);

  return (
    <div className={styles.avatarContainer} style={containerStyle} data-testid={'avatar'} {...rest}>
      {(!picture || selecting) && symbol}
    </div>
  );
};

export type { AvatarPropTypes };
export { Avatar };
