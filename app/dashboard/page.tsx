import Link from "next/link";

import {
    createClient
} from "@/lib/supabase/server";

import IncidentQueue
    from "@/components/IncidentQueue";

import OfficerList
    from "@/components/OfficerList";

import SignOutButton
    from "@/components/SignOutButton";


export default async function DashboardPage() {

    const supabase =
        await createClient();


    const {
        data: {
            user
        }
    } =
        await supabase.auth.getUser();


    if (!user) {
        return null;
    }


    const {
        data: profile
    } =
        await supabase

            .from("profiles")

            .select(
                "full_name, role"
            )

            .eq(
                "id",
                user.id
            )

            .single();


    if (
        !profile ||
        profile.role !== "dispatcher"
    ) {

        return (

            <main className="container">

                <div className="card">

                    <h1>
                        Access denied
                    </h1>

                    <p>
                        This application is only
                        available to dispatchers.
                    </p>

                    <SignOutButton />

                </div>

            </main>

        );

    }


    const {
        data: incidents
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


    const {
        data: officers
    } =
        await supabase

            .from("officer_status")

            .select(`
                officer_id,
                is_on_duty,
                availability,
                last_seen_at,
                profile:profiles!officer_status_officer_id_fkey(
                    full_name
                )
            `);


    return (

        <>

            <header className="topbar">

                <div className="brand">
                    Dispatch Console
                </div>


                <div className="nav">

                    <span>
                        {
                            profile.full_name
                        }
                    </span>

                    <SignOutButton />

                </div>

            </header>


            <main className="container">

                <div className="dashboard-header">

                    <div>

                        <h1>
                            Dispatcher Dashboard
                        </h1>

                        <p>
                            Monitor live incidents
                            and available officers.
                        </p>

                    </div>


                    <Link
                        href="/incidents/new"
                        className="btn btn-primary"
                    >

                        + Log Incident

                    </Link>

                </div>


                <div className="grid">

                        <IncidentQueue
                            initial={(incidents ?? []) as any}
                        />

                        <OfficerList
                            initial={(officers ?? []) as any}
                        />

                </div>

            </main>

        </>

    );

}