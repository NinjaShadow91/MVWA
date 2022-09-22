import * as z from "zod";

export const CredentialLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(12),
});

export const CredentialSignUpSchema = CredentialLoginSchema.extend({
  username: z.string(),
});

export type ILogin = z.infer<typeof CredentialLoginSchema>;
export type ISignUp = z.infer<typeof CredentialSignUpSchema>;
