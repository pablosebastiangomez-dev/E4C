// supabase/functions/create-e4c-accounts-and-emit/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import * as StellarSdk from "https://esm.sh/@stellar/stellar-sdk@11.3.0";

// Configure Stellar Network
// For production: StellarSdk.Network.usePublicNetwork();
StellarSdk.Network.useTestNetwork();
const horizonServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

console.log(`Function "create-e4c-accounts-and-emit" started`);

serve(async (req) => {
  const { url, headers } = req;
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: headers.get("Authorization")! } } }
  );

  try {
    const { adminId } = await req.json();

    if (!adminId) {
      return new Response(JSON.stringify({ error: "Admin ID is required." }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // PASO 1: Crear cuenta emisora (issuer)
    const issuerKeypair = StellarSdk.Keypair.random();
    const issuerPublicKey = issuerKeypair.publicKey();
    const issuerSecretKey = issuerKeypair.secret();

    // PASO 2: Fondear cuenta emisora usando Friendbot (solo testnet)
    await fetch(`https://friendbot.stellar.org?addr=${issuerPublicKey}`);

    // PASO 3: Crear cuenta distribuidora (distributor)
    const distributorKeypair = StellarSdk.Keypair.random();
    const distributorPublicKey = distributorKeypair.publicKey();
    const distributorSecretKey = distributorKeypair.secret();

    // PASO 4: Crear la cuenta distribuidora desde la cuenta emisora
    const issuerAccount = await horizonServer.loadAccount(issuerPublicKey);

    const createAccountTx = new StellarSdk.TransactionBuilder(issuerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(StellarSdk.Operation.createAccount({
        destination: distributorPublicKey,
        startingBalance: '10' // XLM para fondear la cuenta
      }))
      .setTimeout(180)
      .build();

    createAccountTx.sign(issuerKeypair);
    await horizonServer.submitTransaction(createAccountTx);

    // PASO 5: Definir el activo E4C
    const E4C = new StellarSdk.Asset('E4C', issuerPublicKey);

    // PASO 6: Crear trustline desde la cuenta distribuidora hacia el activo E4C
    const distributorAccount = await horizonServer.loadAccount(distributorPublicKey);

    const trustTx = new StellarSdk.TransactionBuilder(distributorAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: E4C,
        limit: '1000000' // Límite opcional de tokens que puede recibir
      }))
      .setTimeout(180)
      .build();

    trustTx.sign(distributorKeypair);
    await horizonServer.submitTransaction(trustTx);

    // PASO 7: Emitir tokens E4C (enviar desde emisor a distribuidor)
    const issuerAccountReload = await horizonServer.loadAccount(issuerPublicKey);

    const paymentTx = new StellarSdk.TransactionBuilder(issuerAccountReload, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: distributorPublicKey,
        asset: E4C,
        amount: '100000' // Cantidad de tokens E4C a emitir
      }))
      .setTimeout(180)
      .build();

    paymentTx.sign(issuerKeypair);
    await horizonServer.submitTransaction(paymentTx);

    // --- Securely store secret keys (RECOMMENDED) ---
    // For MVP, returning to frontend for display, but strongly advise storing
    // these in Supabase Secrets/Vault or another secure backend service.
    // Example of updating Admin's stellar_public_key in DB
    const { error: updateError } = await supabaseClient
      .from('admins')
      .update({ stellar_public_key: issuerPublicKey }) // Admin's public key is the Issuer
      .eq('id', adminId);

    if (updateError) {
      console.error("Error updating admin's stellar_public_key:", updateError);
      // Decide how to handle this error - it might not be critical enough to fail the entire Stellar setup
    }

    return new Response(
      JSON.stringify({
        issuerPublicKey,
        issuerSecretKey, // WARNING: Store securely!
        distributorPublicKey,
        distributorSecretKey, // WARNING: Store securely!
        message: "Stellar accounts created and E4C tokens emitted successfully."
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in create-e4c-accounts-and-emit:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});