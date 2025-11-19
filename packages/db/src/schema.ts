import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const uploadStatusEnum = pgEnum("upload_status", [
  "pending", // File uploaded, waiting for workflow to start
  "processing", // AI is analyzing the file
  "completed", // AI finished, one or more events extracted
  "failed", // AI failed to process or no event found
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "incomplete",
  "ended",
  "upcoming",
  "free",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk User ID
  email: text("email").notNull().unique(),
  name: text("name"),
  imageUrl: text("image_url"),
  phoneNumber: text("phone_number"),
  accountType: text("account_type"),
  isOnboarded: boolean("is_onboarded").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionStatus = pgTable("subscription_status", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clerkSubscriptionId: text("clerk_subscription_id"),
  clerkSubscriptionItemId: text("clerk_subscription_item_id"),
  planId: text("plan_id"),
  status: subscriptionStatusEnum("status").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const uploads = pgTable("uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // e.g., 'image/png', 'application/pdf'
  storageUrl: text("storage_url").notNull(), // URL from Vercel Blob, S3, etc.
  icsUrl: text("ics_url"), // URL to the combined ICS file for all events

  // The status is updated by your Vercel Workflow at each step of the process.
  status: uploadStatusEnum("status").default("pending").notNull(),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Links to the user who uploaded it
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  isAllDay: boolean("is_all_day").default(false).notNull(),

  // The generated iCalendar (.ics) file content is stored directly here.
  icsContent: text("ics_content").notNull(),

  uploadId: uuid("upload_id")
    .notNull()
    .references(() => uploads.id, { onDelete: "cascade" }), // Links back to the source upload
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Direct link to user for easy querying
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



export const usersRelations = relations(users, ({ many }) => ({
  uploads: many(uploads),
  events: many(events),
  subscriptionStatuses: many(subscriptionStatus),
}));

export const uploadsRelations = relations(uploads, ({ one, many }) => ({
  user: one(users, {
    fields: [uploads.userId],
    references: [users.id],
  }),
  events: many(events), // An upload can have many extracted events
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  upload: one(uploads, {
    fields: [events.uploadId],
    references: [uploads.id],
  }),
}));

export const subscriptionStatusRelations = relations(subscriptionStatus, ({ one }) => ({
  user: one(users, {
    fields: [subscriptionStatus.userId],
    references: [users.id],
  }),
}));
