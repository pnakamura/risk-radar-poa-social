-- =====================================================
-- CRITICAL SECURITY FIX: Privilege Escalation Prevention
-- =====================================================

-- Step 1: Create user_roles table with proper security
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 2: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- Step 3: Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Step 4: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT id, role, id
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 5: Create RLS policies on user_roles (only admins can modify roles)
CREATE POLICY "Anyone can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 6: Update profiles RLS policy to prevent role updates
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

CREATE POLICY "Users can update own profile except role"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 7: Keep profiles.role column for backward compatibility but prevent updates
-- Create trigger to sync role from user_roles to profiles (read-only)
CREATE OR REPLACE FUNCTION public.sync_profile_role_from_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET role = NEW.role
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_role_to_profiles
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role_from_user_roles();

-- =====================================================
-- FIX: Anonymous Assessment Email Harvesting
-- =====================================================

-- Step 8: Drop anonymous assessment policies
DROP POLICY IF EXISTS "Allow anonymous assessment creation" ON public.osrl_assessments;
DROP POLICY IF EXISTS "Users can view assessments" ON public.osrl_assessments;

-- Step 9: Create secure policies requiring authentication
CREATE POLICY "Authenticated users can create own assessments"
ON public.osrl_assessments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own assessments"
ON public.osrl_assessments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
ON public.osrl_assessments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
ON public.osrl_assessments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 10: Make user_id NOT NULL for osrl_assessments (prevent anonymous data)
ALTER TABLE public.osrl_assessments 
ALTER COLUMN user_id SET NOT NULL;

-- Step 11: Update existing has_role and is_admin_or_gestor functions to use user_roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_gestor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'gestor')
  );
$$;

-- Step 12: Update handle_new_user to create user_role entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email,
    'visualizador'
  );
  
  -- Insert into user_roles (source of truth)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'visualizador');
  
  RETURN NEW;
END;
$$;