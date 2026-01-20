"use client";

import { useParams } from "next/navigation";
import { QuizCreateClient } from "../fragments/QuizCreateClient";

export default function CreateQuizPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  return (
    <QuizCreateClient workspaceId={workspaceId} />
  );
}
