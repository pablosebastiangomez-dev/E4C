import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const HORIZON_URL = "https://horizon-testnet.stellar.org";

/**
 * EDGE FUNCTION: send-e4c-tokens
 * 
 * OBJETIVO: Transferir tokens E4C desde la institución al alumno tras una validación exitosa.
 * 
 * FLUJO:
 * 1. Recibe el ID del alumno y la cantidad de tokens ganados.
 * 2. Recupera la clave pública del alumno (destino).
 * 3. Recupera la clave secreta del Distribuidor institucional (origen).
 * 4. Ejecuta un pago (Payment Operation) en Stellar.
 * 5. Si tiene éxito, actualiza el estado de la tarea a 'validator_approved'.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const StellarBase = await import("https://esm.sh/stellar-base@12.1.0?bundle&target=browser");
    const { Keypair, Asset, TransactionBuilder, Networks, Account, Operation } = StellarBase;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const { studentId, amount, studentTaskId } = await req.json();
    if (!studentId || !amount || !studentTaskId) throw new Error("Datos de transferencia incompletos");

    console.log(`Procesando pago de ${amount} E4C para Alumno ${studentId}`);

    // --- PASO 1: LOCALIZAR DESTINO ---
    const { data: student } = await supabaseClient
      .from('students')
      .select('stellar_public_key')
      .eq('id', studentId)
      .single();

    if (!student?.stellar_public_key) throw new Error("El alumno no tiene una billetera Stellar activa");

    // --- PASO 2: LOCALIZAR ORIGEN Y AUTORIZACIÓN ---
    // Buscamos la wallet del Distribuidor para firmar la transferencia.
    const { data: distWallet } = await supabaseClient
      .from('stellar_wallets')
      .select('secret_key, public_key')
      .eq('role', 'distributor')
      .limit(1)
      .single();

    if (!distWallet) throw new Error("Infraestructura institucional no configurada (falta Distributor)");

    const distributorKeys = Keypair.fromSecret(distWallet.secret_key);

    // --- PASO 3: IDENTIFICAR EL TOKEN ---
    // Obtenemos la llave del Emisor para reconstruir el objeto Asset.
    const { data: issuerWallet } = await supabaseClient
      .from('stellar_wallets')
      .select('public_key')
      .eq('role', 'issuer')
      .limit(1)
      .single();

    const E4C_ASSET = new Asset('E4C', issuerWallet.public_key);

    // --- PASO 4: EJECUCIÓN EN BLOCKCHAIN ---
    // Cargamos la secuencia actual de la cuenta del distribuidor.
    const distRes = await fetch(`${HORIZON_URL}/accounts/${distributorKeys.publicKey()}`);
    const distData = await distRes.json();
    const distAccount = new Account(distributorKeys.publicKey(), distData.sequence);

    // Construimos la transacción de pago.
    const tx = new TransactionBuilder(distAccount, { 
      fee: '1000', 
      networkPassphrase: Networks.TESTNET 
    })
      .addOperation(Operation.payment({
        destination: student.stellar_public_key,
        asset: E4C_ASSET,
        amount: amount.toString()
      }))
      .setTimeout(30)
      .build();

    // Firmamos criptográficamente con la llave privada del Distribuidor.
    tx.sign(distributorKeys);
    
    // Enviamos a la red Stellar.
    const submitRes = await fetch(`${HORIZON_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ tx: tx.toXDR() }).toString()
    });

    const result = await submitRes.json();
    
    // Control de errores específico de Stellar.
    if (!submitRes.ok) {
      const errorDetail = result.extras?.result_codes?.operations?.[0] || result.detail || JSON.stringify(result);
      throw new Error(`Fallo en Red Stellar: ${errorDetail}`);
    }

    // --- PASO 5: ACTUALIZACIÓN DE ESTADO ACADÉMICO Y BALANCE ---
    // Solo si el pago en blockchain tuvo éxito, marcamos la tarea como validada
    // y actualizamos el balance de tokens en la tabla de estudiantes.
    const { error: updateError } = await supabaseClient
      .from('student_tasks')
      .update({ status: 'validator_approved' })
      .eq('id', studentTaskId);

    if (updateError) console.error("Error al actualizar estado post-transferencia:", updateError);

    // Actualizar el conteo de tokens en la tabla 'students' para que el Ranking se vea reflejado
    const { error: balanceError } = await supabaseClient.rpc('increment_student_tokens', { 
      row_id: studentId, 
      amount_to_add: parseInt(amount.toString()) 
    });

    if (balanceError) {
      console.error("Error al incrementar tokens en DB:", balanceError);
      // Fallback si el RPC no existe: actualización manual (menos segura ante concurrencia pero efectiva)
      const { data: currentStudent } = await supabaseClient.from('students').select('tokens').eq('id', studentId).single();
      await supabaseClient.from('students').update({ tokens: (currentStudent?.tokens || 0) + parseInt(amount.toString()) }).eq('id', studentId);
    }

    return new Response(
      JSON.stringify({ success: true, hash: result.hash, message: "Tokens transferidos y tarea finalizada" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("ERROR EN TRANSFERENCIA E4C:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
})
