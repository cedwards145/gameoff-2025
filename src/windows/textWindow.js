import { Window } from "./window";

const LINE_HEIGHT = 16;

class TextWindow extends Window {
    constructor(x, y, width, height, text="") {
        super(x, y, width, height);
        this.text = text;
    }

    update() {}

    draw(context) {
        super.draw(context);
        context.fillStyle = "black";

        const lines = this.text.split('\n');
        for (var i = 0; i<lines.length; i++) {
            context.fillText(lines[i], this.x + this.padding, this.y + this.padding + (i * LINE_HEIGHT));
        }
    }
}

export { TextWindow };
