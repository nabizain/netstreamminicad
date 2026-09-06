"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function DispatchButton({
  incidentId,
}: {
  incidentId: string;
}) {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  async function handleDispatch() {
    try {
      setLoading(true);

      console.log("Dispatching incident:", incidentId);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("Current session:", session);

      if (sessionError) {
        console.error("Session error:", sessionError);
      }

      if (!session) {
        alert("You are not logged in.");
        return;
      }

      const {
        data: dispatchData,
        error: dispatchError,
      } = await supabase.rpc("dispatch_incident", {
        p_incident_id: incidentId,
      });

      console.log("dispatch_incident result:", {
        dispatchData,
        dispatchError,
      });

      if (dispatchError) {
        alert(`Dispatch failed: ${dispatchError.message}`);
        return;
      }

      const {
        data: pushData,
        error: pushError,
      } = await supabase.functions.invoke(
        "dispatch-notification",
        {
          body: {
            incidentId,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      console.log("Push function data:", pushData);
      console.log("Push function error:", pushError);

      if (pushError) {
        console.error("FULL PUSH ERROR:", pushError);

        alert(`Push function failed: ${pushError.message}`);
        return;
      }

      if (!pushData) {
        alert("The Edge Function returned no response.");
        return;
      }

      console.log(
        "Full push response:",
        JSON.stringify(pushData, null, 2)
      );

      if (pushData.success === false) {
        alert(
          `Push failed: ${
            pushData.error ?? "Unknown error"
          }`
        );
        return;
      }

      if (pushData.sent === 0) {
        alert(
          pushData.message ??
            "No eligible officers were found."
        );
        return;
      }

      const expoResults =
        pushData?.expoResult?.data ?? [];

      const failedPush = expoResults.find(
        (item: any) => item.status === "error"
      );

      if (failedPush) {
        alert(
          `Expo push failed: ${
            failedPush.message ??
            failedPush.details?.error ??
            "Unknown push error"
          }`
        );
        return;
      }

      alert(
        `Incident dispatched. Notifications sent: ${pushData.sent}`
      );
    } catch (error) {
      console.error("Dispatch exception:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unexpected dispatch error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDispatch}
      disabled={loading}
    >
      {loading
        ? "Dispatching..."
        : "Dispatch to On-Duty Pool"}
    </button>
  );
}