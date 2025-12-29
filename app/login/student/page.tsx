import { LoginForm } from "@/components/auth/LoginForm";
import { UserRole } from "@/types/user";

export default function StudentLoginPage() {
    return <LoginForm role={UserRole.STUDENT} />;
}
