import { Box, Link, Button, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import navigator from 'lib/routes'
import Layout from 'ui/global/Layout'

const Page404 = () => {
  return (
    <Layout hideMenu showHelp>
      <Box width={{ base: 'auto', md: '400px' }} m='0 auto' pt={[0, 8]}>
        <Text fontSize='38px' color='gray.600' textAlign='center' mb={4}>
          404
        </Text>

        <Text textAlign='center' lineHeight='200%'>
          <Link
            as={NextLink}
            href={navigator.default}
            color='brand.500'
            passHref
            shallow
          >
            <Button size='md' variant='link'>
              Return home
            </Button>
          </Link>
        </Text>
      </Box>
    </Layout>
  )
}

export default Page404
