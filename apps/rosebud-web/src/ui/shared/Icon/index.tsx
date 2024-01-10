import { Icon, IconProps } from '@chakra-ui/react'

const kDefaultProps: IconProps = {
  boxSize: '24px',
}

export const RbLogo = (props: IconProps) => (
  <Icon viewBox='0 0 224 224' {...props}>
    <path
      d='M91.9789 224C142.919 224 184.214 182.705 184.214 131.765C91.9789 131.765 91.9789 52.7061 -0.256348 52.7061V131.765C-0.256348 182.705 41.0388 224 91.9789 224Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M87.94 71.6392C89.2893 69.7246 90.6341 67.8035 91.9789 65.8824C115.038 32.9412 138.097 0 184.214 0L184.214 118.588C143.129 118.588 123.217 101.656 100.554 82.231L100.338 82.0457C96.3246 78.6057 92.229 75.095 87.94 71.6392ZM80.2297 82.3531C84.2193 85.5844 88.0991 88.9099 91.9789 92.2354L91.9789 92.2355C115.038 112 138.097 131.765 184.214 131.765C138.097 131.765 115.038 112 91.9789 92.2353C88.0992 88.9098 84.2194 85.5843 80.2298 82.3529C80.2298 82.353 80.2298 82.353 80.2297 82.3531Z'
      fill='currentColor'
    />
  </Icon>
)

/**
 * Socials
 */

export const TwitterIcon = (props: IconProps) => (
  <Icon viewBox='0 0 20 20' {...props}>
    <path
      d='M17.6006 5.5006C17.0264 5.7556 16.4096 5.9272 15.7622 6.0046C16.4234 5.6086 16.9304 4.9816 17.1692 4.234C16.5512 4.6006 15.866 4.867 15.1364 5.011C14.5526 4.3888 13.721 4 12.8006 4C11.033 4 9.6002 5.4334 9.6002 7.2004C9.6002 7.4512 9.629 7.696 9.683 7.9294C7.0232 7.7962 4.6652 6.5218 3.086 4.585C2.8112 5.0578 2.6534 5.6074 2.6534 6.1948C2.6534 7.3048 3.218 8.2846 4.0766 8.8582C3.5522 8.8414 3.0584 8.6974 2.627 8.458C2.627 8.4718 2.627 8.4844 2.627 8.4982C2.627 10.0492 3.7298 11.3428 5.1944 11.6362C4.9262 11.7094 4.643 11.7484 4.3508 11.7484C4.145 11.7484 3.944 11.728 3.749 11.6914C4.1564 12.9628 5.3384 13.8886 6.7388 13.9144C5.6438 14.773 4.2638 15.2848 2.7638 15.2848C2.5058 15.2848 2.2508 15.2698 2 15.2398C3.4166 16.1476 5.0984 16.6774 6.9062 16.6774C12.7934 16.6774 16.0118 11.8006 16.0118 7.5712C16.0118 7.4326 16.0088 7.2946 16.0028 7.1572C16.6286 6.7054 17.1716 6.142 17.6006 5.5006Z'
      fill='currentColor'
    />
  </Icon>
)

