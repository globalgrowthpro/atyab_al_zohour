import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "superadmin"
  | "admin"
  | "manager"
  | "seo"
  | "sales"
  | "inventory"
  | "courier"
  | "client";

export type Permission =
  | "manage:all"
  | "manage:security"
  | "manage:roles"
  | "manage:settings"
  | "manage:pricing"
  | "manage:clients"
  | "manage:orders"
  | "manage:products"
  | "manage:couriers"
  | "manage:support"
  | "manage:seo"
  | "view:reports"
  | "portal:admin"
  | "portal:courier"
  | "portal:client";

export function getRoleLabel(role?: AppRole | null): string {
  switch (role) {
    case "superadmin":
      return "المدير العام (Super Admin)";
    case "admin":
      return "مدير النظام (Admin)";
    case "manager":
      return "مدير العمليات (Manager)";
    case "seo":
      return "مسؤول السيو والتسويق (SEO Specialist)";
    case "sales":
      return "مسؤول المبيعات (Sales)";
    case "inventory":
      return "أمين المستودع (Inventory)";
    case "courier":
      return "كابتن التوصيل (Courier)";
    case "client":
      return "عميل تجاري (B2B Client)";
    default:
      return "زائر";
  }
}

export function hasPermission(role: AppRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  if (role === "superadmin") return true;

  switch (permission) {
    case "manage:all":
    case "manage:security":
    case "manage:roles":
      return false; // Only superadmin

    case "manage:settings":
    case "manage:pricing":
      return role === "admin";

    case "manage:clients":
      return role === "admin" || role === "manager" || role === "sales";

    case "manage:orders":
      return role === "admin" || role === "manager" || role === "sales";

    case "manage:products":
      return role === "admin" || role === "manager" || role === "inventory" || role === "seo";

    case "manage:couriers":
      return role === "admin" || role === "manager";

    case "manage:support":
      return role === "admin" || role === "manager";

    case "manage:seo":
      return role === "admin" || role === "seo";

    case "view:reports":
      return role === "admin" || role === "manager" || role === "seo";

    case "portal:admin":
      return ["superadmin", "admin", "manager", "seo", "sales", "inventory"].includes(role);

    case "portal:courier":
      return ["superadmin", "admin", "courier"].includes(role);

    case "portal:client":
      return ["superadmin", "admin", "client"].includes(role);

    default:
      return false;
  }
}

