import { Adventurer } from "./adventurer";
import { INGREDIENTS } from "./data/ingredients";
import { RECIPES } from "./data/recipes";
import {
    clearPressedKeys,
    handleKeyDown,
    handleKeyUp,
    isKeyPressed,
} from "./input";
import { Inventory } from "./inventory";
import { CraftingMenu } from "./menus/craftingMenu";
import { IngredientsShopMenu } from "./menus/ingredientsShopMenu";
import { InventoryMenu } from "./menus/inventoryMenu";
import { Menu } from "./menus/menu";
import { OrdersMenu } from "./menus/ordersMenu";
import { RecipeShopMenu } from "./menus/recipeShopMenu";
import { intersects } from "./physics";
import { Player } from "./player";
import { Restaurant } from "./restaurant";
import { Item, KeyCode, Position } from "./types";

import map from "./map.json";
import { TileMap, TileLayer } from "./ldtk/types";
import { findPassabilityLayer, findPath, isTilePassable } from "./pathfinding";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
const WIDTH = 1280;
const HEIGHT = 720;
const SCALE = 2;


let path: Position[] | undefined = undefined;

const mousePosition: Position = { x: 0, y: 0 };
const inventory = new Inventory([
    // { item: { name: "Dragon's Breath Pepper" }, quantity: 5 },
    // { item: { name: "Moonlit Mushrooms" }, quantity: 12 },
    // { item: { name: "Phoenix Feather Herbs" }, quantity: 3 },
    // { item: { name: "Enchanted Honey" }, quantity: 8 },
    // { item: { name: "Starlight Salt" }, quantity: 20 },
    // { item: { name: "Mermaid Tears (Water)" }, quantity: 15 },
    // { item: { name: "Goblin Garlic" }, quantity: 7 },
    // { item: { name: "Fairy Dust Sugar" }, quantity: 10 },
    // { item: { name: "Wyvern Eggs" }, quantity: 4 },
    // { item: { name: "Crystal Berries" }, quantity: 18 },
    // { item: { name: "Elven Butter" }, quantity: 6 },
    // { item: { name: "Shadow Truffles" }, quantity: 2 },
    // { item: { name: "Unicorn Milk" }, quantity: 9 },
    // { item: { name: "Thundercloud Flour" }, quantity: 25 },
    // { item: { name: "Mandrake Root" }, quantity: 5 },
]);

const player = new Player(104, 104);
const recipeShop = { x: 32, y: 32, width: 64, height: 64 };
const ingredients = { x: 32, y: 128, width: 64, height: 64 };
const kitchen = { x: 128, y: 32, width: 64, height: 64 };
const counter = new Restaurant(128, 128, 64, 64);
const dungeon = { x: 512, y: 128, width: 64, height: 64 };
const menuStack: Menu[] = [];

const entities = [
    player,
    new Adventurer(512, 150, map.levels[0], counter,  { x: Math.floor(dungeon.x / 16), y: Math.floor(dungeon.y / 16) }, RECIPES[0]),
    // new Adventurer(400, 150, map.levels[0], counter, dungeon, RECIPES[1]),
];

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

const tileset = new Image();

function update(): void {
    if (menuStack.length == 0) {
        entities.forEach((entity) => entity.update());

        if (intersects(player, recipeShop) && isKeyPressed(KeyCode.E)) {
            openMenu(new RecipeShopMenu(RECIPES, player));
        }
        if (intersects(player, kitchen) && isKeyPressed(KeyCode.E)) {
            openMenu(new CraftingMenu(player));
        }
        if (intersects(player, ingredients) && isKeyPressed(KeyCode.E)) {
            openMenu(new IngredientsShopMenu(INGREDIENTS, player));
        }
        if (intersects(player, counter) && isKeyPressed(KeyCode.E)) {
            openMenu(new OrdersMenu(player, counter));
        }
        if (isKeyPressed(KeyCode.ESCAPE)) {
            openMenu(new InventoryMenu(player.inventory));
        }

        if (isKeyPressed(KeyCode.R)) {
            path = findPath(map.levels[0], {x: 3, y: 4}, {x: 27, y: 12});
        }
    } else {
        menuStack.forEach((menu) => menu.update());
    }

    clearPressedKeys();
}

function drawMap(context: CanvasRenderingContext2D, map: TileMap) {
    const level = map.levels[0];
    for (let index = level.layerInstances.length - 1; index >= 0; index--) {
        const layer = level.layerInstances[index];
        if ("gridTiles" in layer) {
            layer.gridTiles.forEach(tile => {
                const destination = tile.px;
                const source = tile.src;
                const TILE_SIZE = 16;
    
                context.drawImage(
                    tileset,
                    source[0], source[1], TILE_SIZE, TILE_SIZE,
                    destination[0], destination[1], TILE_SIZE, TILE_SIZE
                )
            });
        }
    }
}

function drawPath(context: CanvasRenderingContext2D) {
    if (!path) {
        return;
    }

    if (path.length < 2) {
        console.log("Single tile path");
        return;
    }

    for (let index = 0; index < path.length - 1; index++) {
        const from = path[index];
        const to = path[index + 1];

        context.beginPath();
        context.moveTo((from.x * 16) + 8, (from.y * 16) + 8);
        context.lineTo((to.x * 16) + 8, (to.y * 16) + 8);
        context.stroke();
    }
}

function draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "cornflowerblue";
    context.textBaseline = "top";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.imageSmoothingEnabled = false;

    context.scale(SCALE, SCALE);

    drawMap(context, map);

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

    // Ingredients
    context.fillStyle = "grey";
    context.fillRect(
        ingredients.x,
        ingredients.y,
        ingredients.width,
        ingredients.height
    );
    context.fillStyle = "black";
    context.fillText("Ingredients", ingredients.x, ingredients.y);

    // Kitchen
    context.fillStyle = "grey";
    context.fillRect(kitchen.x, kitchen.y, kitchen.width, kitchen.height);
    context.fillStyle = "black";
    context.fillText("Kitchen", kitchen.x, kitchen.y);

    context.fillStyle = "grey";
    context.fillRect(counter.x, counter.y, counter.width, counter.height);
    context.fillStyle = "black";
    context.fillText("Counter", counter.x, counter.y);

    context.fillStyle = "grey";
    context.fillRect(dungeon.x, dungeon.y, dungeon.width, dungeon.height);
    context.fillStyle = "black";
    context.fillText("Dungeon", dungeon.x, dungeon.y);

    entities.forEach((entity) => entity.draw(context));
    menuStack.forEach((menu) => menu.draw(context));

    context.fillStyle = "red";
    context.fillRect(mousePosition.x - 1, mousePosition.y - 1, 3, 3);

    drawPath(context);

    context.resetTransform();
}

function loop(): void {
    update();
    draw(context);

    requestAnimationFrame(loop);
}

function load() {
    tileset.onload = loop;
    tileset.src = new URL("img/tileset.png", import.meta.url).href;
}

load();
