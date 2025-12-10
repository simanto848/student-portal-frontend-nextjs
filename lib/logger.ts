import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const MAX_LOG_SIZE = 50 * 1024; // 50KB in bytes
const MAX_LOG_FILES = 10; // Keep only 20 most recent log files

/**
 * Check if logging is enabled via environment variable
 */
function isLoggingEnabled(): boolean {
    if (typeof window !== 'undefined') {
        return false; // Never log on client side
    }
    return process.env.NEXT_LOG_ENABLE === 'true';
}

export interface LogEntry {
    id: string;
    timestamp: string;
    method: string;
    url: string;
    status?: number;
    request?: any;
    response?: any;
    error?: any;
    duration?: number;
    level: 'success' | 'error' | 'warning' | 'info';
}

// Ensure logs directory exists
function ensureLogDirectory() {
    if (typeof window === 'undefined') {
        try {
            if (!fs.existsSync(LOG_DIR)) {
                fs.mkdirSync(LOG_DIR, { recursive: true });
            }
        } catch (error) {
            console.error('Failed to create logs directory:', error);
        }
    }
}

/**
 * Clean up old log files, keeping only the most recent MAX_LOG_FILES
 */
function cleanupOldLogFiles() {
    try {
        const files = fs.readdirSync(LOG_DIR)
            .filter(file => file.startsWith('api-') && file.endsWith('.log'))
            .map(file => ({
                name: file,
                path: path.join(LOG_DIR, file),
                stats: fs.statSync(path.join(LOG_DIR, file))
            }))
            .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime()); // Sort by modification time, newest first

        // If we have more than MAX_LOG_FILES, delete the oldest ones
        if (files.length > MAX_LOG_FILES) {
            const filesToDelete = files.slice(MAX_LOG_FILES);
            filesToDelete.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                    console.log(`Deleted old log file: ${file.name}`);
                } catch (error) {
                    console.error(`Failed to delete old log file ${file.name}:`, error);
                }
            });
        }
    } catch (error) {
        console.error('Failed to cleanup old log files:', error);
    }
}

/**
 * Get the current active log file name
 */
function getActiveLogFile(): string {
    ensureLogDirectory();

    const files = fs.readdirSync(LOG_DIR)
        .filter(file => file.startsWith('api-') && file.endsWith('.log'))
        .sort()
        .reverse();

    // Check if the latest file exists and its size
    if (files.length > 0) {
        const latestFile = path.join(LOG_DIR, files[0]);
        const stats = fs.statSync(latestFile);

        // If file size is less than MAX_LOG_SIZE, use it
        if (stats.size < MAX_LOG_SIZE) {
            return latestFile;
        }
    }

    // Create a new log file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newFileName = `api-${timestamp}.log`;
    const newFilePath = path.join(LOG_DIR, newFileName);

    // Clean up old files after creating a new one
    cleanupOldLogFiles();

    return newFilePath;
}

/**
 * Log API request and response to file
 */
export function logAPICall(data: {
    timestamp: string;
    method: string;
    url: string;
    status?: number;
    requestData?: any;
    responseData?: any;
    error?: any;
    duration?: number;
}) {
    if (typeof window !== 'undefined') {
        // Skip logging on client side
        return;
    }

    if (!isLoggingEnabled()) {
        // Skip logging if disabled via environment variable
        return;
    }

    ensureLogDirectory();

    // Determine log level based on status
    let level: LogEntry['level'] = 'info';
    if (data.status) {
        if (data.status >= 200 && data.status < 300) {
            level = 'success';
        } else if (data.status >= 400 && data.status < 500) {
            level = 'warning';
        } else if (data.status >= 500) {
            level = 'error';
        }
    } else if (data.error) {
        level = 'error';
    }

    const logEntry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: data.timestamp,
        method: data.method.toUpperCase(),
        url: data.url,
        status: data.status,
        request: data.requestData,
        response: data.responseData,
        error: data.error,
        duration: data.duration,
        level,
    };

    try {
        const logFile = getActiveLogFile();
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(logFile, logLine, 'utf8');
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
}

/**
 * Get formatted timestamp
 */
export function getTimestamp(): string {
    return new Date().toISOString();
}

/**
 * Log general errors (not just API calls)
 */
export function logError(data: {
    message: string;
    stack?: string;
    url?: string;
    userAgent?: string;
    timestamp?: string;
    context?: any;
    type: 'client' | 'server' | 'api' | 'build' | 'runtime';
}) {
    if (typeof window !== 'undefined') {
        // Skip logging on client side for server errors
        if (data.type !== 'client') return;
    } else {
        // On server side, check if logging is enabled
        if (!isLoggingEnabled()) {
            return;
        }
    }

    ensureLogDirectory();

    const logEntry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: data.timestamp || getTimestamp(),
        method: 'ERROR',
        url: data.url || (typeof window !== 'undefined' ? window.location.href : 'server'),
        level: 'error',
        error: {
            message: data.message,
            stack: data.stack,
            type: data.type,
            context: data.context,
            userAgent: data.userAgent || (typeof window !== 'undefined' ? window.navigator.userAgent : undefined)
        }
    };

    try {
        const logFile = getActiveLogFile();
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(logFile, logLine, 'utf8');
    } catch (error) {
        console.error('Failed to write error to log file:', error);
    }
}

/**
 * Get all log files (server-side only)
 */
export function getLogFiles(): string[] {
    if (typeof window !== 'undefined') {
        return [];
    }

    if (!isLoggingEnabled()) {
        return [];
    }

    ensureLogDirectory();

    return fs.readdirSync(LOG_DIR)
        .filter(file => file.startsWith('api-') && file.endsWith('.log'))
        .sort()
        .reverse();
}

/**
 * Read logs from a specific file (server-side only)
 */
export function readLogFile(filename: string): LogEntry[] {
    if (typeof window !== 'undefined') {
        return [];
    }

    if (!isLoggingEnabled()) {
        return [];
    }

    const filePath = path.join(LOG_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return [];
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());

        return lines.map(line => {
            try {
                return JSON.parse(line) as LogEntry;
            } catch {
                return null;
            }
        }).filter(entry => entry !== null) as LogEntry[];
    } catch (error) {
        console.error('Failed to read log file:', error);
        return [];
    }
}