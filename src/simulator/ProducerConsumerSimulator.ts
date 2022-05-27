import Random from './Random';
import Simulator, { SimulatorOptions } from './Simulator';
import { SimulatorEvent } from './SimulatorEvent';

enum ConsumerState {
    Unknown,
    Idle,
    Consuming,
    Sleeping,
}

class Consumer {
    public state: ConsumerState = ConsumerState.Sleeping;
    public lastActivity?: number;

    public shouldSleep(time: number, options: ProducerConsumerOptions): boolean {
        if (undefined === options.consumers.maxIdleTime || undefined === options.consumers.sleepTime) {
            return false;
        }

        return (undefined === this.lastActivity || this.lastActivity + options.consumers.maxIdleTime <= time);
    }
}

function initializeState(options: ProducerConsumerOptions): ProducerConsumerState {
    const consumers = new Array<Consumer>();

    for (let i = 0; i < options.consumers.count; i++) {
        consumers.push(new Consumer());
    }

    return {
        consumers,
        numConsumersIdle: 0, // Consumers start in sleep state.
        consumerSleepCount: 0,
        numItemsProduced: 0,
        numItemsConsumed: 0,
        numItemsWaiting: 0,
        maxQueueLen: 0,
        maxBatchSize: 0,
    };
}

function getIdleConsumerId(state: ProducerConsumerState): number | undefined {
    if (state.numConsumersIdle <= 0) {
        return undefined;
    }

    return state.consumers.findIndex((consumer) => consumer.state === ConsumerState.Idle);
}

interface ConsumerOptions {
    count: number;
    batchSize: number;
    meanProcessingTime: number
    maxIdleTime?: number;
    sleepTime?: number;
}

interface ProducerConsumerOptions extends SimulatorOptions {
    consumers: ConsumerOptions;
    numProducers: number;
    meanArrivalTime: number;
    endTime: number;
}

interface ProducerConsumerState {
    consumers: Consumer[];
    numConsumersIdle: number;
    consumerSleepCount: number;
    numItemsProduced: number;
    numItemsConsumed: number;
    numItemsWaiting: number,
    maxQueueLen: number;
    maxBatchSize: number;
}

class ConsumerStartSleep extends SimulatorEvent<ProducerConsumerOptions, ProducerConsumerState> {
    constructor(private readonly consumerId: number, time: number) {
        super(time);
    }

    public override execute(simulator: Simulator<ProducerConsumerOptions, ProducerConsumerState>): void {
        const state = simulator.getState();
        if (state.consumers[this.consumerId].shouldSleep(this.time, simulator.options)) {
            state.consumers[this.consumerId].state = ConsumerState.Sleeping;
            state.numConsumersIdle--;
            state.consumerSleepCount++;
            simulator.report(`Consumer ${this.consumerId} is going to sleep because of inactivity.`);
            simulator.insert(new ConsumerWakeUp(this.consumerId, this.time + simulator.options.consumers.sleepTime!))
        }
    }
}

class ConsumerWakeUp extends SimulatorEvent<ProducerConsumerOptions, ProducerConsumerState> {
    constructor(private readonly consumerId: number, time: number) {
        super(time);
    }

    public override execute(simulator: Simulator<ProducerConsumerOptions, ProducerConsumerState>): void {
        const state = simulator.getState();
        simulator.report(`Consumer ${this.consumerId} is waking up.`);
        state.consumers[this.consumerId].state = ConsumerState.Idle;
        state.numConsumersIdle++;

        if (undefined !== simulator.options.consumers.maxIdleTime) {
            simulator.insert(new ConsumerStartSleep(this.consumerId, this.time + simulator.options.consumers.maxIdleTime));
        }
    }
}

class BatchConsumed extends SimulatorEvent<ProducerConsumerOptions, ProducerConsumerState> {
    constructor(private readonly consumerId: number, private readonly batchSize: number, time: number) {
        super(time);
    }

