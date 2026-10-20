import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  courierRepository,
  demoCourierData,
  transitionTask,
  type CourierData,
  type TaskAction,
} from "./data";
type CourierContextValue = {
  data: CourierData;
  saving: boolean;
  error: string;
  notice: string;
  save: (next: CourierData) => Promise<boolean>;
  updateTask: (id: string, action: TaskAction) => Promise<boolean>;
};
const CourierContext = createContext<CourierContextValue | null>(null);
export function useCourier() {
  const value = useContext(CourierContext);
  if (!value) throw new Error("CourierProvider is required");
  return value;
}
export function CourierProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(demoCourierData);
  const [loading, setLoading] = useState(true);
  const [failedLoad, setFailedLoad] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const busy = useRef(false);
  async function load() {
    setLoading(true);
    setFailedLoad(false);
    setError("");
    try {
      setData(await courierRepository.load());
    } catch {
      setFailedLoad(true);
      setError("تعذّر قراءة بيانات المندوب المحلية. تحقق من إعدادات التخزين أو أعد المحاولة.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(next: CourierData) {
    if (busy.current) return false;
    busy.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await courierRepository.save(next);
      setData(next);
      setFailedLoad(false);
      setNotice("تم حفظ التحديث محلياً في تجربة المندوب. لم يُرسل إشعار أو تحديث فعلي للعميل.");
      return true;
    } catch {
      setError("تعذّر حفظ التحديث. لم تتغير حالة المهمة؛ حاول مرة أخرى.");
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  async function updateTask(id: string, action: TaskAction) {
    try {
      const task = data.tasks.find((item) => item.id === id);
      if (!task) throw new Error("المهمة غير موجودة.");
      const updated = transitionTask(task, action);
      return await save({
        ...data,
        tasks: data.tasks.map((item) => (item.id === id ? updated : item)),
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "راجع بيانات تحديث المهمة.");
      return false;
    }
  }
  if (loading)
    return (
      <div role="status" className="rounded-2xl border bg-card p-10 text-center text-sm">
        جارٍ تحميل مهام المندوب…
      </div>
    );
  if (failedLoad)
    return (
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <p role="alert">{error}</p>
        <button onClick={() => void load()} className="btn btn-primary">
          إعادة المحاولة
        </button>
        <button
          disabled={saving}
          onClick={() => {
            if (
              window.confirm(
                "استبدال بيانات المندوب المحلية ببيانات العرض؟ هذا لا يؤثر على تجربة العميل.",
              )
            )
              void save(demoCourierData());
          }}
          className="btn btn-outline ms-3"
        >
          إعادة بيانات العرض
        </button>
      </div>
    );
  return (
    <CourierContext.Provider value={{ data, saving, error, notice, save, updateTask }}>
      {children}
    </CourierContext.Provider>
  );
}
