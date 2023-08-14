import { ChangeEvent, FC, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { NativeMintButton } from '../../elements/NativeMintButton'
import { MintType, ModalPage, siteDataSuffix } from '../../types'
import { Button } from '@/components/Button'
import { Pending } from '../../elements/Pending'
import clsx from 'clsx'
import { TxDetails } from '../../MintDialog'
import { useMintDialogContext } from '../../Context/useMintDialogContext'
import { AddressPill } from '@/components/AddressPill'
import { PartnerInfo } from '../../elements/PartnerInfo'

import { MintDotFunMinter } from '../../elements/MintDotFunMinter'
import dialogClasses from '@/components/dialog.module.css'
import { l2 } from '@/config/chain'
import { Quantity } from '../../elements/Quantity'
import { Address, useNetwork, useSwitchNetwork } from 'wagmi'
import ReactMarkdown from 'react-markdown'
interface NativeMintProps {
  page: ModalPage
  setPage: React.Dispatch<ModalPage>
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  totalPrice: string
  txDetails: TxDetails | null
  setTxDetails: React.Dispatch<React.SetStateAction<TxDetails | null>>
  setMintError: React.Dispatch<React.SetStateAction<any | null>>
  insufficientFunds: boolean
}

export const NativeMint: FC<NativeMintProps> = ({
  page,
  setPage,
  quantity,
  setQuantity,
  totalPrice,
  txDetails,
  setTxDetails,
  setMintError,
  insufficientFunds,
}) => {
  const { switchNetwork } = useSwitchNetwork()
  const network = useNetwork()

  const wrongChain = network.chain?.id !== l2.id
  const {
    info: {
      creatorAddress,
      dropName,
      crossMintClientId,
      mintDotFunStatus,
      dropDataSuffix,
    },
    setInfo,
  } = useMintDialogContext()
  const isPendingConfirmation =
    page === ModalPage.NATIVE_MINT_PENDING_CONFIRMATION
  const isPendingTx = page === ModalPage.NATIVE_MINTING_PENDING_TX
  const isPending = isPendingConfirmation || isPendingTx

  const isMintDotFun = typeof mintDotFunStatus === 'object'

  const handleDataSuffixChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInfo((prevState) => ({
        ...prevState,
        dataSuffix: e.target.checked ? dropDataSuffix!.value : siteDataSuffix,
      }))
    },
    [dropDataSuffix, setInfo]
  )

  return (
    <>
      {!isPending ? <PartnerInfo /> : null}
      {/* TODO: Add Coinbase Display font */}
      <Dialog.Title
        className={clsx('desktop-h2', 'lg:mt-2', {
          hidden: isPending,
        })}
      >
        {isPending ? 'Mint Tx Pending' : dropName}
      </Dialog.Title>

      <Pending
        isPendingTx={isPendingTx}
        isPendingConfirmation={isPendingConfirmation}
        txHash={txDetails?.hash}
      />

      <div
        className={clsx('flex flex-col w-full gap-4', { hidden: isPending })}
      >
        <Dialog.Description className="flex flex-col w-full gap-4 desktop-body">
          <AddressPill address={creatorAddress as Address} />
          <Quantity quantity={quantity} setQuantity={setQuantity} />
          <span className="text-button-text-text flex justify-between mb-4">
            <span>
              {quantity} NFT{quantity > 1 ? 's' : ''}
            </span>
            <span>{totalPrice} ETH</span>
          </span>
        </Dialog.Description>

        {dropDataSuffix && (
          <div className="flex mt-5">
            <input
              onChange={handleDataSuffixChange}
              id="dataSuffix"
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:bg-ocs-blue focus:ring-2"
            />
            <label
              htmlFor="dataSuffix"
              className="ml-2 desktop-body text-[14px] text-gray-900"
            >
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} className="font-medium" target="_blank" />
                  ),
                }}
              >
                {dropDataSuffix.label}
              </ReactMarkdown>
            </label>
          </div>
        )}

        {wrongChain && switchNetwork ? (
          <Button onClick={() => switchNetwork(l2.id)}>Switch to Base</Button>
        ) : insufficientFunds ? (
          <Button onClick={() => setPage(ModalPage.INSUFFICIENT_FUNDS)}>
            Mint ({totalPrice} ETH)
          </Button>
        ) : isMintDotFun ? (
          <MintDotFunMinter
            totalPrice={totalPrice}
            setTxDetails={setTxDetails}
            setPage={setPage}
          />
        ) : (
          <NativeMintButton
            page={page}
            setPage={setPage}
            quantity={quantity}
            totalPrice={totalPrice}
            setTxDetails={setTxDetails}
            setMintError={setMintError}
          />
        )}

        {!isMintDotFun && crossMintClientId ? (
          <Button
            variant="LIGHT"
            onClick={() => {
              setPage(ModalPage.CROSS_MINT_FORM)
            }}
          >
            Buy with credit card
          </Button>
        ) : null}
      </div>
    </>
  )
}
