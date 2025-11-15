import { isKeyPressed } from "../input";
import { Window } from "./window";
import { KeyCode } from "../types";

const ROW_HEIGHT = 16;

interface Choice {
    text: string;
    enabled: boolean;
}

export class ListWindow extends Window {
    choices: Choice[];
    index: number;
    onSelect?: (index: number) => void;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        choices: Choice[]
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
            const choice = this.choices[this.index];
            if (choice && choice.enabled) {
                this.onSelect?.(this.index);
            }
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

            const choice = this.choices[currentIndex];

            context.fillStyle = choice.enabled ? "black" : "red";
            context.fillText(
                choice.text,
                this.x + this.padding * 2,
                this.y +
                    this.padding * 2 +
                    currentIndex * (ROW_HEIGHT + this.padding)
            );
        }
    }
}
