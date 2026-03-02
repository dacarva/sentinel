/**
 * ProveButton Component
 *
 * Button for initiating proof generation
 */

import type { DomJson } from '@tlsn/plugin-sdk';
import {
  inlineStyle,
  width,
  padding,
  background,
  color,
  border,
  borderRadius,
  fontSize,
  fontWeight,
  cursor,
  transition,
  opacity,
} from '@tlsn/plugin-sdk/styles';

export interface ProveButtonProps {
  onClick: string;
  isPending: boolean;
}

export function ProveButton({ onClick, isPending }: ProveButtonProps): DomJson {
  return button(
    {
      style: inlineStyle(
        width('100%'),
        padding('sm'),
        background('linear-gradient(135deg, #FDD835 0%, #F9A825 100%)'),
        color('white'),
        border('none'),
        borderRadius('sm'),
        fontSize('md'),
        fontWeight('semibold'),
        cursor('pointer'),
        transition(),
        isPending && opacity('0.6'),
        isPending && cursor('not-allowed')
      ),
      onclick: onClick,
    },
    [isPending ? 'Generating Proof...' : 'Prove']
  );
}
