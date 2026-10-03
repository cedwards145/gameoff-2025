import { AdventureManager } from "./adventureManager";
import { Adventurer, AdventurerState } from "./adventurer";
import { Character } from "./character";
import { INGREDIENTS } from "./data/ingredients";
import { RECIPES } from "./data/recipes";
import { isKeyPressed } from "./input";
import { TileMap } from "./ldtk/types";
import { AdventurerMenu } from "./menus/adventurerMenu";
import { CraftingMenu } from "./menus/craftingMenu";
import { IngredientsShopMenu } from "./menus/ingredientsShopMenu";
import { InventoryMenu } from "./menus/inventoryMenu";
import { Menu } from "./menus/menu";
import { OrdersMenu } from "./menus/ordersMenu";
import { RecipeShopMenu } from "./menus/recipeShopMenu";
import { TestMenu } from "./menus/testMenu";
import { intersects } from "./physics";
import { Player } from "./player";
import { getImageResource } from "./resources";
import { Restaurant } from "./restaurant";
import { getCanvasSize, getScale, getScreenSize } from "./screen";
import { KeyCode, Rectangle } from "./types";
import { TextWindow } from "./windows/textWindow";


const testMenu = new TestMenu();


export class Game {
    map: TileMap;
    menuStack: Menu[];
    entities: Character[];
    player: Player;
    recipeShop: Rectangle;
    ingredients: Rectangle;
    kitchen: Rectangle;
    restaurant: Restaurant;
    dungeon: Rectangle;
    dungeonProgress: number;
    goldWindow: TextWindow;

    adventurerManager: AdventureManager;

    constructor(map: TileMap) {
        this.map = map;

        this.menuStack = [];
        this.player = new Player(104, 104);

        this.recipeShop = { x: 32, y: 32, width: 64, height: 64 };
        this.ingredients = { x: 32, y: 128, width: 64, height: 64 };
        this.kitchen = { x: 128, y: 32, width: 64, height: 64 };
        this.restaurant = new Restaurant(128, 128, 64, 64);
        this.dungeon = { x: 512, y: 128, width: 64, height: 64 };
        this.goldWindow = new TextWindow(0, 0, 7, 3);

        this.dungeonProgress = 0;

        const adventurers = [
            new Adventurer(
                512,
                150,
                "John",
                map.levels[0],
                this.restaurant,
                {
                    x: Math.floor(this.dungeon.x / 16),
                    y: Math.floor(this.dungeon.y / 16),
                },
                RECIPES[0]
            ),
            new Adventurer(
                540,
                130,
                "Cid",
                map.levels[0],
                this.restaurant,
                {
                    x: Math.floor(this.dungeon.x / 16),
                    y: Math.floor(this.dungeon.y / 16),
                },
                RECIPES[1]
            ),
            new Adventurer(
                525,
                160,
                "Bob",
                map.levels[0],
                this.restaurant,
                {
                    x: Math.floor(this.dungeon.x / 16),
                    y: Math.floor(this.dungeon.y / 16),
                },
                RECIPES[2]
            ),
        ]

        this.entities = [
            this.player,
            ...adventurers
        ];

        this.adventurerManager = new AdventureManager(adventurers);
    }

    openMenu(menu: Menu) {
        menu.onClose = (menu) => this.handleCloseMenu(menu);
        menu.onOpenMenu = (menu) => this.handleOpenMenu(menu);
        this.menuStack.push(menu);
    }

    handleCloseMenu(menu: Menu) {
        const index = this.menuStack.indexOf(menu);
        if (index > -1) {
            this.menuStack.splice(index, 1);
        }
    }

    handleOpenMenu(menu: Menu) {
        this.openMenu(menu);
    }

    update(deltaT: number): void {
        if (this.menuStack.length == 0) {
            this.entities.forEach((entity) => entity.update(deltaT));

            if (
                intersects(this.player, this.recipeShop) &&
                isKeyPressed(KeyCode.E)
            ) {
                this.openMenu(new RecipeShopMenu(RECIPES, this.player));
            }
            if (
                intersects(this.player, this.kitchen) &&
                isKeyPressed(KeyCode.E)
            ) {
                this.openMenu(new CraftingMenu(this.player));
            }
            if (
                intersects(this.player, this.ingredients) &&
                isKeyPressed(KeyCode.E)
            ) {
                this.openMenu(
                    new IngredientsShopMenu(INGREDIENTS, this.player)
                );
            }
            if (
                intersects(this.player, this.restaurant) &&
                isKeyPressed(KeyCode.E)
            ) {
                this.openMenu(new OrdersMenu(this.player, this.restaurant));
            }
            if (isKeyPressed(KeyCode.ESCAPE)) {
                this.openMenu(new InventoryMenu(this.player.inventory));
            }
            if (isKeyPressed(KeyCode.R)) {
                this.openMenu(
                    new AdventurerMenu(
                        this.entities.filter(
                            (entity) => entity instanceof Adventurer
                        )
                    )
                );
            }
        } else {
            this.menuStack[this.menuStack.length - 1].update();
        }

        this.adventurerManager.update(deltaT);
    }

