import { Rectangle } from "./types";

const WIDTH = 1280;
const HEIGHT = 720;
const SCALE = 2;

export function getScreenSize(): Rectangle {
    return { x: 0, y: 0, width: WIDTH / SCALE, height: HEIGHT / SCALE };
}

export function getCanvasSize(): Rectangle {
    return { x: 0, y: 0, width: WIDTH, height: HEIGHT };
}

export function getScale(): number {
    return SCALE;
}
