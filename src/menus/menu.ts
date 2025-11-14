import { isKeyPressed } from "../input";
import { KeyCode } from "../types";

export class Menu {
    onClose?: (menu: Menu) => void;

    constructor() {}

    update() {
        if (isKeyPressed(KeyCode.ESCAPE)) {
            this.onClose?.(this);
        }
    }

    draw(context: CanvasRenderingContext2D) {}
}
