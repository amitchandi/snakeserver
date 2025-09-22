import { User } from "./models/User";
import { getDb } from "./db";
import bcrypt from "bcrypt";

type LoginResponse = {
  valid: boolean;
  status: string;
  message: string;
  token: string | null;
  userId: string | null;
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
        token: null,
        userId: null
      };
    }

    const validPassword = await bcrypt.compare(data.password, res.password);

    if (!validPassword) {
      return {
        valid: false,
        status: "400 Bad Request",
        message: "Invalid Email or Password",
        token: null,
        userId: null
      };
    }

    return {
      valid: true,
      status: "200 OK",
      message: "",
      token: null,
      userId: res._id.toString()
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
