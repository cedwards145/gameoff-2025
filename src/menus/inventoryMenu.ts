import { InventoryWindow } from "../windows/inventoryWindow";
import { TextWindow } from "../windows/textWindow";
import { Item } from "../types";
import { Menu } from "./menu";

export class InventoryMenu extends Menu {
    inventory: Item[];
    inventoryWindow: InventoryWindow;
    descriptionWindow: TextWindow;

    constructor(inventory: Item[]) {
        super();

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
        super.update();
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
