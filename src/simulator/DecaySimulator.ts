import Random from './Random';
import Simulator, { SimulatorOptions } from './Simulator';
import { SimulatorEvent } from './SimulatorEvent';

interface DecaySimulatorOptions extends SimulatorOptions {
    numItems: number;
    meanLifetime: number;
    percentiles: number[];
}

export function getMeanLifetime(halfLife: number) {
    return halfLife / Math.log(2);
}

export class DecaySimulator extends Simulator<DecaySimulatorOptions> {
    private readonly halfLife: number;
    private readonly percentileCounts: number[] = [];
    private nextPercentileIndex = 0;
    private tenHalfLifesReached = false;

    constructor(options: DecaySimulatorOptions) {
        super(options);

        this.halfLife = options.meanLifetime * Math.log(2);

        options.percentiles.sort();
        for (let i = 0; i < options.percentiles.length; i++) {
            this.percentileCounts[i] = Math.floor(options.percentiles[i] * options.numItems);
        }
    }

    protected setupSimulator(): void {
        for (let i = 0; i < this.options.numItems; i++) {
            this.insert(new SimulatorEvent(Random.exponential({ mean: this.options.meanLifetime })));
        }
    }

    protected override reachedTime(time: number, event: SimulatorEvent<DecaySimulatorOptions>): void {
        if (!this.tenHalfLifesReached && time >= this.halfLife * 10) {
            this.report('Reached 10 half-lifes.');
            this.tenHalfLifesReached = true;
        }
    }

    protected override handledEvents(eventCount: number, event: SimulatorEvent<DecaySimulatorOptions>): void {
        if (this.nextPercentileIndex >= this.percentileCounts.length) {
            return;
        }

        if (this.percentileCounts[this.nextPercentileIndex] === eventCount) {
            const percentile = this.options.percentiles[this.nextPercentileIndex];
            this.report(`${(percentile * 100).toPrecision(5)}% of all nuclei decayed.`);
            this.nextPercentileIndex++;
        }
    }
}
