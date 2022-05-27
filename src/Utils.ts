class Utils {
    public formatSignificantDigits(x: number, significantDigits: number) : string {
        return x.toPrecision(significantDigits);
    }
}

export default new Utils();
