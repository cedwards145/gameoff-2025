import { Category, type Food } from "./types";

export function joinWithCommas(parts: string[]): string {
    if (parts.length === 1) {
        return parts[0]!
    }
    return parts.slice(1).reduce((accumulator, part) => `${accumulator}, ${part}`, parts[0]!);
}

export function ingredientList(ingredients: Food[]): string {
    return ingredients.length === 1 
        ? ingredients[0]!.name
        : `${joinWithCommas(ingredients.map(i => i.name).slice(0, -1))} and ${ingredients[ingredients.length - 1]!.name}`;
}

export function listExcept(ingredients: Food[], categories: Category[]) {
    return ingredientList(ingredients.filter(ingredient => categories.every(category => !ingredient.categories.has(category))))
}
