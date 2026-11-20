"use client";

import { startTransition, useActionState, useRef, type ReactNode } from "react";

export function EntryForm({
  action, button, children,
}: {
  action: (previous: string, form: FormData) => Promise<string>;
  button: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [error, submit, pending] = useActionState(async (previous: string, form: FormData) => {
    const message = await action(previous, form);
    if (!message) ref.current?.reset();
    return message;
  }, "");

  return (
    <form ref={ref} onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      startTransition(() => submit(form));
    }}>
      <fieldset disabled={pending} className="form-fields">
        {children}
        <button type="submit">{pending ? "Saving…" : button}</button>
      </fieldset>
      {error && <p role="alert" className="error">{error}</p>}
    </form>
  );
}
