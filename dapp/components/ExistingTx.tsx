import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  List,
  ListItem,
  Spacer,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { Contract, providers, utils } from 'ethers'

import MultiSigJSON from '../artifacts/contracts/MultiSig.sol/MultiSig.json'

interface ExistingTxProps {
  multiSigAddress: string
  txId: string
  confirmations: string
}

function ExistingTx({ multiSigAddress, txId, confirmations }: ExistingTxProps) {
  const { colorMode } = useColorMode()
  const [destination, setDestination] = useState('')
  const [value, setValue] = useState('')
  const [executed, setExecuted] = useState<boolean>()
  const [data, setData] = useState()
  const [confirmedAddresses, setConfirmedAddresses] = useState([])

  useEffect(() => {
    async function getTxInfo(_multiSigAddress: string, _txId: string) {
      try {
        const tx = await getExistingTxInfo(_multiSigAddress, _txId)
        setDestination(tx.destination)
        setValue(tx.value)
        setExecuted(tx.executed)
        setData(tx.data)
        setConfirmedAddresses(tx.confirmedAddresses)
      } catch (err) {
        console.error(err)
      }
    }

    getTxInfo(multiSigAddress, txId)
  }, [txId])

  async function getExistingTxInfo(_multiSigAddress: string, _txId: string): Promise<any> {
    try {
      const provider = new providers.Web3Provider((window as any).ethereum)
      const contract = new Contract(_multiSigAddress, MultiSigJSON.abi, provider)
      const tx = await contract.transactions(_txId)
      const confirmations = await contract.getConfirmations(_txId)

      return {
        destination: tx.destination,
        value: utils.formatEther(tx.value),
        executed: tx.executed,
        data: tx.data,
        confirmedAddresses: confirmations,
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function confirmTransaction(_multiSigAddress: string, _txId: string) {
    let provider: providers.Web3Provider
    let signer: providers.JsonRpcSigner
    let contract: Contract
    try {
      provider = new providers.Web3Provider((window as any).ethereum)
      signer = provider.getSigner()
      contract = new Contract(_multiSigAddress, MultiSigJSON.abi, provider)
      await contract.connect(signer).confirmTransaction(_txId)
    } catch (err) {
      console.error(err)
    } finally {
      const tx = await getExistingTxInfo(_multiSigAddress, _txId)
      setDestination(tx.destination)
      setValue(tx.value)
      setExecuted(tx.executed)
      setData(tx.data)
      setConfirmedAddresses(tx.confirmedAddresses)
    }
  }

  return (
    <Box mb="5" p="3" rounded="lg" bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}>
      <Heading as="h2" size="md" mb="2">
        Transaction ID: {txId}
      </Heading>
      <Text mb="2">
        Destination: <Code>{destination}</Code>
      </Text>
      <Flex mb="2">
        {value ? (
          <Stat>
            <StatLabel>Value</StatLabel>
            <StatNumber>{value} ETH</StatNumber>
          </Stat>
        ) : null}
        <Spacer />
        {executed !== undefined ? (
          <Stat>
            <StatLabel>Executed</StatLabel>
            <StatNumber>{executed ? '✅ Sent' : '⏱ Pending'}</StatNumber>
          </Stat>
        ) : null}
      </Flex>
      {confirmedAddresses.length > 0 ? (
        <Box mb="3">
          <Text>
            Confirmed Addresses ({confirmedAddresses.length} out of {confirmations})
          </Text>
          <List>
            {confirmedAddresses.map((address) => (
              <ListItem key={address}>
                <Code>{address}</Code>
              </ListItem>
            ))}
          </List>
        </Box>
      ) : null}
      {!executed ? (
        <Button colorScheme="orange" onClick={() => confirmTransaction(multiSigAddress, txId)}>
          Confirm Transaction
        </Button>
      ) : null}
    </Box>
  )
}

export default ExistingTx
