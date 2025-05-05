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
        const errorText = await response.text();
        return { error: new ElectroVisionError(errorText) };
      }

      return { data: await response.json() };
    } catch (error) {
      console.error("ElectroVisionGet error: ", error);
      return {
        error:
          error instanceof Error
            ? error
            : new ElectroVisionError(String(error)),
      };
    }
  }

  async post(endpointUrl: string, data: TData, headers: THeaders = undefined) {
    try {
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
            return { error: new ElectroVisionError("502 Bad Gateway") };
          }
          return {
            error: new ElectroVisionError(
              `ElectroVisionPost went wrong (${errorText})`,
            ),
          };
        }
        return { data: await response.json() };
      }

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: new ElectroVisionError(errorText) };
      }
      return { data: await response.json() };
    } catch (error) {
      console.error("ElectroVisionPost error: ", error);
      return {
        error:
          error instanceof Error
            ? error
            : new ElectroVisionError(String(error)),
      };
    }
  }

  async put(
    endpointUrl: string,
    data: TPutData = undefined,
    headers: THeaders = undefined,
  ) {
    try {
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
        return { error: new ElectroVisionError(errorText) };
      }
      return { data: await response.json() };
    } catch (error) {
      console.error("ElectroVisionPut error: ", error);
      return {
        error:
          error instanceof Error
            ? error
            : new ElectroVisionError(String(error)),
      };
    }
  }

  async delete(
    endpointUrl: string,
    data: TData,
    headers: THeaders = undefined,
  ) {
    try {
      const response = await fetch(endpointUrl, {
        method: "DELETE",
        headers: headers
          ? new Headers(headers)
          : new Headers(this.defaultHeaders),
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          error: new ElectroVisionError(
            `ElectroVisionDelete went wrong (${errorText})`,
          ),
        };
      }
      return { data: await response.json() };
    } catch (error) {
      console.error("ElectroVisionDelete error: ", error);
      return {
        error:
          error instanceof Error
            ? error
            : new ElectroVisionError(String(error)),
      };
    }
  }
}

const OLF = new ElectroVisionFetch();
export default OLF;
