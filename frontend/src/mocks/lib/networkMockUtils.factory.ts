import {
  DefaultRequestBody,
  MockedRequest,
  PathParams,
  ResponseResolver,
  rest,
  RestContext,
  RestHandler,
  RestRequest,
} from "msw";

export function createMockResponse<
  RequestBody extends DefaultRequestBody = DefaultRequestBody,
  Params extends PathParams = PathParams
>(
  endpoint: string,
  resolver: ResponseResolver<
    RestRequest<RequestBody, Params>,
    RestContext,
    DefaultRequestBody
  >,
  options: {
    method: "POST" | "GET" | "DELETE" | "PUT" | "PATCH";
  } = { method: "GET" }
): RestHandler<MockedRequest<RequestBody>> {
  const url = `${process.env.REACT_APP_API_URL}${endpoint}`;
  switch (options.method) {
    case "GET": {
      return rest.get<RequestBody, Params>(url, resolver);
    }
    case "POST": {
      return rest.post<RequestBody, Params>(url, resolver);
    }
    case "DELETE": {
      return rest.delete<RequestBody, Params>(url, resolver);
    }
    case "PATCH": {
      return rest.patch<RequestBody, Params>(url, resolver);
    }
    case "PUT": {
      return rest.put<RequestBody, Params>(url, resolver);
    }
  }
}

export const getQueryParamsFromRestRequest = (
  req: RestRequest<DefaultRequestBody, PathParams>
) => {
  const page = Number(req.url.searchParams.get("page"));
  const perPage = Number(req.url.searchParams.get("perPage"));
  const categoryId = Number(req.url.searchParams.get("category"));
  const title = req.url.searchParams.get("title");

  return {
    page,
    perPage,
    categoryId,
    title,
  } as const;
};
