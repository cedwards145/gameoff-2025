import { Rectangle } from "../types";
import { Size, UINode } from "./node";

export class Grid extends UINode {
    constructor(private rows: number, private columns: number, private children: UINode[]) {
        super();
    }

    measure(bounds: Rectangle, _context: CanvasRenderingContext2D): Size {
        return bounds;
    }

    draw(context: CanvasRenderingContext2D, bounds: Rectangle) {
        const cellWidth = bounds.width / this.rows;
        const cellHeight = bounds.height / this.columns;

        for (let x = 0; x < this.rows; x++) {
            for (let y = 0; y < this.columns; y++) {
                const index = (y * this.rows) + x;
                if (index >= this.children.length) {
                    continue;
                }

                const child = this.children[index]!;
                child.draw(context, {
                    x: bounds.x + (cellWidth * x),
                    y: bounds.y + (cellHeight * y),
                    width: cellWidth,
                    height: cellHeight
                });
            }
        }
    }
}