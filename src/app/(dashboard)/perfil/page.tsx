"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Save, Mail, Phone, Building2, MapPin, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface UserProfile {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  empresa: string;
  cargo: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  bio: string;
  fotoUrl: string | null;
}

const perfilInicial: UserProfile = {
  nombre: "Admin",
  apellidos: "",
  email: "admin@leadflow.com",
  telefono: "",
  empresa: "",
  cargo: "",
  direccion: "",
  ciudad: "",
  codigoPostal: "",
  bio: "",
  fotoUrl: null,
};

const STORAGE_KEY = "leadflow_user_profile";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<UserProfile>(perfilInicial);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar perfil desde localStorage al iniciar
  useEffect(() => {
    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      try {
        setPerfil(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setPerfil(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFotoUrl = reader.result as string;
        setPerfil(prev => {
          const updated = { ...prev, fotoUrl: newFotoUrl };
          // Auto-guardar la foto inmediatamente
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        toast.success("Foto de perfil actualizada");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
      // Simular delay de red - en producción esto sería una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Perfil actualizado correctamente");
    } catch (e) {
      console.error("Error saving profile:", e);
      toast.error("Error al guardar el perfil");
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const getInitials = () => {
    const first = perfil.nombre?.[0] || "";
    const last = perfil.apellidos?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y preferencias
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Editar perfil
            </Button>
          )}
        </div>
      </div>

      {/* Foto de perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>
            Esta foto se mostrará en tu cuenta y en las comunicaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={perfil.fotoUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button
                  onClick={handlePhotoClick}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <div className="space-y-1">
              <p className="font-medium">{perfil.nombre} {perfil.apellidos}</p>
              <p className="text-sm text-muted-foreground">{perfil.email}</p>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Haz clic en el icono de la cámara para cambiar tu foto
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información personal
          </CardTitle>
          <CardDescription>
            Tu información básica de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={perfil.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                disabled={!isEditing}
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                value={perfil.apellidos}
                onChange={(e) => handleChange("apellidos", e.target.value)}
                disabled={!isEditing}
                placeholder="Tus apellidos"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={perfil.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={!isEditing}
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="telefono"
                type="tel"
                value={perfil.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                disabled={!isEditing}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información profesional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Información profesional
          </CardTitle>
          <CardDescription>
            Datos de tu empresa y cargo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empresa" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </Label>
              <Input
                id="empresa"
                value={perfil.empresa}
                onChange={(e) => handleChange("empresa", e.target.value)}
                disabled={!isEditing}
                placeholder="Nombre de tu empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={perfil.cargo}
                onChange={(e) => handleChange("cargo", e.target.value)}
                disabled={!isEditing}
                placeholder="Tu cargo o puesto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dirección
          </CardTitle>
          <CardDescription>
            Tu ubicación física
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={perfil.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              disabled={!isEditing}
              placeholder="Calle, número, piso..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={perfil.ciudad}
                onChange={(e) => handleChange("ciudad", e.target.value)}
                disabled={!isEditing}
                placeholder="Tu ciudad"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigoPostal">Código Postal</Label>
              <Input
                id="codigoPostal"
                value={perfil.codigoPostal}
                onChange={(e) => handleChange("codigoPostal", e.target.value)}
                disabled={!isEditing}
                placeholder="00000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biografía */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre ti</CardTitle>
          <CardDescription>
            Una breve descripción sobre ti (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={perfil.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            disabled={!isEditing}
            placeholder="Cuéntanos un poco sobre ti..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Información de cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>Cuenta</CardTitle>
          <CardDescription>
            Información sobre tu cuenta y autenticación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Autenticación con Google</p>
              <p className="text-sm text-muted-foreground">
                Próximamente podrás vincular tu cuenta de Google
              </p>
            </div>
            <Button variant="outline" disabled>
              Conectar Google
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Cambiar contraseña</p>
              <p className="text-sm text-muted-foreground">
                Actualiza tu contraseña de acceso
              </p>
            </div>
            <Button variant="outline" disabled>
              Cambiar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
