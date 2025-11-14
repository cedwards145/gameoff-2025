import { InventoryWindow } from "../windows/inventoryWindow";
import { TextWindow } from "../windows/textWindow";

class InventoryMenu {
    constructor(inventory) {
        this.inventory = inventory;
        this.inventoryWindow = new InventoryWindow(10, 38, inventory);
        this.descriptionWindow = new TextWindow(10, 10, this.inventoryWindow.width, 24);
    }

    update() {
        this.inventoryWindow.update();
        const currentItem = this.inventoryWindow.currentItem();
        this.descriptionWindow.text = currentItem ? currentItem.name : "";
        this.descriptionWindow.update();
    }

    draw(context) {
        this.inventoryWindow.draw(context);
        this.descriptionWindow.draw(context);
    }
}

export { InventoryMenu };
