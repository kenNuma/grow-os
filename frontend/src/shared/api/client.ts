const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not defined");
}

type RequestOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
};

export class ApiError extends Error {
    readonly status: number;
    readonly responseBody: unknown;

    constructor(
        message: string,
        status: number,
        responseBody: unknown,
    ) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.responseBody = responseBody;
    }
}

export async function apiClient<T>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
        body:
            options.body !== undefined
                ? JSON.stringify(options.body)
                : undefined,
    });

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
        throw new ApiError(
            getErrorMessage(responseBody, response.status),
            response.status,
            responseBody,
        );
    }

    return responseBody as T;
}

async function parseResponseBody(
    response: Response,
): Promise<unknown> {
    if (response.status === 204) {
        return undefined;
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
        return response.json();
    }

    return response.text();
}

function getErrorMessage(
    responseBody: unknown,
    status: number,
): string {
    if (
        typeof responseBody === "object" &&
        responseBody !== null &&
        "message" in responseBody
    ) {
        const message = responseBody.message;

        if (typeof message === "string") {
            return message;
        }

        if (
            Array.isArray(message) &&
            message.every((item) => typeof item === "string")
        ) {
            return message.join(", ");
        }
    }

    return `API request failed with status ${status}`;
}