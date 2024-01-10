import { Button, Box } from '@chakra-ui/react'
import { kViewPadding } from 'ui/constants'
import Layout from 'ui/global/Layout'
import EmptyPageState from '../EmptyPageState'

const GlobalErrorBoundary = () => (
  <Layout hideNav h='full'>
    <Box mt={kViewPadding}>
      <EmptyPageState
        icon={<>🛑</>}
        header={'There was an issue loading this page.'}
        label={
          'Please reload the page or click refresh below and contact us if the issue persists.'
        }
        afterElement={
          <Button
            onClick={() => window.location.reload()}
            variant='primary'
            _hover={{
              background: 'brand.500',
              color: 'white',
            }}
            size='md'
          >
            Reload
          </Button>
        }
      />
    </Box>
  </Layout>
)

export default GlobalErrorBoundary