export interface UserProfile {
  id: string;
  email: string | null;
  fullName: string;
  phone: string | null;
  companyName: string | null;
  city: string | null;
  district: string | null;
  role: AppRole;
  tier: string;
  avatarUrl: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: AppRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string; destination?: string; role?: AppRole }>;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    companyName?: string;
    city?: string;
    commercialRegister?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchDemoRole: (role: AppRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getRoleDestination(role?: AppRole | null): string {
  switch (role) {
    case "superadmin":
    case "admin":
    case "manager":
    case "sales":
    case "inventory":
      return "/admin";
    case "seo":
      return "/admin/seo";
    case "courier":
      return "/courier";
    case "client":
    default:
      return "/dashboard";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from Supabase profiles and user_roles
  async function fetchProfile(userId: string, userEmail?: string): Promise<UserProfile | null> {
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!profileErr && profileData) {
        const userRole = (profileData.role as AppRole) || "client";
        const loadedProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email || userEmail || null,
          fullName: profileData.full_name || "عميل أطياب الزهور",
          phone: profileData.phone || null,
          companyName: profileData.company_name || null,
          city: profileData.city || "الرياض",
          district: profileData.district || null,
          role: userRole,
          tier: profileData.tier || "bronze",
          avatarUrl: profileData.avatar_url || null,
        };
        setProfile(loadedProfile);
        setRole(userRole);
        return loadedProfile;
      }

      // Fallback if profile row is not yet populated
      const fallbackRole: AppRole = userEmail?.includes("superadmin")
        ? "superadmin"
        : userEmail?.includes("admin")
          ? "admin"
          : userEmail?.includes("manager")
            ? "manager"
            : userEmail?.includes("seo")
              ? "seo"
              : userEmail?.includes("courier")
                ? "courier"
                : "client";

      const fallbackProfile: UserProfile = {
        id: userId,
        email: userEmail || null,
        fullName: userEmail || (fallbackRole === "superadmin" ? "المدير العام" : fallbackRole === "admin" ? "مدير النظام" : fallbackRole === "manager" ? "مدير العمليات" : fallbackRole === "seo" ? "مسؤول السيو" : fallbackRole === "courier" ? "كابتن التوصيل" : "عميل مسجل"),
        phone: null,
        companyName: null,
        city: "الرياض",
        district: null,
        role: fallbackRole,
        tier: "bronze",
        avatarUrl: null,
      };

      setProfile(fallbackProfile);
      setRole(fallbackRole);
      return fallbackProfile;
    } catch (err) {
      console.warn("Profile fetch notice:", err);
      return null;
    }
  }

  // Initialize session & listen to auth state changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        // Session token expiry validation & refresh protection
        let activeSession = initialSession;
        if (initialSession && initialSession.expires_at) {
          const isExpired = initialSession.expires_at * 1000 < Date.now();
          if (isExpired) {
            const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
            if (!refreshErr && refreshData.session) {
              activeSession = refreshData.session;
            } else {
              activeSession = null;
              if (typeof window !== "undefined") {
                localStorage.removeItem("atyab_auth_session");
              }
            }
          }
        }

        if (!error && activeSession?.user && isMounted) {
          setSession(activeSession);
          setUser(activeSession.user);
          await fetchProfile(activeSession.user.id, activeSession.user.email);
        } else if (typeof window !== "undefined") {
          // Check local stored session as offline fallback
          const cached = localStorage.getItem("atyab_auth_session");
          const signedOut = localStorage.getItem("atyab_signed_out");
          if (cached && isMounted) {
            try {
              const parsed = JSON.parse(cached);
              // Inactivity check: 4 hours maximum session lifetime without refresh
              const loggedTime = new Date(parsed.lastActiveAt || parsed.loggedInAt || 0).getTime();
              const now = Date.now();
              if (now - loggedTime > 4 * 60 * 60 * 1000) {
                localStorage.removeItem("atyab_auth_session");
                setRole(null);
                setProfile(null);
              } else {
                parsed.lastActiveAt = new Date().toISOString();
                localStorage.setItem("atyab_auth_session", JSON.stringify(parsed));
                const cachedRole = (parsed.role as AppRole) || "superadmin";
                setRole(cachedRole);
                setProfile({
                  id: "cached-session-id",
                  email: parsed.email || null,
                  fullName: parsed.personaName || "مستخدم مسجل",
                  phone: null,
                  companyName: null,
                  city: "الرياض",
                  district: null,
                  role: cachedRole,
                  tier: "gold",
                  avatarUrl: null,
                });
              }
            } catch {
              // ignore
            }
          } else if (!signedOut && isMounted) {
            // Frontend preview default until authentication is connected or explicitly signed out
            setRole("superadmin");
            setProfile({
              id: "preview-superadmin-id",
              email: "admin@atyabalzohour.com",
              fullName: "المدير العام (Super Admin)",
              phone: "+201007419344",
              companyName: "أطياب الزهور",
              city: "الرياض",
              district: "حي الملز",
              role: "superadmin",
              tier: "gold",
              avatarUrl: null,
            });
          }
        }
      } catch (err) {
        console.warn("Auth initialization notice:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void initAuth();

    // Subscribe to auth state updates
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === "SIGNED_OUT") {
          if (typeof window !== "undefined") {
            localStorage.removeItem("atyab_auth_session");
          }
          setProfile(null);
          setRole(null);
          return;
        }

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user.email);
        } else {
          setProfile(null);
          setRole(null);
        }
      }
    );

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  async function signIn({ email, password }: { email: string; password: string }) {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Rate limiting / Brute-force protection
      if (typeof window !== "undefined") {
        try {
          const attemptData = JSON.parse(sessionStorage.getItem("atyab:login-guard") || "{}");
          const now = Date.now();
          if (attemptData.lockedUntil && now < attemptData.lockedUntil) {
            const remainingMins = Math.ceil((attemptData.lockedUntil - now) / 60000);
            setIsLoading(false);
            return {
              success: false,
              error: `تم إيقاف محاولات الدخول مؤقتاً لحماية أمان الحساب. يرجى الانتظار ${remainingMins} دقيقة قبل المحاولة مجدداً.`,
            };
          }
        } catch {
          // fallback
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        // Record failed attempt
        if (typeof window !== "undefined") {
          try {
            const attemptData = JSON.parse(sessionStorage.getItem("atyab:login-guard") || "{\"count\": 0}");
            const count = (attemptData.count || 0) + 1;
            const now = Date.now();
            if (count >= 5) {
              sessionStorage.setItem("atyab:login-guard", JSON.stringify({ count: 0, lockedUntil: now + 5 * 60 * 1000 }));
            } else {
              sessionStorage.setItem("atyab:login-guard", JSON.stringify({ count, lastAttempt: now }));
            }
          } catch {
            // fallback
          }
        }

        if (!import.meta.env["TEST"]) {
          await supabase.from("security_logs").insert({
            actor_name: cleanEmail,
            event_type: "login_failed",
            description: `فشل تسجيل الدخول للبريد (${cleanEmail}): بيانات الدخول غير صحيحة أو غير مسجلة`,
            severity: "warning",
            tone: "destructive",
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          });
        }

        setIsLoading(false);
        return {
          success: false,
          error: error.message.includes("Invalid login credentials")
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى إدخال بيانات حساب حقيقي مسجل."
            : error.message,
        };
      }

      // Successful login: reset guard
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("atyab:login-guard");
      }

      const activeUser = data.user;
      const loadedProfile = await fetchProfile(activeUser.id, activeUser.email);
      const userRole = loadedProfile?.role || "client";
      const destination = getRoleDestination(userRole);

      // Cache session in localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("atyab_signed_out");
        }
        localStorage.setItem(
          "atyab_auth_session",
          JSON.stringify({
            role: userRole,
            roleTitle: getRoleLabel(userRole),
            personaName: loadedProfile?.fullName || activeUser.email,
            email: activeUser.email,
            loggedInAt: new Date().toISOString(),
          })
        );

        // Security Audit Log
        if (!import.meta.env["TEST"]) {
          await supabase.from("security_logs").insert({
            user_id: activeUser.id,
            actor_name: loadedProfile?.fullName || cleanEmail,
            event_type: "login_success",
            description: `تسجيل دخول ناجح بصلاحية ${getRoleLabel(userRole)} (${cleanEmail})`,
            severity: "info",
            tone: "sage",
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          });
        }
      } catch {
        // Safe fallback
      }

      setIsLoading(false);
      return { success: true, destination, role: userRole };
    } catch (err) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "فشل تسجيل الدخول. تحقق من الاتصال.";
      return { success: false, error: msg };
    }
  }

  async function signUp({
    email,
    password,
    fullName,
    phone,
    companyName,
    city,
    commercialRegister,
  }: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    companyName?: string;
    city?: string;
    commercialRegister?: string;
  }) {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            company: companyName?.trim() || null,
            city: city?.trim() || "الرياض",
            role: "client",
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Ensure profile record is inserted
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: fullName.trim(),
          phone: phone.trim(),
          company_name: companyName?.trim() || null,
          commercial_register: commercialRegister?.trim() || null,
          city: city?.trim() || "الرياض",
          role: "client",
          tier: "bronze",
        });

        // Also add to clients CRM table
        await supabase.from("clients").upsert({
          name: fullName.trim(),
          phone: phone.trim(),
          company: companyName?.trim() || null,
          email: cleanEmail,
          city: city?.trim() || "الرياض",
        }, { onConflict: "phone" });

        // Security Log
        await supabase.from("security_logs").insert({
          user_id: data.user.id,
          actor_name: fullName.trim(),
          event_type: "user_registered",
          description: `تسجيل عميل B2B جديد (${cleanEmail})`,
          severity: "info",
          tone: "sage",
        });
      }

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "تعذّر إكمال التسجيل.";
      return { success: false, error: msg };
    }
  }

  async function signOut() {
    setIsLoading(true);
    try {
      if (user?.id) {
        await supabase.from("security_logs").insert({
          user_id: user.id,
          actor_name: profile?.fullName || user.email || "مستخدم",
          event_type: "logout",
          description: "تسجيل الخروج من المنصة",
          severity: "info",
          tone: "muted",
        });
      }
      await supabase.auth.signOut();
    } catch {
      // Safe fallback
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("atyab_auth_session");
        localStorage.removeItem("atyab-client-demo-v1");
        localStorage.removeItem("atyab-courier-demo-v1");
        localStorage.setItem("atyab_signed_out", "true");
        try {
          sessionStorage.clear();
        } catch {
          // ignore
        }
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      setIsLoading(false);
    }
  }

  async function refreshProfile() {
    if (user?.id) {
      await fetchProfile(user.id, user.email);
    }
  }

  function switchDemoRole(newRole: AppRole) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("atyab_signed_out");
    }
    const roleTitle = getRoleLabel(newRole);
    const demoProfile: UserProfile = {
      id: `demo-${newRole}-id`,
      email: `${newRole}@atyabalzohour.com`,
      fullName: roleTitle.split(" (")[0] || "المدير العام",
      phone: "+201007419344",
      companyName: "شركة أطياب الزهور للتوريد",
      city: "الرياض",
      district: "حي الملز",
      role: newRole,
      tier: "gold",
      avatarUrl: null,
    };
    setProfile(demoProfile);
    setRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "atyab_auth_session",
        JSON.stringify({
          role: newRole,
          roleTitle,
          personaName: demoProfile.fullName,
          email: demoProfile.email,
          loggedInAt: new Date().toISOString(),
        })
      );
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    role,
    isAuthenticated: Boolean(user || role),
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    switchDemoRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      session: null,
      profile: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      signIn: async () => ({ success: false, error: "Auth provider missing" }),
      signUp: async () => ({ success: false, error: "Auth provider missing" }),
      signOut: async () => {},
      refreshProfile: async () => {},
      switchDemoRole: () => {},
    };
  }
  return context;
}

export function useHasPermission(permission: Permission): boolean {
  const { role } = useAuth();
  return hasPermission(role, permission);
}

