import { Request as OakRequest } from "oak";

export type StringMap = Record<string, string>;

export type GetServerSidePropsResult<T> = {
  data: T;
};

export type RequestWithParams = OakRequest & {
  params: StringMap;
  query: StringMap;
};

export type GetServerSideProps<T = unknown> = (
  req: RequestWithParams
) => Promise<GetServerSidePropsResult<T>> | GetServerSidePropsResult<T>;

export type InferServerSideProps<F extends GetServerSideProps<unknown>> =
  ReturnType<F>;
