const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

const getMaxRetries = () => {
    const configuredRetries = Number(process.env.WEBHOOK_MAX_RETRIES);
    return Number.isInteger(configuredRetries) && configuredRetries >= 0
        ? configuredRetries
        : DEFAULT_MAX_RETRIES;
};

const getBackoffMs = () => {
    const configuredBackoff = Number(process.env.WEBHOOK_BACKOFF_MS);
    return Number.isFinite(configuredBackoff) && configuredBackoff > 0
        ? configuredBackoff
        : DEFAULT_BACKOFF_MS;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildCompletionPayload = (task) => ({
    event: 'task.completed',
    task: {
        id: task._id.toString(),
        title: task.title,
        completedAt: new Date().toISOString(),
        userId: task.userId
    }
});

class WebhookService {
    static async sendTaskCompleted(task) {
        const webhookUrl = process.env.EXTERNAL_WEBHOOK_URL;
        const payload = buildCompletionPayload(task);

        if (!webhookUrl) {
            console.log('[Webhook skipped] EXTERNAL_WEBHOOK_URL is not configured', payload);
            return;
        }

        const maxRetries = getMaxRetries();
        const backoffMs = getBackoffMs();

        for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`Webhook failed with status ${response.status}`);
                }

                console.log(`[Webhook delivered] task=${payload.task.id} attempt=${attempt}`);
                return;
            } catch (error) {
                const isLastAttempt = attempt > maxRetries;
                console.error(`[Webhook attempt failed] task=${payload.task.id} attempt=${attempt}`, error.message);

                if (isLastAttempt) {
                    console.error('[Webhook abandoned]', payload);
                    return;
                }

                await sleep(backoffMs * (2 ** (attempt - 1)));
            }
        }
    }
}

module.exports = WebhookService;
