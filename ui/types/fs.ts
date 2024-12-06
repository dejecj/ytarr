interface BaseFolder {
    path: string
}

export interface FSFolder extends BaseFolder {
    name: string
}

export interface RootFolder extends BaseFolder {
    id: string
    free_space?: string,
    created: string
    updated: string
    collectionId: string
    collectionName: string
    deleting?: boolean
}

export interface CreateRootFolder extends BaseFolder {}