    public execute(simulator: Simulator<ProducerConsumerOptions, ProducerConsumerState>): void {
        const state = simulator.getState();
        simulator.report(`Batch of size ${this.batchSize} finished by #${this.consumerId}. ${state.numItemsWaiting} items waiting.`);
        state.consumers[this.consumerId].lastActivity = this.time;
        state.numItemsConsumed += this.batchSize;

        if (this.batchSize > state.maxBatchSize) {
            state.maxBatchSize = this.batchSize;
        }

        if (state.numItemsWaiting > 0) {
            const batchSize = Math.min(state.numItemsWaiting, simulator.options.consumers.batchSize);
            state.numItemsWaiting -= batchSize;
            state.consumers[this.consumerId].state = ConsumerState.Consuming;
            BatchConsumed.schedule(this.consumerId, batchSize, simulator);
        } else {
            state.consumers[this.consumerId].state = ConsumerState.Idle;
            state.numConsumersIdle++;
        }
    }

    public static schedule(consumerId: number, batchSize: number, simulator: Simulator<ProducerConsumerOptions>): void {
        simulator.insert(new BatchConsumed(
            consumerId,
            batchSize,
            simulator.now() + Random.exponential({ mean: simulator.options.consumers.meanProcessingTime })));
    }
}

class ItemProduced extends SimulatorEvent<ProducerConsumerOptions, ProducerConsumerState> {
    public execute(simulator: Simulator<ProducerConsumerOptions, ProducerConsumerState>): void {
        const state = simulator.getState();
        state.numItemsProduced++;
        state.numItemsWaiting++;
        if (state.numItemsWaiting > state.maxQueueLen) {
            state.maxQueueLen = state.numItemsWaiting;
        }

        const consumerId = getIdleConsumerId(state);
        if (undefined !== consumerId) {
            simulator.report(`Item produced. ${state.numConsumersIdle} consumers idle, assign to #${consumerId}.`);
            const batchSize = Math.min(state.numItemsWaiting, simulator.options.consumers.batchSize);

            state.consumers[consumerId].state = ConsumerState.Consuming;
            state.numConsumersIdle--;

            state.numItemsWaiting -= batchSize;
            state.consumers[consumerId].lastActivity = this.time;

            BatchConsumed.schedule(consumerId, batchSize, simulator);
        } else {
            simulator.report(`Item produced. No consumers idle.`);
        }

        ItemProduced.schedule(simulator);
    }

    public static schedule(simulator: Simulator<ProducerConsumerOptions>): void {
        simulator.insert(new ItemProduced(
            simulator.now() + Random.exponential({ mean: simulator.options.meanArrivalTime })));
    }
}

class End extends SimulatorEvent<ProducerConsumerOptions, ProducerConsumerState> {
    public override execute(simulator: Simulator<ProducerConsumerOptions, ProducerConsumerState>): void {
        simulator.stop();
        const state = simulator.getState();
        simulator.report('Statistics:\n' +
            `\t# Procuded       : ${state.numItemsProduced}\n` +
            `\t# Consumed       : ${state.numItemsConsumed}\n` +
            `\t# Sleep          : ${state.consumerSleepCount}\n` +
            `\t# Items Waiting  : ${state.numItemsWaiting}\n` +
            `\tMax Queue Length : ${state.maxQueueLen}\n` +
            `\tMax Batch Size   : ${state.maxBatchSize}\n`);
    }
}

export default class ProducerConsumerSimulator extends Simulator<ProducerConsumerOptions, ProducerConsumerState> {
    constructor(options: ProducerConsumerOptions) {
        super(options, initializeState(options));
    }

    protected setupSimulator(): void {
        for (let i = 0; i < this.options.consumers.count; i++) {
            this.insert(new ConsumerWakeUp(i, 0));
        }

        this.insert(new End(this.options.endTime));
        ItemProduced.schedule(this);
    }
}
