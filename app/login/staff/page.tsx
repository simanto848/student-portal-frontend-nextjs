import { LoginForm } from "@/components/auth/LoginForm";
import { UserRole } from "@/types/user";

export default function StaffLoginPage() {
    return <LoginForm role={UserRole.STAFF} />;
}
