import styled from 'styled-components'

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;

  line {
    filter: drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.5));
  }
`

export const Styled = {
  Container,
}
