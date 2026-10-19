import type { Category, Food, Recipe } from "./types";


export function ingredientsMatchRecipe(ingredients: Food[], recipe: Recipe): boolean {
    const hasCategory = (category: Category) => ingredients.some(f => f.categories.has(category));
    return recipe.requires.every(hasCategory) && !(recipe.forbids ?? []).some(hasCategory);
}

export class CookingVessel {
    constructor(readonly name: string, readonly recipes: Recipe[]) {}

    pickRecipe(ingredients: Food[]): Recipe | undefined {
        const matchingRecipes = this.recipes.filter(recipe => ingredientsMatchRecipe(ingredients, recipe));
        if (matchingRecipes.length > 0) {
            return matchingRecipes[0];
        }

        return undefined;
    }

    cook(ingredients: Food[]): Food {
        const recipe = this.pickRecipe(ingredients);

        if (recipe) {
            return {
                name: recipe.name(ingredients),
                categories: new Set()
            }
        }

        return {
            name: "Mush",
            categories: new Set()
        }
    }
}