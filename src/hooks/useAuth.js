import { useState, useEffect } from "react";
import { authApi, usersApi } from "@/lib/api";

/**
 * Shared auth hook: returns { user, role, loading, profile }
 * role is derived from the User entity profile (field "role")
 * Falls back to the built-in user.role from Base44 auth
 */
export function useAppAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getCurrentUser().then(async (u) => {
      if (!u) { setLoading(false); return; }
      setUser(u);
      try {
        const profiles = await usersApi.listUsers();
        const match = profiles.find(
          p => p.created_by === u.email || p.id === u.id
        );
        setProfile(match || null);
        // Priority: entity role → built-in user role → cidadao
        const derivedRole = match?.role || u.role || "cidadao";
        setRole(derivedRole);
      } catch {
        setRole(u.role || "cidadao");
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return { user, role, profile, loading };
}
