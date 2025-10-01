import bcrypt from "bcrypt";
import { getDb } from "../../db";
import { ObjectId } from "mongodb";
import { User } from "../../models/User";

const functions: Array<Function> = [];
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
 * Create the user with the given parameters
 */
export async function createUser(data: { email: string; username: string, password: string }) {
  try {
    const db = await getDb();
    const collection = db.collection<User>("users");
    const user = await collection.findOne({ email: data.email });
    if (user) {
      return {
        status: "400",
        message: "User with email already exists",
        id: null,
      };
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    var res = await collection.insertOne({
      email: data.email,
      username: data.username,
      password: hashedPassword,
      wins: 0,
      gamesPlayed: 0
    });
    return {
      status: "201",
      message: "User created successfully",
      id: res.insertedId,
    };
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
functions.push(addWin);

export { functions };
