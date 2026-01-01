"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Key,
  Plus,
  Copy,
  RefreshCw,
  Trash2,
  Globe,
  Bell,
  Moon,
  Sun,
  Check,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Landing {
  id: number;
  nombre: string;
  slug: string;
  url: string | null;
  apiKey: string;
  activa: boolean;
  createdAt: string;
  _count: {
    leads: number;
  };
}

export default function ConfiguracionPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [landings, setLandings] = useState<Landing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKeys, setShowApiKeys] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Estados para crear nueva landing
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newLanding, setNewLanding] = useState({
    nombre: "",
    slug: "",
    url: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchLandings = async () => {
    try {
      const response = await fetch("/api/landings");
      if (!response.ok) throw new Error("Error al cargar landings");
      const data = await response.json();
      setLandings(data);
    } catch (error) {
      toast.error("Error al cargar las landings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLandings();
  }, []);

  const handleCreateLanding = async () => {
    if (!newLanding.nombre || !newLanding.slug) {
      toast.error("Nombre y slug son requeridos");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/landings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLanding,
          url: newLanding.url || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear");
      }

      toast.success("Landing creada correctamente");
      setCreateDialogOpen(false);
      setNewLanding({ nombre: "", slug: "", url: "" });
      fetchLandings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear landing");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRegenerateKey = async (id: number) => {
    try {
      const response = await fetch(`/api/landings/${id}/regenerate-key`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Error al regenerar");

      toast.success("API Key regenerada");
      fetchLandings();
    } catch (error) {
      toast.error("Error al regenerar la API Key");
    }
  };

  const handleDeleteLanding = async (id: number) => {
    try {
      const response = await fetch(`/api/landings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      toast.success("Landing eliminada");
      fetchLandings();
    } catch (error) {
      toast.error("Error al eliminar la landing");
    }
  };

  const handleToggleActive = async (id: number, activa: boolean) => {
    try {
      const response = await fetch(`/api/landings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !activa }),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      toast.success(activa ? "Landing desactivada" : "Landing activada");
      fetchLandings();
    } catch (error) {
      toast.error("Error al actualizar la landing");
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("API Key copiada al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleShowApiKey = (id: number) => {
    setShowApiKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona las landings, API Keys y preferencias del sistema
        </p>
      </div>

      {/* Tema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {mounted && theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <CardTitle className="text-base">Apariencia</CardTitle>
          </div>
          <CardDescription>
            Personaliza el tema de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Tema</Label>
            {mounted ? (
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="w-[180px] h-9 rounded-md border bg-muted animate-pulse" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Keys y Landings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle className="text-base">Landings y API Keys</CardTitle>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Landing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Landing</DialogTitle>
                  <DialogDescription>
                    Crea una nueva landing para recibir leads. Se generará una API
                    Key automáticamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      placeholder="Mi Landing Page"
                      value={newLanding.nombre}
                      onChange={(e) => {
                        const nombre = e.target.value;
                        setNewLanding((prev) => ({
                          ...prev,
                          nombre,
                          slug: prev.slug || generateSlug(nombre),
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (identificador único)</Label>
                    <Input
                      id="slug"
                      placeholder="mi-landing"
                      value={newLanding.slug}
                      onChange={(e) =>
                        setNewLanding((prev) => ({
                          ...prev,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL (opcional)</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://mi-landing.com"
                      value={newLanding.url}
                      onChange={(e) =>
                        setNewLanding((prev) => ({ ...prev, url: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateLanding} disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Landing
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Gestiona las landings que pueden enviar leads a través de la API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : landings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay landings configuradas</p>
              <p className="text-sm">Crea una para empezar a recibir leads</p>
            </div>
          ) : (
            <div className="space-y-4">
              {landings.map((landing) => (
                <div
                  key={landing.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{landing.nombre}</h4>
                        <Badge
                          variant={landing.activa ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {landing.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>/{landing.slug}</span>
                        <span>•</span>
                        <span>{landing._count.leads} leads</span>
                        {landing.url && (
                          <>
                            <span>•</span>
                            <a
                              href={landing.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(landing.id, landing.activa)}
                      >
                        {landing.activa ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteLanding(landing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">API Key</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                        {showApiKeys[landing.id]
                          ? landing.apiKey
                          : `${landing.apiKey.slice(0, 10)}${"•".repeat(30)}`}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleShowApiKey(landing.id)}
                      >
                        {showApiKeys[landing.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(landing.apiKey, landing.id)}
                      >
                        {copiedId === landing.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRegenerateKey(landing.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentación API */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentación API</CardTitle>
          <CardDescription>
            Cómo integrar tus landings con el CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Endpoint</Label>
            <code className="block bg-muted px-3 py-2 rounded text-sm mt-1">
              POST /api/public/leads
            </code>
          </div>

          <div>
            <Label className="text-sm font-medium">Headers</Label>
            <pre className="bg-muted px-3 py-2 rounded text-sm mt-1 overflow-x-auto">
{`Content-Type: application/json
X-API-Key: tu_api_key_aqui`}
            </pre>
          </div>

          <div>
            <Label className="text-sm font-medium">Body (ejemplo)</Label>
            <pre className="bg-muted px-3 py-2 rounded text-sm mt-1 overflow-x-auto">
{`{
  "nombre": "Juan García",
  "email": "juan@email.com",
  "telefono": "612345678",
  "localidad": "Barcelona",
  "servicios": ["ventanas", "puertas"],
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "verano2024"
}`}
            </pre>
          </div>

          <div>
            <Label className="text-sm font-medium">Campos requeridos</Label>
            <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
              <li><code>nombre</code> - Nombre del lead</li>
              <li><code>telefono</code> - Teléfono de contacto</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
