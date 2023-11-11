// Uses the format ${perPage}.${page} for the cursor encoded base64

export function decodeCursor({
  first,
  after,
}: {
  first: number;
  after?: string;
}): { perPage: number; page: number } {
  if (!after) {
    return { perPage: first, page: 1 };
  }
  const cursor = Buffer.from(after, "base64").toString("ascii").split(".");
  if (cursor.length !== 2) {
    throw new Error(`Invalid cursor ${after}`);
  }
  if (cursor[0] !== first.toString()) {
    throw new Error(
      `Changing page size between calls unsupported. Was ${cursor[0]}, requested ${first}.`,
    );
  }
  return {
    perPage: first,
    page: parseInt(cursor[1]),
  };
}

export function encodeCursor({
  perPage,
  page,
}: {
  perPage: number;
  page: number;
}): string {
  return Buffer.from(`${perPage}.${page}`).toString("base64");
}

export function buildPage({ total, perPage, page, items }) {
  const hasNextPage = page < total / perPage;
  return {
    total,
    items,
    hasNextPage,
    nextPageCursor: hasNextPage
      ? encodeCursor({ perPage, page: page + 1 })
      : null,
  };
}
