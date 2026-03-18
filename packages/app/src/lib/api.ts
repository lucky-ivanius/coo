import { hc } from "hono/client";

import type { AssertionApi } from "@coo/api/types";

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787";

export const assertionApi = hc<AssertionApi>(`${apiBaseUrl}/assertions`);
