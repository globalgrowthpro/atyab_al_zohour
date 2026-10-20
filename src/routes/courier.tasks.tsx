import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCourier } from "@/features/courier/context";
import { TaskList } from "@/features/courier/task-list";
import { TaskDrawer } from "@/features/courier/shared";
export const Route = createFileRoute("/courier/tasks")({
  validateSearch: (search: Record<string, unknown>): { task?: string | undefined } => ({
    task: typeof search["task"] === "string" ? search["task"] : undefined,
  }),
  component: CourierTasks,
});
function CourierTasks() {
  const { data } = useCourier();
  const { task: selected } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">مهام التوصيل</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            كل المهام المسندة إليك، وتفاصيل كل عملية تسليم.
          </p>
        </div>
        <span className="rounded-lg border bg-card px-3 py-2 text-xs text-primary">
          {data.tasks.length} مهام · جولة تجريبية
        </span>
      </div>
      <TaskList
        tasks={data.tasks}
        onDetails={(task) =>
          void navigate({ to: "/courier/tasks", search: { task: task.id }, resetScroll: false })
        }
      />
      <TaskDrawer
        task={data.tasks.find((task) => task.id === selected)}
        open={Boolean(selected)}
        onClose={() =>
          void navigate({ to: "/courier/tasks", search: {}, replace: true, resetScroll: false })
        }
      />
    </div>
  );
}