export const DiscordIcon = (props: IconProps) => (
  <Icon viewBox='0 0 20 20' {...props}>
    <path
      d='M16.717 5.67141C16.4546 5.27752 16.0831 4.97622 15.6424 4.80107C14.6859 4.41992 13.8633 4.1653 13.1272 4.02179C12.6109 3.92148 12.0997 4.17379 11.8539 4.64908L11.7926 4.7679C11.2475 4.7081 10.6687 4.68804 10.0095 4.70463C9.33367 4.68843 8.75291 4.7081 8.20709 4.7679L8.14614 4.64908C7.90041 4.17379 7.38836 3.92187 6.87321 4.02217C6.13717 4.1653 5.31417 4.41992 4.35801 4.80146C3.91778 4.97661 3.54627 5.27752 3.28345 5.67179C1.45072 8.42283 0.732538 11.3903 1.08814 14.7443C1.10056 14.862 1.16656 14.9673 1.2671 15.0302C2.67707 15.9136 3.89721 16.5185 5.10686 16.9344C5.6127 17.1099 6.17366 16.9136 6.47219 16.4603L7.00442 15.6498C6.5805 15.4908 6.16667 15.3025 5.76992 15.0776C5.58397 14.9723 5.51914 14.7366 5.62512 14.5518C5.7311 14.3662 5.9683 14.301 6.15464 14.4079C7.33518 15.0769 8.66984 15.4306 10.0142 15.4306C11.3586 15.4306 12.6932 15.0769 13.8738 14.4079C14.0597 14.301 14.2969 14.3662 14.4033 14.5518C14.5093 14.7366 14.4444 14.9723 14.2585 15.0776C13.8485 15.3103 13.4199 15.5039 12.9809 15.6656L13.5286 16.4765C13.7542 16.8102 14.1265 17 14.51 17C14.635 17 14.7612 16.9796 14.8839 16.9379C16.097 16.5216 17.3195 15.9159 18.7326 15.0306C18.8331 14.9677 18.8991 14.862 18.9115 14.7447C19.2679 11.3903 18.5497 8.42244 16.717 5.67141ZM7.52035 12.3582C6.77267 12.3582 6.15736 11.5755 6.15736 10.6241C6.15736 9.67278 6.77267 8.89002 7.52035 8.89002C8.26804 8.89002 8.88335 9.67278 8.88335 10.6241C8.88335 11.5755 8.26804 12.3582 7.52035 12.3582ZM12.5643 12.3482C11.8236 12.3482 11.2142 11.5608 11.2142 10.6037C11.2142 9.64654 11.8236 8.85915 12.5643 8.85915C13.305 8.85915 13.9145 9.64654 13.9145 10.6037C13.9145 11.5608 13.305 12.3482 12.5643 12.3482Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbCloudSync = (props: IconProps) => (
  <Icon viewBox='0 0 24 25' {...kDefaultProps} {...props}>
    <path
      d='M8.11028 12.673C5.29028 12.873 5.30028 16.973 8.11028 17.173H14.7803C15.5903 17.183 16.3703 16.873 16.9703 16.333C18.9503 14.603 17.8903 11.133 15.2903 10.803C14.3603 5.163 6.21028 7.303 8.14028 12.673'
      fill='currentColor'
    />
    <path
      d='M9 23.5732C4.73 23.5732 1.25 20.0932 1.25 15.8232C1.25 15.4132 1.59 15.0732 2 15.0732C2.41 15.0732 2.75 15.4132 2.75 15.8232C2.75 18.7832 4.81 21.2632 7.58 21.9132L7.31 21.4632C7.1 21.1032 7.21 20.6432 7.57 20.4332C7.92 20.2232 8.39 20.3332 8.6 20.6932L9.65 22.4432C9.79 22.6732 9.79 22.9632 9.66 23.1932C9.52 23.4232 9.27 23.5732 9 23.5732Z'
      fill='currentColor'
    />
    <path
      d='M22.0004 10.5732C21.5904 10.5732 21.2504 10.2332 21.2504 9.82324C21.2504 6.86324 19.1904 4.38324 16.4204 3.73324L16.6904 4.18324C16.9004 4.54324 16.7904 5.00324 16.4304 5.21324C16.0804 5.42324 15.6104 5.31324 15.4004 4.95324L14.3504 3.20324C14.2104 2.97324 14.2104 2.68324 14.3404 2.45324C14.4804 2.22324 14.7304 2.07324 15.0004 2.07324C19.2704 2.07324 22.7504 5.55324 22.7504 9.82324C22.7504 10.2332 22.4104 10.5732 22.0004 10.5732Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbInvincibility = (props: IconProps) => (
  <Icon viewBox='0 0 24 25' {...kDefaultProps} {...props}>
    <path
      d='M15.3904 6.03352L16.8004 8.85352C16.9904 9.24352 17.5004 9.61352 17.9304 9.69352L20.4804 10.1135C22.1104 10.3835 22.4904 11.5635 21.3204 12.7435L19.3304 14.7335C19.0004 15.0635 18.8104 15.7135 18.9204 16.1835L19.4904 18.6435C19.9404 20.5835 18.9004 21.3435 17.1904 20.3235L14.8004 18.9035C14.3704 18.6435 13.6504 18.6435 13.2204 18.9035L10.8304 20.3235C9.12043 21.3335 8.08043 20.5835 8.53043 18.6435L9.10043 16.1835C9.19043 15.7035 9.00043 15.0535 8.67043 14.7235L6.68043 12.7335C5.51043 11.5635 5.89043 10.3835 7.52043 10.1035L10.0704 9.68352C10.5004 9.61352 11.0104 9.23352 11.2004 8.84352L12.6104 6.02352C13.3804 4.50352 14.6204 4.50352 15.3904 6.03352Z'
      fill='currentColor'
    />
    <path
      d='M8 6.57324H2C1.59 6.57324 1.25 6.23324 1.25 5.82324C1.25 5.41324 1.59 5.07324 2 5.07324H8C8.41 5.07324 8.75 5.41324 8.75 5.82324C8.75 6.23324 8.41 6.57324 8 6.57324Z'
      fill='currentColor'
    />
    <path
      d='M5 20.5732H2C1.59 20.5732 1.25 20.2332 1.25 19.8232C1.25 19.4132 1.59 19.0732 2 19.0732H5C5.41 19.0732 5.75 19.4132 5.75 19.8232C5.75 20.2332 5.41 20.5732 5 20.5732Z'
      fill='currentColor'
    />
    <path
      d='M3 13.5732H2C1.59 13.5732 1.25 13.2332 1.25 12.8232C1.25 12.4132 1.59 12.0732 2 12.0732H3C3.41 12.0732 3.75 12.4132 3.75 12.8232C3.75 13.2332 3.41 13.5732 3 13.5732Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbClockFill = (props: IconProps) => (
  <Icon viewBox='0 0 24 25' {...kDefaultProps} {...props}>
    <path
      d='M12.0002 4.34277C7.32733 4.34277 3.51953 8.15058 3.51953 12.8234C3.51953 17.4962 7.32733 21.304 12.0002 21.304C16.673 21.304 20.4808 17.4962 20.4808 12.8234C20.4808 8.15058 16.673 4.34277 12.0002 4.34277ZM15.6892 15.851C15.5705 16.0545 15.3585 16.1648 15.138 16.1648C15.0277 16.1648 14.9175 16.1393 14.8157 16.0715L12.1867 14.5026C11.5337 14.1125 11.0503 13.2559 11.0503 12.5011V9.02408C11.0503 8.67638 11.3387 8.38803 11.6864 8.38803C12.0341 8.38803 12.3224 8.67638 12.3224 9.02408V12.5011C12.3224 12.8064 12.5768 13.2559 12.8397 13.4086L15.4687 14.9775C15.774 15.1556 15.8758 15.5457 15.6892 15.851Z'
      fill='currentColor'
    />
  </Icon>
)
export const RbClock = (props: IconProps) => (
  <Icon viewBox='0 0 24 25' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.71 15.18L12.61 13.33C12.07 13.01 11.63 12.24 11.63 11.61V7.51001'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbVerify = (props: IconProps) => (
  <Icon viewBox='0 0 24 25' {...kDefaultProps} {...props}>
    <path
      d='M21.5599 11.6995L20.1999 10.1195C19.9399 9.81953 19.7299 9.25953 19.7299 8.85953V7.15953C19.7299 6.09953 18.8599 5.22953 17.7999 5.22953H16.0999C15.7099 5.22953 15.1399 5.01953 14.8399 4.75953L13.2599 3.39953C12.5699 2.80953 11.4399 2.80953 10.7399 3.39953L9.16988 4.76953C8.86988 5.01953 8.29988 5.22953 7.90988 5.22953H6.17988C5.11988 5.22953 4.24988 6.09953 4.24988 7.15953V8.86953C4.24988 9.25953 4.03988 9.81953 3.78988 10.1195L2.43988 11.7095C1.85988 12.3995 1.85988 13.5195 2.43988 14.2095L3.78988 15.7995C4.03988 16.0995 4.24988 16.6595 4.24988 17.0495V18.7595C4.24988 19.8195 5.11988 20.6895 6.17988 20.6895H7.90988C8.29988 20.6895 8.86988 20.8995 9.16988 21.1595L10.7499 22.5195C11.4399 23.1095 12.5699 23.1095 13.2699 22.5195L14.8499 21.1595C15.1499 20.8995 15.7099 20.6895 16.1099 20.6895H17.8099C18.8699 20.6895 19.7399 19.8195 19.7399 18.7595V17.0595C19.7399 16.6695 19.9499 16.0995 20.2099 15.7995L21.5699 14.2195C22.1499 13.5295 22.1499 12.3895 21.5599 11.6995ZM16.1599 11.0695L11.3299 15.8995C11.1899 16.0395 10.9999 16.1195 10.7999 16.1195C10.5999 16.1195 10.4099 16.0395 10.2699 15.8995L7.84988 13.4795C7.55988 13.1895 7.55988 12.7095 7.84988 12.4195C8.13988 12.1295 8.61988 12.1295 8.90988 12.4195L10.7999 14.3095L15.0999 10.0095C15.3899 9.71953 15.8699 9.71953 16.1599 10.0095C16.4499 10.2995 16.4499 10.7795 16.1599 11.0695Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbCalendarFill = (props: IconProps) => (
  <Icon viewBox='0 0 24 25' {...kDefaultProps} {...props}>
    <path
      d='M16.7502 3.56V2C16.7502 1.59 16.4102 1.25 16.0002 1.25C15.5902 1.25 15.2502 1.59 15.2502 2V3.5H8.75023V2C8.75023 1.59 8.41023 1.25 8.00023 1.25C7.59023 1.25 7.25023 1.59 7.25023 2V3.56C4.55023 3.81 3.24023 5.42 3.04023 7.81C3.02023 8.1 3.26023 8.34 3.54023 8.34H20.4602C20.7502 8.34 20.9902 8.09 20.9602 7.81C20.7602 5.42 19.4502 3.81 16.7502 3.56Z'
      fill='currentColor'
    />
    <path
      d='M20 9.83984H4C3.45 9.83984 3 10.2898 3 10.8398V16.9998C3 19.9998 4.5 21.9998 8 21.9998H16C19.5 21.9998 21 19.9998 21 16.9998V10.8398C21 10.2898 20.55 9.83984 20 9.83984ZM9.21 18.2098C9.16 18.2498 9.11 18.2998 9.06 18.3298C9 18.3698 8.94 18.3998 8.88 18.4198C8.82 18.4498 8.76 18.4698 8.7 18.4798C8.63 18.4898 8.57 18.4998 8.5 18.4998C8.37 18.4998 8.24 18.4698 8.12 18.4198C7.99 18.3698 7.89 18.2998 7.79 18.2098C7.61 18.0198 7.5 17.7598 7.5 17.4998C7.5 17.2398 7.61 16.9798 7.79 16.7898C7.89 16.6998 7.99 16.6298 8.12 16.5798C8.3 16.4998 8.5 16.4798 8.7 16.5198C8.76 16.5298 8.82 16.5498 8.88 16.5798C8.94 16.5998 9 16.6298 9.06 16.6698C9.11 16.7098 9.16 16.7498 9.21 16.7898C9.39 16.9798 9.5 17.2398 9.5 17.4998C9.5 17.7598 9.39 18.0198 9.21 18.2098ZM9.21 14.7098C9.02 14.8898 8.76 14.9998 8.5 14.9998C8.24 14.9998 7.98 14.8898 7.79 14.7098C7.61 14.5198 7.5 14.2598 7.5 13.9998C7.5 13.7398 7.61 13.4798 7.79 13.2898C8.07 13.0098 8.51 12.9198 8.88 13.0798C9.01 13.1298 9.12 13.1998 9.21 13.2898C9.39 13.4798 9.5 13.7398 9.5 13.9998C9.5 14.2598 9.39 14.5198 9.21 14.7098ZM12.71 18.2098C12.52 18.3898 12.26 18.4998 12 18.4998C11.74 18.4998 11.48 18.3898 11.29 18.2098C11.11 18.0198 11 17.7598 11 17.4998C11 17.2398 11.11 16.9798 11.29 16.7898C11.66 16.4198 12.34 16.4198 12.71 16.7898C12.89 16.9798 13 17.2398 13 17.4998C13 17.7598 12.89 18.0198 12.71 18.2098ZM12.71 14.7098C12.66 14.7498 12.61 14.7898 12.56 14.8298C12.5 14.8698 12.44 14.8998 12.38 14.9198C12.32 14.9498 12.26 14.9698 12.2 14.9798C12.13 14.9898 12.07 14.9998 12 14.9998C11.74 14.9998 11.48 14.8898 11.29 14.7098C11.11 14.5198 11 14.2598 11 13.9998C11 13.7398 11.11 13.4798 11.29 13.2898C11.38 13.1998 11.49 13.1298 11.62 13.0798C11.99 12.9198 12.43 13.0098 12.71 13.2898C12.89 13.4798 13 13.7398 13 13.9998C13 14.2598 12.89 14.5198 12.71 14.7098ZM16.21 18.2098C16.02 18.3898 15.76 18.4998 15.5 18.4998C15.24 18.4998 14.98 18.3898 14.79 18.2098C14.61 18.0198 14.5 17.7598 14.5 17.4998C14.5 17.2398 14.61 16.9798 14.79 16.7898C15.16 16.4198 15.84 16.4198 16.21 16.7898C16.39 16.9798 16.5 17.2398 16.5 17.4998C16.5 17.7598 16.39 18.0198 16.21 18.2098ZM16.21 14.7098C16.16 14.7498 16.11 14.7898 16.06 14.8298C16 14.8698 15.94 14.8998 15.88 14.9198C15.82 14.9498 15.76 14.9698 15.7 14.9798C15.63 14.9898 15.56 14.9998 15.5 14.9998C15.24 14.9998 14.98 14.8898 14.79 14.7098C14.61 14.5198 14.5 14.2598 14.5 13.9998C14.5 13.7398 14.61 13.4798 14.79 13.2898C14.89 13.1998 14.99 13.1298 15.12 13.0798C15.3 12.9998 15.5 12.9798 15.7 13.0198C15.76 13.0298 15.82 13.0498 15.88 13.0798C15.94 13.0998 16 13.1298 16.06 13.1698C16.11 13.2098 16.16 13.2498 16.21 13.2898C16.39 13.4798 16.5 13.7398 16.5 13.9998C16.5 14.2598 16.39 14.5198 16.21 14.7098Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbCalendarStroke = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M8 2V5'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16 2V5'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.5 9.08997H20.5'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.6947 13.7H15.7037'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.6947 16.7H15.7037'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 13.7H12.0045'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 16.7H12.0045'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.29431 13.7H8.30329'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.29431 16.7H8.30329'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbPlus = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M8 12H16'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 16V8'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbCheckmark = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M5 13.8751L9.09098 18L20 7'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbCross = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M5 5L19 19'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M19 5L5 19'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbRegenerate = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M4.33008 5.15991H18.1701C19.8301 5.15991 21.1701 6.49991 21.1701 8.15991V11.4799'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7.49008 2L4.33008 5.15997L7.49008 8.32001'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M21.1701 18.84H7.33008C5.67008 18.84 4.33008 17.5 4.33008 15.84V12.52'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M18.0103 21.9999L21.1703 18.84L18.0103 15.6799'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbGoDeeper = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props}>
    <svg
      width='25'
      height='24'
      viewBox='0 0 25 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M10.0698 11.6799L12.6298 14.2399L15.1898 11.6799'
        stroke='currentColor'
        strokeWidth='2'
        strokeMiterlimit='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12.6299 4V14.17'
        stroke='currentColor'
        strokeWidth='2'
        strokeMiterlimit='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M20.75 12.1799C20.75 16.5999 17.75 20.1799 12.75 20.1799C7.75 20.1799 4.75 16.5999 4.75 12.1799'
        stroke='currentColor'
        strokeWidth='2'
        strokeMiterlimit='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </Icon>
)

