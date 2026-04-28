const scheduledReminders = new Map();

const DEFAULT_REMINDER_LEAD_MS = 60 * 60 * 1000;

const getReminderLeadMs = () => {
    const configuredLead = Number(process.env.REMINDER_LEAD_MS);
    return Number.isFinite(configuredLead) && configuredLead >= 0
        ? configuredLead
        : DEFAULT_REMINDER_LEAD_MS;
};

const buildReminderPayload = (task) => ({
    taskId: task._id.toString(),
    title: task.title,
    dueDate: task.dueDate,
    userId: task.userId,
    status: task.status
});

class ReminderService {
    static schedule(task) {
        const taskId = task._id.toString();
        this.cancel(taskId);

        if (!task.dueDate || task.status === 'completed') {
            return;
        }

        const reminderAt = new Date(task.dueDate).getTime() - getReminderLeadMs();
        const delay = reminderAt - Date.now();

        if (delay <= 0) {
            console.log('[Reminder skipped]', buildReminderPayload(task));
            return;
        }

        const timeoutId = setTimeout(() => {
            console.log('[Task reminder]', buildReminderPayload(task));
            scheduledReminders.delete(taskId);
        }, delay);

        scheduledReminders.set(taskId, timeoutId);
        console.log(`[Reminder scheduled] task=${taskId} at=${new Date(reminderAt).toISOString()}`);
    }

    static cancel(taskId) {
        const timeoutId = scheduledReminders.get(taskId.toString());
        if (!timeoutId) return;

        clearTimeout(timeoutId);
        scheduledReminders.delete(taskId.toString());
        console.log(`[Reminder cancelled] task=${taskId}`);
    }

    static reschedule(task) {
        this.schedule(task);
    }
}

module.exports = ReminderService;
