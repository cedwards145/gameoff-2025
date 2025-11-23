import { ListWindow } from "../windows/listWindow";
import { TextWindow } from "../windows/textWindow";
import { Recipe } from "../types";
import { Menu } from "./menu";
import { Player } from "../player";
import { getScreenSize } from "../screen";

export class RecipeShopMenu extends Menu {
    allRecipes: Recipe[];
    recipes: Recipe[];
    player: Player;
    listWindow: ListWindow;
    descriptionWindow: TextWindow;
    ingredientsWindow: TextWindow;

    constructor(recipes: Recipe[], player: Player) {
        super();

        this.allRecipes = recipes;
        this.recipes = [];
        this.player = player;

        this.descriptionWindow = new TextWindow(10, 10, 47, 3);
        this.listWindow = new ListWindow(10, 40, 23, 24, []);
        this.listWindow.onSelect = (index) => this.handlePurchase(index);
        this.ingredientsWindow = new TextWindow(202, 40, 23, 24);

        this.updateRecipes();

        const screenSize = getScreenSize();
        this.descriptionWindow.centerHorizontallyIn(screenSize);
        this.listWindow.x = this.descriptionWindow.x;
        this.ingredientsWindow.x =
            this.listWindow.x + this.ingredientsWindow.pixelWidth + 8;
    }

    updateRecipes() {
        this.recipes = this.allRecipes.filter(
            (recipe) => this.player.recipes.indexOf(recipe) < 0
        );
        this.listWindow.choices = this.recipes.map((recipe) => ({
            text: recipe.name,
            enabled: this.player.money >= recipe.price,
        }));
        if (this.listWindow.index >= this.listWindow.choices.length) {
            this.listWindow.index = this.listWindow.choices.length - 1;
        }
    }

    handlePurchase(index: number) {
        const recipe = this.recipes[index];
        if (recipe) {
            this.player.recipes.push(recipe);
            this.player.money -= recipe.price;
        }
        this.updateRecipes();
    }

    update(): void {
        super.update();
        this.listWindow.update();

        const recipe = this.recipes[this.listWindow.index];
        if (recipe) {
            this.descriptionWindow.text = recipe.name;
            this.ingredientsWindow.text =
                recipe.ingredients.reduce(
                    (text, ingredient) => text + "\n" + ingredient,
                    "Ingredients:\n"
                ) +
                "\n\n" +
                recipe.price +
                "G";
        } else {
            this.descriptionWindow.text = "";
            this.ingredientsWindow.text = "";
        }
        this.descriptionWindow.update();
        this.ingredientsWindow.update();
    }

    draw(context: CanvasRenderingContext2D): void {
        this.listWindow.draw(context);
        this.descriptionWindow.draw(context);
        this.ingredientsWindow.draw(context);
    }
}
