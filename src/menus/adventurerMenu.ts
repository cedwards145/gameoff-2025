import { TextWindow } from "../windows/textWindow";
import { Menu } from "./menu";
import { ListWindow } from "../windows/listWindow";
import { getScreenSize } from "../screen";
import { Adventurer, adventurerStateToDescription } from "../adventurer";

export class AdventurerMenu extends Menu {
    adventurers: Adventurer[];
    adventurerList: ListWindow;
    statusWindow: TextWindow;
    headingWindow: TextWindow;

    constructor(adventurers: Adventurer[]) {
        super();
        this.adventurers = adventurers;

        this.adventurerList = new ListWindow(
            10,
            40,
            24,
            24,
            adventurers.map((adventurer) => ({
                text: adventurer.name,
                enabled: true,
            }))
        );
        this.statusWindow = new TextWindow(10, 40, 24, 24);
        this.headingWindow = new TextWindow(10, 10, 49, 3, "Adventurers");

        const screenSize = getScreenSize();
        this.headingWindow.centerHorizontallyIn(screenSize);
        this.adventurerList.x = this.headingWindow.x;
        this.statusWindow.x =
            this.adventurerList.x + this.adventurerList.pixelWidth + 8;
    }

    update(): void {
        super.update();
        this.adventurerList.update();
        const adventurer = this.adventurers[this.adventurerList.index];
        this.statusWindow.text = `Name: ${
            adventurer.name
        }\nStatus: ${adventurerStateToDescription(
            adventurer.adventurerState
        )}\nFood Buff: ${adventurer.foodBuff}`;
        this.statusWindow.update();
        this.headingWindow.update();
    }

    draw(context: CanvasRenderingContext2D): void {
        this.adventurerList.draw(context);
        this.statusWindow.draw(context);
        this.headingWindow.draw(context);
    }
}
