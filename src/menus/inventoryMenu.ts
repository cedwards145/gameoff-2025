import { InventoryWindow } from "../windows/inventoryWindow";
import { TextWindow } from "../windows/textWindow";
import { Item } from "../types";

export class InventoryMenu {
    inventory: Item[];
    inventoryWindow: InventoryWindow;
    descriptionWindow: TextWindow;

    constructor(inventory: Item[]) {
        this.inventory = inventory;
        this.inventoryWindow = new InventoryWindow(10, 38, inventory);
        this.descriptionWindow = new TextWindow(
            10,
            10,
            this.inventoryWindow.width,
            24
        );
    }

    update(): void {
        this.inventoryWindow.update();
        const currentItem = this.inventoryWindow.currentItem();
        this.descriptionWindow.text = currentItem ? currentItem.name : "";
        this.descriptionWindow.update();
    }

    draw(context: CanvasRenderingContext2D): void {
        this.inventoryWindow.draw(context);
        this.descriptionWindow.draw(context);
    }
}
