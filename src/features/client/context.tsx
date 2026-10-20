import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { clientRepository, emptyClientData, type ClientData } from "./data";

type ClientContextValue = {
  data: ClientData;
  saving: boolean;
  save: (data: ClientData) => Promise<boolean>;
  notice: string;
  error: string;
};
const ClientContext = createContext<ClientContextValue | null>(null);
export function useClientData() {
  const context = useContext(ClientContext);
  if (!context) throw new Error("ClientProvider is required");
  return context;
}
export function ClientProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(emptyClientData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    setLoadFailed(false);
    try {
      setData(await clientRepository.load());
    } catch {
      setLoadFailed(true);
      setError(
        "تعذّر قراءة بيانات التجربة المحلية. قد يكون التخزين محظوراً أو البيانات غير صالحة.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(next: ClientData) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await clientRepository.save(next);
      setData(next);
      setLoadFailed(false);
      setNotice("تم الحفظ على هذا المتصفح فقط. لم تُرسل البيانات إلى الشركة.");
      return true;
    } catch {
      setError("تعذّر الحفظ المحلي. تحقق من سماح المتصفح بالتخزين ثم حاول مرة أخرى.");
      return false;
    } finally {
      setSaving(false);
    }
  }
  if (loading)
    return (
      <div className="rounded-3xl border bg-card p-12 text-center" role="status">
        جارٍ تحميل بيانات التجربة…
      </div>
    );
  if (loadFailed)
    return (
      <div className="space-y-4 rounded-3xl border bg-card p-8">
        <p role="alert">{error}</p>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => void load()}>
            إعادة المحاولة
          </button>
          <button
            className="btn btn-outline"
            disabled={saving}
            onClick={() => {
              if (
                window.confirm(
                  "سيتم استبدال بيانات التجربة المحفوظة على هذا المتصفح ببيانات فارغة. متابعة؟",
                )
              )
                void save(emptyClientData());
            }}
          >
            بدء تجربة فارغة
          </button>
        </div>
      </div>
    );
  return (
    <ClientContext.Provider value={{ data, saving, save, notice, error }}>
      {children}
    </ClientContext.Provider>
  );
}
