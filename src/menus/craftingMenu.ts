import { INGREDIENTS } from "../data/ingredients";
import { Player } from "../player";
import { getScreenSize } from "../screen";
import { Item } from "../types";
import { ListWindow } from "../windows/listWindow";
import { Menu } from "./menu";

export class CraftingMenu extends Menu {
    player: Player;
    ingredientListWindow: ListWindow;
    selectedIngredientsWindow: ListWindow;
    selectedIngredients: Item[] = [];

    constructor(player: Player) {
        super();

        this.player = player;
        const screenSize = getScreenSize();

        this.ingredientListWindow = new ListWindow(0, 50, 24, 24, []);
        this.ingredientListWindow.onSelect = (index) => this.handleCraft(index);
        this.ingredientListWindow.centerHorizontallyIn(screenSize);
        this.ingredientListWindow.x -= 150;
        this.updateIngredientList();
        
        this.selectedIngredientsWindow = new ListWindow(this.ingredientListWindow.x + 250, 50, 24, 24, []);
    }

    updateSelectedIngredientList() {
        this.selectedIngredientsWindow.choices = this.selectedIngredients.map(ingredient => ({
            text: ingredient.name,
            enabled: true
        }));
    }

    updateIngredientList() {
        this.ingredientListWindow.choices = INGREDIENTS.map((ingredient) => ({
            text: ingredient.name,
            enabled: this.selectedIngredients.length <= 2,
        }));
    }

    handleCraft(index: number) {
        const ingredient = INGREDIENTS[index];
        this.selectedIngredients.push(ingredient);
        this.updateIngredientList();
        this.updateSelectedIngredientList();
    }

    update(): void {
        super.update();
        this.ingredientListWindow.update();
    }

    draw(context: CanvasRenderingContext2D): void {
        this.ingredientListWindow.draw(context);
        this.selectedIngredientsWindow.draw(context);
    }
}
