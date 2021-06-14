import Head from 'next/head'
import { Container, Heading } from '@chakra-ui/react'

import Header from '../components/Header'

export default function Home() {
  return (
    <>
      <Head>
        <title>MultiSig Interface</title>
        <meta name="description" content="Multisig interface application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Container>
        <Heading as="h1" size="xl">
          TODO: Create a multisig
        </Heading>
      </Container>
    </>
  )
}
