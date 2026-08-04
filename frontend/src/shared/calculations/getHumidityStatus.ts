import type { EnvironmentStatus } from "./status_type";

export function getHumidityStatus(
    humidity: number,
): EnvironmentStatus {
    if (humidity < 40) {
        return {
            label: "Low",
            variant: "low",
            title: "Humidity is too low.",
            description:
                "Plants may lose water more quickly. Consider increasing humidity.",
        };
    }

    if (humidity <= 70) {
        return {
            label: "Optimal",
            variant: "optimal",
        };
    }

    if (humidity <= 85) {
        return {
            label: "High",
            variant: "high",
            title: "Humidity is high.",
            description:
                "High humidity may reduce transpiration and increase the risk of disease.",
        };
    }

    return {
        label: "Critical",
        variant: "critical",
        title: "Humidity is critically high.",
        description:
            "Excessive humidity may cause condensation and increase the risk of mold or disease.",
    };
}