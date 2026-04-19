export function setSession(authData) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem("access_token", authData.access_token);
  localStorage.setItem("refresh_token", authData.refresh_token || "");
  localStorage.setItem("user", JSON.stringify(authData.user || null));
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

export function getUser() {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getHomeRouteByRole(role) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "travel_partner") return "/dashboard/partner";
  if (role === "linked_user") return "/dashboard/user";
  if (role === "normal") return "/dashboard/self-travel";
  return "/dashboard/guardian";
}
