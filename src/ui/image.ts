import { getImageResource } from "../resources";
import { Rectangle } from "../types";
import { Size, UINode } from "./node";

export class Image extends UINode {
    constructor(private imageKey: string, private height: number | undefined = undefined, private width: number | undefined = undefined) {
        super();
    }

    measure(bounds: Rectangle, _context: CanvasRenderingContext2D): Size {
        return {
            height: this.height ?? bounds.height,
            width: this.width ?? bounds.width
        }
    }

    draw(context: CanvasRenderingContext2D, bounds: Rectangle): void {
        const image = getImageResource(this.imageKey);
        const size = this.measure(bounds, context);

        context.drawImage(image, bounds.x, bounds.y, size.width, size.height);
    }
}
