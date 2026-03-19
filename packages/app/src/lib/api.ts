import type { Assertion } from "@coo/core";

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787";

export const getAssertions = async () => {
  const response = await fetch(`${apiBaseUrl}/assertions`);
  if (!response.ok) return [];

  const data = await response.json();

  return data as Assertion[];
};
