import { LoginForm } from "@/components/auth/LoginForm";
import { UserRole } from "@/types/user";

export default function AdminLoginPage() {
    return <LoginForm role={UserRole.ADMIN} />;
}
