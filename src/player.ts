import { Character, Direction } from "./character";
import { isKeyDown } from "./input";
import { Inventory } from "./inventory";
import { KeyCode, Recipe } from "./types";

export class Player extends Character {
    recipes: Recipe[] = [];
    inventory: Inventory = new Inventory();

    constructor(x: number, y: number) {
        super(x, y, 16, 16);
    }

    update(deltaT: number): void {
        const move = isKeyDown(KeyCode.SHIFT)
            ? (direction: Direction, deltaT: number) =>
                  this.run(direction, deltaT)
            : (direction: Direction, deltaT: number) =>
                  this.walk(direction, deltaT);
        let moved = false;

        if (isKeyDown(82)) {
            this.attack();
            moved = true;
        }
        if (isKeyDown(65)) {
            move(Direction.LEFT, deltaT);
            moved = true;
        }
        if (isKeyDown(68)) {
            move(Direction.RIGHT, deltaT);
            moved = true;
        }
        if (isKeyDown(87)) {
            move(Direction.UP, deltaT);
            moved = true;
        }
        if (isKeyDown(83)) {
            move(Direction.DOWN, deltaT);
            moved = true;
        }

        if (!moved) {
            this.idle();
        }

        super.update(deltaT);
    }
}
