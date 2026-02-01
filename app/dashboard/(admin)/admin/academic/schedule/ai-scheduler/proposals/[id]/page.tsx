"use client";

import { useParams } from "next/navigation";
import ProposalDetailsClient from "../../../fragments/ProposalDetailsClient";

export default function ProposalDetailsPage() {
    const { id } = useParams();

    return <ProposalDetailsClient proposalId={id as string} />;
}
