type TData = string | Object;
type TPutData = string | Object | undefined;
type THeaders = HeadersInit | undefined;

export class ElectroVisionError extends Error {
  public title: string = "";
  public error: string = "";

  constructor(errorText: string) {
    super("ElectroVisionFetch went wrong");
    this.name = "ElectroVisionError";
    this.title = "ElectroVisionFetch went wrong";
    this.error = errorText;
  }

  toString() {
    return JSON.stringify({ title: this.title, error: this.error });
  }
}

export class ElectroVisionFetch {
  private defaultHeaders = { "Content-Type": "application/json" };

  async get(endpointUrl: string, headers: THeaders = undefined) {
    try {
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: headers
          ? new Headers(headers)
          : new Headers(this.defaultHeaders),
      });

      if (!response.ok) {
        throw new Error("ElectroVisionGet went wrong");
      }

      return await response.json();
    } catch (error) {
      console.error("ElectroVisionGet error: ", error);
      throw error; // Propagate the error to the caller
    }
  }

  async post(endpointUrl: string, data: TData, headers: THeaders = undefined) {
    if (data != undefined) {
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: headers
          ? new Headers(headers)
          : new Headers(this.defaultHeaders),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status == 502) {
          throw new Error("502");
        }
        throw new Error(`ElectroVisionPost went wrong (${errorText}})`);
      }
      return await response.json();
    }
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: this.defaultHeaders,
    });

    if (!response.ok) throw new Error("ElectroVisionPost went wrong");
    return await response.json();
  }

  async put(
    endpointUrl: string,
    data: TPutData = undefined,
    headers: THeaders = undefined,
  ) {
    let response;
    if (data == undefined) {
      response = await fetch(endpointUrl, {
        method: "PUT",
        headers: headers
          ? new Headers(headers)
          : new Headers(this.defaultHeaders),
      });
    } else {
      response = await fetch(endpointUrl, {
        method: "PUT",
        headers: headers
          ? new Headers(headers)
          : new Headers(this.defaultHeaders),
        body: JSON.stringify({ data }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      //      throw { title: "ElectroVisionPut went wrong", error: errorText };
      throw new ElectroVisionError(errorText);
    }
    return await response.json();
  }

  async delete(
    endpointUrl: string,
    data: TData,
    headers: THeaders = undefined,
  ) {
    const response = await fetch(endpointUrl, {
      method: "DELETE",
      headers: headers
        ? new Headers(headers)
        : new Headers(this.defaultHeaders),
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElectroVisionDelete went wrong (${errorText})`);
    }
    return await response.json();
  }
}

const OLF = new ElectroVisionFetch();
export default OLF;
