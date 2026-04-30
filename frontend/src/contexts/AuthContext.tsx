"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  title?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (name: string, email: string, password: string, stage_index?: number, interests?: string[]) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 체크
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // 프로필 정보 가져오기 (이름 등)
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, title')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: profile?.name || session.user.email?.split('@')[0] || "User",
          title: profile?.title || "IT 역량 강화 중"
        });
      }
      setLoading(false);
    };

    checkUser();

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, title')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: profile?.name || session.user.email?.split('@')[0] || "User",
          title: profile?.title || "IT 역량 강화 중"
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signup = async (name: string, email: string, password: string, stage_index: number = 0, interests: string[] = []) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name }
      }
    });
    
    if (!error && data.user) {
      // profiles 테이블에 초기 데이터 생성 (Trigger가 없을 경우를 대비해 직접 호출)
      // 실제로는 Trigger를 쓰는 것이 더 안전함
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: name,
        title: ["입문기 개발자", "성장기 개발자", "숙련기 개발자", "전문가", "마스터"][stage_index] || "입문기 개발자",
        streak: 1,
        xp: 0,
        level: 1,
        stage_index: stage_index,
        interests: interests
      });
    }

    return { error: error?.message || null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
