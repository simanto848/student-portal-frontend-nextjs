const MAX_LOG_SIZE = 50 * 1024; // 50KB in bytes
const MAX_LOG_FILES = 10; // Keep only 10 most recent log files

/**
 * Helper to get Node.js modules without triggering bundler errors in browser
 */
async function getFs() {
    if (typeof window !== 'undefined') return null;
    try {
        // Use eval to hide the import from static analysis
        return await eval('import("fs")');
    } catch (e) {
        return null;
    }
}

async function getPath() {
    if (typeof window !== 'undefined') return null;
    try {
        // Use eval to hide the import from static analysis
        return await eval('import("path")');
    } catch (e) {
        return null;
    }
}

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
    request?: unknown;
    response?: unknown;
    error?: unknown;
    duration?: number;
    level: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Get log directory path (server-side only)
 */
async function getLogDir() {
    if (typeof window !== 'undefined') return null;
    const path = await getPath();
    if (!path) return null;
    return path.join(process.cwd(), 'logs');
}

// Ensure logs directory exists
async function ensureLogDirectory() {
    if (typeof window === 'undefined') {
        try {
            const fs = await getFs();
            const LOG_DIR = await getLogDir();
            if (fs && LOG_DIR && !fs.existsSync(LOG_DIR)) {
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
async function cleanupOldLogFiles() {
    if (typeof window !== 'undefined') return;
    try {
        const fs = await getFs();
        const path = await getPath();
        const LOG_DIR = await getLogDir();
        if (!fs || !path || !LOG_DIR) return;

        const files = fs.readdirSync(LOG_DIR)
            .filter((file: string) => file.startsWith('api-') && file.endsWith('.log'))
            .map((file: string) => ({
                name: file,
                path: path.join(LOG_DIR, file),
                stats: fs.statSync(path.join(LOG_DIR, file))
            }))
            .sort((a: { stats: { mtime: Date } }, b: { stats: { mtime: Date } }) => b.stats.mtime.getTime() - a.stats.mtime.getTime()); // Sort by modification time, newest first

        // If we have more than MAX_LOG_FILES, delete the oldest ones
        if (files.length > MAX_LOG_FILES) {
            const filesToDelete = files.slice(MAX_LOG_FILES);
            filesToDelete.forEach((file: { path: string; name: string }) => {
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
async function getActiveLogFile(): Promise<string | null> {
    if (typeof window !== 'undefined') return null;

    await ensureLogDirectory();
    const fs = await getFs();
    const path = await getPath();
    const LOG_DIR = await getLogDir();
    if (!fs || !path || !LOG_DIR) return null;

    const files = fs.readdirSync(LOG_DIR)
        .filter((file: string) => file.startsWith('api-') && file.endsWith('.log'))
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
    await cleanupOldLogFiles();

    return newFilePath;
}

/**
 * Log API request and response to file
 */
export async function logAPICall(data: {
    timestamp: string;
    method: string;
    url: string;
    status?: number;
    requestData?: unknown;
    responseData?: unknown;
    error?: unknown;
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
        const fs = await getFs();
        const logFile = await getActiveLogFile();
        if (fs && logFile) {
            const logLine = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(logFile, logLine, 'utf8');
        }
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
export async function logError(data: {
    message: string;
    stack?: string;
    url?: string;
    userAgent?: string;
    timestamp?: string;
    context?: unknown;
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
        const fs = await getFs();
        const logFile = await getActiveLogFile();
        if (fs && logFile) {
            const logLine = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(logFile, logLine, 'utf8');
        }
    } catch (error) {
        console.error('Failed to write error to log file:', error);
    }
}

/**
 * Get all log files (server-side only)
 */
export async function getLogFiles(): Promise<string[]> {
    if (typeof window !== 'undefined') {
        return [];
    }

    if (!isLoggingEnabled()) {
        return [];
    }

    const fs = await getFs();
    const LOG_DIR = await getLogDir();
    if (!fs || !LOG_DIR) return [];

    await ensureLogDirectory();

    return fs.readdirSync(LOG_DIR)
        .filter((file: string) => file.startsWith('api-') && file.endsWith('.log'))
        .sort()
        .reverse();
}

/**
 * Read logs from a specific file (server-side only)
 */
export async function readLogFile(filename: string): Promise<LogEntry[]> {
    if (typeof window !== 'undefined') {
        return [];
    }

    if (!isLoggingEnabled()) {
        return [];
    }

    const fs = await getFs();
    const path = await getPath();
    const LOG_DIR = await getLogDir();
    if (!fs || !path || !LOG_DIR) return [];

    const filePath = path.join(LOG_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return [];
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n').filter((line: string) => line.trim());

        const logEntries: (LogEntry | null)[] = lines.map((line: string) => {
            try {
                return JSON.parse(line) as LogEntry;
            } catch {
                return null;
            }
        });

        return logEntries.filter((entry): entry is LogEntry => entry !== null);
    } catch (error) {
        console.error('Failed to read log file:', error);
        return [];
    }
}
