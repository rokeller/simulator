import Simulator, { SimulatorOptions } from './Simulator';
import { SimulatorEvent } from './SimulatorEvent';

interface BeepSimulatorOptions extends SimulatorOptions {
    times: number[];
}

class Beep extends SimulatorEvent {
    public execute(simulator: Simulator<SimulatorOptions>): void {
        simulator.report('Beep');
    }
}

export default class BeepSimulator extends Simulator<BeepSimulatorOptions> {
    protected setupSimulator(): void {
        this.options.times.forEach((time) => this.insert(new Beep(time)));
    }
}
