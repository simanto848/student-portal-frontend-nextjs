"use server";

import { scheduleService, ScheduleGenerationOptions, ScheduleValidationResult, ScheduleGenerationResult } from "@/services/academic/schedule.service";
import { sessionService } from "@/services/academic/session.service";
import { departmentService } from "@/services/academic/department.service";
import { batchService } from "@/services/academic/batch.service";
import { Session, ScheduleProposal, Department, Batch } from "@/services/academic/types";

// ================== Data Fetching Actions ==================
export async function fetchSessions(): Promise<Session[]> {
    try {
        return await sessionService.getAllSessions();
    } catch (error) {
        throw new Error("Failed to load sessions");
    }
}

export async function fetchDepartments(): Promise<Department[]> {
    try {
        return await departmentService.getAllDepartments();
    } catch (error) {
        throw new Error("Failed to load departments");
    }
}

export async function fetchBatches(): Promise<Batch[]> {
    try {
        return await batchService.getAllBatches({ status: true });
    } catch (error) {
        throw new Error("Failed to load batches");
    }
}

export async function fetchProposals(sessionId: string): Promise<ScheduleProposal[]> {
    try {
        return await scheduleService.getProposals(sessionId);
    } catch (error) {
        throw new Error("Failed to load proposals");
    }
}

export async function fetchProposalById(proposalId: string): Promise<ScheduleProposal> {
    try {
        return await scheduleService.getProposalById(proposalId);
    } catch (error) {
        throw new Error("Failed to load proposal details");
    }
}

// ================== Schedule Generation Actions ==================
export async function validateSchedulePrerequisites(
    options: ScheduleGenerationOptions
): Promise<ScheduleValidationResult> {
    try {
        return await scheduleService.validateSchedulePrerequisites(options);
    } catch (error) {
        throw error;
    }
}

export async function generateSchedule(
    options: ScheduleGenerationOptions
): Promise<ScheduleGenerationResult> {
    try {
        return await scheduleService.generateSchedule(options);
    } catch (error) {
        throw error;
    }
}

// ================== Proposal Management Actions ==================
export async function applyProposal(proposalId: string): Promise<{ success: boolean; schedulesCreated: number; message: string }> {
    try {
        return await scheduleService.applyProposal(proposalId);
    } catch (error) {
        throw new Error("Failed to apply schedule proposal");
    }
}

export async function deleteProposal(proposalId: string): Promise<void> {
    try {
        await scheduleService.deleteProposal(proposalId);
    } catch (error) {
        throw new Error("Failed to delete proposal");
    }
}

// ================== Schedule Management Actions ==================
export async function closeSchedulesForBatches(batchIds: string[]): Promise<{ success: boolean; closedCount: number; message: string }> {
    try {
        return await scheduleService.closeSchedulesForBatches(batchIds);
    } catch (error) {
        throw new Error("Failed to close schedules for batches");
    }
}

export async function closeSchedulesForSession(sessionId: string): Promise<{ success: boolean; closedCount: number; message: string }> {
    try {
        return await scheduleService.closeSchedulesForSession(sessionId);
    } catch (error) {
        throw new Error("Failed to close schedules for session");
    }
}

export async function reopenSchedulesForBatches(batchIds: string[]): Promise<{ success: boolean; reopenedCount: number; message: string }> {
    try {
        return await scheduleService.reopenSchedulesForBatches(batchIds);
    } catch (error) {
        throw new Error("Failed to reopen schedules");
    }
}

export async function getScheduleStatusSummary(batchIds?: string[]): Promise<{ active: number; closed: number; archived: number }> {
    try {
        return await scheduleService.getScheduleStatusSummary(batchIds);
    } catch (error) {
        throw new Error("Failed to get schedule status summary");
    }
}

