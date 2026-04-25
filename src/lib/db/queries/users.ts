import { db } from "../index";
import { feeds, users, feedFollows } from "../../../schema";
import { eq } from "drizzle-orm"
import { firstOrUndefined } from "./utils";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({name: name}).returning();
  return result;
}

export async function getUser(name: string) {
 const result = await db.select().from(users).where(eq(users.name, name))
 return firstOrUndefined(result);
}

export async function getUsers() {
const result = await db.select().from(users);
return result;
};


export async function resetUsers(): Promise<void> {
const result = await db.delete(users);
};
