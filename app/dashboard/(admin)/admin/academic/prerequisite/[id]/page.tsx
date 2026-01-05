import PrerequisiteDetailClient from "../fragments/PrerequisiteDetailClient";

export const metadata = {
    title: "Prerequisite Details | Admin Dashboard",
    description: "View course dependency information",
};

interface PrerequisiteDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default async function PrerequisiteDetailsPage({ params }: PrerequisiteDetailsPageProps) {
    const resolvedParams = await params;
    return <PrerequisiteDetailClient id={resolvedParams.id} />;
}
