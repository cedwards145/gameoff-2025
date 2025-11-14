import { isKeyPressed } from "../input";
import { Window } from "./window";

const SLOTS_ACROSS = 10;
const SLOTS_DOWN = 5;
const ICON_SIZE = 16;

class InventoryWindow extends Window {
    constructor(x, y, inventory) {
        super(x, y, 0, 0);

        this.width = ICON_SIZE * SLOTS_ACROSS + (this.padding * (SLOTS_ACROSS + 1)),
        this.height = ICON_SIZE * SLOTS_DOWN + (this.padding * (SLOTS_DOWN + 1))

        this.inventory = inventory;
        this.index = 0;
    }

    update() {
        if (isKeyPressed(65)) {
            this.index--;
        }
        else if (isKeyPressed(68)) {
            this.index++;
        }
        else if (isKeyPressed(83)) {
            this.index += SLOTS_ACROSS;
        }
        else if (isKeyPressed(87)) {
            this.index -= SLOTS_ACROSS;
        }
    }

    draw(context) {
        super.draw(context);

        for (let x = 0; x < SLOTS_ACROSS; x++) {
            for (let y = 0; y < SLOTS_DOWN; y++) {
                const currentIndex = (y * SLOTS_ACROSS) + x
                context.fillStyle = currentIndex === this.index ? "blue" : "grey";
                context.fillRect(
                    this.x + this.padding + (x * (ICON_SIZE + this.padding)),
                    this.y + this.padding + (y * (ICON_SIZE + 4)),
                    ICON_SIZE,
                    ICON_SIZE
                );
            }
        }
    }

    currentItem() {
        if (this.index < this.inventory.length) {
            return this.inventory[this.index];
        }
        return null;
    }
}

export { InventoryWindow };
