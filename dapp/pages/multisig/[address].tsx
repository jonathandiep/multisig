import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { BigNumber, Contract, providers, utils } from 'ethers'
import {
  Box,
  Code,
  Container,
  Flex,
  Heading,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  OrderedList,
  Spacer,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react'

import MultiSigJSON from '../../artifacts/contracts/MultiSig.sol/MultiSig.json'

import Header from '../../components/Header'
import ExistingTx from '../../components/ExistingTx'
import SubmitTx from '../../components/SubmitTx'

interface MultiSigProps {
  id: string
}

export default function Multisig({ id }: MultiSigProps) {
  const [balance, setBalance] = useState('')
  const [confirmations, setConfirmations] = useState('')
  const [owners, setOwners] = useState<string[]>([])
  const [existingTxs, setExistingTxs] = useState<BigNumber[]>([])

  useEffect(() => {
    const provider = new providers.Web3Provider((window as any).ethereum)
    const contract = new Contract(id, MultiSigJSON.abi, provider)
    updateMultiSigInfo(provider, contract)
    updateExistingTxs(contract)
    setContractListeners(provider, contract)
  }, [id])

  async function updateMultiSigInfo(provider: providers.Web3Provider, contract: Contract) {
    try {
      const multiSigBalance = utils.formatEther(await provider.getBalance(contract.address))
      const multiSigConfirmations = (await contract.required()).toString()
      const multiSigOwners = await contract.getOwners()
      setBalance(multiSigBalance)
      setConfirmations(multiSigConfirmations)
      setOwners(multiSigOwners)
    } catch (err) {
      console.error(err)
    }
  }

  async function updateExistingTxs(contract: Contract, pending = true, executed = true) {
    try {
      // Hacky way to get interface to update. Find something better
      setExistingTxs([])
      const txs = await contract.getTransactionIds(pending, executed)
      setExistingTxs(txs)
    } catch (err) {
      console.error(err)
    }
  }

  async function setContractListeners(provider: providers.Web3Provider, contract: Contract) {
    const code = await provider.getCode(contract.address)
    const initBlockNumber = await provider.getBlockNumber()

    if (code !== '0x') {
      contract.on('Confirmation', (sender, txId, event) => {
        if (event.blockNumber > initBlockNumber) {
          updateExistingTxs(contract)
        }
      })

      contract.on('Submission', (txId, event) => {
        if (event.blockNumber > initBlockNumber) {
          updateExistingTxs(contract)
        }
      })

      contract.on('Execution', (txId, event) => {
        if (event.blockNumber > initBlockNumber) {
          updateMultiSigInfo(provider, contract)
          updateExistingTxs(contract)
        }
      })

      contract.on('Deposit', (sender, value, event) => {
        if (event.blockNumber > initBlockNumber) {
          updateMultiSigInfo(provider, contract)
        }
      })
    }
  }

  return (
    <>
      <Header />
      <Container maxW="container.lg">
        <Flex flexWrap="wrap">
          <Box mb="5">
            <Heading as="h2" size="lg" mb="3">
              Contract Information
            </Heading>
            <Text mb="3">
              Address: <Code>{id}</Code>
            </Text>
            <Flex mb="3">
              {balance ? (
                <Stat>
                  <StatLabel>Balance</StatLabel>
                  <StatNumber>{balance} ETH</StatNumber>
                </Stat>
              ) : null}
              <Spacer />
              {confirmations ? (
                <Stat>
                  <StatLabel>Confirmations</StatLabel>
                  <StatNumber>{confirmations}</StatNumber>
                </Stat>
              ) : null}
            </Flex>
            {owners.length > 0 ? (
              <Box mb="5">
                <Text fontSize="md">Owners ({owners.length}):</Text>
                <OrderedList spacing="1">
                  {owners.map((owner) => (
                    <ListItem key={owner}>
                      <Code>{owner}</Code>
                    </ListItem>
                  ))}
                </OrderedList>
              </Box>
            ) : null}
            <SubmitTx multiSigAddress={id} />
          </Box>
          {existingTxs.length > 0 ? (
            <>
              <Spacer />
              <Box>
                <Heading as="h2" size="lg" mb="3">
                  Existing Transactions
                </Heading>
                {existingTxs.map((tx) => (
                  <ExistingTx
                    key={tx.toString()}
                    multiSigAddress={id}
                    txId={tx.toString()}
                    confirmations={confirmations}
                  />
                ))}
              </Box>
            </>
          ) : null}
        </Flex>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const props = {
    id: params?.address,
  }

  return {
    props,
  }
}