export const RbManifest = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props}>
    <svg
      width='25'
      height='24'
      viewBox='0 0 25 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M16.14 5.21L17.5499 8.02999C17.7399 8.41999 18.2499 8.78999 18.6799 8.86999L21.23 9.28999C22.86 9.55999 23.24 10.74 22.07 11.92L20.0799 13.91C19.7499 14.24 19.56 14.89 19.67 15.36L20.2399 17.82C20.6899 19.76 19.65 20.52 17.94 19.5L15.5499 18.08C15.1199 17.82 14.4 17.82 13.97 18.08L11.5799 19.5C9.86994 20.51 8.82995 19.76 9.27995 17.82L9.84996 15.36C9.95996 14.9 9.76995 14.25 9.43995 13.91L7.44996 11.92C6.27996 10.75 6.65996 9.56999 8.28996 9.28999L10.8399 8.86999C11.2699 8.79999 11.78 8.41999 11.97 8.02999L13.38 5.21C14.13 3.68 15.37 3.68 16.14 5.21Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.75 5H2.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M5.75 19H2.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M3.75 12H2.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </Icon>
)

export const RbConnected = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props}>
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M16.96 6.17004C18.96 7.56004 20.34 9.77004 20.62 12.32'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M3.48999 12.37C3.74999 9.82997 5.10999 7.61997 7.08999 6.21997'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.19 20.9399C9.35 21.5299 10.67 21.8599 12.06 21.8599C13.4 21.8599 14.66 21.5599 15.79 21.0099'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12.06 7.70001C13.5954 7.70001 14.84 6.45537 14.84 4.92001C14.84 3.38466 13.5954 2.14001 12.06 2.14001C10.5247 2.14001 9.28003 3.38466 9.28003 4.92001C9.28003 6.45537 10.5247 7.70001 12.06 7.70001Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M4.82999 19.92C6.36534 19.92 7.60999 18.6753 7.60999 17.14C7.60999 15.6046 6.36534 14.36 4.82999 14.36C3.29464 14.36 2.04999 15.6046 2.04999 17.14C2.04999 18.6753 3.29464 19.92 4.82999 19.92Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19.17 19.92C20.7054 19.92 21.95 18.6753 21.95 17.14C21.95 15.6046 20.7054 14.36 19.17 14.36C17.6347 14.36 16.39 15.6046 16.39 17.14C16.39 18.6753 17.6347 19.92 19.17 19.92Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </Icon>
)

