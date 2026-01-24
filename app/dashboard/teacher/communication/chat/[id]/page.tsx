import { requireUser } from "@/lib/auth/userAuth";
import ChatClient from "../../fragments/ChatClient";

export default async function ChatPage({ params, searchParams }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ type?: string }>
}) {
    await requireUser();
    const { id } = await params;
    const { type } = await searchParams;

    return (
        <div className="max-w-7xl mx-auto pb-10 px-4 md:px-0">
            <ChatClient
                chatGroupId={id}
                chatGroupType={type as 'BatchChatGroup' | 'CourseChatGroup' | undefined}
            />
        </div>
    );
}
