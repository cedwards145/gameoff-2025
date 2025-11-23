import { TextWindow } from "../windows/textWindow";
import { Menu } from "./menu";
import { ListWindow } from "../windows/listWindow";
import { Inventory } from "../inventory";
import { getScreenSize } from "../screen";

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
            24,
            24,
            inventory.itemQuantities.map((itemQuantity) => ({
                text: itemQuantity.item.name + " x" + itemQuantity.quantity,
                enabled: true,
            }))
        );
        this.descriptionWindow = new TextWindow(10, 10, 24, 3);

        const screenSize = getScreenSize();
        this.inventoryWindow.centerHorizontallyIn(screenSize);
        this.descriptionWindow.centerHorizontallyIn(screenSize);
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
