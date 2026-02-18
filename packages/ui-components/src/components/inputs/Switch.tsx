/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useRef } from 'react';
import styled, { css, SimpleInterpolation } from 'styled-components';

import { useCheckbox } from '../../hooks/useCheckbox';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { AnyColor, PaletteColor } from '../../types/utils';
import { Text } from '../basic/text/Text';
import { Container, ContainerProps } from '../layout/Container';
import { Padding } from '../layout/Padding';

type SwitchSize = 'medium' | 'small';

const IconWrapper = styled.div<{
  $disabled: boolean;
  $iconColor: AnyColor;
}>`
  position: relative;
  display: flex;
  align-items: center;
  ${({ theme, $disabled, $iconColor }): SimpleInterpolation =>
    !$disabled &&
    css`
      &:focus {
        outline: none;
        > icon-wc {
          color: ${theme.palette[$iconColor as keyof typeof theme.palette].focus};
        }
      }
      &:hover {
        outline: none;
        > icon-wc {
          color: ${theme.palette[$iconColor as keyof typeof theme.palette].hover};
        }
      }
      &:active {
        outline: none;
        > icon-wc {
          color: ${theme.palette[$iconColor as keyof typeof theme.palette].active};
        }
      }
    `};
`;

const CustomText = styled(Text)`
  user-select: none;
  line-height: 1.5;
`;

type SwitchProps = Omit<ContainerProps, 'onChange' | 'onClick'> & {
  /** status of the Switch */
  defaultChecked?: boolean;
  /** Switch value */
  value?: boolean;
  /** Switch text */
  label?: string;
  /** Switch padding */
  padding?: ContainerProps['padding'];
  /** whether to disable the Switch or not */
  disabled?: boolean;
  /** click callback */
  onClick?: (event: Event) => void;
  /** change callback */
  onChange?: (checked: boolean) => void;
  /** available sizes */
  size?: SwitchSize;
  /** icon color */
  iconColor?: PaletteColor;
  ref?: React.Ref<HTMLDivElement>;
};

const Switch = ({
  defaultChecked = false,
  value,
  label,
  padding,
  disabled = false,
  onClick,
  onChange,
  size = 'medium',
  iconColor = 'gray0',
  ref,
  ...rest
}: SwitchProps) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const ckbRef = useCombinedRefs<HTMLDivElement>(ref, innerRef);
  const checked = useCheckbox({
    ref: ckbRef,
    defaultChecked,
    value,
    disabled,
    onClick,
    onChange,
  });

  return (
    <Container
      ref={ckbRef}
      orientation="horizontal"
      width="fit"
      height="fit"
      padding={padding}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
      crossAlignment="center"
      {...rest}
    >
      <IconWrapper $disabled={disabled} tabIndex={disabled ? -1 : 0} $iconColor={String(iconColor)}>
        <icon-wc
          icon={checked ? 'ToggleRight' : 'ToggleLeftOutline'}
          size={size === 'medium' ? 'large' : 'medium'}
          color={String(iconColor)}
          disabled={disabled || undefined}
        />
      </IconWrapper>
      {label && (
        <Padding left="small">
          <CustomText
            size={size === 'medium' ? 'medium' : 'small'}
            weight="regular"
            overflow="break-word"
            color="gray0"
            disabled={disabled}
          >
            {label}
          </CustomText>
        </Padding>
      )}
    </Container>
  );
};

export { Switch };
export type { SwitchProps };
