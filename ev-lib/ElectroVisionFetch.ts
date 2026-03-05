type TData = string | object | FormData;
type TPutData = string | object | FormData | undefined;
type THeaders = HeadersInit | undefined;
type Method = "GET" | "POST" | "PUT" | "DELETE";

export class FetchError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

export class ElectroVisionFetch {
  private defaultHeaders = { "Content-Type": "application/json" };
  private refreshCallback: (() => Promise<string | null>) | null = null;

  setRefreshCallback(cb: () => Promise<string | null>) {
    this.refreshCallback = cb;
  }

  private async makeRequest(
    method: Method,
    endpointUrl: string,
    data?: TData | TPutData,
    headers?: THeaders,
  ): Promise<any> {
    const isFormData = data instanceof FormData;

    const requestHeaders = isFormData
      ? new Headers(headers)
      : new Headers(headers || this.defaultHeaders);

    if (isFormData) {
      requestHeaders.delete("Content-Type");
    }

    const body = isFormData
      ? data
      : data && typeof data !== "string"
        ? JSON.stringify(data)
        : data;

    const response = await fetch(endpointUrl, {
      method,
      headers: requestHeaders,
      body,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const responseData = await response.json();
        errorMessage = responseData?.response || errorMessage;
      } catch {
        // Failed to parse JSON error response
      }
      throw new FetchError(errorMessage, response.status);
    }

    try {
      const responseData = await response.json();
      return responseData.response ?? responseData;
    } catch {
      throw new FetchError("Failed to parse JSON response", 200);
    }
  }

  private async validateHeadersAndMakeRequest(
    method: Method,
    authorization: string,
    endpointUrl: string,
    data: TData | undefined,
    headers?: THeaders,
    retrying = false,
  ): Promise<any> {
    const auth = !authorization.startsWith("Bearer")
      ? "Bearer " + authorization
      : authorization;

    const combinedHeaders = new Headers(this.defaultHeaders);

    if (headers != null) {
      const providedHeaders = new Headers(headers);
      providedHeaders.forEach((value, key) => {
        combinedHeaders.set(key, value);
      });
    }

    combinedHeaders.set("Authorization", auth);

    try {
      return await this.makeRequest(method, endpointUrl, data, combinedHeaders);
    } catch (err) {
      if (
        !retrying &&
        err instanceof FetchError &&
        err.status === 401 &&
        this.refreshCallback
      ) {
        const newToken = await this.refreshCallback();
        if (newToken) {
          return this.validateHeadersAndMakeRequest(
            method,
            newToken,
            endpointUrl,
            data,
            headers,
            true,
          );
        }
      }
      throw err;
    }
  }

  async get(
    endpointUrl: string,
    headers?: THeaders,
    authorization?: string,
  ): Promise<any> {
    if (authorization == null) {
      return this.makeRequest("GET", endpointUrl, undefined, headers);
    }
    return this.validateHeadersAndMakeRequest(
      "GET",
      authorization,
      endpointUrl,
      undefined,
    );
  }

  async post(
    endpointUrl: string,
    data: TData,
    headers?: THeaders,
    authorization?: string,
  ): Promise<any> {
    if (authorization == null) {
      return this.makeRequest("POST", endpointUrl, data, headers);
    }
    return this.validateHeadersAndMakeRequest(
      "POST",
      authorization,
      endpointUrl,
      data,
    );
  }

  async put(
    endpointUrl: string,
    data?: TPutData,
    headers?: THeaders,
    authorization?: string,
  ): Promise<any> {
    if (authorization == null) {
      return this.makeRequest("PUT", endpointUrl, data, headers);
    }
    return this.validateHeadersAndMakeRequest(
      "PUT",
      authorization,
      endpointUrl,
      data as TData | undefined,
    );
  }

  async delete(
    endpointUrl: string,
    data?: TData,
    headers?: THeaders,
    authorization?: string,
  ): Promise<any> {
    if (authorization == null) {
      return this.makeRequest("DELETE", endpointUrl, data, headers);
    }
    return this.validateHeadersAndMakeRequest(
      "DELETE",
      authorization,
      endpointUrl,
      data,
    );
  }
}

const OLF = new ElectroVisionFetch();
export default OLF;
