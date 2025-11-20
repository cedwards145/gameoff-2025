import { Adventurer, AdventurerState } from "./adventurer";
import { Item, Position } from "./types";

interface Order {
    adventurer: Adventurer;
    item: Item;
}

export class Restaurant {
    x: number;
    y: number;
    width: number;
    height: number;
    busy: boolean;
    orders: Order[] = [];
    position: Position;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.busy = false;

        this.position = { x: Math.floor(x / 16), y: Math.floor(y / 16) };
    }

    placeOrder(adventurer: Adventurer, item: Item) {
        this.orders.push({ adventurer: adventurer, item: item });
    }

    deliverOrder(order: Order) {
        const index = this.orders.indexOf(order);
        if (index > -1) {
            this.orders.splice(index, 1);
        }

        order.adventurer.startEating();
    }
}
