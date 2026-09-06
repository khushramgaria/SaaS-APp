import { Queue, Worker } from "bullmq";
import { redisConnection } from "../config/redis.config.js";
import { sendInviteEmail } from "../services/email.service.js";

const QUEUE_NAME = "email-queue";

// 1. Queue Producer
export const emailQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// 2. Queue Consumer (Worker)
export const initEmailWorker = () => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      if (job.name === "SEND_INVITE_EMAIL") {
        const { toEmail, workspaceName, role, inviteUrl } = job.data;
        await sendInviteEmail({ toEmail, workspaceName, role, inviteUrl });
      }
    },
    { connection: redisConnection },
  );

  worker.on("completed", (job) => {
    console.log(`[BullMQ Job Done]: ${job.name} (ID: ${job.id})`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[BullMQ Job Failed]: ${job?.name} with error: ${err.message}`,
    );
  });

  return worker;
};
