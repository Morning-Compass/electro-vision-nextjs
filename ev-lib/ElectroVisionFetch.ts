type TData = string | object;
type TPutData = string | object | undefined;
type THeaders = HeadersInit | undefined;

export class ElectroVisionFetch {
  private defaultHeaders = { "Content-Type": "application/json" };

  private async makeRequest(
    method: string,
    endpointUrl: string,
    data?: TData | TPutData,
    headers?: THeaders,
  ): Promise<any> {
    const requestHeaders = headers
      ? new Headers(headers)
      : new Headers(this.defaultHeaders);

    const response = await fetch(endpointUrl, {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData?.response ||
        `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseData.response;
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
