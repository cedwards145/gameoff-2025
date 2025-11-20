export interface GridTile {
    px: number[];
    src: number[];
}

export interface IntGridLayer {
    __cWid: number
    __cHei: number
    intGridCsv: number[]
}

export interface TileLayer {
    gridTiles: GridTile[]
}

export type Layer = IntGridLayer | TileLayer

export interface Level {
    layerInstances: Layer[]
}

export interface TileMap {
    levels: Level[]
}
