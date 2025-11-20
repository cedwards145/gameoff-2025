import { IntGridLayer, Level } from "./ldtk/types";
import { Position } from "./types";
import map from "./map.json";

export function findPassabilityLayer(level: Level): IntGridLayer {
    for (let index = 0; index < level.layerInstances.length; index++) {
        const layer = level.layerInstances[index];
        if ("intGridCsv" in layer) {
            return layer;
        }
    }

    throw "No passability layer found";
}

export function isTilePassable(passability: IntGridLayer, x: number, y: number): boolean {
    return passability.intGridCsv[(y * passability.__cWid) + x] !== 0;
}

function positionToIndex(x: number, y: number, width: number): number {
    return (y * width) + x;
}

function indexToPosition(index: number, width: number): Position {
    const y = Math.floor(index / width);
    const x = index % width;
    return { x: x, y: y };
}


export function findPath(level: Level, from: Position, to: Position): Position[] {
    console.log("Starting pathfinding from {" + from.x + ", " + from.y + "} to { " + to.x + ", " + to.y + "}");
    const passability = findPassabilityLayer(level);
    const start = positionToIndex(from.x, from.y, passability.__cWid);
    const goal = positionToIndex(to.x, to.y, passability.__cWid);

    const gScore: Record<number, number> = {};
    gScore[start] = 0
    
    const fScore: Record<number, number> = {};
    fScore[start] = 0

    const cameFrom: Record<number, number> = {};
    const openSet: number[] = [start];

    function findBestNode(openSet: number[]): number {
        return openSet[0];
    }

    function findNeighbours(index: number): number[] {
        const position = indexToPosition(index, passability.__cWid);
        const neighbours = [];

        if (isTilePassable(passability, position.x + 1, position.y)) {
            neighbours.push(positionToIndex(position.x + 1, position.y, passability.__cWid));
        }
        if (isTilePassable(passability, position.x - 1, position.y)) {
            neighbours.push(positionToIndex(position.x - 1, position.y, passability.__cWid));
        }
        if (isTilePassable(passability, position.x, position.y + 1)) {
            neighbours.push(positionToIndex(position.x, position.y + 1, passability.__cWid));
        }
        if (isTilePassable(passability, position.x, position.y - 1)) {
            neighbours.push(positionToIndex(position.x, position.y - 1, passability.__cWid));
        }

        return neighbours;
    }

    function buildPath(): Position[] {
        let current = goal;
        const path = [];
        
        while (current) {
            path.push(indexToPosition(current, passability.__cWid));
            if (current == start) {
                break;
            }
            current = cameFrom[current];
        }

        return path.reverse();
    }

    function h(index: number): number {
        const position = indexToPosition(index, passability.__cWid);
        return Math.abs(position.x - to.x) + (position.y - to.y);
    }

    while (openSet.length > 0) {
        const current = findBestNode(openSet);
        // console.log(indexToPosition(current, passability.__cWid));
        const index = openSet.indexOf(current);
        openSet.splice(index, 1);

        if (current === goal) {
            return buildPath();
        }

        const neighbours = findNeighbours(current);

        for (let neighbourIndex = 0; neighbourIndex < neighbours.length; neighbourIndex++) {
            const neighbour = neighbours[neighbourIndex];
            const tentativeG = gScore[current] + 1;

            if (!gScore[neighbour] || tentativeG < gScore[neighbour]) {
                cameFrom[neighbour] = current;
                gScore[neighbour] = tentativeG;
                fScore[neighbour] = tentativeG + h(neighbour);

                if (openSet.filter(index => index === neighbour).length === 0) {
                    openSet.push(neighbour)
                }
            }
        }
    }

    console.log("No path found");
    return [];
}

// findPath(map.levels[0], {x: 3, y: 4}, {x: 5, y: 4});
