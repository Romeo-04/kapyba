import type { Instrumentation } from "next";
import { log } from "@/src/log";

// Server errors as structured logs. A Sentry hook can be added here once a DSN exists (docs/RUNBOOK.md).
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const digest = typeof err === "object" && err !== null && "digest" in err ? String(err.digest) : undefined;
  log("error", "request-error", {
    // Not the message: database errors repeat the query parameters, which can hold emails and tokens.
    name: err instanceof Error ? err.name : typeof err,
    digest,
    method: request.method,
    path: request.path.split("?")[0],
    route: context.routePath,
  });
};
