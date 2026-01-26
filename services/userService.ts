import user from "../data/user.json";
import { User } from "../types/User";

export const getCurrentUser = async (): Promise<User> => {
  return user as User;
};
