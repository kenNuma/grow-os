const ONLINE_THRESHOLD_MS = 30_000;

export function isDeviceOnline(
    lastSeenAt: string | null,
    currentTime = Date.now(),
): boolean {
    if (!lastSeenAt) {
        return false;
    }

    const lastSeenTime = new Date(lastSeenAt).getTime();

    if (Number.isNaN(lastSeenTime)) {
        return false;
    }

    return currentTime - lastSeenTime <= ONLINE_THRESHOLD_MS;
}