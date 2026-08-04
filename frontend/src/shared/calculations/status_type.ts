export type StatusVariant =
    | "low"
    | "optimal"
    | "high"
    | "critical";

export type EnvironmentStatus = {
    label: string;
    variant: StatusVariant;
    title?: string;
    description?: string;
};