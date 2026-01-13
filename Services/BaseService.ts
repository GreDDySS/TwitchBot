import { Logger } from "../Utils/Logger";

export abstract class BaseService {
    protected static validateString(value: unknown, fieldName: string): string | null {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            Logger.warn(`[${this.name}] Invalid ${fieldName}: ${value}`);
            return null;
        }
        return value;
    }

    protected static validateId(id: unknown, entityName: string): string | null {
        return this.validateString(id, `${entityName} ID`);
    }

    protected static clampNumber(value: number, min: number, max: number, defaultValue: number): number {
        if (typeof value !== 'number' || isNaN(value)) {
            return defaultValue;
        }
        return Math.max(min, Math.min(value, max));
    }

    protected static isPrismaError(error: unknown, code: string): boolean {
        return (
            error !== null &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === code
        );
    }
}