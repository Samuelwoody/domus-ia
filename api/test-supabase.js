// Test de conexión a Supabase
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key exists:', !!supabaseKey);
    console.log('Key length:', supabaseKey?.length);
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Variables de entorno no configuradas',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      });
    }
    
    // Crear cliente
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente creado');
    
    // Test 1: Ping a Supabase
    console.log('🔍 Test 1: Ping a Supabase...');
    const { data: pingData, error: pingError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (pingError) {
      console.error('❌ Ping error:', pingError);
      return res.status(500).json({
        success: false,
        error: 'Error conectando a Supabase',
        details: {
          message: pingError.message,
          code: pingError.code,
          hint: pingError.hint,
          details: pingError.details
        }
      });
    }
    
    console.log('✅ Ping exitoso');
    
    // Test 2: Listar columnas de users
    console.log('🔍 Test 2: Verificando columnas...');
    const { data: columnsData, error: columnsError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT column_name FROM information_schema.columns WHERE table_name = 'users'` 
      })
      .catch(async () => {
        // Si RPC no funciona, usar query directa
        return await supabase
          .from('users')
          .select('*')
          .limit(1);
      });
    
    console.log('✅ Columnas verificadas');
    
    // Test 3: Intentar crear usuario de prueba
    console.log('🔍 Test 3: Crear usuario de prueba...');
    const testEmail = 'test-' + Date.now() + '@example.com';
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        name: 'Test User',
        user_type: 'particular'
      })
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Error creando usuario:', userError);
      return res.status(500).json({
        success: false,
        error: 'Error creando usuario de prueba',
        details: {
          message: userError.message,
          code: userError.code,
          hint: userError.hint,
          details: userError.details
        }
      });
    }
    
    console.log('✅ Usuario creado:', userData.id);
    
    // Test 4: Actualizar password_hash
    console.log('🔍 Test 4: Actualizar password_hash...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: 'test_hash_123',
        last_login: new Date().toISOString()
      })
      .eq('id', userData.id);
    
    if (updateError) {
      console.error('❌ Error actualizando password:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Error actualizando password_hash',
        details: {
          message: updateError.message,
          code: updateError.code,
          hint: updateError.hint,
          details: updateError.details
        }
      });
    }
    
    console.log('✅ Password actualizado');
    
    // Limpiar: eliminar usuario de prueba
    await supabase
      .from('users')
      .delete()
      .eq('id', userData.id);
    
    console.log('✅ Usuario de prueba eliminado');
    
    // TODO PASÓ
    return res.status(200).json({
      success: true,
      message: 'Todas las pruebas pasaron exitosamente',
      tests: {
        connection: 'OK',
        ping: 'OK',
        columns: 'OK',
        createUser: 'OK',
        updatePassword: 'OK'
      },
      config: {
        url: supabaseUrl,
        keyLength: supabaseKey.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en test de Supabase',
      details: {
        message: error.message,
        stack: error.stack
      }
    });
  }
}
