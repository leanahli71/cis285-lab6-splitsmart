import Link from "next/link";
import { listGroups, parseId, viewGroup } from "@/lib/groups";
import { formatMoney, InputError } from "@/lib/money";
import { createGroupAction, updateGroupAction } from "./actions";
import { EntryForm } from "./forms";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ group?: string | string[] }>;
}) {
  const [{ group: selected }, groups] = await Promise.all([searchParams, listGroups()]);
  let groupId: number | undefined = groups[0]?.id;
  if (selected !== undefined) {
    try {
      groupId = parseId(typeof selected === "string" ? selected : null, "group");
    } catch (error) {
      if (!(error instanceof InputError)) throw error;
      groupId = undefined;
    }
  }
  const detail = groupId ? await viewGroup(groupId) : null;

  return (
    <main className="workspace">
      <header className="masthead">
        <h1>SplitSmart</h1>
        <p>Shared expenses and balances</p>
      </header>

      <aside className="panel">
        <h2>Groups</h2>
        {groups.length > 0 && (
          <nav aria-label="Expense groups">
            {groups.map((group) => (
              <Link key={group.id} href={`/?group=${group.id}`}
                aria-current={group.id === detail?.group.id ? "page" : undefined}>
                {group.name}
              </Link>
            ))}
          </nav>
        )}
        <EntryForm action={createGroupAction} button="Create group">
          <label>Group name<input name="name" required maxLength={80} /></label>
        </EntryForm>
      </aside>

      {detail ? <GroupDetail key={detail.group.id} detail={detail} /> : (
        <section className="panel">
          <h2>{selected === undefined ? "Create your first group" : "Group unavailable"}</h2>
          <p>{selected === undefined ? "Start by naming the group that will share expenses." : "Choose an existing group or create a new one."}</p>
        </section>
      )}
    </main>
  );
}

function GroupDetail({ detail }: { detail: NonNullable<Awaited<ReturnType<typeof viewGroup>>> }) {
  const { id, name, members, expenses } = detail.group;
  return (
    <article className="group-detail">
      <h2 className="group-title">{name}</h2>
      <section className="panel">
        <h3>Members and balances</h3>
        {!members.length && <p>Add a member to start recording expenses.</p>}
        {members.length > 0 && (
          <ul className="ledger">
            {members.map((member) => {
              const balance = detail.balances.get(member.id)!;
              return (
                <li key={member.id}>
                  <span>{member.name}</span>
                  <strong>{balance > 0 ? "Gets back " : balance < 0 ? "Owes " : "Settled · "}
                    {formatMoney(balance < 0 ? -balance : balance)}
                  </strong>
                </li>
              );
            })}
          </ul>
        )}
        <EntryForm action={updateGroupAction} button="Add member">
          <input type="hidden" name="groupId" value={id} />
          <input type="hidden" name="intent" value="addMember" />
          <label>Member name<input name="name" required maxLength={80} /></label>
        </EntryForm>
      </section>
      {members.length > 0 && (
        <section className="panel">
          <h3>Record an expense</h3>
          <EntryForm action={updateGroupAction} button="Save expense">
            <input type="hidden" name="groupId" value={id} />
            <input type="hidden" name="intent" value="recordExpense" />
            <label>Description<input name="description" required maxLength={200} /></label>
            <label>Amount (USD)<input name="amount" inputMode="decimal" placeholder="0.00" required /></label>
            <label>Paid by
              <select name="payerId" defaultValue="" required>
                <option value="" disabled>Select a payer</option>
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </label>
            <fieldset className="participants">
              <legend>Split equally among</legend>
              {members.map((member) => (
                <label key={member.id}>
                  <input type="checkbox" name="participantIds" value={member.id} />{member.name}
                </label>
              ))}
            </fieldset>
          </EntryForm>
        </section>
      )}
      <section className="panel">
        <h3>Expense history</h3>
        {!expenses.length && <p>No expenses recorded yet.</p>}
        {expenses.length > 0 && (
          <ul className="ledger history">
            {expenses.map((expense) => (
              <li key={expense.id}>
                <div className="expense-title"><strong>{expense.description}</strong><strong>{formatMoney(expense.amountCents)}</strong></div>
                <p>Paid by {expense.payer.name} · <time dateTime={expense.createdAt.toISOString()}>
                  {expense.createdAt.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}
                </time></p>
                <ul className="shares">
                  {expense.shares.map((share) => (
                    <li key={share.memberId}>{share.member.name} · {formatMoney(share.cents)}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
