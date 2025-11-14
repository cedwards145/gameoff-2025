import { RECIPES } from "./data/recipes";
import {
    clearPressedKeys,
    handleKeyDown,
    handleKeyUp,
    isKeyPressed,
} from "./input";
import { InventoryMenu } from "./menus/inventoryMenu";
import { Menu } from "./menus/menu";
import { RecipeShopMenu } from "./menus/recipeShopMenu";
import { intersects } from "./physics";
import { Player } from "./player";
import { Item, KeyCode, Position } from "./types";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
const WIDTH = 1280;
const HEIGHT = 720;
const SCALE = 2;

const mousePosition: Position = { x: 0, y: 0 };
const inventory: Item[] = [
    { name: "Dragon's Breath Pepper", quantity: 5 },
    { name: "Moonlit Mushrooms", quantity: 12 },
    { name: "Phoenix Feather Herbs", quantity: 3 },
    { name: "Enchanted Honey", quantity: 8 },
    { name: "Starlight Salt", quantity: 20 },
    { name: "Mermaid Tears (Water)", quantity: 15 },
    { name: "Goblin Garlic", quantity: 7 },
    { name: "Fairy Dust Sugar", quantity: 10 },
    { name: "Wyvern Eggs", quantity: 4 },
    { name: "Crystal Berries", quantity: 18 },
    { name: "Elven Butter", quantity: 6 },
    { name: "Shadow Truffles", quantity: 2 },
    { name: "Unicorn Milk", quantity: 9 },
    { name: "Thundercloud Flour", quantity: 25 },
    { name: "Mandrake Root", quantity: 5 },
];

const player = new Player(0, 0);
const kitchen = { x: 32, y: 32, width: 64, height: 64 };
const recipeShop = { x: 128, y: 32, width: 64, height: 64 };

const menuStack: Menu[] = [];

function openMenu(menu: Menu) {
    menu.onClose = handleMenuClose;
    menuStack.push(menu);
}

function handleMenuClose(menu: Menu) {
    const index = menuStack.indexOf(menu);
    if (index > -1) {
        menuStack.splice(index, 1);
    }
}

canvas.onmousemove = (e: MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    mousePosition.x = (e.clientX - rect.left) / SCALE;
    mousePosition.y = (e.clientY - rect.top) / SCALE;
};

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function update(): void {
    if (menuStack.length == 0) {
        player.update();

        if (intersects(player, recipeShop) && isKeyPressed(KeyCode.E)) {
            openMenu(new RecipeShopMenu(RECIPES));
        }
    }

    menuStack.forEach((menu) => menu.update());
    clearPressedKeys();
}

function draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "cornflowerblue";
    context.textBaseline = "top";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.scale(SCALE, SCALE);

    // Recipe Shop
    context.fillStyle = "grey";
    context.fillRect(
        recipeShop.x,
        recipeShop.y,
        recipeShop.width,
        recipeShop.height
    );
    context.fillStyle = "black";
    context.fillText("Recipes", recipeShop.x, recipeShop.y);

    // Kitchen
    context.fillStyle = "grey";
    context.fillRect(kitchen.x, kitchen.y, kitchen.width, kitchen.height);
    context.fillStyle = "black";
    context.fillText("Kitchen", kitchen.x, kitchen.y);

    player.draw(context);

    menuStack.forEach((menu) => menu.draw(context));

    context.fillStyle = "red";
    context.fillRect(mousePosition.x - 1, mousePosition.y - 1, 3, 3);

    context.resetTransform();
}

function loop(): void {
    update();
    draw(context);

    requestAnimationFrame(loop);
}

loop();