export const RbSend = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props}>
    <path
      d='M16.1391 2.95907L7.10914 5.95907C1.03914 7.98907 1.03914 11.2991 7.10914 13.3191L9.78914 14.2091L10.6791 16.8891C12.6991 22.9591 16.0191 22.9591 18.0391 16.8891L21.0491 7.86907C22.3891 3.81907 20.1891 1.60907 16.1391 2.95907ZM16.4591 8.33907L12.6591 12.1591C12.5091 12.3091 12.3191 12.3791 12.1291 12.3791C11.9391 12.3791 11.7491 12.3091 11.5991 12.1591C11.3091 11.8691 11.3091 11.3891 11.5991 11.0991L15.3991 7.27907C15.6891 6.98907 16.1691 6.98907 16.4591 7.27907C16.7491 7.56907 16.7491 8.04907 16.4591 8.33907Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbShare = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M16.44 8.8999C20.04 9.2099 21.51 11.0599 21.51 15.1099V15.2399C21.51 19.7099 19.72 21.4999 15.25 21.4999H8.73998C4.26998 21.4999 2.47998 19.7099 2.47998 15.2399V15.1099C2.47998 11.0899 3.92998 9.2399 7.46998 8.9099'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 15.0001V3.62012'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.35 5.85L12 2.5L8.65002 5.85'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbSendStroke = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M7.39999 6.32003L15.89 3.49003C19.7 2.22003 21.77 4.30003 20.51 8.11003L17.68 16.6C15.78 22.31 12.66 22.31 10.76 16.6L9.91999 14.08L7.39999 13.24C1.68999 11.34 1.68999 8.23003 7.39999 6.32003Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10.11 13.6501L13.69 10.0601'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbHeart = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbThumbsDown = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M16.52 5.65002L13.42 3.25002C13.02 2.85002 12.12 2.65002 11.52 2.65002H7.71998C6.51998 2.65002 5.21998 3.55002 4.91998 4.75002L2.51998 12.05C2.01998 13.45 2.91998 14.65 4.41998 14.65H8.41998C9.01998 14.65 9.51998 15.15 9.41998 15.85L8.91998 19.05C8.71998 19.95 9.31998 20.95 10.22 21.25C11.02 21.55 12.02 21.15 12.42 20.55L16.52 14.45'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
    />
    <path
      d='M21.62 5.65V15.45C21.62 16.85 21.02 17.35 19.62 17.35H18.62C17.22 17.35 16.62 16.85 16.62 15.45V5.65C16.62 4.25 17.22 3.75 18.62 3.75H19.62C21.02 3.75 21.62 4.25 21.62 5.65Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbThumbsUp = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M7.47998 18.35L10.58 20.75C10.98 21.15 11.88 21.35 12.48 21.35H16.28C17.48 21.35 18.78 20.45 19.08 19.25L21.48 11.95C21.98 10.55 21.08 9.34997 19.58 9.34997H15.58C14.98 9.34997 14.48 8.84997 14.58 8.14997L15.08 4.94997C15.28 4.04997 14.68 3.04997 13.78 2.74997C12.98 2.44997 11.98 2.84997 11.58 3.44997L7.47998 9.54997'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
    />
    <path
      d='M2.38 18.35V8.55002C2.38 7.15002 2.98 6.65002 4.38 6.65002H5.38C6.78 6.65002 7.38 7.15002 7.38 8.55002V18.35C7.38 19.75 6.78 20.25 5.38 20.25H4.38C2.98 20.25 2.38 19.75 2.38 18.35Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbNotifications = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M12.02 2.90991C8.70997 2.90991 6.01997 5.59991 6.01997 8.90991V11.7999C6.01997 12.4099 5.75997 13.3399 5.44997 13.8599L4.29997 15.7699C3.58997 16.9499 4.07997 18.2599 5.37997 18.6999C9.68997 20.1399 14.34 20.1399 18.65 18.6999C19.86 18.2999 20.39 16.8699 19.73 15.7699L18.58 13.8599C18.28 13.3399 18.02 12.4099 18.02 11.7999V8.90991C18.02 5.60991 15.32 2.90991 12.02 2.90991Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
    />
    <path
      d='M13.87 3.19994C13.56 3.10994 13.24 3.03994 12.91 2.99994C11.95 2.87994 11.03 2.94994 10.17 3.19994C10.46 2.45994 11.18 1.93994 12.02 1.93994C12.86 1.93994 13.58 2.45994 13.87 3.19994Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.02 19.0601C15.02 20.7101 13.67 22.0601 12.02 22.0601C11.2 22.0601 10.44 21.7201 9.90002 21.1801C9.36002 20.6401 9.02002 19.8801 9.02002 19.0601'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
    />
  </Icon>
)

