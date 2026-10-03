import { Rectangle } from "../types";

export interface Size {width: number, height: number };

export abstract class UINode {
    update (dt: number) { }
    abstract measure(bounds: Rectangle, context: CanvasRenderingContext2D): Size;
    abstract draw(context: CanvasRenderingContext2D, bounds: Rectangle): void
}