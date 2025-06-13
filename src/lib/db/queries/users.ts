import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(userName: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.name, userName)
  });

  return user;
}

export async function getUsers() {
  return await db.select().from(users);
}

export async function deleteAllUsers() {
  let successful = true;

  try {
    await db.delete(users);
  } catch(err) {
    successful = false;
    if (err instanceof Error) {
      console.error(`Error while trying to delete all users: ${err.message}.`);
    } else {
      console.error(`Unexpected exception caught when trying to delete all users: ${err}`);
    }
  }

  if (successful) {
    console.log("All users have been deleted");
  } else {
    console.log("Something went wrong");
  }
}