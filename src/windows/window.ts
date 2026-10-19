import { Rectangle } from "../types";

export class Window {
    x: number;
    y: number;
    width: number;
    height: number;
    padding: number;
    pixelWidth: number;
    pixelHeight: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.pixelWidth = width * 8;
        this.pixelHeight = height * 8;
        this.padding = 8;
    }

    update(): void { }

    sourceFromCoords(x: number, y: number) {
        if (x === 0 && y === 0) {
            return { x: 0, y: 0 };
        } else if (x === this.width - 1 && y === 0) {
            return { x: 24, y: 0 };
        } else if (x === 0 && y == this.height - 1) {
            return { x: 0, y: 24 };
        } else if (x === this.width - 1 && y === this.height - 1) {
            return { x: 24, y: 24 };
        } else if (x === 0) {
            return { x: 0, y: 8 };
        } else if (x === this.width - 1) {
            return { x: 24, y: 16 };
        } else if (y === 0) {
            return { x: 16, y: 0 };
        } else if (y === this.height - 1) {
            return { x: 8, y: 24 };
        } else {
            return { x: 8, y: 8 };
        }
    }

    clip(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.rect(
            this.x + this.padding,
            this.y + this.padding,
            this.width * 8 - this.padding * 2,
            this.height * 8 - this.padding * 2
        );
        context.clip();
    }

    draw(context: CanvasRenderingContext2D): void {
        context.save();
        context.shadowColor = "rgba(0, 0, 0, 0.6)";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 8;
        context.shadowBlur = 24;
        context.beginPath();
        context.roundRect(this.x, this.y, this.width * 8, this.height * 8, 16);

        context.fillStyle = "lightgray"
        context.fill();
        context.restore();
    }

    centerHorizontallyIn(rect: Rectangle) {
        const xPadding = rect.width - this.pixelWidth;
        this.x = xPadding / 2;
    }
}
