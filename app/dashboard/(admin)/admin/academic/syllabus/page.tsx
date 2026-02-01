import { SyllabusManagementClient } from "./fragments/SyllabusManagementClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syllabus Management | Admin Dashboard",
  description: "Curate and manage course syllabi and versions",
};

export default function SyllabusManagementPage() {
  return <SyllabusManagementClient />;
}
