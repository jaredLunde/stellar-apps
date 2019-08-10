import React from 'react'
import {Helmet} from 'react-helmet-async'
import {Spinner} from '@jaredlunde/curls-addons'
import {Text, Box} from 'curls'
import {useQuery} from 'react-apollo'
import gql from 'graphql-tag'


const Home = props => {
  const {loading, error, data} = useQuery(gql`{hello}`)
  if (error) throw error

  return (
    <Box flex column bg='black' minH='100vh' w='100%' align='center'>
      <Helmet>
        <title>
          <:PKG_NAME:></title>
      </Helmet>

      <Text center ultraLight w='100%' d='block' color='white' size='xl@desktop lg@phone'>
        Hello world
      </Text>

      {loading ? 'Loading...' : (
        <Text light center w='100%' d='block' color='white' m='t3' size='md'>
          SSR
          <Text as='pre'>
            {JSON.stringify(data.hello)}
          </Text>
        </Text>
      )}
    </Box>
  )
}

export default Home