export const RbMicrophone = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M4.3501 9.6499V11.3499C4.3501 15.5699 7.7801 18.9999 12.0001 18.9999C16.2201 18.9999 19.6501 15.5699 19.6501 11.3499V9.6499'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 19V22'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbBookmark = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M16.8199 2H7.17995C5.04995 2 3.31995 3.74 3.31995 5.86V19.95C3.31995 21.75 4.60995 22.51 6.18995 21.64L11.0699 18.93C11.5899 18.64 12.4299 18.64 12.9399 18.93L17.8199 21.64C19.3999 22.52 20.6899 21.76 20.6899 19.95V5.86C20.6799 3.74 18.9499 2 16.8199 2Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbStop = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M9.3 21H14.7C19.2 21 21 19.2 21 14.7V9.3C21 4.8 19.2 3 14.7 3H9.3C4.8 3 3 4.8 3 9.3V14.7C3 19.2 4.8 21 9.3 21Z'
      stroke='currentColor'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbBookmarkFill = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M16.8203 2H7.18031C5.05031 2 3.32031 3.74 3.32031 5.86V19.95C3.32031 21.75 4.61031 22.51 6.19031 21.64L11.0703 18.93C11.5903 18.64 12.4303 18.64 12.9403 18.93L17.8203 21.64C19.4003 22.52 20.6903 21.76 20.6903 19.95V5.86C20.6803 3.74 18.9503 2 16.8203 2Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbJournal = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M22 10H18C15 10 14 9 14 6V2L22 10Z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7 13H13'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7 17H11'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbPencil = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M13.26 3.59997L5.04997 12.29C4.73997 12.62 4.43997 13.27 4.37997 13.72L4.00997 16.96C3.87997 18.13 4.71997 18.93 5.87997 18.73L9.09997 18.18C9.54997 18.1 10.18 17.77 10.49 17.43L18.7 8.73997C20.12 7.23997 20.76 5.52997 18.55 3.43997C16.35 1.36997 14.68 2.09997 13.26 3.59997Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.89 5.05005C12.32 7.81005 14.56 9.92005 17.34 10.2'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3 22H21'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbSettings = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M2 12.8799V11.1199C2 10.0799 2.85 9.21994 3.9 9.21994C5.71 9.21994 6.45 7.93994 5.54 6.36994C5.02 5.46994 5.33 4.29994 6.24 3.77994L7.97 2.78994C8.76 2.31994 9.78 2.59994 10.25 3.38994L10.36 3.57994C11.26 5.14994 12.74 5.14994 13.65 3.57994L13.76 3.38994C14.23 2.59994 15.25 2.31994 16.04 2.78994L17.77 3.77994C18.68 4.29994 18.99 5.46994 18.47 6.36994C17.56 7.93994 18.3 9.21994 20.11 9.21994C21.15 9.21994 22.01 10.0699 22.01 11.1199V12.8799C22.01 13.9199 21.16 14.7799 20.11 14.7799C18.3 14.7799 17.56 16.0599 18.47 17.6299C18.99 18.5399 18.68 19.6999 17.77 20.2199L16.04 21.2099C15.25 21.6799 14.23 21.3999 13.76 20.6099L13.65 20.4199C12.75 18.8499 11.27 18.8499 10.36 20.4199L10.25 20.6099C9.78 21.3999 8.76 21.6799 7.97 21.2099L6.24 20.2199C5.33 19.6999 5.02 18.5299 5.54 17.6299C6.45 16.0599 5.71 14.7799 3.9 14.7799C2.85 14.7799 2 13.9199 2 12.8799Z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbModeFocused = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M16 2H8C4 2 2 4 2 8V21C2 21.55 2.45 22 3 22H16C20 22 22 20 22 16V8C22 4 20 2 16 2Z'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12.91 7.83991L7.72004 13.0299C7.52004 13.2299 7.33004 13.6199 7.29004 13.8999L7.01004 15.8799C6.91004 16.5999 7.41004 17.0999 8.13004 16.9999L10.11 16.7199C10.39 16.6799 10.78 16.4899 10.98 16.2899L16.17 11.0999C17.06 10.2099 17.49 9.16991 16.17 7.84991C14.85 6.51991 13.81 6.93991 12.91 7.83991Z'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12.17 8.57983C12.61 10.1498 13.84 11.3898 15.42 11.8298'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbModeInteractive = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M16 2H8C4 2 2 4 2 8V21C2 21.55 2.45 22 3 22H16C20 22 22 20 22 16V8C22 4 20 2 16 2Z'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7 9.5H17'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7 14.5H14'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbStarStroke = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M13.73 3.51001L15.49 7.03001C15.73 7.52002 16.37 7.99001 16.91 8.08001L20.1 8.61001C22.14 8.95001 22.62 10.43 21.15 11.89L18.67 14.37C18.25 14.79 18.02 15.6 18.15 16.18L18.86 19.25C19.42 21.68 18.13 22.62 15.98 21.35L12.99 19.58C12.45 19.26 11.56 19.26 11.01 19.58L8.01997 21.35C5.87997 22.62 4.57997 21.67 5.13997 19.25L5.84997 16.18C5.97997 15.6 5.74997 14.79 5.32997 14.37L2.84997 11.89C1.38997 10.43 1.85997 8.95001 3.89997 8.61001L7.08997 8.08001C7.61997 7.99001 8.25997 7.52002 8.49997 7.03001L10.26 3.51001C11.22 1.60001 12.78 1.60001 13.73 3.51001Z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbStarFill = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M5.73937 16C5.84937 15.51 5.64937 14.81 5.29937 14.46L2.86937 12.03C2.10937 11.27 1.80937 10.46 2.02937 9.76C2.25937 9.06 2.96937 8.58 4.02937 8.4L7.14937 7.88C7.59937 7.8 8.14937 7.4 8.35937 6.99L10.0794 3.54C10.5794 2.55 11.2594 2 11.9994 2C12.7394 2 13.4194 2.55 13.9194 3.54L15.6394 6.99C15.7694 7.25 16.0394 7.5 16.3294 7.67L5.55937 18.44C5.41937 18.58 5.17937 18.45 5.21937 18.25L5.73937 16Z'
      fill='currentColor'
    />
    <path
      d='M18.7008 14.4619C18.3408 14.8219 18.1408 15.5119 18.2608 16.0019L18.9508 19.0119C19.2408 20.2619 19.0608 21.2019 18.4408 21.6519C18.1908 21.8319 17.8908 21.9219 17.5408 21.9219C17.0308 21.9219 16.4308 21.7319 15.7708 21.3419L12.8408 19.6019C12.3808 19.3319 11.6208 19.3319 11.1608 19.6019L8.23078 21.3419C7.12078 21.9919 6.17078 22.1019 5.56078 21.6519C5.33078 21.4819 5.16078 21.2519 5.05078 20.9519L17.2108 8.79185C17.6708 8.33185 18.3208 8.12185 18.9508 8.23185L19.9608 8.40185C21.0208 8.58185 21.7308 9.06185 21.9608 9.76185C22.1808 10.4619 21.8808 11.2719 21.1208 12.0319L18.7008 14.4619Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbExport = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M6.70001 9.26001L12 12.33L17.26 9.28001'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 17.7701V12.3201'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10.76 6.28998L7.56 8.06998C6.84 8.46998 6.23999 9.47998 6.23999 10.31V13.7C6.23999 14.53 6.83 15.54 7.56 15.94L10.76 17.72C11.44 18.1 12.56 18.1 13.25 17.72L16.45 15.94C17.17 15.54 17.77 14.53 17.77 13.7V10.3C17.77 9.46998 17.18 8.45998 16.45 8.05998L13.25 6.27998C12.56 5.89998 11.44 5.89998 10.76 6.28998Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M22 15C22 18.87 18.87 22 15 22L16.05 20.25'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M2 9C2 5.13 5.13 2 9 2L7.95001 3.75'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbMemory = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M9.31993 13.28H12.4099V20.48C12.4099 21.54 13.7299 22.04 14.4299 21.24L21.9999 12.64C22.6599 11.89 22.1299 10.72 21.1299 10.72H18.0399V3.51997C18.0399 2.45997 16.7199 1.95997 16.0199 2.75997L8.44994 11.36C7.79994 12.11 8.32993 13.28 9.31993 13.28Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.5 4H1.5'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7.5 20H1.5'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M4.5 12H1.5'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbInvite = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M18 18.86H17.24C16.44 18.86 15.68 19.17 15.12 19.73L13.41 21.42C12.63 22.19 11.36 22.19 10.58 21.42L8.87 19.73C8.31 19.17 7.54 18.86 6.75 18.86H6C4.34 18.86 3 17.53 3 15.89V4.97998C3 3.33998 4.34 2.01001 6 2.01001H18C19.66 2.01001 21 3.33998 21 4.97998V15.89C21 17.52 19.66 18.86 18 18.86Z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9999 10.0001C13.2868 10.0001 14.33 8.95687 14.33 7.67004C14.33 6.38322 13.2868 5.34009 11.9999 5.34009C10.7131 5.34009 9.66992 6.38322 9.66992 7.67004C9.66992 8.95687 10.7131 10.0001 11.9999 10.0001Z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16 15.6601C16 13.8601 14.21 12.4001 12 12.4001C9.79 12.4001 8 13.8601 8 15.6601'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const SfShare = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M7.78662 20.2995H16.7476C18.3804 20.2995 19.2007 19.4871 19.2007 17.8777V10.0808C19.2007 8.47143 18.3804 7.65893 16.7476 7.65893H14.5679V8.91675H16.7241C17.4976 8.91675 17.9429 9.33861 17.9429 10.1511V17.8073C17.9429 18.6199 17.4976 19.0417 16.7241 19.0417H7.80224C7.021 19.0417 6.59131 18.6199 6.59131 17.8073V10.1511C6.59131 9.33861 7.021 8.91675 7.80224 8.91675H9.96631V7.65893H7.78662C6.15381 7.65893 5.3335 8.47143 5.3335 10.0808V17.8777C5.3335 19.4871 6.15381 20.2995 7.78662 20.2995ZM12.2632 14.1823C12.5991 14.1823 12.8882 13.9011 12.8882 13.573V5.54956L12.8413 4.37769L13.3648 4.93237L14.5522 6.198C14.6616 6.323 14.8179 6.38549 14.9741 6.38549C15.2944 6.38549 15.5444 6.15112 15.5444 5.83081C15.5444 5.66675 15.4741 5.54175 15.357 5.42456L12.7163 2.87769C12.56 2.72144 12.4272 2.66675 12.2632 2.66675C12.107 2.66675 11.9741 2.72144 11.8101 2.87769L9.16944 5.42456C9.05224 5.54175 8.98975 5.66675 8.98975 5.83081C8.98975 6.15112 9.22412 6.38549 9.55224 6.38549C9.70068 6.38549 9.87256 6.323 9.98194 6.198L11.1616 4.93237L11.6929 4.37769L11.646 5.54956V13.573C11.646 13.9011 11.9272 14.1823 12.2632 14.1823Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbEllipseVertical = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <svg
      stroke='currentColor'
      fill='currentColor'
      strokeWidth='0'
      viewBox='0 0 192 512'
      height='24px'
      width='24px'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z'></path>
    </svg>
  </Icon>
)

