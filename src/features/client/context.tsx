import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { clientRepository, emptyClientData, type ClientData } from "./data";

type ClientContextValue = {
  data: ClientData;
  saving: boolean;
  save: (data: ClientData) => Promise<boolean>;
  notice: string;
  error: string;
  loading: boolean;
  loadFailed: boolean;
  retry: () => void;
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
  return (
    <ClientContext.Provider
      value={{ data, saving, save, notice, error, loading, loadFailed, retry: load }}
    >
      {children}
    </ClientContext.Provider>
  );
}
