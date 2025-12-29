import { LoginForm } from "@/components/auth/LoginForm";
import { UserRole } from "@/types/user";

export default function TeacherLoginPage() {
    return <LoginForm role={UserRole.TEACHER} />;
}
