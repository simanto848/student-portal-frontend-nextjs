import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { CourseManagementClient } from "./fragments/CourseManagementClient";

export const metadata = {
  title: "Course Management | Admin Dashboard",
  description: "Manage academic courses and curriculum",
};

export default async function CourseManagementPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  return <CourseManagementClient />;
}
