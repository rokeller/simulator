import { useState } from 'react';
import ProducerConsumerSimulator from '../simulator/ProducerConsumerSimulator';
import { onFloatChange, onIntChange, onStringChange, SimulatorProperties } from './Common';

export default function ProducerConsumer({ run, report }: SimulatorProperties) {
    const [endTime, setEndTime] = useState<number>(3600);
    const [timeUnit, setTimeUnit] = useState<string>('s');
    const [numConsumers, setNumConsumers] = useState<number>(1);
    const [consumersBatchSize, setConsumersBatchSize] = useState<number>(1);
    const [consumersMaxIdleTime, setConsumersMaxIdleTime] = useState<number>();
    const [consumersSleepTime, setConsumersSleepTime] = useState<number>();
    const [meanProcessingTime, setMeanProcessingTime] = useState<number>(1);
    const [meanArrivalTime, setMeanArrivalTime] = useState<number>(30);

    function createSimulator() {
        return new ProducerConsumerSimulator({
            endTime,
            consumers: {
                count: numConsumers,
                batchSize: consumersBatchSize,
                maxIdleTime: consumersMaxIdleTime || undefined,
                sleepTime: consumersSleepTime || undefined,
                meanProcessingTime,
            },
            numProducers: 1,
            meanArrivalTime,
            timeUnit,
            timePrecision: 6,
            report,
        });
    }

    return <>
        <h2>Producer/Consumer Simulator</h2>
        <label>
            <div>Time unit</div>
            <input type='text' value={timeUnit} onChange={onStringChange(setTimeUnit)} />
        </label>
        <label>
            <div>End time</div>
            <input type='number' min={1} value={endTime} onChange={onIntChange(setEndTime)} />
            <div>{timeUnit}</div>
        </label>
        <hr />
        <div><h3>Producer</h3></div>
        <label>
            <div>Mean arrival time</div>
            <input type='number' min={0.1} step={0.1} value={meanArrivalTime} onChange={onFloatChange(setMeanArrivalTime)} />
            <div>{timeUnit}</div>
        </label>
        <hr />
        <div><h3>Consumers</h3></div>
        <label>
            <div>Count</div>
            <input type='number' min={1} step={1} value={numConsumers} onChange={onIntChange(setNumConsumers)} />
        </label>
        <label>
            <div>Batch size</div>
            <input type='number' min={1} step={1} value={consumersBatchSize} onChange={onIntChange(setConsumersBatchSize)} />
        </label>
        <label>
            <div>Max idle time</div>
            <input type='number' value={consumersMaxIdleTime} onChange={onIntChange(setConsumersMaxIdleTime)} />
            <div>{timeUnit}</div>
        </label>
        <label>
            <div>Sleep time</div>
            <input type='number' value={consumersSleepTime} onChange={onIntChange(setConsumersSleepTime)} />
            <div>{timeUnit}</div>
        </label>
        <label>
            <div>Mean processing time</div>
            <input type='number' value={meanProcessingTime} min={0.1} step={0.1} onChange={onFloatChange(setMeanProcessingTime)} />
            <div>{timeUnit}</div>
        </label>
        <button type='button' onClick={() => run(createSimulator())}>Run</button>
    </>
}
