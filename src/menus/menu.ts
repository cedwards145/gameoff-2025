import { isKeyPressed } from "../input";
import { KeyCode } from "../types";

export class Menu {
    onClose?: (menu: Menu) => void;
    onOpenMenu?: (menu: Menu) => void;

    constructor() {}

    update() {
        if (isKeyPressed(KeyCode.ESCAPE)) {
            this.close();
        }
    }

    close() {
        this.onClose?.(this);
    }

    draw(context: CanvasRenderingContext2D) {}
}
