import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { UserRole } from "@/types/user";

export default function StudentForgotPasswordPage() {
    return <ForgotPasswordForm role={UserRole.STUDENT} />;
}
