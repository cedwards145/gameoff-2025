import { Character } from "./character";
import { Level } from "./ldtk/types";
import { findPath } from "./pathfinding";
import { Restaurant } from "./restaurant";
import { Timer } from "./timer";
import { Item, Position } from "./types";

export enum AdventurerState {
    IDLE,
    MOVING_TO_RESTAURANT,
    QUEUEING,
    EATING,
    MOVING_TO_DUNGEON,
    ADVENTURING,
}

export class Adventurer extends Character {
    level: Level;
    adventurerState: AdventurerState;
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
        super(x, y, 16, 16);
        this.level = level;
        this.restaurant = restaurant;
        this.dungeon = dungeon;
        this.order = order;

        this.adventurerState = AdventurerState.MOVING_TO_RESTAURANT;
        this.timer = new Timer();
    }

    followPath(deltaT: number): boolean {
        if (!this.path || this.path.length === 0) {
            return true;
        }

        const target = {
            x: this.path[0].x * 16 + 8,
            y: this.path[0].y * 16 + 16,
        };
        this.walkTo(target, deltaT);

        if (this.x === target.x && this.y === target.y) {
            this.path.shift();
        }

        return false;
    }

    update(deltaT: number) {
        switch (this.adventurerState) {
            case AdventurerState.IDLE:
                this.idle();
                break;
            case AdventurerState.MOVING_TO_RESTAURANT:
                if (!this.path) {
                    this.path = findPath(
                        this.level,
                        {
                            x: Math.floor(this.x / 16),
                            y: Math.floor(this.y / 16),
                        },
                        this.restaurant.position
                    );
                }
                if (this.followPath(deltaT)) {
                    this.path = undefined;
                    this.adventurerState = AdventurerState.QUEUEING;
                    this.restaurant.placeOrder(this, this.order);
                }
                break;
            case AdventurerState.QUEUEING:
                this.idle();
                break;
            case AdventurerState.EATING:
                if (this.timer.isComplete()) {
                    this.adventurerState = AdventurerState.MOVING_TO_DUNGEON;
                    this.restaurant.busy = false;
                } else {
                    this.idle();
                }
                break;
            case AdventurerState.MOVING_TO_DUNGEON:
                if (!this.path) {
                    this.path = findPath(
                        this.level,
                        {
                            x: Math.floor(this.x / 16),
                            y: Math.floor(this.y / 16),
                        },
                        this.dungeon
                    );
                }
                if (this.followPath(deltaT)) {
                    this.path = undefined;
                    this.adventurerState = AdventurerState.ADVENTURING;
                    this.timer.start(5000);
                }
                break;
            case AdventurerState.ADVENTURING:
                if (this.timer.isComplete()) {
                    this.adventurerState = AdventurerState.MOVING_TO_RESTAURANT;
                } else {
                    this.idle();
                }
                break;
        }

        super.update(deltaT);
    }

    startEating() {
        this.adventurerState = AdventurerState.EATING;
        this.timer.start(5000);
    }
}
