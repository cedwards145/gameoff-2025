export interface Item {
    name: string;
    quantity: number;
}

export interface Recipe {
    name: string;
    ingredients: string[];
}

export interface Position {
    x: number;
    y: number;
}

export enum KeyCode {
    W = 87,
    S = 83,
    A = 65,
    D = 68,
}
