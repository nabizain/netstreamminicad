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


export default function LoginPage() {

    const router = useRouter();

    const supabase =
        createClient();


    const [email, setEmail] =
        useState("dispatcher@example.com");

    const [password, setPassword] =
        useState("Dispatcher123!");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    async function handleLogin(
        event: FormEvent
    ) {

        event.preventDefault();

        setLoading(true);
        setError("");


        const {
            error
        } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });


        if (error) {

            setError(
                error.message
            );

            setLoading(false);

            return;
        }


        router.push(
            "/dashboard"
        );

        router.refresh();

    }


    return (

        <main
            style={{
                maxWidth: 450,
                margin: "100px auto",
                padding: 20
            }}
        >

            <div className="card">

                <h1>
                    Dispatcher Login
                </h1>

                <p>
                    Sign in to the dispatch console.
                </p>


                <form
                    onSubmit={handleLogin}
                >

                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={
                                e =>
                                    setEmail(
                                        e.target.value
                                    )
                            }
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={
                                e =>
                                    setPassword(
                                        e.target.value
                                    )
                            }
                            required
                        />

                    </div>


                    {error && (

                        <p className="error">
                            {error}
                        </p>

                    )}


                    <button
                        className="btn btn-primary"
                        disabled={loading}
                    >

                        {
                            loading
                                ? "Signing in..."
                                : "Sign in"
                        }

                    </button>

                </form>

            </div>

        </main>

    );
}