    drawDungeonProgress(context: CanvasRenderingContext2D) {
        const screenSize = getScreenSize();

        const progressBar = getImageResource("progress");

        const height = progressBar.height;
        const indicatorY = 32 + height * this.dungeonProgress;

        context.drawImage(progressBar, screenSize.width - 24, 32);

        context.fillStyle = "black";
        context.fillRect(
            screenSize.width - 24,
            indicatorY + 16,
            progressBar.width,
            Math.max(0, progressBar.height * (1 - this.dungeonProgress) - 16)
        );

        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.beginPath();
        context.rect(
            screenSize.width - 25,
            31,
            progressBar.width + 2,
            progressBar.height + 2
        );
        context.stroke();

        context.fillStyle = "red";
        context.beginPath();
        context.moveTo(screenSize.width - 24, indicatorY);
        context.lineTo(screenSize.width - 32, indicatorY + 4);
        context.lineTo(screenSize.width - 32, indicatorY - 4);
        context.fill();
    }

    drawMap(context: CanvasRenderingContext2D, map: TileMap) {
        const level = map.levels[0];
        const tileset = getImageResource("tileset");
        for (let index = level.layerInstances.length - 1; index >= 0; index--) {
            const layer = level.layerInstances[index];
            if ("gridTiles" in layer) {
                layer.gridTiles.forEach((tile) => {
                    const destination = tile.px;
                    const source = tile.src;
                    const TILE_SIZE = 16;

                    context.drawImage(
                        tileset,
                        source[0],
                        source[1],
                        TILE_SIZE,
                        TILE_SIZE,
                        destination[0],
                        destination[1],
                        TILE_SIZE,
                        TILE_SIZE
                    );
                });
            }
        }
    }

    // drawPath(context: CanvasRenderingContext2D) {
    //     if (!path) {
    //         return;
    //     }

    //     if (path.length < 2) {
    //         console.log("Single tile path");
    //         return;
    //     }

    //     for (let index = 0; index < path.length - 1; index++) {
    //         const from = path[index];
    //         const to = path[index + 1];

    //         context.beginPath();
    //         context.moveTo(from.x * 16 + 8, from.y * 16 + 8);
    //         context.lineTo(to.x * 16 + 8, to.y * 16 + 8);
    //         context.stroke();
    //     }
    // }

    drawUI(context: CanvasRenderingContext2D) {
        this.drawDungeonProgress(context);

        const screenSize = getScreenSize();
        this.goldWindow.x = screenSize.width - this.goldWindow.pixelWidth;
        this.goldWindow.text = `${this.player.money}G`;
        this.goldWindow.draw(context);

        this.drawOrderTickets(context);
    }

    drawOrderTickets(context: CanvasRenderingContext2D) {
        for (let index = 0; index < this.restaurant.orders.length; index++) {
            const order = this.restaurant.orders[index];

            const y = 25 + (index * 50);

            context.fillStyle = "white";
            context.fillRect(0, y, 100, 30);
            context.fillStyle = "black";
            context.fillText(order.item.name, 0, y);
        }
    }

    draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = "cornflowerblue";
        context.textBaseline = "top";

        const canvasSize = getCanvasSize();
        context.fillRect(
            canvasSize.x,
            canvasSize.y,
            canvasSize.width,
            canvasSize.height
        );

        context.imageSmoothingEnabled = false;

        const scale = getScale();
        context.scale(scale, scale);

        testMenu.draw(context);
        context.resetTransform();
        return;

        this.drawMap(context, this.map);

        // Recipe Shop
        context.fillStyle = "grey";
        context.fillRect(
            this.recipeShop.x,
            this.recipeShop.y,
            this.recipeShop.width,
            this.recipeShop.height
        );
        context.fillStyle = "black";
        context.fillText("Recipes", this.recipeShop.x, this.recipeShop.y);

        // Ingredients
        context.fillStyle = "grey";
        context.fillRect(
            this.ingredients.x,
            this.ingredients.y,
            this.ingredients.width,
            this.ingredients.height
        );
        context.fillStyle = "black";
        context.fillText("Ingredients", this.ingredients.x, this.ingredients.y);

        // Kitchen
        context.fillStyle = "grey";
        context.fillRect(
            this.kitchen.x,
            this.kitchen.y,
            this.kitchen.width,
            this.kitchen.height
        );
        context.fillStyle = "black";
        context.fillText("Kitchen", this.kitchen.x, this.kitchen.y);

        context.fillStyle = "grey";
        context.fillRect(
            this.restaurant.x,
            this.restaurant.y,
            this.restaurant.width,
            this.restaurant.height
        );
        context.fillStyle = "black";
        context.fillText("Counter", this.restaurant.x, this.restaurant.y);

        context.fillStyle = "grey";
        context.fillRect(
            this.dungeon.x,
            this.dungeon.y,
            this.dungeon.width,
            this.dungeon.height
        );
        context.fillStyle = "black";
        context.fillText("Dungeon", this.dungeon.x, this.dungeon.y);

        this.entities.forEach((entity) => entity.draw(context));
        this.menuStack.forEach((menu) => menu.draw(context));

        this.drawUI(context);

        context.resetTransform();
    }
}
