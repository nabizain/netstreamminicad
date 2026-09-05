"use client";

import {
    useEffect,
    useState
} from "react";

import {
    createClient
} from "@/lib/supabase/client";


interface Officer {

    officer_id: string;

    is_on_duty: boolean;

    availability: string;

    last_seen_at: string | null;

    profile?: {
        full_name: string;
    } | null;

}


interface Props {

    initial: Officer[];

}


export default function OfficerList({
    initial
}: Props) {

    const [
        officers,
        setOfficers
    ] =
        useState<Officer[]>(
            initial
        );


    useEffect(() => {

        const supabase =
            createClient();


        async function reload() {

            const {
                data
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


            if (data) {

                setOfficers(
                    data as unknown as Officer[]
                );

            }

        }


        const channel =
            supabase

                .channel(
                    "officer-status"
                )

                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "officer_status"
                    },
                    () => {

                        reload();

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

            <h2>
                Officers
            </h2>


            <table className="table">

                <thead>

                    <tr>

                        <th>
                            Officer
                        </th>

                        <th>
                            Duty
                        </th>

                        <th>
                            Availability
                        </th>

                        <th>
                            Connection
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {officers.map(
                        officer => {

                            const online =
                                officer.last_seen_at
                                ?
                                (
                                    Date.now()
                                    -
                                    new Date(
                                        officer.last_seen_at
                                    ).getTime()
                                )
                                <
                                120000
                                :
                                false;


                            return (

                                <tr
                                    key={
                                        officer.officer_id
                                    }
                                >

                                    <td>

                                        {
                                            officer
                                                .profile
                                                ?.full_name
                                            ??
                                            "Officer"
                                        }

                                    </td>


                                    <td>

                                        <span
                                            className={
                                                officer.is_on_duty
                                                    ?
                                                    "badge status-available"
                                                    :
                                                    "badge status-off"
                                            }
                                        >

                                            {
                                                officer.is_on_duty
                                                    ?
                                                    "On duty"
                                                    :
                                                    "Off duty"
                                            }

                                        </span>

                                    </td>


                                    <td>

                                        {
                                            officer
                                                .is_on_duty
                                                ?
                                                officer.availability
                                                :
                                                "—"
                                        }

                                    </td>


                                    <td>

                                        {
                                            online
                                                ?
                                                "Online"
                                                :
                                                "Not logged in"
                                        }

                                    </td>

                                </tr>

                            );

                        }
                    )}

                </tbody>

            </table>


            <p className="muted">

                The dispatcher can view officer
                status but cannot change an
                officer's on-duty state.

            </p>

        </div>

    );
}