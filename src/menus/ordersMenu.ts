import { Player } from "../player";
import { Restaurant } from "../restaurant";
import { getScreenSize } from "../screen";
import { ListWindow } from "../windows/listWindow";
import { Menu } from "./menu";

export class OrdersMenu extends Menu {
    player: Player;
    restaurant: Restaurant;
    listWindow: ListWindow;

    constructor(player: Player, restaurant: Restaurant) {
        super();

        this.player = player;
        this.restaurant = restaurant;

        this.listWindow = new ListWindow(10, 10, 24, 24, []);
        this.listWindow.onSelect = (index) => this.handleDeliverOrder(index);
        this.updateChoices();

        const screenSize = getScreenSize();
        this.listWindow.centerHorizontallyIn(screenSize);
    }

    updateChoices() {
        this.listWindow.choices = this.restaurant.orders.map((order) => ({
            text: order.item.name,
            enabled: this.player.inventory.getQuantity(order.item) > 0,
        }));
    }

    handleDeliverOrder(index: number) {
        const order = this.restaurant.orders[index];
        this.restaurant.deliverOrder(order);
        this.player.inventory.removeItem(order.item, 1);
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
