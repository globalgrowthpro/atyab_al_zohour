import { useEffect, useRef } from "react";
import { supabase } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE" | "*";

export interface RealtimeSubscriptionOptions<T = any> {
  table: string;
  schema?: string;
  filter?: string;
  event?: RealtimeEventType;
  onInsert?: (row: T) => void;
  onUpdate?: (newRow: T, oldRow: T) => void;
  onDelete?: (oldRow: T) => void;
  onChange?: (payload: { eventType: RealtimeEventType; new: T; old: T }) => void;
  enabled?: boolean;
}

/**
 * Subscribe to realtime PostgreSQL changes on a given table.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToTable<T = any>(options: RealtimeSubscriptionOptions<T>): () => void {
  if (typeof window === "undefined" || import.meta.env["TEST"] || options.enabled === false) {
    return () => {};
  }

  const {
    table,
    schema = "public",
    filter,
    event = "*",
    onInsert,
    onUpdate,
    onDelete,
    onChange,
  } = options;

  const channelId = `realtime-${table}-${filter || "all"}-${Math.random().toString(36).slice(2, 7)}`;
  let channel: RealtimeChannel;

  try {
    channel = supabase.channel(channelId);

    const postgresChangesFilter: any = {
      event,
      schema,
      table,
    };

    if (filter) {
      postgresChangesFilter.filter = filter;
    }

    channel
      .on("postgres_changes", postgresChangesFilter, (payload: any) => {
        onChange?.(payload);

        if (payload.eventType === "INSERT") {
          onInsert?.(payload.new);
        } else if (payload.eventType === "UPDATE") {
          onUpdate?.(payload.new, payload.old);
        } else if (payload.eventType === "DELETE") {
          onDelete?.(payload.old);
        }
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // Safe fallback
      }
    };
  } catch (err) {
    console.warn(`Realtime channel error for table ${table}:`, err);
    return () => {};
  }
}

/**
 * React Hook for declarative real-time subscriptions with automatic lifecycle cleanup.
 */
export function useRealtimeSubscription<T = any>(options: RealtimeSubscriptionOptions<T>): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (options.enabled === false) return;

    const cleanup = subscribeToTable<T>({
      table: options.table,
      schema: options.schema,
      filter: options.filter,
      event: options.event,
      onInsert: (row) => optionsRef.current.onInsert?.(row),
      onUpdate: (newRow, oldRow) => optionsRef.current.onUpdate?.(newRow, oldRow),
      onDelete: (oldRow) => optionsRef.current.onDelete?.(oldRow),
      onChange: (payload) => optionsRef.current.onChange?.(payload),
    });

    return () => {
      cleanup();
    };
  }, [options.table, options.filter, options.schema, options.event, options.enabled]);
}
