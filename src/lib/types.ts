import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string(),
  email: z.string().email({
    error: "Invalid Email Address",
  }),
  password: z.string(),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const ContentSchema = z.object({
  title: z.string(),
  type: z.string(),
  link: z.string(),
  description: z.string(),
});
