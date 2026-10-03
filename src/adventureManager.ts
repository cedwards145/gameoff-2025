import { Adventurer, AdventurerState } from "./adventurer";

export enum PartyState {
    FREE_TIME,
    PREPARING,
    ADVENTURING
}

const FREE_TIME_LIMIT = 30;

export class AdventureManager {
    private accumulator = 0;

    private _state: PartyState = PartyState.FREE_TIME;
    private get state() {
        return this._state;
    }

    private set state(newState: PartyState) {
        this._state = newState;
        this.adventurers.forEach(adventurer => adventurer.setPartyState(newState));
    }

    constructor(private adventurers: Adventurer[]) { }

    update(deltaT: number) {
        this.accumulator += deltaT;

        switch (this.state) {
            case PartyState.FREE_TIME:
                if (this.accumulator >= FREE_TIME_LIMIT) {
                    this.state = PartyState.PREPARING;
                }
                break;
            case PartyState.PREPARING:
                if (this.adventurers.every(adventurer => adventurer.adventurerState === AdventurerState.WAITING_TO_LEAVE)) {
                    this.state = PartyState.ADVENTURING;
                }
                break;
            case PartyState.ADVENTURING:
                if (this.adventurers.every(adventurer => adventurer.foodBuff <= 0)) {
                    this.state = PartyState.FREE_TIME;
                    this.accumulator = 0;
                }
                break;
        }
    }
}