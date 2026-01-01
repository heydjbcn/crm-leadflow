import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const SESSION_COOKIE_NAME = "leadflow_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * Genera un token de sesión aleatorio
 */
function generateSessionToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Inicia sesión de un usuario
 */
export async function login(email: string, password: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email, activo: true },
  });

  if (!usuario) {
    return { error: "Credenciales inválidas" };
  }

  const passwordValid = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValid) {
    return { error: "Credenciales inválidas" };
  }

  // Crear sesión
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.sesion.create({
    data: {
      usuarioId: usuario.id,
      token,
      expiresAt,
    },
  });

  // Actualizar último acceso
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcceso: new Date() },
  });

  // Establecer cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return { success: true, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre } };
}

/**
 * Cierra sesión del usuario actual
 */
export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.sesion.deleteMany({
      where: { token },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Obtiene la sesión actual del usuario
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const sesion = await prisma.sesion.findUnique({
    where: { token },
    include: { usuario: true },
  });

  if (!sesion || sesion.expiresAt < new Date()) {
    if (sesion) {
      await prisma.sesion.delete({ where: { id: sesion.id } });
    }
    return null;
  }

  return {
    id: sesion.usuario.id,
    email: sesion.usuario.email,
    nombre: sesion.usuario.nombre,
    tema: sesion.usuario.tema,
    comisionPorDefecto: sesion.usuario.comisionPorDefecto,
  };
}

/**
 * Verifica si hay una sesión válida (para middleware)
 */
export async function verifySession(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => c.split("="))
  );
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) return null;

  const sesion = await prisma.sesion.findUnique({
    where: { token },
    include: { usuario: true },
  });

  if (!sesion || sesion.expiresAt < new Date()) {
    return null;
  }

  return sesion.usuario;
}
