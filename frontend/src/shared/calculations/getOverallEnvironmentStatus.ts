import type { EnvironmentStatus, StatusVariant } from "./status_type";

export type OverallEnvironmentStatus = {
    label: "Healthy" | "Warning" | "Critical";
    variant: "healthy" | "warning" | "critical";
};

const severityByVariant: Record<StatusVariant, number> = {
    optimal: 0,
    low: 1,
    high: 1,
    critical: 2,
};

export function getOverallEnvironmentStatus(
    statuses: EnvironmentStatus[],
): OverallEnvironmentStatus {
    const highestSeverity = Math.max(
        ...statuses.map(
            (status) => severityByVariant[status.variant],
        ),
    );

    if (highestSeverity === 2) {
        return {
            label: "Critical",
            variant: "critical",
        };
    }

    if (highestSeverity === 1) {
        return {
            label: "Warning",
            variant: "warning",
        };
    }

    return {
        label: "Healthy",
        variant: "healthy",
    };
}