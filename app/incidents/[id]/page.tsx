import Link from "next/link";

import {
    createClient
} from "@/lib/supabase/server";

import DispatchButton
    from "@/components/DispatchButton";


interface Props {

    params: Promise<{
        id: string;
    }>;

}


export default async function IncidentDetailPage({
    params
}: Props) {

    const {
        id
    } =
        await params;


    const supabase =
        await createClient();


    const {
        data: incident
    } =
        await supabase

            .from("incidents")

            .select(`
                *,
                claimant:profiles!incidents_claimed_by_fkey(
                    full_name
                )
            `)

            .eq(
                "id",
                id
            )

            .single();


    if (!incident) {

        return (

            <main className="container">

                <div className="card">

                    <h1>
                        Incident not found
                    </h1>

                    <Link href="/dashboard">
                        Back to dashboard
                    </Link>

                </div>

            </main>

        );

    }


    const {
        data: report
    } =
        await supabase

            .from("incident_reports")

            .select(`
                *,
                officer:profiles!incident_reports_officer_id_fkey(
                    full_name
                )
            `)

            .eq(
                "incident_id",
                id
            )

            .maybeSingle();


    return (

        <main className="container">

            <p>

                <Link href="/dashboard">
                    ← Dashboard
                </Link>

            </p>


            <div className="card">

                <h1>
                    Incident Details
                </h1>


                <div className="grid grid-2">

                    <div>

                        <strong>
                            Caller
                        </strong>

                        <p>
                            {
                                incident.caller_name
                            }
                        </p>

                    </div>


                    <div>

                        <strong>
                            Phone
                        </strong>

                        <p>
                            {
                                incident.caller_phone
                            }
                        </p>

                    </div>


                    <div>

                        <strong>
                            Location
                        </strong>

                        <p>
                            {
                                incident.location
                            }
                        </p>

                    </div>


                    <div>

                        <strong>
                            Incident type
                        </strong>

                        <p>
                            {
                                incident.incident_type
                            }
                        </p>

                    </div>


                    <div>

                        <strong>
                            Priority
                        </strong>

                        <p>
                            {
                                incident.priority
                            }
                        </p>

                    </div>


                    <div>

                        <strong>
                            Status
                        </strong>

                        <p>

                            <span
                                className={
                                    `badge status-${incident.status}`
                                }
                            >
                                {
                                    incident.status
                                }
                            </span>

                        </p>

                    </div>


                    <div>

                        <strong>
                            Claimed by
                        </strong>

                        <p>
                            {
                                incident
                                    .claimant
                                    ?.full_name
                                ??
                                "Not claimed"
                            }
                        </p>

                    </div>


                    <div
                        style={{
                            gridColumn:
                                "1 / -1"
                        }}
                    >

                        <strong>
                            Description
                        </strong>

                        <p>
                            {
                                incident.description
                            }
                        </p>

                    </div>

                </div>


                <DispatchButton
                incidentId={incident.id}
                />

            </div>


            <div
                className="card"
                style={{
                    marginTop: 20
                }}
            >

                <h2>
                    Officer Report
                </h2>


                {!report && (

                    <p>
                        No report submitted yet.
                    </p>

                )}


                {report && (

                    <>

                        <p>

                            <strong>
                                Officer:
                            </strong>{" "}

                            {
                                report
                                    .officer
                                    ?.full_name
                            }

                        </p>


                        <p>

                            <strong>
                                Submitted:
                            </strong>{" "}

                            {
                                new Date(
                                    report.submitted_at
                                ).toLocaleString()
                            }

                        </p>


                        <div
                            style={{
                                whiteSpace:
                                    "pre-wrap"
                            }}
                        >

                            {
                                report.report_text
                            }

                        </div>

                    </>

                )}

            </div>

        </main>

    );
}