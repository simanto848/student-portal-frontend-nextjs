import { LoginForm } from "@/components/auth/LoginForm";
import { UserRole } from "@/types/user";

export default function LoginPage() {
    return <LoginForm role={UserRole.STUDENT} />;
}
