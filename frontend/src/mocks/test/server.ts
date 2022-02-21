import { DefaultRequestBody, MockedRequest, RestHandler } from "msw";
import { setupServer } from "msw/node";

const handlers: RestHandler<MockedRequest<DefaultRequestBody>>[] = [];
export const server = setupServer(...handlers);
