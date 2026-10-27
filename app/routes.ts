import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/list.tsx"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
  ]),
] satisfies RouteConfig;