import Link from "next/link";
import IncidentForm from "@/components/IncidentForm";

export default function NewIncidentPage() {

    return (

        <main className="container">

            <p>
                <Link href="/dashboard">
                    ← Dashboard
                </Link>
            </p>


            <div className="card">

                <h1>
                    Log New Incident
                </h1>

                <p>
                    Capture the caller and incident
                    details.
                </p>

                <IncidentForm />

            </div>

        </main>

    );
}