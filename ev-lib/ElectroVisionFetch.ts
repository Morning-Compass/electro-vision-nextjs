type TData = string | object | FormData;
type TPutData = string | object | FormData | undefined;
type THeaders = HeadersInit | undefined;

export class ElectroVisionFetch {
  private defaultHeaders = { "Content-Type": "application/json" };

  private async makeRequest(
    method: string,
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

  async get(endpointUrl: string, headers?: THeaders): Promise<any> {
    return this.makeRequest("GET", endpointUrl, undefined, headers);
  }

  async post(
    endpointUrl: string,
    data: TData,
    headers?: THeaders,
  ): Promise<any> {
    return this.makeRequest("POST", endpointUrl, data, headers);
  }

  async put(
    endpointUrl: string,
    data?: TPutData,
    headers?: THeaders,
  ): Promise<any> {
    return this.makeRequest("PUT", endpointUrl, data, headers);
  }

  async delete(
    endpointUrl: string,
    data: TData,
    headers?: THeaders,
  ): Promise<any> {
    return this.makeRequest("DELETE", endpointUrl, data, headers);
  }
}

const OLF = new ElectroVisionFetch();
export default OLF;
