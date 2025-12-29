import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { UserRole } from "@/types/user";

export default function StaffForgotPasswordPage() {
    return <ForgotPasswordForm role={UserRole.STAFF} />;
}
