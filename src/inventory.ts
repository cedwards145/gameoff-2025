import { Item, KeyCode, Recipe } from "./types";

interface ItemQuantity {
    item: Item;
    quantity: number;
}

export class Inventory {
    itemQuantities: ItemQuantity[];

    constructor(itemQuantities: ItemQuantity[] = []) {
        this.itemQuantities = itemQuantities;
    }

    getQuantity(item: Item): number {
        const matches = this.itemQuantities.filter(
            (itemQuantity) => itemQuantity.item.name === item.name
        );

        if (matches.length > 0) {
            return matches[0].quantity;
        }

        return 0;
    }

    addItem(item: Item, quantity: number) {
        for (let index = 0; index < this.itemQuantities.length; index++) {
            const itemQuantity = this.itemQuantities[index];
            if (itemQuantity.item.name === item.name) {
                itemQuantity.quantity += quantity;

                if (itemQuantity.quantity <= 0) {
                    this.itemQuantities.splice(index, 1);
                }
                return;
            }
        }

        this.itemQuantities.push({ item: item, quantity: quantity });
    }

    removeItem(item: Item, quantity: number) {
        this.addItem(item, -1 * quantity);
    }

    canCraft(recipe: Recipe): boolean {
        return recipe.ingredients
            .map((ingredient) => this.getQuantity({ name: ingredient }))
            .every((quantity) => quantity > 0);
    }
}
