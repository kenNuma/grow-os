
export function calculateVPD(
    temperature: number,
    humidity: number,
): number {
    const saturation =
        0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));

    const actual = saturation * (humidity / 100);

    return saturation - actual;
}