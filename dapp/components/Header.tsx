import { useEffect, useState } from 'react'
import { Button, Divider, Flex, Heading, IconButton, Input, Spacer, useColorMode } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { providers } from 'ethers'

function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  const [network, setNetwork] = useState('')

  useEffect(() => {
    try {
      const provider = new providers.Web3Provider((window as any).ethereum)
      provider.on('network', (_network) => {
        if (_network.name === 'unknown') {
          setNetwork('local')
        } else if (_network.name === 'homestead') {
          setNetwork('mainnet')
        } else {
          setNetwork(_network.name)
        }
      })
    } catch (err) {
      console.error(err)
    }
  })

  return (
    <>
      <Flex m="5" flexWrap="wrap">
        <Heading as="h1" size="lg">
          MultiSig Interface
        </Heading>
        <Spacer />
        <Flex w="50%">
          <Input type="text" placeholder="Search by Multisig address..." mr="1" />
          <IconButton aria-label="Search database" icon={<SearchIcon />} />
        </Flex>
        <Spacer />
        {network ? (
          <Button mr="1" colorScheme="blue" variant="outline">
            {network}
          </Button>
        ) : null}
        <Button onClick={toggleColorMode}>{colorMode === 'light' ? '🌚' : '🌝'}</Button>
      </Flex>
      <Divider mb="5" />
    </>
  )
}

export default Header
