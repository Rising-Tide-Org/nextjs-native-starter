import {
  Button,
  Divider,
  Heading,
  Image,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'

type Props = {
  content: string
  onButtonClick?: () => void
}

/**
 * To use this component, pass in a markdown string as the `content` prop.
 * To add a button to the markdown, add a link with the href ending in `:button`.
 */

const Markdown = ({ content, onButtonClick }: Props) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ ...props }) => (
          <Heading fontSize='21px' pt={3} pb={1} {...props} />
        ),
        h2: ({ ...props }) => (
          <Heading fontSize='19px' pt={3} pb={1} {...props} />
        ),
        h3: ({ ...props }) => (
          <Heading fontSize='17px' pt={3} pb={1} {...props} />
        ),
        p: ({ ...props }) => <Text my={4} {...props} />,
        img: ({ alt, ...props }) => <Image my={4} alt={alt} {...props} />,
        a: ({ children, href, ...props }) => {
          if (href?.endsWith(':button')) {
            const link = href.split(':')[0]
            return (
              <Link href={link} {...props}>
                <Button variant='primary' mt={4} onClick={onButtonClick}>
                  {children}
                </Button>
              </Link>
            )
          }
          const isExternal = href?.includes('://')
          return (
            <Link
              variant='primary'
              href={href}
              {...props}
              isExternal={isExternal}
              onClick={isExternal ? undefined : () => onButtonClick?.()}
            >
              {children}
            </Link>
          )
        },
        ul: ({ children, ...props }) => (
          <UnorderedList {...props}>{children}</UnorderedList>
        ),
        ol: ({ children, ...props }) => (
          <OrderedList {...props}>{children}</OrderedList>
        ),
        li: ({ children, ...props }) => (
          <ListItem my={2} {...props}>
            {children}
          </ListItem>
        ),
        hr: ({ ...props }) => <Divider my={6} {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default Markdown
