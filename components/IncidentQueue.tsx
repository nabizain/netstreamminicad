"use client";

import {
    useEffect,
    useState
} from "react";

import {
    createClient
} from "@/lib/supabase/client";

import Link from "next/link";


interface Incident {

    id: string;

    caller_name: string;

    location: string;

    incident_type: string;

    priority: string;

    status: string;

    claimed_by: string | null;

    created_at: string;

    claimant?: {
        full_name: string;
    } | null;

}


interface Props {

    initial: Incident[];

}


export default function IncidentQueue({
    initial
}: Props) {

    const [
        incidents,
        setIncidents
    ] =
        useState<Incident[]>(
            initial
        );


    useEffect(() => {

        const supabase =
            createClient();


        async function reloadIncidents() {

            const {
                data
            } =
                await supabase

                    .from("incidents")

                    .select(`
                        id,
                        caller_name,
                        location,
                        incident_type,
                        priority,
                        status,
                        claimed_by,
                        created_at,
                        claimant:profiles!incidents_claimed_by_fkey(
                            full_name
                        )
                    `)

                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (data) {

                setIncidents(
                    data as unknown as Incident[]
                );

            }

        }


        const channel =
            supabase

                .channel(
                    "dispatcher-incidents"
                )

                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "incidents"
                    },
                    () => {

                        reloadIncidents();

                    }
                )

                .subscribe();


        return () => {

            supabase.removeChannel(
                channel
            );

        };

    }, []);


    return (

        <div className="card">

            <div className="queue-header">

                <h2>
                    Live Incident Queue
                </h2>

                <span>
                    ● Realtime
                </span>

            </div>


            <table className="table">

                <thead>

                    <tr>

                        <th>
                            Caller
                        </th>

                        <th>
                            Type
                        </th>

                        <th>
                            Priority
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Officer
                        </th>

                        <th>
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {incidents.map(
                        incident => (

                            <tr
                                key={
                                    incident.id
                                }
                            >

                                <td>

                                    <strong>
                                        {
                                            incident.caller_name
                                        }
                                    </strong>

                                    <br />

                                    <small>
                                        {
                                            incident.location
                                        }
                                    </small>

                                </td>


                                <td>
                                    {
                                        incident.incident_type
                                    }
                                </td>


                                <td>
                                    {
                                        incident.priority
                                    }
                                </td>


                                <td>

                                    <span
                                        className={
                                            `badge status-${incident.status}`
                                        }
                                    >
                                        {
                                            incident.status
                                        }
                                    </span>

                                </td>


                                <td>

                                    {
                                        incident
                                            .claimant
                                            ?.full_name
                                        ??
                                        "—"
                                    }

                                </td>


                                <td>

                                    <Link
                                        href={
                                            `/incidents/${incident.id}`
                                        }
                                        className="btn btn-secondary"
                                    >
                                        View
                                    </Link>

                                </td>

                            </tr>

                        )
                    )}

                </tbody>

            </table>

        </div>

    );
}