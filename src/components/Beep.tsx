import { useState } from 'react';
import BeepSimulator from '../simulator/BeepSimulator';
import { onMultiStringChange, SimulatorProperties } from './Common';

export default function Beep({ run, report }: SimulatorProperties) {
    const [rawTimes, setRawTimes] = useState<string>('4\n1\n23\n1.5\n2');

    function createBeepSimulator() {
        const times: number[] = [];
        rawTimes.split(/[\r\n]+/gi).forEach((rawTime) => times.push(Number.parseFloat(rawTime)));
        return new BeepSimulator({ times, timeUnit: ' ticks', report, });
    }

    return <>
        <h2>Beep Simulator</h2>
        <label className='wide'>
            <div>Beep times (any order, one number per line):</div>
            <textarea className='r' aria-multiline={true} rows={10} onChange={onMultiStringChange(setRawTimes)} value={rawTimes} />
        </label>
        <button type='button' onClick={() => run(createBeepSimulator())}>Run</button>
    </>;
}
