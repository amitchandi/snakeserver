import bcrypt from "bcrypt";
import { getDb } from "../../db";
import { ObjectId } from "mongodb";
import { User } from "../../models/User";

const functions: Array<Function> = [];

// const users: {[key: string]: User} = {
//     '123': {
//         id: v4(),
//         deviceId: '123',
//         name: 'Baby Snake',
//         isReady: false,
//         wins: 0,
//     },
//     '456': {
//         id: v4(),
//         deviceId: '456',
//         name: 'Mama Snake',
//         isReady: false,
//         wins: 0,
//     }
// }; // temporary, will use mongo database

/**
 * Get all users
 */
async function getUsers() {
  try {
    const db = await getDb();
    const collection = db.collection<User>("users");
    return await collection.find().toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Get all online users
 */
export async function getUserById(_id: string) {
  try {
    const db = await getDb();
    const collection = db.collection<User>("users");
    return await collection.findOne({
      _id: new ObjectId(_id)
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Get the user with the given email
 * @param email email of the user
 */
export async function getUserWithEmail(email: string) {
  try {
    const db = await getDb();
    const collection = db.collection<User>("users");
    return await collection.find({ email: email }).toArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Update the name of the user with the given deviceId
 * @param data deviceId and new name
 */
function updateUsername(data: { username: string, newUsername: string }): boolean {
  //TODO: Implement updateUsername function
  return false;
}

/**
 * Create the user with the given parameters
 */
async function createUser(data: { email: string; username: string, password: string }) {
  try {
    const db = await getDb();
    const collection = db.collection("users");
    const user = await collection.findOne({ email: data.email });
    if (user) {
      throw new Error("User with email already exists");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await collection.insertOne({
      email: data.email,
      username: data.username,
      password: hashedPassword,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Add to the win count of the user with the given id
 */
async function addWin(data: { userId: string }) {
  try {
    const db = await getDb();
    const collection = db.collection<User>("users");
    const result = await collection.updateOne(
      { _id: new ObjectId(data.userId) },
      { $inc: { wins: 1 } }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}

functions.push(getUsers);
// functions.push(getUser);
functions.push(updateUsername);
// functions.push(getUserWithDevice);
functions.push(createUser);
functions.push(addWin);

export { functions };
