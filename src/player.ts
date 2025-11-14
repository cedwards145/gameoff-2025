import { isKeyDown } from "./input";
import { Inventory } from "./inventory";
import { KeyCode, Recipe } from "./types";

export class Player {
    x: number;
    y: number;
    width: number;
    height: number;
    recipes: Recipe[] = [];
    inventory: Inventory = new Inventory();

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
    }

    update(): void {
        if (isKeyDown(KeyCode.A)) {
            this.x--;
        } else if (isKeyDown(KeyCode.D)) {
            this.x++;
        } else if (isKeyDown(KeyCode.W)) {
            this.y--;
        } else if (isKeyDown(KeyCode.S)) {
            this.y++;
        }
    }

    draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = "black";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
