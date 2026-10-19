export enum Category {
    STOCK = "STOCK",
    NOODLE = "NOODLE"
};

export interface Food {
    name: string,
    categories: ReadonlySet<Category>
};

export interface CookingTool {
    cook(ingredients: Food[]): Food;
}

export interface Recipe {
  requires: Category[];
  forbids?: Category[];
  produces: Category[];
  name: (ingredients: Food[]) => string;
}