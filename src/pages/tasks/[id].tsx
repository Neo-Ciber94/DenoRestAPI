import { h } from "nano_jsx";
import { InferServerSideProps, RequestWithParams } from "../../ssr/types.ts";

export function getServerSideProps(req: RequestWithParams) {
  return {
    data: {
      hello: req.params.id,
    },
  };
}

type Data = InferServerSideProps<typeof getServerSideProps>;

export default function GoodBye(data: Data) {
  return <h2 style="color: red">Hello {JSON.stringify(data)}</h2>;
}
