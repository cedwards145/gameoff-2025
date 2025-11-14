import { isKeyPressed } from "../input";
import { Window } from "./window";
import { KeyCode } from "../types";

const ROW_HEIGHT = 16;

export class ListWindow extends Window {
    choices: string[];
    index: number;
    onSelect?: (index: number) => void;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        choices: string[]
    ) {
        super(x, y, width, height);
        this.choices = choices;
        this.index = 0;
    }

    update(): void {
        if (isKeyPressed(KeyCode.W)) {
            this.index--;
        } else if (isKeyPressed(KeyCode.S)) {
            this.index++;
        }

        if (isKeyPressed(KeyCode.E)) {
            this.onSelect?.(this.index);
        }
    }

    draw(context: CanvasRenderingContext2D): void {
        super.draw(context);

        context.font = "10px sans";

        for (
            let currentIndex = 0;
            currentIndex < this.choices.length;
            currentIndex++
        ) {
            if (currentIndex === this.index) {
                context.fillStyle = "blue";
                context.fillRect(
                    this.x + this.padding,
                    this.y +
                        this.padding +
                        currentIndex * (ROW_HEIGHT + this.padding),
                    this.width - this.padding * 2,
                    ROW_HEIGHT
                );
            }

            context.fillStyle = "black";
            context.fillText(
                this.choices[currentIndex],
                this.x + this.padding * 2,
                this.y +
                    this.padding * 2 +
                    currentIndex * (ROW_HEIGHT + this.padding)
            );
        }
    }
}
