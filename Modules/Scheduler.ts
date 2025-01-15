import schedule, {Job} from 'node-schedule';
import pc from 'picocolors';
import { Logger } from './Logger';
import type { Task } from '../types';
import { bot } from '@clients/Twitch'

export class Scheduler {
  private static jobs: Map<string, Job> = new Map();

  /**
   * Add a task to the scheduler.
   * @param task Object with task data (name, schedule, task).
   */
  public static addTask(task: Task): void {
    if (this.jobs.has(task.name)) {
      Logger.warn(`${pc.yellow("[SCHEDULER]")} || Task "${task.name}" already exists.`);
      return;
    }

    const job = schedule.scheduleJob(task.schedule, async () => {
      try {
        Logger.info(`${pc.green("[SCHEDULER]")} || Task started "${task.name}"`);
        await task.task();
      } catch (error) {
        Logger.error(`${pc.red("[SCHEDULER ERROR]")} || Error in task "${task.name}": ${(error as Error).message}`);
        bot.Utils.logError("Scheduler", (error as Error).message, (error as Error).stack || "");
      }
    });

    this.jobs.set(task.name, job);
    Logger.info(`${pc.green("[SCHEDULER]")} || Task "${task.name}" successfuly created.`);
  }

  /**
   * Remove a task from the scheduler.
   * @param name Name of the task.
   */
  public static removeTask(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.cancel();
      this.jobs.delete(name);
      Logger.info(`${pc.green("[SCHEDULER]")} || Task "${name}" succesfulu remove.`);
    } else {
      Logger.warn(`${pc.yellow("[SCHEDULER]")} || Task "${name}" not found.`);
    }
  }

  /**
   * List all tasks.
   * @returns List of all tasks.
   */
  public static listTasks(): string[] {
    return Array.from(this.jobs.keys());
  }
}