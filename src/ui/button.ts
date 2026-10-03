import { Rectangle } from "../types";
import { Size, UINode } from "./node";

const PADDING = 8;

export class Button extends UINode {
    constructor(private child: UINode) {
        super();
    }

    measure(bounds: Rectangle, context: CanvasRenderingContext2D): Size {
        const childSize = this.child.measure(bounds, context);
        return {
            width: bounds.width,
            height: childSize.height + (PADDING * 2)
        };
    }

    draw(context: CanvasRenderingContext2D, bounds: Rectangle): void {
        const size = this.measure(bounds, context);
        context.beginPath();
        context.roundRect(bounds.x, bounds.y, size.width, size.height, 16);
        context.fillStyle = "white";
        context.fill();

        return this.child.draw(context, {
            x: bounds.x + PADDING,
            y: bounds.y + PADDING,
            width: size.width,
            height: size.height
        });
    }

}