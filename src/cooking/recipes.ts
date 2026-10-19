import { Category, type Food } from "./types";
import { ingredientList, listExcept } from "./utils";

export const soup = {
    requires: [Category.STOCK],
    produces: [],
    name: (ingredients: Food[]) => `${listExcept(ingredients, [Category.STOCK])} Soup`
}

export const noodleSoup = {
    requires: [Category.STOCK, Category.NOODLE],
    produces: [],
    name: (ingredients: Food[]) => `${listExcept(ingredients, [Category.STOCK, Category.NOODLE])} Soup`
}

export const stock = {
    requires: [],
    produces: [],
    name: (ingredients: Food[]) => `${ingredientList(ingredients)} Stock`
}