import { Global } from '@emotion/react'

// This is Chakra recommended way of doing this https://chakra-ui.com/community/recipes/using-fonts#option-2-using-font-face
const Fonts = () => (
  <Global
    styles={`
        /* Primary */

        @font-face {
            font-family: 'Circular Std';
            font-style: normal;
            font-weight: 450;
            src: local('Circular Std'), url('https://fonts.cdnfonts.com/s/15011/CircularStd-Book.woff') format('woff');
        }
        @font-face {
            font-family: 'Circular Std';
            font-style: normal;
            font-weight: 500;
            src: local('Circular Std'), url('https://fonts.cdnfonts.com/s/15011/CircularStd-Medium.woff') format('woff');
        }
        @font-face {
            font-family: 'Circular Std';
            font-style: normal;
            font-weight: 700;
            src: local('Circular Std'), url('https://fonts.cdnfonts.com/s/15011/CircularStd-Bold.woff') format('woff');
        }

        /* Secondary */

        @font-face {
            font-style: normal;
            font-family: 'Outfit';
            font-display: swap;
            font-weight: 400, 500, 700;
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            src: url(https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtqUYLknw.woff2) format('woff2');
        }
      `}
  />
)

export default Fonts
