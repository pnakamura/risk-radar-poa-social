-- Adicionar foreign key constraint para usuario_id na tabela riscos_variaveis_historico
ALTER TABLE public.riscos_variaveis_historico 
ADD CONSTRAINT riscos_variaveis_historico_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES public.profiles(id);