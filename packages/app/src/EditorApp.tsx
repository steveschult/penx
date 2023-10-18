import { FC, PropsWithChildren, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Provider } from 'jotai'
import { useAccount } from 'wagmi'
import { CatalogueNodeType, CatalogueTree } from '@penx/catalogue'
import { isServer } from '@penx/constants'
import { emitter } from '@penx/event'
import { appLoader, useLoaderStatus } from '@penx/loader'
import { db } from '@penx/local-db'
import { JotaiNexus, spacesAtom, store } from '@penx/store'
import { trpc } from '@penx/trpc-client'
import { ClientOnly } from './components/ClientOnly'
import { EditorLayout } from './EditorLayout/EditorLayout'
import { HotkeyBinding } from './HotkeyBinding'
import { WorkerStarter } from './WorkerStarter'

if (!isServer) {
  appLoader.init()

  emitter.on('ADD_DOCUMENT', () => {
    const spaces = store.get(spacesAtom)
    const activeSpace = spaces.find((space) => space.isActive)!

    // TODO:
    store.createDoc()
  })
}

export const EditorApp: FC<PropsWithChildren> = ({ children }) => {
  const { isLoaded } = useLoaderStatus()
  const { address = '' } = useAccount()
  const createRef = useRef(false)

  useEffect(() => {
    if (!address || createRef.current) return

    trpc.user.create.mutate({ address })

    createRef.current = true
  }, [address])

  useEffect(() => {
    persist()
      .then((d) => {
        //
      })
      .catch((e) => {
        //
      })
  }, [])

  if (!isLoaded) {
    return null
  }

  return (
    <ClientOnly>
      <Provider store={store}>
        <WorkerStarter />
        <HotkeyBinding />
        <JotaiNexus />
        <EditorLayout />
      </Provider>
    </ClientOnly>
  )
}

async function persist() {
  if (navigator.storage && navigator.storage.persist) {
    return navigator.storage.persist()
  }
}
