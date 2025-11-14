import { isKeyPressed } from "../input";
import { KeyCode } from "../types";

export class Menu {
    enabled: boolean;
    onClose: ((menu: Menu) => void) | null;

    constructor() {
        this.enabled = false;
        this.onClose = null;
    }

    update() {
        if (isKeyPressed(KeyCode.ESCAPE)) {
            this.onClose?.(this);
        }
    }

    draw(context: CanvasRenderingContext2D) {}
}
