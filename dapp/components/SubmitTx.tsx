import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { Formik, Form, Field } from 'formik'
import { BigNumber, Contract, providers, utils } from 'ethers'

import MultiSigJSON from '../artifacts/contracts/MultiSig.sol/MultiSig.json'

interface SubmitTxInterface {
  multiSigAddress: string
}

function validateAddress(address: string) {
  let error

  if (!address || !utils.isAddress(address)) {
    error = 'Invalid address'
  }

  return error
}

function validateValue(value: string) {
  let error

  if (!value || !utils.parseEther(value)) {
    error = 'Invalid amount'
  }

  return error
}

function SubmitTx({ multiSigAddress }: SubmitTxInterface) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const initialValues = { destination: '', value: '' }

  async function createTransaction(values: any, actions: any) {
    try {
      const provider = new providers.Web3Provider((window as any).ethereum)
      const signer = provider.getSigner()
      const contract = new Contract(multiSigAddress, MultiSigJSON.abi, provider)
      const ether = utils.parseEther(values.value).toString()
      await contract.connect(signer).submitTransaction(values.destination, ether, '0x')
    } catch (err) {
      console.error(err)
    } finally {
      onClose()
    }
  }

  return (
    <>
      <Button colorScheme="green" onClick={onOpen}>
        Create Transaction
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a Transaction</ModalHeader>
          <ModalCloseButton />
          <Formik initialValues={initialValues} onSubmit={createTransaction}>
            {(props) => (
              <Form>
                <ModalBody pb={6}>
                  <Field name="destination" validate={validateAddress}>
                    {({ field, form }: any) => (
                      <FormControl isInvalid={form.errors.destination && form.touched.destination}>
                        <FormLabel htmlFor="destination">Destination</FormLabel>
                        <Input {...field} id="destination" placeholder="0x..." />
                        <FormErrorMessage>{form.errors.destination}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="value" validate={validateValue}>
                    {({ field, form }: any) => (
                      <FormControl mt={4} isInvalid={form.errors.value && form.touched.value}>
                        <FormLabel htmlFor="value">Value (ETH)</FormLabel>
                        {/* TODO: Enable validation to prevent unwanted chars */}
                        <Input {...field} id="value" placeholder="4.2069" />
                        <FormErrorMessage>{form.errors.value}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    type="submit"
                    isLoading={props.isSubmitting}
                    isDisabled={!props.isValid || (!props.touched.destination && !props.touched.value)}
                  >
                    Submit
                  </Button>
                  <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SubmitTx
