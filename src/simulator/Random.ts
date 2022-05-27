interface ExponentialOptions {
    mean?: number;
    lambda?: number;
}

class Random {
    public exponential(options: ExponentialOptions): number {
        if (options.mean !== undefined) {
            return -options.mean * Math.log(Math.random());
        } else if (options.lambda !== undefined) {
            return this.exponential({ mean: 1.0 / options.lambda });
        } else {
            throw new Error('One of mean | lambda must be specified in the options.');
        }
    }
}

export default new Random();
