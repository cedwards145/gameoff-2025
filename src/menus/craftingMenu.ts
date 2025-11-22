import { Player } from "../player";
import { ListWindow } from "../windows/listWindow";
import { TextWindow } from "../windows/textWindow";
import { Menu } from "./menu";

export class CraftingMenu extends Menu {
    player: Player;
    listWindow: ListWindow;

    constructor(player: Player) {
        super();

        this.player = player;
        this.listWindow = new ListWindow(0, 0, 24, 24, []);
        this.listWindow.onSelect = (index) => this.handleCraft(index);
        this.updateChoices();
    }

    updateChoices() {
        this.listWindow.choices = this.player.recipes.map((recipe) => ({
            text: recipe.name,
            enabled: this.player.inventory.canCraft(recipe),
        }));
    }

    handleCraft(index: number) {
        const recipe = this.player.recipes[index];
        if (recipe) {
            recipe.ingredients.forEach((ingredient) =>
                this.player.inventory.removeItem({ name: ingredient }, 1)
            );
            this.player.inventory.addItem({ name: recipe.name }, 1);
        }
        this.updateChoices();
    }

    update(): void {
        super.update();
        this.listWindow.update();
    }

    draw(context: CanvasRenderingContext2D): void {
        this.listWindow.draw(context);
    }
}
