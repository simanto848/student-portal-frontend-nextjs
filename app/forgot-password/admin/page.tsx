import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { UserRole } from "@/types/user";

export default function AdminForgotPasswordPage() {
    return <ForgotPasswordForm role={UserRole.ADMIN} />;
}
