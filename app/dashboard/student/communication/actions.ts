"use server";

import { chatService } from "@/services/communication/chat.service";
import { batchService } from "@/services/academic/batch.service";

export async function listMyChatGroupsAction() {
    return await chatService.listMyChatGroups();
}

export async function getBatchByIdAction(batchId: string) {
    return await batchService.getBatchById(batchId);
}

export async function getChatGroupDetailsAction(chatGroupId: string) {
    return await chatService.getChatGroupDetails(chatGroupId);
}
