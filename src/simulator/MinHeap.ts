export interface Comparable<T> {
    compareTo(other?: T): number;
}

export default class MinHeap<T extends Comparable<T>> {
    private readonly heap: T[] = [];

    public add(item: T): void {
        const insertIndex = this.heap.length;
        this.heap.push(item);

        if (insertIndex > 0) {
            this.moveUp(insertIndex);
        }
    }

    public removeRoot(): T | undefined {
        if (this.heap.length < 1) {
            return undefined;
        }

        const root = this.heap[0];
        const last = this.heap.pop()!;

        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.moveDown(0);
        }

        return root;
    }

    public removeAll(): void {
        if (this.heap.length > 0) {
            this.heap.splice(0, this.heap.length)
        }
    }

    private moveUp(index: number) {
        const parentIndex = (index - 1) >> 1;
        if (this.heap[index].compareTo(this.heap[parentIndex]) < 0) {
            this.swap(index, parentIndex);

            if (parentIndex > 0) {
                this.moveUp(parentIndex);
            }
        }
    }

    private moveDown(index: number) {
        const leftChildIndex = (index << 1) + 1;
        const rightChildIndex = leftChildIndex + 1;
        let minIndex = index;

        if (index + 1 >= this.heap.length) {
            // We're looking at the last element on the heap, so nothing to do anymore.
            return;
        }

        if (leftChildIndex < this.heap.length) {
            if (this.heap[leftChildIndex].compareTo(this.heap[minIndex]) < 0) {
                minIndex = leftChildIndex;
            }

            if (rightChildIndex < this.heap.length &&
                this.heap[rightChildIndex].compareTo(this.heap[minIndex]) < 0) {
                minIndex = rightChildIndex;
            }

            if (minIndex !== index) {
                this.swap(minIndex, index);
                this.moveDown(minIndex);
            }
        }
    }

    private swap(first: number, second: number) {
        const temp = this.heap[first];
        this.heap[first] = this.heap[second];
        this.heap[second] = temp;
    }
}
