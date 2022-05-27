import { Comparable } from './MinHeap';
import Simulator, { SimulatorOptions } from './Simulator';

export class SimulatorEvent<TOptions extends SimulatorOptions = SimulatorOptions, TState = {}> implements Comparable<SimulatorEvent<TOptions, TState>>{
    constructor(public readonly time: number) {
    }

    public compareTo(other?: SimulatorEvent<TOptions, TState>): number {
        if (other === undefined) {
            return 1;
        }

        if (this.time < other.time) {
            return -1;
        } else if (this.time === other.time) {
            return 0;
        } else {
            return 1;
        }
    }

    public execute(simulator: Simulator<TOptions, TState>): void {
    }
}
