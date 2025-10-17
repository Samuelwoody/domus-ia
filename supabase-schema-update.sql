 1	-- =====================================================
     2	-- DOMUS-IA: Actualización de Schema de Base de Datos
     3	-- Fase 1: Sistema de Autenticación Completo
     4	-- =====================================================
     5	-- 
     6	-- INSTRUCCIONES:
     7	-- 1. Ve a tu proyecto en Supabase (https://supabase.com)
     8	-- 2. Abre el "SQL Editor"
     9	-- 3. Copia y pega este script completo
    10	-- 4. Haz clic en "Run" para ejecutar
    11	-- 
    12	-- Este script es IDEMPOTENTE (se puede ejecutar múltiples veces sin problemas)
    13	-- =====================================================
    14	
    15	-- =====================================================
    16	-- PASO 1: Añadir columnas para autenticación
    17	-- =====================================================
    18	
    19	-- Añadir columna para hash de contraseña
    20	ALTER TABLE users 
    21	ADD COLUMN IF NOT EXISTS password_hash TEXT;
    22	
    23	-- Añadir columna para CIF/NIF (profesionales)
    24	ALTER TABLE users 
    25	ADD COLUMN IF NOT EXISTS cif_nif TEXT;
    26	
    27	-- Añadir columna para estado de verificación
    28	ALTER TABLE users 
    29	ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
    30	
    31	-- Añadir columna para verificación de email
    32	ALTER TABLE users 
    33	ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
    34	
    35	-- Añadir columna para fecha de último login
    36	ALTER TABLE users 
    37	ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
    38	
    39	-- Añadir columna para token de reset de password (futuro)
    40	ALTER TABLE users 
    41	ADD COLUMN IF NOT EXISTS reset_token TEXT;
    42	
    43	-- Añadir columna para expiración de token de reset
    44	ALTER TABLE users 
    45	ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;
    46	
    47	COMMENT ON COLUMN users.password_hash IS 'Hash SHA256 de la contraseña del usuario';
    48	COMMENT ON COLUMN users.cif_nif IS 'CIF/NIF del profesional (obligatorio si user_type=profesional)';
    49	COMMENT ON COLUMN users.verified IS 'Si el profesional ha sido verificado por admin';
    50	COMMENT ON COLUMN users.email_verified IS 'Si el email ha sido verificado';
    51	COMMENT ON COLUMN users.last_login IS 'Fecha y hora del último login';
    52	
    53	-- =====================================================
    54	-- PASO 2: Crear índices para búsquedas rápidas
    55	-- =====================================================
    56	
    57	-- Índice en email (para login)
    58	CREATE INDEX IF NOT EXISTS idx_users_email 
    59	ON users(email);
    60	
    61	-- Índice en CIF/NIF (para verificación de profesionales)
    62	CREATE INDEX IF NOT EXISTS idx_users_cif_nif 
    63	ON users(cif_nif);
    64	
    65	-- Índice en user_type (para filtrar profesionales vs particulares)
    66	CREATE INDEX IF NOT EXISTS idx_users_user_type 
    67	ON users(user_type);
    68	
    69	-- Índice compuesto para email + password_hash (optimizar login)
    70	CREATE INDEX IF NOT EXISTS idx_users_email_password 
    71	ON users(email, password_hash);
    72	
    73	-- =====================================================
    74	-- PASO 3: Añadir constraints de validación
    75	-- =====================================================
    76	
    77	-- Constraint: Si es profesional, CIF/NIF es obligatorio
    78	ALTER TABLE users 
    79	DROP CONSTRAINT IF EXISTS check_profesional_needs_cif;
    80	
    81	ALTER TABLE users 
    82	ADD CONSTRAINT check_profesional_needs_cif 
    83	CHECK (
    84	    (user_type = 'profesional' AND cif_nif IS NOT NULL) OR
    85	    (user_type != 'profesional')
    86	);
    87	
    88	-- Constraint: CIF/NIF debe tener formato válido español
    89	ALTER TABLE users 
    90	DROP CONSTRAINT IF EXISTS check_cif_nif_format;
    91	
    92	ALTER TABLE users 
    93	ADD CONSTRAINT check_cif_nif_format 
    94	CHECK (
    95	    cif_nif IS NULL OR 
    96	    cif_nif ~* '^[A-Z]?[0-9]{8}[A-Z]?$'
    97	);
    98	
    99	COMMENT ON CONSTRAINT check_cif_nif_format ON users IS 
   100	'Valida formato español: CIF (B12345678) o NIF (12345678A)';
   101	
   102	-- =====================================================
   103	-- PASO 4: Crear tabla de sesiones (opcional - futuro)
   104	-- =====================================================
   105	
   106	CREATE TABLE IF NOT EXISTS user_sessions (
   107	    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   108	    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   109	    token TEXT NOT NULL UNIQUE,
   110	    ip_address TEXT,
   111	    user_agent TEXT,
   112	    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
   113	    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   114	    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   115	);
   116	
   117	CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
   118	CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);
   119	CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
   120	
   121	COMMENT ON TABLE user_sessions IS 
   122	'Tabla para gestionar sesiones de usuarios con tokens JWT';
   123	
   124	-- =====================================================
   125	-- PASO 5: Crear tabla de logs de autenticación
   126	-- =====================================================
   127	
   128	CREATE TABLE IF NOT EXISTS auth_logs (
   129	    id SERIAL PRIMARY KEY,
   130	    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   131	    email TEXT NOT NULL,
   132	    action TEXT NOT NULL, -- 'register', 'login', 'logout', 'failed_login'
   133	    ip_address TEXT,
   134	    user_agent TEXT,
   135	    success BOOLEAN DEFAULT TRUE,
   136	    error_message TEXT,
   137	    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   138	);
   139	
   140	CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
   141	CREATE INDEX IF NOT EXISTS idx_auth_logs_email ON auth_logs(email);
   142	CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON auth_logs(action);
   143	CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at DESC);
   144	
   145	COMMENT ON TABLE auth_logs IS 
   146	'Registro de eventos de autenticación para auditoría y seguridad';
   147	
   148	-- =====================================================
   149	-- PASO 6: Crear función para limpiar sesiones expiradas
   150	-- =====================================================
   151	
   152	CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
   153	RETURNS INTEGER AS $$
   154	DECLARE
   155	    deleted_count INTEGER;
   156	BEGIN
   157	    DELETE FROM user_sessions 
   158	    WHERE expires_at < NOW();
   159	    
   160	    GET DIAGNOSTICS deleted_count = ROW_COUNT;
   161	    RETURN deleted_count;
   162	END;
   163	$$ LANGUAGE plpgsql;
   164	
   165	COMMENT ON FUNCTION cleanup_expired_sessions IS 
   166	'Limpia sesiones expiradas. Ejecutar diariamente con cron';
   167	
   168	-- =====================================================
   169	-- PASO 7: Crear función para registrar eventos de auth
   170	-- =====================================================
   171	
   172	CREATE OR REPLACE FUNCTION log_auth_event(
   173	    p_user_id UUID,
   174	    p_email TEXT,
   175	    p_action TEXT,
   176	    p_ip_address TEXT DEFAULT NULL,
   177	    p_user_agent TEXT DEFAULT NULL,
   178	    p_success BOOLEAN DEFAULT TRUE,
   179	    p_error_message TEXT DEFAULT NULL
   180	)
   181	RETURNS VOID AS $$
   182	BEGIN
   183	    INSERT INTO auth_logs (
   184	        user_id,
   185	        email,
   186	        action,
   187	        ip_address,
   188	        user_agent,
   189	        success,
   190	        error_message
   191	    ) VALUES (
   192	        p_user_id,
   193	        p_email,
   194	        p_action,
   195	        p_ip_address,
   196	        p_user_agent,
   197	        p_success,
   198	        p_error_message
   199	    );
   200	END;
   201	$$ LANGUAGE plpgsql;
   202	
   203	COMMENT ON FUNCTION log_auth_event IS 
   204	'Registra eventos de autenticación (login, register, etc)';
   205	
   206	-- =====================================================
   207	-- PASO 8: Crear vistas útiles para reportes
   208	-- =====================================================
   209	
   210	-- Vista: Usuarios profesionales pendientes de verificación
   211	CREATE OR REPLACE VIEW professional_pending_verification AS
   212	SELECT 
   213	    id,
   214	    email,
   215	    name,
   216	    cif_nif,
   217	    created_at,
   218	    last_active
   219	FROM users
   220	WHERE user_type = 'profesional'
   221	  AND verified = FALSE
   222	ORDER BY created_at DESC;
   223	
   224	COMMENT ON VIEW professional_pending_verification IS 
   225	'Profesionales que han registrado su CIF/NIF pero aún no están verificados';
   226	
   227	-- Vista: Estadísticas de autenticación por día
   228	CREATE OR REPLACE VIEW auth_stats_daily AS
   229	SELECT 
   230	    DATE(created_at) as date,
   231	    action,
   232	    COUNT(*) as total,
   233	    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
   234	    SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed
   235	FROM auth_logs
   236	GROUP BY DATE(created_at), action
   237	ORDER BY date DESC, action;
   238	
   239	COMMENT ON VIEW auth_stats_daily IS 
   240	'Estadísticas diarias de eventos de autenticación';
   241	
   242	-- =====================================================
   243	-- PASO 9: Política de seguridad RLS (Row Level Security)
   244	-- =====================================================
   245	
   246	-- Habilitar RLS en tabla users (si no está habilitado)
   247	ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   248	
   249	-- Política: Los usuarios solo pueden ver/modificar sus propios datos
   250	DROP POLICY IF EXISTS users_own_data ON users;
   251	
   252	CREATE POLICY users_own_data ON users
   253	    FOR ALL
   254	    USING (auth.uid() = id);
   255	
   256	-- Política: Los usuarios autenticados pueden ver su propio perfil
   257	DROP POLICY IF EXISTS users_select_own ON users;
   258	
   259	CREATE POLICY users_select_own ON users
   260	    FOR SELECT
   261	    USING (auth.uid() = id);
   262	
   263	-- Política: Permitir inserción durante registro (sin auth)
   264	DROP POLICY IF EXISTS users_insert_register ON users;
   265	
   266	CREATE POLICY users_insert_register ON users
   267	    FOR INSERT
   268	    WITH CHECK (true);
   269	
   270	COMMENT ON TABLE users IS 
   271	'Usuarios del sistema con RLS habilitado para seguridad';
   272	
   273	-- =====================================================
   274	-- PASO 10: Datos de prueba (OPCIONAL - solo desarrollo)
   275	-- =====================================================
   276	
   277	-- Descomentar para crear usuarios de prueba:
   278	/*
   279	-- Usuario particular de prueba
   280	INSERT INTO users (email, name, user_type, password_hash, email_verified)
   281	VALUES (
   282	    'particular@test.com',
   283	    'Usuario Particular',
   284	    'particular',
   285	    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- hash de 'test123'
   286	    TRUE
   287	) ON CONFLICT (email) DO NOTHING;
   288	
   289	-- Usuario profesional de prueba
   290	INSERT INTO users (email, name, user_type, cif_nif, password_hash, email_verified, verified)
   291	VALUES (
   292	    'profesional@test.com',
   293	    'Agente Profesional',
   294	    'profesional',
   295	    'B12345678',
   296	    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- hash de 'test123'
   297	    TRUE,
   298	    TRUE
   299	) ON CONFLICT (email) DO NOTHING;
   300	*/
   301	
   302	-- =====================================================
   303	-- PASO 11: Verificación final
   304	-- =====================================================
   305	
   306	-- Mostrar estructura de tabla actualizada
   307	SELECT 
   308	    column_name,
   309	    data_type,
   310	    is_nullable,
   311	    column_default
   312	FROM information_schema.columns
   313	WHERE table_name = 'users'
   314	ORDER BY ordinal_position;
   315	
   316	-- Mostrar índices creados
   317	SELECT 
   318	    indexname,
   319	    indexdef
   320	FROM pg_indexes
   321	WHERE tablename = 'users';
   322	
   323	-- Mostrar constraints
   324	SELECT 
   325	    conname AS constraint_name,
   326	    contype AS constraint_type,
   327	    pg_get_constraintdef(oid) AS constraint_definition
   328	FROM pg_constraint
   329	WHERE conrelid = 'users'::regclass;
   330	
   331	-- =====================================================
   332	-- FIN DEL SCRIPT
   333	-- =====================================================
   334	
   335	-- Mensaje de confirmación
   336	DO $$
   337	BEGIN
   338	    RAISE NOTICE '✅ Schema actualizado correctamente!';
   339	    RAISE NOTICE 'Columnas añadidas: password_hash, cif_nif, verified, email_verified';
   340	    RAISE NOTICE 'Índices creados: idx_users_email, idx_users_cif_nif';
   341	    RAISE NOTICE 'Tablas auxiliares: user_sessions, auth_logs';
   342	    RAISE NOTICE 'Funciones útiles: cleanup_expired_sessions(), log_auth_event()';
   343	    RAISE NOTICE 'Vistas de reportes: professional_pending_verification, auth_stats_daily';
   344	END $$;
   345	
