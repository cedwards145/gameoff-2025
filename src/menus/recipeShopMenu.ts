import { ListWindow } from "../windows/listWindow";
import { TextWindow } from "../windows/textWindow";
import { Recipe } from "../types";

export class RecipeShopMenu {
    recipes: Recipe[];
    listWindow: ListWindow;
    descriptionWindow: TextWindow;
    ingredientsWindow: TextWindow;

    constructor(recipes: Recipe[]) {
        this.recipes = recipes;
        this.listWindow = new ListWindow(
            10,
            40,
            200,
            220,
            recipes.map((recipe) => recipe.name)
        );
        this.descriptionWindow = new TextWindow(10, 10, 410, 24);
        this.ingredientsWindow = new TextWindow(220, 40, 200, 220);
    }

    update(): void {
        this.listWindow.update();

        const recipe = this.recipes[this.listWindow.index];
        this.descriptionWindow.text = recipe.name;
        this.ingredientsWindow.text = recipe.ingredients.reduce(
            (text, ingredient) => text + "\n" + ingredient,
            "Ingredients:\n"
        );
        this.descriptionWindow.update();
        this.ingredientsWindow.update();
    }

    draw(context: CanvasRenderingContext2D): void {
        this.listWindow.draw(context);
        this.descriptionWindow.draw(context);
        this.ingredientsWindow.draw(context);
    }
}
