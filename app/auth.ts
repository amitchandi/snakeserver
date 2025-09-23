import { User } from "./models/User";
import { getDb } from "./db";
import bcrypt from "bcrypt";

type LoginResponse = {
  valid: boolean;
  status: string;
  message: string;
  token?: string | null;
  userId?: string;
  email?: string;
  username?: string;
  wins?: number;
  gamesPlayed?: number;
};

/**
 * Login the user with the given parameters
 */
export async function login(data: { email: string; password: string }) : Promise<LoginResponse> {
  try {
    const db = await getDb();
    const collection = db.collection<User>("users");

    var res = await collection.findOne({ email: data.email });
    if (!res) {
      return {
        valid: false,
        status: "400 Bad Request",
        message: "Invalid Email or Password",
      };
    }

    const validPassword = await bcrypt.compare(data.password, res.password);

    if (!validPassword) {
      return {
        valid: false,
        status: "400 Bad Request",
        message: "Invalid Email or Password",
      };
    }

    return {
      valid: true,
      status: "200 OK",
      message: "",
      token: null,
      userId: res._id.toString(),
      email: res.email,
      username: res.username,
      wins: res.wins,
      gamesPlayed: res.gamesPlayed,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
