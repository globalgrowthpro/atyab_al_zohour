import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call stored procedure to update vase-life statuses
    const { error: rpcErr } = await supabase.rpc("update_vase_life_statuses");
    if (rpcErr) {
      throw new Error(`Error executing vase-life procedure: ${rpcErr.message}`);
    }

    // Retrieve summary of batches by status
    const { data: batches, error: queryErr } = await supabase
      .from("perishable_batches")
      .select("id, product_name, expiry_date, on_hand_qty, reserved_qty, status");

    if (queryErr) throw queryErr;

    const summary = {
      fresh: batches?.filter((b) => b.status === "fresh").length ?? 0,
      clearing: batches?.filter((b) => b.status === "clearing").length ?? 0,
      expired: batches?.filter((b) => b.status === "expired").length ?? 0,
      totalBatches: batches?.length ?? 0,
    };

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        batches,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
