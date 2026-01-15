"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useUser } from "@stackframe/stack";
import { Bell, Sun, Moon, User, LogOut, Menu, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  nombre: string;
  apellidos: string;
  email: string;
  fotoUrl: string | null;
}

const PROFILE_STORAGE_KEY = "leadflow_user_profile";

interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
}

const notificacionesIniciales: Notification[] = [
  { id: 1, titulo: "Nuevo lead recibido", mensaje: "María García - Landing Ventanas - Hace 5 min", leida: false },
  { id: 2, titulo: "Lead cualificado", mensaje: "Juan López pasó a Cualificado - Hace 1h", leida: false },
  { id: 3, titulo: "Venta cerrada", mensaje: "Pedro Martínez - 12,500€ - Hace 3h", leida: false },
];

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [notificaciones, setNotificaciones] = React.useState<Notification[]>(notificacionesIniciales);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const router = useRouter();
  const user = useUser();

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const handleLogout = async () => {
    await user?.signOut();
    router.push("/handler/sign-in");
  };

  // Cargar perfil del usuario desde localStorage o StackAuth
  React.useEffect(() => {
    // Si hay usuario de StackAuth, usar ese
    if (user) {
      setUserProfile({
        nombre: user.displayName || user.primaryEmail?.split("@")[0] || "Usuario",
        apellidos: "",
        email: user.primaryEmail || "",
        fotoUrl: user.profileImageUrl || null,
      });
      return;
    }

    // Fallback a localStorage
    const loadProfile = () => {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        try {
          setUserProfile(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading profile:", e);
        }
      }
    };

    loadProfile();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === PROFILE_STORAGE_KEY) {
        loadProfile();
      }
    };

    window.addEventListener("storage", handleStorage);
    const interval = setInterval(loadProfile, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [user]);

  const marcarComoLeida = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  };

  const marcarTodasComoLeidas = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const eliminarTodas = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotificaciones([]);
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {noLeidas > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {noLeidas}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-2 py-1.5">
              <span className="text-sm font-semibold">Notificaciones</span>
            </div>
            <DropdownMenuSeparator />
            {notificaciones.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No tienes notificaciones
              </div>
            ) : (
              notificaciones.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className={cn(
                    "flex flex-col items-start gap-1 py-3 cursor-pointer",
                    !notif.leida && "bg-primary/5"
                  )}
                  onClick={(e) => marcarComoLeida(notif.id, e)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className={cn("font-medium flex-1", !notif.leida && "font-semibold")}>
                      {notif.titulo}
                    </span>
                    {!notif.leida && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {notif.mensaje}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
              <Link href="/notificaciones" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
              {notificaciones.length > 0 && (
                <div className="flex items-center gap-2">
                  {noLeidas > 0 && (
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      onClick={marcarTodasComoLeidas}
                    >
                      <Check className="h-3 w-3" />
                      Leídas
                    </button>
                  )}
                  <button
                    className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                    onClick={eliminarTodas}
                  >
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <Avatar className="h-10 w-10">
                {userProfile?.fotoUrl && (
                  <AvatarImage src={userProfile.fotoUrl} className="object-cover" />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {userProfile?.nombre?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{userProfile?.nombre && userProfile?.apellidos
                  ? `${userProfile.nombre} ${userProfile.apellidos}`
                  : userProfile?.nombre || "Usuario"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {userProfile?.email || "sin email"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/perfil">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
