import { ListWindow } from "../windows/listWindow";
import { TextWindow } from "../windows/textWindow";
import { Item, Recipe } from "../types";
import { Menu } from "./menu";
import { Player } from "../player";
import { getScreenSize } from "../screen";

export class IngredientsShopMenu extends Menu {
    ingredients: Item[];
    player: Player;
    listWindow: ListWindow;
    descriptionWindow: TextWindow;

    constructor(ingredients: Item[], player: Player) {
        super();

        this.ingredients = ingredients;
        this.player = player;

        this.listWindow = new ListWindow(10, 40, 30, 24, []);
        this.listWindow.onSelect = (index) => this.handlePurchase(index);
        this.descriptionWindow = new TextWindow(10, 10, 30, 3);

        const screenSize = getScreenSize();
        this.listWindow.centerHorizontallyIn(screenSize);
        this.descriptionWindow.centerHorizontallyIn(screenSize);

        this.updateChoices();
    }

    updateChoices() {
        this.listWindow.choices = this.ingredients.map((ingredient) => ({
            text: `${ingredient.name} - ${ingredient.price}G`,
            enabled: this.player.money >= ingredient.price,
        }));
    }

    handlePurchase(index: number) {
        const ingredient = this.ingredients[index];
        if (ingredient) {
            this.player.inventory.addItem(ingredient, 1);
            this.player.money -= ingredient.price;
        }
        this.updateChoices();
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
