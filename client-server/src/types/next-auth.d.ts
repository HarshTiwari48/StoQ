import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;        // MongoDB _id of the user
    } & DefaultSession["user"];
  }
}