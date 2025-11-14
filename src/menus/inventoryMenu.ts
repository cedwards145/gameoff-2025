import { TextWindow } from "../windows/textWindow";
import { Menu } from "./menu";
import { ListWindow } from "../windows/listWindow";
import { Inventory } from "../inventory";

export class InventoryMenu extends Menu {
    inventory: Inventory;
    inventoryWindow: ListWindow;
    descriptionWindow: TextWindow;

    constructor(inventory: Inventory) {
        super();

        this.inventory = inventory;
        this.inventoryWindow = new ListWindow(
            10,
            40,
            200,
            200,
            inventory.itemQuantities.map(
                (itemQuantity) =>
                    itemQuantity.item.name + " x" + itemQuantity.quantity
            )
        );
        this.descriptionWindow = new TextWindow(10, 10, 200, 24);
    }

    update(): void {
        super.update();
        this.inventoryWindow.update();
        const currentItemQuantity =
            this.inventory.itemQuantities[this.inventoryWindow.index];
        this.descriptionWindow.text = currentItemQuantity?.item.name || "";
        this.descriptionWindow.update();
    }

    draw(context: CanvasRenderingContext2D): void {
        this.inventoryWindow.draw(context);
        this.descriptionWindow.draw(context);
    }
}
