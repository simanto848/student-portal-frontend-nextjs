import { z } from "zod";

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .transform((val) => val.toLowerCase().trim());

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

const strongPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  );

const otpSchema = z
  .string()
  .min(1, "OTP is required")
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d+$/, "OTP must contain only numbers");

export const userRoleSchema = z.enum([
  "student",
  "teacher",
  "staff",
  "admin",
  "super_admin",
  "moderator",
  "program_controller",
  "admission",
  "exam",
  "finance",
  "library",
  "transport",
  "hr",
  "it",
  "hostel",
  "hostel_warden",
  "hostel_supervisor",
  "maintenance",
]);

export type UserRoleType = z.infer<typeof userRoleSchema>;

const loginRoleSchema = z.enum(["student", "teacher", "staff", "admin"], {
  message: "Please select a valid role",
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: loginRoleSchema,
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.input<typeof loginSchema>;
export type LoginSubmitData = z.output<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  role: loginRoleSchema,
});

export type ForgotPasswordFormData = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordSubmitData = z.output<typeof forgotPasswordSchema>;

export const otpVerificationSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  role: loginRoleSchema,
});

export type OTPVerificationFormData = z.input<typeof otpVerificationSchema>;
export type OTPVerificationSubmitData = z.output<typeof otpVerificationSchema>;

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: loginRoleSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.input<typeof resetPasswordSchema>;
export type ResetPasswordSubmitData = z.output<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.input<typeof changePasswordSchema>;
export type ChangePasswordSubmitData = z.output<typeof changePasswordSchema>;

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .transform((val) => val.trim())
    .optional(),
  phone: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      "Please enter a valid phone number",
    )
    .optional()
    .or(z.literal("")),
  address: z
    .object({
      present: z.string().optional().or(z.literal("")),
      permanent: z.string().optional().or(z.literal("")),
    })
    .optional(),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  dateOfBirth: z.string().optional().or(z.literal("")),
  guardianName: z
    .string()
    .max(100, "Guardian name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  guardianPhone: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      "Please enter a valid phone number",
    )
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateFormData = z.input<typeof profileUpdateSchema>;
export type ProfileUpdateSubmitData = z.output<typeof profileUpdateSchema>;

export interface PasswordStrength {
  score: number; // 0-4
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
  feedback: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      color: "bg-gray-300",
      feedback: ["Enter a password"],
    };
  }

  // Length checks
  if (password.length >= 8) score++;
  else feedback.push("Add at least 8 characters");

  if (password.length >= 12) score++;

  // Character type checks
  if (/[a-z]/.test(password)) score += 0.5;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score += 0.5;
  else feedback.push("Add uppercase letters");

  if (/\d/.test(password)) score += 0.5;
  else feedback.push("Add numbers");

  if (/[@$!%*?&#^()_+=[\]{}|\\:";'<>,.?/~`-]/.test(password)) score += 0.5;
  else feedback.push("Add special characters");

  // Normalize score to 0-4
  const normalizedScore = Math.min(4, Math.floor(score));

  const labels: PasswordStrength["label"][] = [
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Very Strong",
  ];

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    color: colors[normalizedScore],
    feedback: feedback.length > 0 ? feedback : ["Strong password!"],
  };
}


export function validateLoginForm(data: unknown) {
  return loginSchema.safeParse(data);
}

export function validateForgotPasswordForm(data: unknown) {
  return forgotPasswordSchema.safeParse(data);
}

export function validateOTPForm(data: unknown) {
  return otpVerificationSchema.safeParse(data);
}

export function validateResetPasswordForm(data: unknown) {
  return resetPasswordSchema.safeParse(data);
}

export function validateChangePasswordForm(data: unknown) {
  return changePasswordSchema.safeParse(data);
}
