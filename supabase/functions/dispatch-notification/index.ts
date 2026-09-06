import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Required when called from your Next.js browser app
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { incidentId } = await req.json();

    if (!incidentId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "incidentId is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get incident
    const { data: incident, error: incidentError } = await supabase
      .from("incidents")
      .select("*")
      .eq("id", incidentId)
      .single();

    if (incidentError) {
      throw incidentError;
    }

    if (incident.status !== "dispatched") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Incident is not dispatched",
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Officer must have a recent heartbeat
    const cutoff = new Date(
      Date.now() - 2 * 60 * 1000,
    ).toISOString();

    // Find eligible officers
    const { data: officers, error: officersError } = await supabase
      .from("officer_status")
      .select(
        "officer_id,is_on_duty,availability,last_seen_at",
      )
      .eq("is_on_duty", true)
      .eq("availability", "available")
      .gte("last_seen_at", cutoff);

    if (officersError) {
      throw officersError;
    }

    const officerIds = officers?.map((officer) => officer.officer_id) ?? [];

    if (officerIds.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          message: "No eligible officers found",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Find active push tokens
    const { data: devices, error: devicesError } = await supabase
      .from("officer_devices")
      .select("officer_id,push_token")
      .in("officer_id", officerIds)
      .eq("is_active", true);

    if (devicesError) {
      throw devicesError;
    }

    const messages = devices?.map((device) => ({
      to: device.push_token,
      sound: "default",
      title: "New Incident Dispatched",
      body: `${
        incident.priority?.toUpperCase() ?? ""
      } - ${incident.incident_type}`,
      data: {
        incidentId: incident.id,
      },
    })) ?? [];

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          message: "No active push devices found",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Send notifications through Expo
    const expoResponse = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      },
    );

    const expoResult = await expoResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        sent: messages.length,
        expoResult,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
