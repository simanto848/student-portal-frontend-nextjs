import SyllabusDetailClient from "../fragments/SyllabusDetailClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Syllabus Details | Admin Dashboard",
    description: "View detailed course syllabus and policies",
};

interface SyllabusDetailsPageProps {
    params: { id: string };
}

export default function SyllabusDetailsPage({ params }: SyllabusDetailsPageProps) {
    return (
        <SyllabusDetailClient id={params.id} />
    );
}
