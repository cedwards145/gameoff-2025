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
        this.listWindow = new ListWindow(
            0,
            0,
            200,
            200,
            player.recipes.map((recipe) => recipe.name)
        );
        this.listWindow.onSelect = (index) => this.handleCraft(index);
    }

    handleCraft(index: number) {
        const recipe = this.player.recipes[index];
        if (recipe) {
            this.player.inventory.addItem({ name: recipe.name }, 1);
            console.log(this.player.inventory);
        }
    }

    update(): void {
        super.update();
        this.listWindow.update();
    }

    draw(context: CanvasRenderingContext2D): void {
        this.listWindow.draw(context);
    }
}
