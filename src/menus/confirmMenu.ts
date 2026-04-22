import { getScreenSize } from "../screen";
import { ListWindow } from "../windows/listWindow";
import { Menu } from "./menu";

export class ConfirmMenu extends Menu {
    choiceWindow: ListWindow;
    onConfirm?: () => void;
    onReject?: () => void;

    constructor() {
        super();
        this.choiceWindow = new ListWindow(0, 150, 20, 7, [
            { text: "Yes", enabled: true },
            { text: "No", enabled: true },
        ]);
        this.choiceWindow.onSelect = (index) => {
            if (index === 0) {
                this.onConfirm?.();
            } else {
                this.onReject?.();
            }
        };

        this.choiceWindow.centerHorizontallyIn(getScreenSize());
    }

    update() {
        super.update();
        this.choiceWindow.update();
    }

    draw(context: CanvasRenderingContext2D) {
        this.choiceWindow.draw(context);
    }
}
