import { db } from "./db";
import { InputError, netBalances, parseAmount, splitExpense } from "./money";

export function parseId(value: FormDataEntryValue | null, label: string) {
  if (typeof value !== "string" || !/^[1-9]\d{0,9}$/.test(value) || Number(value) > 2_147_483_647) {
    throw new InputError(`Select a valid ${label}.`);
  }
  return Number(value);
}

function requiredText(form: FormData, field: string, label: string, limit: number) {
  const entry = form.get(field);
  const value = typeof entry === "string" ? entry.trim() : "";
  if (!value || value.length > limit) {
    throw new InputError(`Enter a ${label} between 1 and ${limit} characters.`);
  }
  return value;
}

export function listGroups() {
  return db.group.findMany({ orderBy: { id: "desc" } });
}

export async function viewGroup(id: number) {
  // Read membership and history from the same SQLite snapshot.
  const [group] = await db.$transaction([db.group.findUnique({
    where: { id },
    include: {
      members: { orderBy: { id: "asc" } },
      expenses: {
        orderBy: { id: "desc" },
        include: { payer: true, shares: { orderBy: { memberId: "asc" }, include: { member: true } } },
      },
    },
  })]);
  if (!group) return null;
  return { group, balances: netBalances(group.members.map(({ id }) => id), group.expenses) };
}

export function createGroup(form: FormData) {
  return db.group.create({ data: { name: requiredText(form, "name", "group name", 80) } });
}

export async function addMember(groupId: number, form: FormData) {
  const name = requiredText(form, "name", "member name", 80);
  await db.$transaction(async (tx) => {
    if (!(await tx.group.findUnique({ where: { id: groupId } }))) {
      throw new InputError("This group could not be found.");
    }
    await tx.member.create({ data: { groupId, name } });
  });
}

export async function recordExpense(groupId: number, form: FormData) {
  const description = requiredText(form, "description", "description", 200);
  const amountCents = parseAmount(form.get("amount"));
  const payerId = parseId(form.get("payerId"), "payer");
  const participantIds = form.getAll("participantIds").map((id) => parseId(id, "participant"));
  if (!participantIds.length) throw new InputError("Select at least one participant.");
  if (new Set(participantIds).size !== participantIds.length) {
    throw new InputError("Select each participant only once.");
  }

  await db.$transaction(async (tx) => {
    const members = await tx.member.findMany({ where: { groupId }, select: { id: true } });
    const memberIds = new Set(members.map(({ id }) => id));
    if (!memberIds.has(payerId)) throw new InputError("The payer must belong to this group.");
    if (participantIds.some((id) => !memberIds.has(id))) {
      throw new InputError("All participants must belong to this group.");
    }
    await tx.expense.create({
      data: {
        groupId,
        description,
        amountCents,
        payerId,
        shares: { create: splitExpense(amountCents, payerId, participantIds) },
      },
    });
  });
}
