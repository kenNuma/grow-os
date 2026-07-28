const API_BASE_URL =
    process.env.API_BASE_URL ?? "http://localhost:3000";

const DEVICE_KEY = process.env.DEVICE_KEY;

const INTERVAL_MS = Number(
    process.env.INTERVAL_MS ?? 5000,
);

if (!DEVICE_KEY) {
    console.error(
        "DEVICE_KEY is required. Example: DEVICE_KEY=device-001 npm run simulate:telemetry",
    );

    process.exit(1);
}

if (
    !Number.isFinite(INTERVAL_MS) ||
    INTERVAL_MS < 1000
) {
    console.error(
        "INTERVAL_MS must be a number greater than or equal to 1000.",
    );

    process.exit(1);
}

let temperature = 25;
let humidity = 60;
let isSending = false;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function round(value, digits = 1) {
    return Number(value.toFixed(digits));
}

function createTelemetry() {
    const temperatureChange =
        (Math.random() - 0.5) * 0.8;

    const humidityChange =
        (Math.random() - 0.5) * 2;

    temperature = round(
        clamp(
            temperature + temperatureChange,
            18,
            35,
        ),
    );

    humidity = round(
        clamp(
            humidity + humidityChange,
            35,
            85,
        ),
    );

    return {
        deviceKey: DEVICE_KEY,
        temperature,
        humidity,
    };
}

async function sendTelemetry() {
    if (isSending) {
        console.warn(
            "Previous request is still running. Skipping this interval.",
        );

        return;
    }

    isSending = true;

    const telemetry = createTelemetry();

    try {
        const response = await fetch(
            `${API_BASE_URL}/telemetry`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(telemetry),
            },
        );

        if (!response.ok) {
            const errorBody = await response.text();

            throw new Error(
                `${response.status} ${response.statusText}: ${errorBody}`,
            );
        }

        const createdTelemetry =
            await response.json();

        console.log(
            `[${new Date().toLocaleTimeString("ja-JP")}]`,
            `temperature=${telemetry.temperature}°C`,
            `humidity=${telemetry.humidity}%`,
            createdTelemetry,
        );
    } catch (error) {
        console.error(
            `[${new Date().toLocaleTimeString("ja-JP")}] Failed to send telemetry:`,
            error instanceof Error
                ? error.message
                : error,
        );
    } finally {
        isSending = false;
    }
}

console.log("Telemetry simulator started.");
console.log(`API: ${API_BASE_URL}/telemetry`);
console.log(`Device key: ${DEVICE_KEY}`);
console.log(`Interval: ${INTERVAL_MS}ms`);
console.log("Press Ctrl + C to stop.");

await sendTelemetry();

const intervalId = setInterval(
    sendTelemetry,
    INTERVAL_MS,
);

function stopSimulator() {
    clearInterval(intervalId);

    console.log("\nTelemetry simulator stopped.");

    process.exit(0);
}

process.on("SIGINT", stopSimulator);
process.on("SIGTERM", stopSimulator);