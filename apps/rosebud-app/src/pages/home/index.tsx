import { ReactElement } from 'react'
import Layout from 'ui/global/Layout'
import HomeComponent from 'ui/pages/home'

const HomePage = () => {
  return <HomeComponent />
}

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout isWide>{page}</Layout>
}

export default HomePage
