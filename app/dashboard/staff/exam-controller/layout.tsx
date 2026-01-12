
import { DashboardShell } from "./DashboardShell";

export default function ExamControllerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardShell>{children}</DashboardShell>;
}
