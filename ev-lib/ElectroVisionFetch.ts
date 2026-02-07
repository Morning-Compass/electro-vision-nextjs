type TData = string | object | FormData;
type TPutData = string | object | FormData | undefined;
type THeaders = HeadersInit | undefined;
type Method = "GET" | "POST" | "PUT" | "DELETE";

export class ElectroVisionFetch {
  private defaultHeaders = { "Content-Type": "application/json" };

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
      } catch (e) {
        console.error("Failed to parse json res");
        // Failed to parse JSON error response
      }
      throw new Error(errorMessage);
    }

    try {
      const responseData = await response.json();
      return responseData.response ?? responseData;
    } catch (e) {
      throw new Error("Failed to parse JSON response");
    }
  }

  validateHeadersAndMakeRequest(
    method: Method,
    authorization: string,
    endpointUrl: string,
    data: TData | undefined,
    headers?: THeaders,
  ) {
    authorization = !authorization.startsWith("Bearer")
      ? "Bearer " + authorization
      : authorization;

    const combinedHeaders =
      headers !== null && headers !== undefined
        ? new Headers(headers)
        : new Headers();

    if (authorization !== null && authorization !== undefined) {
      combinedHeaders.append("Authorization", authorization);
    }
    return this.makeRequest(method, endpointUrl, data, combinedHeaders);
  }

  async get(
    endpointUrl: string,
    headers?: THeaders,
    authorization?: string,
  ): Promise<any> {
    if (authorization === null || authorization === undefined) {
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
    if (authorization === null || authorization === undefined) {
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
    if (authorization === null || authorization === undefined) {
      return this.makeRequest("PUT", endpointUrl, data, headers);
    }
    return this.validateHeadersAndMakeRequest(
      "PUT",
      authorization,
      endpointUrl,
      data,
    );
  }

  async delete(
    endpointUrl: string,
    data?: TData,
    headers?: THeaders,
    authorization?: string,
  ): Promise<any> {
    if (authorization === null || authorization === undefined) {
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
