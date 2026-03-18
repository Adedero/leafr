import type { ButtonProps } from "@renderer/components/ui/Button.vue";

export type UIColor = "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
export type UIVariant = "filled" | "outline" | "soft" | "subtle" | "ghost" | "link";
export type UISize = "sm" | "md" | "lg" | "xl";
export type UIAction = ButtonProps & { onClick?: () => void | Promise<void> };
