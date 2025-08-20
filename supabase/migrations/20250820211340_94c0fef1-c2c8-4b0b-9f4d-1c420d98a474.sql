-- FASE 1.2: CORREÇÕES ADICIONAIS DE CONFIGURAÇÃO DE AUTENTICAÇÃO

-- Configurar OTP expiry para valor recomendado (reduzir de padrão para 10 minutos)
UPDATE auth.config 
SET password_strength_policy = jsonb_set(
  COALESCE(password_strength_policy, '{}'::jsonb),
  '{password_requirements}',
  '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special_chars": false}'::jsonb
) 
WHERE id = 1;

-- Habilitar proteção contra senhas vazadas
UPDATE auth.config 
SET password_strength_policy = jsonb_set(
  COALESCE(password_strength_policy, '{}'::jsonb),
  '{hibp_enabled}',
  'true'::jsonb
) 
WHERE id = 1;

-- Configurar tempo de expiração de OTP para 10 minutos (600 segundos)
UPDATE auth.config 
SET otp_expiry = 600
WHERE id = 1;