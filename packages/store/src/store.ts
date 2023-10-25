import { atom, createStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { SyncStatus } from '@penx/constants'
import { emitter } from '@penx/event'
import { db } from '@penx/local-db'
import { User } from '@penx/model'
import {
  Command,
  ExtensionStore,
  INode,
  ISpace,
  NodeStatus,
  RouteName,
  RouterStore,
} from '@penx/types'

// export const nodeAtom = atomWithStorage('node', null as any as INode)
export const nodeAtom = atom(null as any as INode)
export const nodesAtom = atom<INode[]>([])

export const spacesAtom = atom<ISpace[]>([])

export const syncStatusAtom = atom<SyncStatus>(SyncStatus.NORMAL)

export const commandsAtom = atom<Command[]>([
  {
    id: 'add-document',
    name: 'Add document',
    handler: () => {
      emitter.emit('ADD_DOCUMENT')
    },
  },

  {
    id: 'export-to-markdown',
    name: 'export to markdown',
    handler: () => {
      emitter.emit('ADD_DOCUMENT')
    },
  },
])

export const routerAtom = atomWithStorage('Router', {
  name: 'NODE',
} as RouterStore)

export const extensionStoreAtom = atom<ExtensionStore>({})

export const userAtom = atom<User>(null as any as User)

export const store = Object.assign(createStore(), {
  getSpaces() {
    return store.get(spacesAtom)
  },

  getActiveSpace() {
    const spaces = store.getSpaces()
    return spaces.find((space) => space.isActive)!
  },

  setSpaces(spaces: ISpace[]) {
    return store.set(spacesAtom, spaces)
  },

  getNodes() {
    return store.get(nodesAtom)
  },

  setNodes(nodes: INode[]) {
    return store.set(nodesAtom, nodes)
  },

  getNode() {
    return store.get(nodeAtom)
  },

  setNode(node: INode) {
    return store.set(nodeAtom, node)
  },

  getUser() {
    return store.get(userAtom)
  },

  setUser(user: User) {
    return store.set(userAtom, user)
  },

  routeTo(name: RouteName, params: Record<string, any> = {}) {
    const current = store.get(routerAtom)
    if (name === current.name) return
    return store.set(routerAtom, {
      name,
      params,
    })
  },

  async trashNode(id: string) {
    const space = this.getActiveSpace()
    await db.trashNode(id)

    const nodes = await db.listNodesBySpaceId(space.id)

    const normalNodes = nodes.filter(
      (node) => node.status === NodeStatus.NORMAL,
    )

    if (normalNodes.length) {
      this.reloadNode(normalNodes[0])
    } else {
      this.routeTo('ALL_DOCS')
    }
    this.setNodes(nodes)
  },

  async selectNode(node: INode) {
    this.routeTo('NODE')
    this.reloadNode(node)
    await db.updateSpace(this.getActiveSpace().id, {
      activeNodeId: node.id,
    })
  },

  async restoreNode(id: string) {
    const space = this.getActiveSpace()
    await db.restoreNode(id)
    const nodes = await db.listNodesBySpaceId(space.id)
    const normalNodes = nodes.filter(
      (node) => node.status === NodeStatus.NORMAL,
    )
    this.setNode(normalNodes[0])
    this.setNodes(nodes)
  },

  async deleteNode(id: string) {
    const space = this.getActiveSpace()
    await db.deleteNode(id)
    const nodes = await db.listNodesBySpaceId(space.id)
    const normalNodes = nodes.filter(
      (node) => node.status === NodeStatus.NORMAL,
    )
    this.setNode(normalNodes[0])
    this.setNodes(nodes)
  },

  reloadNode(node: INode) {
    this.setNode(null as any)

    // for rerender editor
    setTimeout(() => {
      this.setNode(node)
    }, 0)
  },

  async createPageNode() {
    const space = this.getActiveSpace()
    const node = await db.createPageNode({ spaceId: space.id })
    await db.updateSpace(space.id, { activeNodeId: node.id })
    const nodes = await db.listNormalNodes(space.id)
    this.routeTo('NODE')

    this.setNodes(nodes)
    this.reloadNode(node)
  },

  async createSpace(name: string) {
    const space = await db.createSpace({ name })
    const spaces = await db.listSpaces()
    this.setSpaces(spaces)
    const nodeId = space.children[0]
    const node = await db.getNode(nodeId)
    this.reloadNode(node)
    return space
  },
})
