import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "manager" | "sales" | "inventory" | "courier" | "client";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getRoleDestination(role?: AppRole | null): string {
  switch (role) {
    case "admin":
    case "manager":
    case "sales":
    case "inventory":
      return "/admin";
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
      const fallbackRole: AppRole = userEmail?.includes("admin")
        ? "admin"
        : userEmail?.includes("courier")
          ? "courier"
          : "client";

      const fallbackProfile: UserProfile = {
        id: userId,
        email: userEmail || null,
        fullName: userEmail || "مستخدم مسجل",
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
        if (!error && initialSession?.user && isMounted) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id, initialSession.user.email);
        } else if (typeof window !== "undefined") {
          // Check local stored session as offline fallback
          const cached = localStorage.getItem("atyab_auth_session");
          if (cached && isMounted) {
            try {
              const parsed = JSON.parse(cached);
              const cachedRole = (parsed.role as AppRole) || "client";
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
                tier: "bronze",
                avatarUrl: null,
              });
            } catch {
              // ignore
            }
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      const activeUser = data.user;
      const loadedProfile = await fetchProfile(activeUser.id, activeUser.email);
      const userRole = loadedProfile?.role || "client";
      const destination = getRoleDestination(userRole);

      // Cache session in localStorage
      try {
        localStorage.setItem(
          "atyab_auth_session",
          JSON.stringify({
            role: userRole,
            roleTitle: userRole === "admin" ? "مدير النظام" : userRole === "courier" ? "كابتن التوصيل" : "عميل مسجل",
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
            description: `تسجيل دخول ناجح بصلاحية ${userRole} (${cleanEmail})`,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

