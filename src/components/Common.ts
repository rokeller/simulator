import Simulator from '../simulator/Simulator';

export function onIntChange(callback: (newVal: number) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => callback(Number.parseInt(e.target.value, 10));
}

export function onFloatChange(callback: (newVal: number) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => callback(Number.parseFloat(e.target.value));
}

export function onStringChange(callback: (newVal: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => callback(e.target.value);
}

export function onMultiStringChange(callback: (newVal: string) => void) {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) => callback(e.target.value);
}

export interface SimulatorProperties {
    run: (s: Simulator) => void;
    report: (t: string) => void;
}
