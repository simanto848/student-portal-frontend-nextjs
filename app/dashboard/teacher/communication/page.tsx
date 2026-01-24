import { requireUser } from "@/lib/auth/userAuth";
import CommunicationClient from "./fragments/CommunicationClient";

export default async function CommunicationHubPage() {
  await requireUser();

  return (
    <div className="w-full h-full pb-10">
      <CommunicationClient />
    </div>
  );
}
