export type VPDStatus = {
    label: string;
    variant: string;
    title?: string;
    description?: string;
};

export function getVPDStatus(vpd: number): VPDStatus {
    if (vpd < 0.8) {
        return {
            label: "Low",
            variant: "low",
            title: "VPD is too low.",
            description: "Humidity may be too high. Plants may experience reduced transpiration and increased disease risk."
        };
    }

    if (vpd <= 1.2) {
        return {
            label: "Optimal",
            variant: "optimal",
        };
    }

    if (vpd <= 1.8) {
        return {
            label: "High",
            variant: "high",
            title: "VPD is high.",
            description: "Plants may experience increased transpiration.",
        };
    }

    return {
        label: "Critical",
        variant: "critical",
        title: "VPD is critically high.",
        description: "Plants may lose water rapidly. Consider increasing humidity or reducing temperature."
    };
}