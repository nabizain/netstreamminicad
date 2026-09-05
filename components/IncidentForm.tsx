"use client";

import {
    FormEvent,
    useState
} from "react";

import {
    createClient
} from "@/lib/supabase/client";

import {
    useRouter
} from "next/navigation";


export default function IncidentForm() {

    const router =
        useRouter();

    const supabase =
        createClient();


    const [form, setForm] =
        useState({

            caller_name: "",
            caller_phone: "",
            location: "",
            incident_type: "",
            priority: "medium",
            description: ""

        });


    const [error, setError] =
        useState("");

    const [saving, setSaving] =
        useState(false);


    function updateField(
        field: string,
        value: string
    ) {

        setForm(
            previous => ({
                ...previous,
                [field]: value
            })
        );

    }


    async function submit(
        event: FormEvent
    ) {

        event.preventDefault();

        setSaving(true);
        setError("");


        const {
            data: {
                user
            }
        } =
            await supabase.auth.getUser();


        if (!user) {

            setError(
                "Your session has expired."
            );

            setSaving(false);

            return;
        }


        const {
            data,
            error
        } =
            await supabase

                .from("incidents")

                .insert({

                    ...form,

                    created_by:
                        user.id,

                    status:
                        "new"

                })

                .select("id")

                .single();


        if (error) {

            setError(
                error.message
            );

            setSaving(false);

            return;
        }


        router.push(
            `/incidents/${data.id}`
        );

        router.refresh();

    }


    return (

        <form
            onSubmit={submit}
        >

            <div className="grid grid-2">

                <div className="form-group">

                    <label>
                        Caller name
                    </label>

                    <input
                        required
                        value={
                            form.caller_name
                        }
                        onChange={
                            e =>
                                updateField(
                                    "caller_name",
                                    e.target.value
                                )
                        }
                    />

                </div>


                <div className="form-group">

                    <label>
                        Caller phone
                    </label>

                    <input
                        required
                        value={
                            form.caller_phone
                        }
                        onChange={
                            e =>
                                updateField(
                                    "caller_phone",
                                    e.target.value
                                )
                        }
                    />

                </div>


                <div className="form-group">

                    <label>
                        Location / address
                    </label>

                    <input
                        required
                        value={
                            form.location
                        }
                        onChange={
                            e =>
                                updateField(
                                    "location",
                                    e.target.value
                                )
                        }
                    />

                </div>


                <div className="form-group">

                    <label>
                        Incident type
                    </label>

                    <input
                        required
                        placeholder="Burglary"
                        value={
                            form.incident_type
                        }
                        onChange={
                            e =>
                                updateField(
                                    "incident_type",
                                    e.target.value
                                )
                        }
                    />

                </div>


                <div className="form-group">

                    <label>
                        Priority
                    </label>

                    <select
                        value={
                            form.priority
                        }
                        onChange={
                            e =>
                                updateField(
                                    "priority",
                                    e.target.value
                                )
                        }
                    >

                        <option value="low">
                            Low
                        </option>

                        <option value="medium">
                            Medium
                        </option>

                        <option value="high">
                            High
                        </option>

                        <option value="critical">
                            Critical
                        </option>

                    </select>

                </div>

            </div>


            <div className="form-group">

                <label>
                    Short description
                </label>

                <textarea
                    required
                    value={
                        form.description
                    }
                    onChange={
                        e =>
                            updateField(
                                "description",
                                e.target.value
                            )
                    }
                />

            </div>


            {error && (

                <p className="error">
                    {error}
                </p>

            )}


            <button
                className="btn btn-primary"
                disabled={saving}
            >

                {
                    saving
                        ? "Saving..."
                        : "Log incident"
                }

            </button>

        </form>

    );
}