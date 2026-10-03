import { UINode } from "./node";
import { Rectangle } from "../types";

export class UITree {
    constructor(private root: UINode) { }

    update(dt: number) { }

    draw(context: CanvasRenderingContext2D, bounds: Rectangle): void {
        this.root.draw(context, bounds);
    }
}