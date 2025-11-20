import { Level } from "./ldtk/types";
import { findPath } from "./pathfinding";
import { intersects } from "./physics";
import { Restaurant } from "./restaurant";
import { Timer } from "./timer";
import { Item, Position, Rectangle } from "./types";

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
    level: Level;
    width: number;
    height: number;
    state: AdventurerState;
    restaurant: Restaurant;
    dungeon: Position;
    order: Item;

    timer: Timer;
    path: Position[] | undefined;

    constructor(
        x: number,
        y: number,
        level: Level,
        restaurant: Restaurant,
        dungeon: Position,
        order: Item
    ) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.width = 16;
        this.height = 16;
        this.restaurant = restaurant;
        this.dungeon = dungeon;
        this.order = order;

        this.state = AdventurerState.MOVING_TO_RESTAURANT;
        this.timer = new Timer();
    }

    followPath(): boolean {
        if (!this.path || this.path.length === 0) {
            return true;
        }

        const target = this.path[0];

        const xDelta = target.x - Math.floor(this.x / 16);
        const yDelta = target.y - Math.floor(this.y / 16);
        if (xDelta === 0 && yDelta === 0) {
            this.path.shift();
        }

        this.x += Math.sign(xDelta);
        this.y += Math.sign(yDelta);
        
        return false;
    }

    update() {
        switch (this.state) {
            case AdventurerState.IDLE:
                break;
            case AdventurerState.MOVING_TO_RESTAURANT:
                if (!this.path) {
                    this.path = findPath(this.level, { x: Math.floor(this.x / 16), y: Math.floor(this.y / 16)}, this.restaurant.position);
                }
                if (this.followPath()) {
                    this.path = undefined;
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
                if (!this.path) {
                    this.path = findPath(this.level, { x: Math.floor(this.x / 16), y: Math.floor(this.y / 16)}, this.dungeon);
                }
                if (this.followPath()) {
                    this.path = undefined;
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