export const RbSun = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M19.14 19.14L19.01 19.01M19.01 4.99L19.14 4.86L19.01 4.99ZM4.86 19.14L4.99 19.01L4.86 19.14ZM12 2.08V2V2.08ZM12 22V21.92V22ZM2.08 12H2H2.08ZM22 12H21.92H22ZM4.99 4.99L4.86 4.86L4.99 4.99Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbExplore = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M15.59 12.26C18.4232 12.26 20.72 9.96323 20.72 7.13C20.72 4.29678 18.4232 2 15.59 2C12.7567 2 10.46 4.29678 10.46 7.13C10.46 9.96323 12.7567 12.26 15.59 12.26Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
    />
    <path
      d='M6.36002 19.44C8.06105 19.44 9.44003 18.0611 9.44003 16.36C9.44003 14.659 8.06105 13.28 6.36002 13.28C4.65898 13.28 3.28003 14.659 3.28003 16.36C3.28003 18.0611 4.65898 19.44 6.36002 19.44Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
    />
    <path
      d='M16.62 22C18.0338 22 19.18 20.8539 19.18 19.44C19.18 18.0262 18.0338 16.88 16.62 16.88C15.2061 16.88 14.06 18.0262 14.06 19.44C14.06 20.8539 15.2061 22 16.62 22Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
    />
  </Icon>
)

