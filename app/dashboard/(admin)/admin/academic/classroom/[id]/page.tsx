import ClassroomDetailClient from "../fragments/ClassroomDetailClient";

export const metadata = {
    title: "Classroom Details | Admin Dashboard",
    description: "View classroom information and facilities",
};

interface ClassroomDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default async function ClassroomDetailsPage({ params }: ClassroomDetailsPageProps) {
    const resolvedParams = await params;
    return <ClassroomDetailClient id={resolvedParams.id} />;
}
