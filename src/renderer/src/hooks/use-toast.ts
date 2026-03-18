import type { UIAction, UIColor } from "@renderer/types/ui.type";
import { nextTick, onUnmounted, ref } from "vue";
import { ulid } from "ulid";
import type { IconName } from "@renderer/components/ui/Icon.vue";

export type XAxis = "left" | "right";
export type YAxis = "top" | "bottom";
export type ToastPosition = `${YAxis}-${XAxis}`;

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  color?: UIColor;
  duration?: number;
  actions?: UIAction[];
  position?: ToastPosition;
  removeAfterDuration?: boolean;
  icon?: IconName;
}

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  duration: number;
  actions?: UIAction[];
  color: UIColor;
  open: boolean;
  position: ToastPosition;
  removeAfterDuration: boolean;
  icon?: IconName;
}

export interface UseToastInstanceOptions {
  clearOnUnmounted?: boolean;
}

const toasts = ref<Toast[]>([]);

const ID = () => ulid();

export default function useToast(config: UseToastInstanceOptions = {}) {
  const useToastConfig: UseToastInstanceOptions = {
    clearOnUnmounted: true,
    ...config
  };

  const open = (options: string | ToastOptions) => {
    if (typeof options === "string") {
      const toast = toasts.value.find((t) => t.id === options);
      if (!toast) return null;

      toast.open = false;
      nextTick(() => (toast.open = true));

      return toast.id;
    }

    const id = options.id || ID();

    const existing = toasts.value.find((t) => t.id === id);
    if (existing) {
      existing.open = false;
      nextTick(() => (existing.open = true));
      return id;
    }

    const toast: Toast = {
      id,
      title: options.title,
      description: options.description,
      duration: options.duration ?? 5000,
      actions: options.actions,
      color: options.color ?? "primary",
      open: true,
      position: options.position ?? "bottom-right",
      removeAfterDuration: options.removeAfterDuration ?? true,
      ...options
    };

    toasts.value.push(toast);

    if (toast.removeAfterDuration && toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration + 300);
    }

    return id;
  };

  const close = (id: string) => {
    const toast = toasts.value.find((t) => t.id === id);
    if (toast) toast.open = false;
  };

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const clear = () => {
    toasts.value = [];
  };

  const success = (
    title?: string,
    description?: string,
    opts: Omit<ToastOptions, "color"> = {}
  ) => {
    return useToast(config).open({
      title,
      description,
      color: "success",
      ...opts
    });
  };

  const warning = (
    title?: string,
    description?: string,
    opts: Omit<ToastOptions, "color"> = {}
  ) => {
    return useToast(config).open({
      title,
      description,
      color: "warning",
      ...opts
    });
  };

  const error = (title?: string, description?: string, opts: Omit<ToastOptions, "color"> = {}) => {
    return useToast(config).open({
      title,
      description,
      color: "error",
      icon: "lucide:circle-alert",
      ...opts
    });
  };

  onUnmounted(() => {
    if (useToastConfig.clearOnUnmounted) {
      clear();
    }
  });

  return {
    toasts,
    open,
    close,
    remove,
    clear,
    success,
    warning,
    error
  };
}
