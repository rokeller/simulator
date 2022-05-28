import { useState } from 'react';
import CounterSimulator from '../simulator/CounterSimulator';
import { onIntChange, SimulatorProperties } from './Common';

export default function Counter({ run, report }: SimulatorProperties) {
    const [increment, setIncrement] = useState<number>(1);
    const [upperBound, setUpperBound] = useState<number>(20);

    function createCounterSimulator() {
        return new CounterSimulator({ increment, upperBound, timeUnit: ' ticks', report });
    }

    return <>
        <h2>Counter Simulator</h2>
        <label>
            <div>Count using increment of</div>
            <input type='number' min={1} step={1} value={increment} onChange={onIntChange(setIncrement)} />
        </label>
        <label>
            <div>Count as long as time is less than</div>
            <input type='number' min={1} step={1} value={upperBound} onChange={onIntChange(setUpperBound)} />
        </label>
        <button type='button' onClick={() => run(createCounterSimulator())}>Run</button>
    </>;
}
