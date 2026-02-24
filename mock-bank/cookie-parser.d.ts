declare module "cookie-parser" {
  const cookieParser: (secret?: string) => import("express").RequestHandler;
  export default cookieParser;
}