export const RbEntries = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M21.6601 10.44L20.6801 14.62C19.8401 18.23 18.1801 19.69 15.0601 19.39C14.5601 19.35 14.0201 19.26 13.4401 19.12L11.7601 18.72C7.59006 17.73 6.30006 15.67 7.28006 11.49L8.26006 7.30001C8.46006 6.45001 8.70006 5.71001 9.00006 5.10001C10.1701 2.68001 12.1601 2.03001 15.5001 2.82001L17.1701 3.21001C21.3601 4.19001 22.6401 6.26001 21.6601 10.44Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.06 19.39C14.44 19.81 13.66 20.16 12.71 20.47L11.13 20.99C7.15998 22.27 5.06997 21.2 3.77997 17.23L2.49997 13.28C1.21997 9.30998 2.27997 7.20998 6.24997 5.92998L7.82997 5.40998C8.23997 5.27998 8.62997 5.16998 8.99997 5.09998C8.69997 5.70998 8.45997 6.44998 8.25997 7.29998L7.27997 11.49C6.29997 15.67 7.58998 17.73 11.76 18.72L13.44 19.12C14.02 19.26 14.56 19.35 15.06 19.39Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12.64 8.53003L17.49 9.76003'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.66 12.4L14.56 13.14'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbBolt = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M6.08998 13.28H9.17998V20.48C9.17998 22.16 10.09 22.5 11.2 21.24L18.77 12.64C19.7 11.59 19.31 10.72 17.9 10.72H14.81V3.52002C14.81 1.84002 13.9 1.50002 12.79 2.76002L5.21998 11.36C4.29998 12.42 4.68998 13.28 6.08998 13.28Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbConfig = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M22 6.5H16'
      stroke='currentColor'
      strokeMiterlimit='10'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6 6.5H2'
      stroke='currentColor'
      strokeMiterlimit='10'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10 10C11.933 10 13.5 8.433 13.5 6.5C13.5 4.567 11.933 3 10 3C8.067 3 6.5 4.567 6.5 6.5C6.5 8.433 8.067 10 10 10Z'
      stroke='currentColor'
      strokeMiterlimit='10'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M22 17.5H18'
      stroke='currentColor'
      strokeMiterlimit='10'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 17.5H2'
      stroke='currentColor'
      strokeMiterlimit='10'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M14 21C15.933 21 17.5 19.433 17.5 17.5C17.5 15.567 15.933 14 14 14C12.067 14 10.5 15.567 10.5 17.5C10.5 19.433 12.067 21 14 21Z'
      stroke='currentColor'
      strokeMiterlimit='10'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbSearch = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M22 22L20 20'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbSummary = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M8 2V5'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16 2V5'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7 13H15'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7 17H12'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16 3.5C19.33 3.68 21 4.95 21 9.65V15.83C21 19.95 20 22.01 15 22.01H9C4 22.01 3 19.95 3 15.83V9.65C3 4.95 4.67 3.69 8 3.5H16Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbQuestion = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M17 18.4301H13L8.54999 21.39C7.88999 21.83 7 21.3601 7 20.5601V18.4301C4 18.4301 2 16.4301 2 13.4301V7.42999C2 4.42999 4 2.42999 7 2.42999H17C20 2.42999 22 4.42999 22 7.42999V13.4301C22 16.4301 20 18.4301 17 18.4301Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12.0001 11.36V11.15C12.0001 10.47 12.4201 10.11 12.8401 9.82001C13.2501 9.54001 13.66 9.18002 13.66 8.52002C13.66 7.60002 12.9201 6.85999 12.0001 6.85999C11.0801 6.85999 10.3401 7.60002 10.3401 8.52002'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 13.75H12.0045'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbTrash = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M21 5.98001C17.67 5.65001 14.32 5.48001 10.98 5.48001C9 5.48001 7.02 5.58001 5.04 5.78001L3 5.98001'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M18.85 9.14001L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14001'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10.33 16.5H13.66'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9.5 12.5H14.5'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbWarning = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M11.9999 2.01001L21.72 19.25C22.18 19.94 21.73 20.87 20.94 20.87H3.05999C2.26999 20.87 1.81999 19.94 2.27999 19.25L11.9999 2.01001Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 8V13'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 17.01H12.01'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Icon>
)

