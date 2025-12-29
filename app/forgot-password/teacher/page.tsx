import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { UserRole } from "@/types/user";

export default function TeacherForgotPasswordPage() {
    return <ForgotPasswordForm role={UserRole.TEACHER} />;
}
