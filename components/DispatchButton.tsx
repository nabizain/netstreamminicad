"use client";

import {
    useState
} from "react";

import {
    createClient
} from "@/lib/supabase/client";

import {
    useRouter
} from "next/navigation";


interface Props {

    incidentId: string;

    status: string;

}


export default function DispatchButton({
    incidentId,
    status
}: Props) {

    const router =
        useRouter();

    const [busy, setBusy] =
        useState(false);

    const [error, setError] =
        useState("");


    async function dispatchIncident() {

        setBusy(true);
        setError("");


        const supabase =
            createClient();


        const {
            error
        } =
            await supabase.rpc(
                "dispatch_incident",
                {
                    p_incident_id:
                        incidentId
                }
            );


        if (error) {

            setError(
                error.message
            );

        } else {

            router.refresh();

        }


        setBusy(false);

    }


    if (status !== "new") {
        return null;
    }


    return (

        <div>

            <button
                className="btn btn-primary"
                onClick={
                    dispatchIncident
                }
                disabled={busy}
            >

                {
                    busy
                        ? "Dispatching..."
                        : "Dispatch to on-duty pool"
                }

            </button>


            {error && (

                <p className="error">
                    {error}
                </p>

            )}

        </div>

    );
}