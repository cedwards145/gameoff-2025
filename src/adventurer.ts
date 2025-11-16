import { intersects } from "./physics";
import { Restaurant } from "./restaurant";
import { Timer } from "./timer";
import { Item, Rectangle } from "./types";

export enum AdventurerState {
    IDLE,
    MOVING_TO_RESTAURANT,
    QUEUEING,
    EATING,
    MOVING_TO_DUNGEON,
    ADVENTURING,
}

export class Adventurer {
    x: number;
    y: number;
    width: number;
    height: number;
    state: AdventurerState;
    restaurant: Restaurant;
    dungeon: Rectangle;
    order: Item;

    timer: Timer;

    constructor(
        x: number,
        y: number,
        restaurant: Restaurant,
        dungeon: Rectangle,
        order: Item
    ) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.restaurant = restaurant;
        this.dungeon = dungeon;
        this.order = order;

        this.state = AdventurerState.MOVING_TO_RESTAURANT;
        this.timer = new Timer();
    }

    moveTo(target: Rectangle): boolean {
        if (intersects(this, target)) {
            return true;
        } else {
            const xDelta = target.x - this.x;
            const yDelta = target.y - this.y;

            this.x += Math.sign(xDelta);
            this.y += Math.sign(yDelta);
            return false;
        }
    }

    update() {
        switch (this.state) {
            case AdventurerState.IDLE:
                break;
            case AdventurerState.MOVING_TO_RESTAURANT:
                if (this.moveTo(this.restaurant)) {
                    this.state = AdventurerState.QUEUEING;
                    this.restaurant.placeOrder(this, this.order);
                }
                break;
            case AdventurerState.QUEUEING:
                break;
            case AdventurerState.EATING:
                if (this.timer.isComplete()) {
                    this.state = AdventurerState.MOVING_TO_DUNGEON;
                    this.restaurant.busy = false;
                }
                break;
            case AdventurerState.MOVING_TO_DUNGEON:
                if (this.moveTo(this.dungeon)) {
                    this.state = AdventurerState.ADVENTURING;
                    this.timer.start(5000);
                }
                break;
            case AdventurerState.ADVENTURING:
                if (this.timer.isComplete()) {
                    this.state = AdventurerState.MOVING_TO_RESTAURANT;
                }
                break;
        }
    }

    startEating() {
        this.state = AdventurerState.EATING;
        this.timer.start(5000);
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = "black";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
