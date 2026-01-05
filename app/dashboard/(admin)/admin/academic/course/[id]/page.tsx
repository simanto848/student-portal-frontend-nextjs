import CourseDetailClient from "../fragments/CourseDetailClient";

export const metadata = {
    title: "Course Details | Admin Dashboard",
    description: "View academic course details and curriculum",
};

interface CourseDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default async function CourseDetailsPage({ params }: CourseDetailsPageProps) {
    const resolvedParams = await params;
    return <CourseDetailClient id={resolvedParams.id} />;
}
