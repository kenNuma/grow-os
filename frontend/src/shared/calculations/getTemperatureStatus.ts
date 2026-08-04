import type { EnvironmentStatus } from "./status_type";

export function getTemperatureStatus(
    temperature: number,
): EnvironmentStatus {
    if (temperature < 15) {
        return {
            label: "Low",
            variant: "low",
            title: "Temperature is too low.",
            description:
                "Plant growth may slow down. Consider increasing the temperature.",
        };
    }

    if (temperature <= 28) {
        return {
            label: "Optimal",
            variant: "optimal",
        };
    }

    if (temperature <= 35) {
        return {
            label: "High",
            variant: "high",
            title: "Temperature is high.",
            description:
                "Plants may experience heat stress. Consider improving ventilation or reducing heat.",
        };
    }

    return {
        label: "Critical",
        variant: "critical",
        title: "Temperature is critically high.",
        description:
            "Plants are at high risk of heat stress. Reduce the temperature as soon as possible.",
    };
}