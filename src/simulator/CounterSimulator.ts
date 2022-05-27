import Simulator, { SimulatorOptions } from './Simulator';
import { SimulatorEvent } from './SimulatorEvent';

interface CounterSimulatorOptions extends SimulatorOptions {
    upperBound: number;
    increment: number;
}

class CountEvent extends SimulatorEvent<CounterSimulatorOptions> {
    public execute(simulator: Simulator<CounterSimulatorOptions>): void {
        simulator.report('Count');

        if (this.time < simulator.options.upperBound) {
            simulator.insert(new CountEvent(this.time + simulator.options.increment));
        }
    }
}

export default class CounterSimulator extends Simulator<CounterSimulatorOptions> {
    protected setupSimulator(): void {
        this.insert(new CountEvent(0));
    }
}
