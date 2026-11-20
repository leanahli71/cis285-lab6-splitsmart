"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addMember, createGroup, parseId, recordExpense } from "@/lib/groups";
import { InputError } from "@/lib/money";

function errorMessage(error: unknown) {
  if (error instanceof InputError) return error.message;
  console.error(error);
  return "The change could not be saved. Please try again.";
}

export async function createGroupAction(_previous: string, form: FormData) {
  let id: number;
  try {
    ({ id } = await createGroup(form));
  } catch (error) {
    return errorMessage(error);
  }
  revalidatePath("/");
  redirect(`/?group=${id}`);
}

export async function updateGroupAction(_previous: string, form: FormData) {
  try {
    const groupId = parseId(form.get("groupId"), "group");
    switch (form.get("intent")) {
      case "addMember":
        await addMember(groupId, form);
        break;
      case "recordExpense":
        await recordExpense(groupId, form);
        break;
      default:
        throw new InputError("Choose a valid group action.");
    }
  } catch (error) {
    return errorMessage(error);
  }
  revalidatePath("/");
  return "";
}
