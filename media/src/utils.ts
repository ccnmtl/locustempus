type HTTPMethod = 'GET' | 'PUT' | 'POST' | 'DELETE'

async function authedFetch(url: string, method: HTTPMethod, data?: unknown): Promise<Response> {
    const csrf = (document.getElementById(
        'csrf-token') as HTMLElement).getAttribute('content') || '';
    const response  = await fetch(url,{
        method: method,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrf
        }, body: JSON.stringify(data), credentials: 'same-origin'
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response;
}

export async function get<T>(url: string): Promise<T> {
    const resp = await authedFetch(url, 'GET');
    if (resp.status !== 200) {
        throw new Error(`GET request failed: ${resp.statusText}`);
    }
    // There's no efficient way to type check the JSON response for
    // generic types at runtime.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsedBody: T = await resp.json();
    return parsedBody;
}

export async function put<T>(url: string, data: unknown): Promise<T> {
    const resp = await authedFetch(url, 'PUT', data);
    if (resp.status !== 200) {
        throw new Error(`PUT request failed: ${resp.statusText}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsedBody: T = await resp.json();
    return parsedBody;
}

export async function post<T>(url: string, data: unknown): Promise<T> {
    const resp = await authedFetch(url, 'POST', data);
    if (resp.status !== 201) {
        throw new Error(`POST request failed: ${resp.statusText}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsedBody: T = await resp.json();
    return parsedBody;
}

export async function del(url: string): Promise<void> {
    const resp = await authedFetch(url, 'DELETE');
    if (resp.status !== 204) {
        throw new Error(`DELETE request failed: ${resp.statusText}`);
    }
}
