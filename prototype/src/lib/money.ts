export class InputError extends Error {}

export function parseAmount(value: FormDataEntryValue | null) {
  const match = typeof value === "string" && /^(\d{1,8})(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) throw new InputError("Enter a dollar amount with up to two decimal places, such as 12.50.");
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  if (cents < 1 || cents > 2_147_483_647) {
    throw new InputError("Enter an amount from $0.01 to $21,474,836.47.");
  }
  return cents;
}

export function splitExpense(cents: number, payerId: number, participantIds: number[]) {
  // Give leftover cents to the payer first if selected, then by ascending member ID.
  const ordered = participantIds.toSorted((a, b) => {
    if (a === payerId) return -1;
    if (b === payerId) return 1;
    return a - b;
  });
  const base = Math.floor(cents / ordered.length);
  const remainder = cents % ordered.length;
  return ordered.map((memberId, index) => ({
    memberId,
    cents: base + Number(index < remainder),
  }));
}

export function netBalances(
  memberIds: number[],
  expenses: { payerId: number; amountCents: number; shares: { memberId: number; cents: number }[] }[],
) {
  const balances = new Map(memberIds.map((id) => [id, BigInt(0)]));
  for (const expense of expenses) {
    balances.set(expense.payerId, balances.get(expense.payerId)! + BigInt(expense.amountCents));
    for (const share of expense.shares) {
      balances.set(share.memberId, balances.get(share.memberId)! - BigInt(share.cents));
    }
  }
  return balances;
}

export function formatMoney(value: number | bigint) {
  const cents = BigInt(value);
  const magnitude = cents < BigInt(0) ? -cents : cents;
  return `${cents < BigInt(0) ? "−" : ""}$${(magnitude / BigInt(100)).toLocaleString("en-US")}.${String(magnitude % BigInt(100)).padStart(2, "0")}`;
}
