import { z } from "zod";
import type {
  DialogStepContent,
  QuestionStepContent,
  SimulationStepOut,
  SimulationStepType,
  TaskStepContent,
} from "@/types/api";

const nonEmptyString = z.string().trim().min(1);

export const questionStepContentSchema = z
  .object({
    prompt: nonEmptyString,
    hint: z.string().optional(),
    placeholder: z.string().optional(),
    options: z.array(nonEmptyString).optional(),
    expected_keywords: z.array(nonEmptyString).optional(),
  })
  .passthrough();

export const taskStepContentSchema = z
  .object({
    title: nonEmptyString,
    instructions: nonEmptyString,
    checklist: z.array(nonEmptyString).optional(),
    placeholder: z.string().optional(),
    starter_template: z.string().optional(),
    deliverable_format: z.enum(["text", "markdown", "json", "code"]).optional(),
  })
  .passthrough();

export const dialogStepContentSchema = z
  .object({
    mentor_message: nonEmptyString,
    context: z.string().optional(),
    tone: z.string().optional(),
    placeholder: z.string().optional(),
    suggested_replies: z.array(nonEmptyString).optional(),
  })
  .passthrough();

const stepBaseSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().min(1),
  next_step_rules: z.record(z.string(), z.unknown()).nullable().optional(),
});

const stepDraftQuestionSchema = stepBaseSchema.extend({
  type: z.literal("question"),
  content: questionStepContentSchema,
});

const stepDraftTaskSchema = stepBaseSchema.extend({
  type: z.literal("task"),
  content: taskStepContentSchema,
});

const stepDraftDialogSchema = stepBaseSchema.extend({
  type: z.literal("dialog"),
  content: dialogStepContentSchema,
});

export const simulationStepDraftSchema = z.discriminatedUnion("type", [
  stepDraftQuestionSchema,
  stepDraftTaskSchema,
  stepDraftDialogSchema,
]);

export const simulationStepsDraftSchema = z.array(simulationStepDraftSchema).superRefine((steps, ctx) => {
  const orders = new Set<number>();

  for (let index = 0; index < steps.length; index += 1) {
    const order = steps[index].order;
    if (orders.has(order)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate step order: ${order}`,
        path: [index, "order"],
      });
    }
    orders.add(order);
  }
});

export type SimulationStepDraft = z.infer<typeof simulationStepDraftSchema>;

export type ParsedQuestionStepContent = QuestionStepContent & {
  type: "question";
  placeholder: string;
  options: string[];
};

export type ParsedTaskStepContent = TaskStepContent & {
  type: "task";
  checklist: string[];
  placeholder: string;
};

export type ParsedDialogStepContent = DialogStepContent & {
  type: "dialog";
  suggested_replies: string[];
  placeholder: string;
};

export type ParsedSimulationStepContent =
  | ParsedQuestionStepContent
  | ParsedTaskStepContent
  | ParsedDialogStepContent;

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asTextArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseQuestionContent(raw: unknown): ParsedQuestionStepContent {
  const parsed = questionStepContentSchema.safeParse(raw);
  if (parsed.success) {
    return {
      type: "question",
      ...parsed.data,
      placeholder: parsed.data.placeholder ?? "Write your answer...",
      options: parsed.data.options ?? [],
    };
  }

  const fallback = asObject(raw);
  return {
    type: "question",
    prompt: asText(fallback.prompt) || asText(fallback.title) || asText(fallback.text) || "Question",
    hint: asText(fallback.hint) || undefined,
    placeholder: asText(fallback.placeholder) || "Write your answer...",
    options: asTextArray(fallback.options),
    expected_keywords: asTextArray(fallback.expected_keywords),
    ...fallback,
  };
}

function parseTaskContent(raw: unknown): ParsedTaskStepContent {
  const parsed = taskStepContentSchema.safeParse(raw);
  if (parsed.success) {
    return {
      type: "task",
      ...parsed.data,
      checklist: parsed.data.checklist ?? [],
      placeholder: parsed.data.placeholder ?? "Describe your solution and reasoning...",
    };
  }

  const fallback = asObject(raw);
  return {
    type: "task",
    title: asText(fallback.title) || asText(fallback.prompt) || "Task",
    instructions: asText(fallback.instructions) || asText(fallback.text) || "Complete the task.",
    checklist: asTextArray(fallback.checklist),
    starter_template: asText(fallback.starter_template) || undefined,
    deliverable_format: ["text", "markdown", "json", "code"].includes(asText(fallback.deliverable_format))
      ? (asText(fallback.deliverable_format) as ParsedTaskStepContent["deliverable_format"])
      : undefined,
    placeholder: asText(fallback.placeholder) || "Describe your solution and reasoning...",
    ...fallback,
  };
}

function parseDialogContent(raw: unknown): ParsedDialogStepContent {
  const parsed = dialogStepContentSchema.safeParse(raw);
  if (parsed.success) {
    return {
      type: "dialog",
      ...parsed.data,
      suggested_replies: parsed.data.suggested_replies ?? [],
      placeholder: parsed.data.placeholder ?? "Reply to mentor...",
    };
  }

  const fallback = asObject(raw);
  return {
    type: "dialog",
    mentor_message:
      asText(fallback.mentor_message) || asText(fallback.prompt) || asText(fallback.text) || "Let's discuss your approach.",
    context: asText(fallback.context) || undefined,
    tone: asText(fallback.tone) || undefined,
    suggested_replies: asTextArray(fallback.suggested_replies),
    placeholder: asText(fallback.placeholder) || "Reply to mentor...",
    ...fallback,
  };
}

export function parseStepContentByType(type: SimulationStepType, raw: unknown): ParsedSimulationStepContent {
  if (type === "task") return parseTaskContent(raw);
  if (type === "dialog") return parseDialogContent(raw);
  return parseQuestionContent(raw);
}

export function parseSimulationStepContent(step: SimulationStepOut | null | undefined): ParsedSimulationStepContent | null {
  if (!step) return null;
  return parseStepContentByType(step.type, step.content);
}

export function getAssistantMessageFromStep(step: SimulationStepOut | null | undefined): string {
  const parsed = parseSimulationStepContent(step);
  if (!parsed) return "";

  if (parsed.type === "task") {
    return `${parsed.title}: ${parsed.instructions}`;
  }

  if (parsed.type === "dialog") {
    return parsed.mentor_message;
  }

  return parsed.prompt;
}

export function formatSimulationValidationIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "root";
    return `${path}: ${issue.message}`;
  });
}
