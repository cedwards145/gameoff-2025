
import { Rectangle } from "../types";
import { Size, UINode } from "./node";
import { WINDOW_COLOR } from "./theme";

const PADDING = 12;

export class Panel extends UINode {
    constructor(private children: UINode[]=[]) {
        super();
    }

    measure(bounds: Rectangle, context: CanvasRenderingContext2D): Size {
        return bounds;
    }

    draw(context: CanvasRenderingContext2D, bounds: Rectangle): void {
        context.save();
        context.shadowColor = "rgba(0, 0, 0, 0.6)";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 8;
        context.shadowBlur = 24;
        context.beginPath();
        context.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, 16);

        context.fillStyle = WINDOW_COLOR;
        context.fill();
        context.restore();

        const remainingBounds = {
            x: bounds.x + PADDING,
            y: bounds.y + PADDING,
            width:bounds.width - (PADDING * 2),
            height: bounds.height - (PADDING * 2)
        };

        for (let index = 0; index < this.children.length; index++) {
            const child = this.children[index];
            const size = child.measure(remainingBounds, context);
            child.draw(context, remainingBounds);

            remainingBounds.y += size.height;
            remainingBounds.height -= size.height;
        }
    }
}