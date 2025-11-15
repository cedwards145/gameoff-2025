import { ListWindow } from "../windows/listWindow";
import { TextWindow } from "../windows/textWindow";
import { Item, Recipe } from "../types";
import { Menu } from "./menu";
import { Player } from "../player";

export class IngredientsShopMenu extends Menu {
    ingredients: Item[];
    player: Player;
    listWindow: ListWindow;
    descriptionWindow: TextWindow;

    constructor(ingredients: Item[], player: Player) {
        super();

        this.ingredients = ingredients;
        this.player = player;

        this.listWindow = new ListWindow(
            10,
            40,
            200,
            220,
            ingredients.map((ingredient) => ({
                text: ingredient.name,
                enabled: true,
            }))
        );
        this.listWindow.onSelect = (index) => this.handlePurchase(index);
        this.descriptionWindow = new TextWindow(10, 10, 410, 24);
    }

    handlePurchase(index: number) {
        const ingredient = this.ingredients[index];
        if (ingredient) {
            this.player.inventory.addItem(ingredient, 1);
        }
    }

    update(): void {
        super.update();
        this.listWindow.update();

        const ingredient = this.ingredients[this.listWindow.index];
        if (ingredient) {
            this.descriptionWindow.text = ingredient.name;
        } else {
            this.descriptionWindow.text = "";
        }
        this.descriptionWindow.update();
    }

    draw(context: CanvasRenderingContext2D): void {
        this.listWindow.draw(context);
        this.descriptionWindow.draw(context);
    }
}
