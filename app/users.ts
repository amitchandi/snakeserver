import { getDb } from "./db";

/**
 * Update the name of the user with the given email
 */
export async function updateUsername(email: string, newUsername: string ): Promise<boolean> {
  try {
    const db = await getDb();
    const collection = db.collection("users");
    var res = await collection.updateOne(
      { email },
      { $set: { username: newUsername } }
    );
    if (res.modifiedCount > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    // throw error;
    return false;
  }
}
