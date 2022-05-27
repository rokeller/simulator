import Utils from '../Utils';
import MinHeap from './MinHeap';
import { SimulatorEvent } from './SimulatorEvent';

const DefaultTimePrecision = 3;

export interface SimulatorOptions {
    timeUnit: string;
    timePrecision?: number; // default: 3
    report?: (output: string) => void; // default: no reporting
}

export interface RunResult<TOptions extends SimulatorOptions = SimulatorOptions> {
    lastTime: number;
    lastEvent?: SimulatorEvent<TOptions>;
    runtimeMs: number;
}

export default abstract class Simulator<TOptions extends SimulatorOptions = SimulatorOptions, TState = {}> {
    private readonly events = new MinHeap<SimulatorEvent<TOptions>>();
    private time = 0;

    constructor(public readonly options: TOptions, private state: TState = {} as TState) {
    }

    public now(): number {
        return this.time;
    }

    public nowString(): string {
        return this.toTimeString(this.now());
    }

    public toTimeString(time: number): string {
        return Utils.formatSignificantDigits(time, this.options.timePrecision || DefaultTimePrecision) + this.options.timeUnit;
    }

    public report(text: string): void {
        if (this.options.report) {
            this.options.report(this.nowString() + ': ' + text);
        }
    }

    public setup() {
        this.setupSimulator();
        return this;
    }

    public run(): RunResult<TOptions> {
        const start = new Date();
        let event: SimulatorEvent<TOptions> | undefined;
        let lastEvent: SimulatorEvent<TOptions> | undefined = undefined;
        let lastTime = -1;
        let eventCount = 0;

        while (undefined !== (event = this.removeFirstEvent())) {
            lastEvent = event;
            eventCount++;

            this.time = event.time;
            if (this.time < lastTime) {
                throw new Error('The events\' times must be increasing.');
            }
            lastTime = this.time;

            this.reachedTime(this.time, event);
            event.execute(this);
            this.handledEvents(eventCount, event);
        }

        const end = new Date();

        return { lastTime, lastEvent, runtimeMs: end.valueOf() - start.valueOf() };
    }

    public insert(event: SimulatorEvent<TOptions>) {
        this.events.add(event);
    }

    public stop(): void {
        this.events.removeAll();
    }

    public getState(): TState {
        return this.state;
    }

    public setState(setter: (previousState?: TState) => TState): void {
        this.state = setter(this.state);
    }

    protected abstract setupSimulator(): void;

    protected reachedTime(time: number, event: SimulatorEvent<TOptions>) {
        // Interested simulators should override.
    }

    protected handledEvents(eventCount: number, event: SimulatorEvent<TOptions>) {
        // Interested simulators should override.
    }

    private removeFirstEvent(): SimulatorEvent<TOptions> | undefined {
        return this.events.removeRoot();
    }
}
