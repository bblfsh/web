import styled, { css } from 'styled-components';
import { shadow, font, background } from '../styling/variables';

export const CssButton = css`
  padding: 0.5em 0.5em;
  border: 1px solid ${background.lightGrey};
  border-radius: 3px;
  cursor: pointer;
  background: ${background.lightGrey};
  color: ${font.color.dark};
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  transition: box-shadow 300ms ease-in-out;

  &[disabled] {
    opacity: 0.6;
    pointer-events: none;
  }

  &:hover {
    box-shadow: 0 5px 15px ${shadow.dark};
  }
`;

const Button = styled.button`
  ${CssButton} border: none;

  & + & {
    margin-left: 0.7rem;
  }
`;

export default Button;
