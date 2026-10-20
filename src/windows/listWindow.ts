import { isKeyPressed } from "../input";
import { Window } from "./window";
import { KeyCode } from "../types";

const ROW_HEIGHT = 20;

interface Choice {
    text: string;
    enabled: boolean;
}

export class ListWindow extends Window {
    choices: Choice[];
    index: number;
    startIndex: number;
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
        this.startIndex = 0;
    }

    update(): void {
        if (this.choices.length >= 2) {
            if (isKeyPressed(KeyCode.W)) {
                this.index--;
                if (this.index < 0) {
                    this.index = this.choices.length - 1;
                    this.startIndex =
                        this.choices.length -
                        Math.floor(this.pixelHeight / ROW_HEIGHT);
                } else if (this.index - this.startIndex < 0) {
                    this.startIndex--;
                }
            } else if (isKeyPressed(KeyCode.S)) {
                this.index++;
                if (this.index >= this.choices.length) {
                    this.index = 0;
                    this.startIndex = 0;
                } else if (
                    this.index - this.startIndex >=
                    Math.floor(this.pixelHeight / ROW_HEIGHT)
                ) {
                    this.startIndex++;
                }
            }
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

        context.save();
        this.clip(context);
        context.font = "10px sans";

        for (
            let currentIndex = this.startIndex;
            currentIndex < this.choices.length;
            currentIndex++
        ) {
            const yIndex = currentIndex - this.startIndex;
            if (currentIndex === this.index) {
                context.fillStyle = "white";
                context.fillRect(
                    this.x + this.padding,
                    this.y + this.padding + yIndex * ROW_HEIGHT,
                    this.width * 8 - this.padding * 2,
                    ROW_HEIGHT
                );
            }

            const choice = this.choices[currentIndex];

            context.fillStyle = choice.enabled ? "black" : "grey";
            context.fillText(
                choice.text,
                this.x + this.padding * 2,
                this.y + this.padding + 4 + yIndex * ROW_HEIGHT
            );
        }

        context.restore();
    }
}
