import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as StellarSdk from 'https://esm.sh/stellar-sdk@12.3.0';

const horizonServer = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function fundWithFriendbot(publicKey: string) {
  try {
    await horizonServer.friendbot(publicKey).call();
    console.log("SUCCESS! Stellar Testnet account funded.");
  } catch (e) {
    console.error("ERROR! Failed to fund Stellar Testnet account:", e);
    throw new Error("Failed to fund Stellar Testnet account.");
  }
}

serve(async (req) => {
  // Handle OPTIONS preflight request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let studentId: string;
    let newStudent: any;

    try {
      const payload = await req.json();
      if (payload.record && payload.record.id) {
        // Webhook payload structure
        studentId = payload.record.id;
        newStudent = payload.record;
      } else if (payload.student_id) {
        // Direct call structure (e.g., from another Edge Function)
        studentId = payload.student_id;
        const { data, error } = await supabaseClient
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single();

        if (error || !data) {
          console.error("Error fetching student for direct call:", error);
          return new Response(JSON.stringify({ error: "Student not found or failed to fetch." }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        newStudent = data;
      } else {
        return new Response(JSON.stringify({ error: "Invalid payload: missing 'record.id' or 'student_id'." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (e) {
      console.error("Error parsing request payload:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON payload." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!newStudent || !newStudent.id || !newStudent.name || !newStudent.email) {
      return new Response(JSON.stringify({ error: "Invalid student data received." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deconstruct student data from newStudent (which could be from webhook or direct fetch)
    const { name, email, curso, division, escuela } = newStudent;


    // 1. Create a new Stellar keypair
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret(); // Esta se entrega al alumno y se OLVIDA

    // 2. Fund the new account
    await fundWithFriendbot(masterPublicKey);



    // 4. Update the existing student row with the stellar_public_key
    const { error: updateError } = await supabaseClient
      .from('students')
      .update({ stellar_public_key: publicKey })
      .eq('id', studentId);

    if (updateError) {
      console.error("Supabase student update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update student with Stellar public key." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Store the Stellar public key and signers info securely in 'stellar_wallets' table
    const { error: walletError } = await supabaseClient
      .from('stellar_wallets')
      .insert([{
        student_id: studentId,
        public_key: publicKey,
        // Eliminamos signers_info y claves de recuperación
      }]);

    if (walletError) {
      console.error("Supabase wallet insertion error:", walletError);
      // NOTE: Student is already created, so we don't roll back.
      return new Response(JSON.stringify({ error: "Failed to securely store Stellar wallet secret." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return the updated student data (or a success message)
    return new Response(JSON.stringify({
      message: "Billetera creada. GUARDA TU CLAVE PRIVADA.",
      stellar_public_key: publicKey,
      stellar_secret_key: secretKey, // IMPORTANTE: El frontend debe mostrar esto al usuario
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Edge Function internal error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