export const RbEightPointStar = (props: IconProps) => (
  <Icon viewBox='0 0 31 30' {...kDefaultProps} {...props} fill='none'>
    <path
      d='M15.7055 0.152344L17.1371 11.5413L26.2026 4.50039L19.1617 13.5659L30.5507 14.9975L19.1617 16.4291L26.2026 25.4946L17.1371 18.4537L15.7055 29.8427L14.2739 18.4537L5.2084 25.4946L12.2493 16.4291L0.860352 14.9975L12.2493 13.5659L5.2084 4.50039L14.2739 11.5413L15.7055 0.152344Z'
      fill='currentColor'
    />
  </Icon>
)

export const RbCheckmarkAsterisk = (props: IconProps) => (
  <Icon viewBox='0 0 24 24' {...kDefaultProps} {...props} fill='none'>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M18.3471 5.96295C18.8093 6.26519 18.9391 6.88493 18.6368 7.34717L11.8368 17.7472C11.6766 17.9923 11.4169 18.1547 11.1265 18.1918C10.836 18.229 10.5439 18.1368 10.3272 17.9398L5.92718 13.9399C5.51853 13.5684 5.48842 12.9359 5.85992 12.5273C6.23142 12.1186 6.86387 12.0885 7.27253 12.46L10.8047 15.6711L16.9629 6.25268C17.2652 5.79044 17.8848 5.66072 18.3471 5.96295Z'
      fill='currentColor'
    />
    <path
      d='M11.5 4C11.7304 4 11.9165 4.1596 11.9165 4.35714V5.86942L13.3678 5.12277C13.5656 5.02121 13.8207 5.07589 13.9392 5.24554C14.0576 5.41518 13.9939 5.63393 13.796 5.73549L12.3096 6.5L13.7973 7.26563C13.9952 7.36719 14.0589 7.58594 13.9405 7.75558C13.822 7.92522 13.5669 7.97991 13.3691 7.87835L11.9165 7.13058V8.64286C11.9165 8.8404 11.7304 9 11.5 9C11.2696 9 11.0835 8.8404 11.0835 8.64286V7.13058L9.63221 7.87723C9.43437 7.97879 9.17926 7.92411 9.06081 7.75446C8.94237 7.58482 9.00615 7.36607 9.20399 7.26451L10.6904 6.5L9.20269 5.73437C9.00484 5.63281 8.94107 5.41406 9.05951 5.24442C9.17796 5.07478 9.43307 5.02009 9.63091 5.12165L11.0835 5.86942V4.35714C11.0835 4.1596 11.2696 4 11.5 4Z'
      fill='currentColor'
    />
  </Icon>
)
