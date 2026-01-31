"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ProposalDetailsClient from "../../../fragments/ProposalDetailsClient";

export default function ProposalDetailsPage() {
    const { id } = useParams();

    return (
        <DashboardLayout>
            <ProposalDetailsClient proposalId={id as string} />
        </DashboardLayout>
    );
}
