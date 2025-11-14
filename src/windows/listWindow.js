import { isKeyPressed } from "../input";
import { Window } from "./window";

const ROW_HEIGHT = 16;

class ListWindow extends Window {
    constructor(x, y, width, height, choices) {
        super(x, y, width, height);

        this.choices = choices;
        this.index = 0;
    }

    update() {
        if (isKeyPressed(87)) {
            this.index--;
        }
        else if (isKeyPressed(83)) {
            this.index++;
        }
    }

    draw(context) {
        super.draw(context);
        
        context.font = "10px sans";

        for (let currentIndex = 0; currentIndex < this.choices.length; currentIndex++) {
            if (currentIndex === this.index) {
                context.fillStyle = "blue";
                context.fillRect(
                    this.x + this.padding,
                    this.y + this.padding + (currentIndex * (ROW_HEIGHT + this.padding)),
                    this.width - (this.padding * 2),
                    ROW_HEIGHT
                );
            }

            context.fillStyle = "black";
            context.fillText(this.choices[currentIndex], this.x + (this.padding * 2), this.y + (this.padding * 2) + (currentIndex * (ROW_HEIGHT + this.padding)))

        }
    }
}

export { ListWindow };
