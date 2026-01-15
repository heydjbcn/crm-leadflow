-- Script para insertar la landing de Solutec en produccion
-- Ejecutar en el contenedor crm-leadflow-db

INSERT INTO landings (nombre, slug, url, descripcion, api_key, activa, notificar_email, notificar_push, created_at, updated_at)
VALUES (
  'Solutec - Ventanas',
  'solutec-ventanas',
  'https://ventanas.jmauri.com',
  'Landing page de ventanas de aluminio - Solutec',
  'lf_8a3f2e9c4b7d1a6e5f3c2b9a8d7e4f1c6b5a4d3e2f1a9b8c',
  true,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  url = EXCLUDED.url,
  api_key = EXCLUDED.api_key,
  updated_at = NOW();

-- Verificar
SELECT id, nombre, slug, api_key, activa FROM landings;
