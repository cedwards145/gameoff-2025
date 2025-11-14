import { Window } from "./window";

const LINE_HEIGHT = 16;

export class TextWindow extends Window {
    text: string;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string = ""
    ) {
        super(x, y, width, height);
        this.text = text;
    }

    update(): void {}

    draw(context: CanvasRenderingContext2D): void {
        super.draw(context);
        context.fillStyle = "black";

        const lines = this.text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            context.fillText(
                lines[i],
                this.x + this.padding,
                this.y + this.padding + i * LINE_HEIGHT
            );
        }
    }
}
