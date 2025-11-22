import { getImageResource } from "../resources";

export class Window {
    x: number;
    y: number;
    width: number;
    height: number;
    padding: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.padding = 8;
    }

    update(): void {}

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
        context.rect(
            this.x + this.padding,
            this.y + this.padding,
            this.width * 8 - this.padding * 2,
            this.height * 8 - this.padding * 2
        );
        context.clip();
    }

    draw(context: CanvasRenderingContext2D): void {
        const ui = getImageResource("ui");
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const source = this.sourceFromCoords(x, y);
                context.drawImage(
                    ui,
                    source.x + 5 * 32,
                    source.y + 2 * 32,
                    8,
                    8,
                    this.x + x * 8,
                    this.y + y * 8,
                    8,
                    8
                );
            }
        }
    }
}
