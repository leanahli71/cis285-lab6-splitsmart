import { describe, expect, it } from "vitest";
import { netBalances, parseAmount, splitExpense } from "./money";

describe("shared expenses", () => {
  const members = [1, 2, 3];

  it("allocates $60 equally and credits the payer", () => {
    const shares = splitExpense(parseAmount("60"), 1, members);
    expect(shares.map(({ cents }) => cents)).toEqual([2000, 2000, 2000]);
    const balances = netBalances(members, [{ payerId: 1, amountCents: 6000, shares }]);
    expect([...balances.values()]).toEqual([BigInt(4000), BigInt(-2000), BigInt(-2000)]);
  });

  it("gives the extra cent from $10 to the payer regardless of selection order", () => {
    expect(splitExpense(parseAmount("10.00"), 2, [3, 1, 2])).toEqual([
      { memberId: 2, cents: 334 },
      { memberId: 1, cents: 333 },
      { memberId: 3, cents: 333 },
    ]);
  });

  it("combines expenses and supports a payer outside the split", () => {
    const expenses = [
      { payerId: 1, amountCents: 6000, shares: splitExpense(6000, 1, members) },
      { payerId: 2, amountCents: 1000, shares: splitExpense(1000, 2, members) },
      { payerId: 3, amountCents: 1, shares: splitExpense(1, 3, [2, 1]) },
    ];
    expect(expenses[2].shares).toEqual([{ memberId: 1, cents: 1 }, { memberId: 2, cents: 0 }]);
    const balances = [...netBalances(members, expenses).values()];
    expect(balances).toEqual([BigInt(3666), BigInt(-1334), BigInt(-2332)]);
    expect(balances.reduce((sum, cents) => sum + cents, BigInt(0))).toBe(BigInt(0));
  });

  it.each(["0", "-1", "1.001", "1e2", "NaN", "Infinity", "21474836.48", ""])(
    "rejects invalid amount %j",
    (amount) => expect(() => parseAmount(amount)).toThrow(),
  );
});
