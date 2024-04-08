import Table from "../components/Table";
import Link from 'next/link'

export default function LandingPage() {
    return (
        <section id="LandingPage" className="flex flex-col pt-16 min-h-screen w-full">
                    <div className="bg-emerald-400 p-2 rounded-md font-bold w-52 mb-10">
                    <Link href="/test" className="text-2xl">Go to test page</Link>
                    </div>
                <div className="text-left font-bold w-full mb-10">

                    <p className="text-3xl">LIST OF APPOINTMENTS IN LUZON, VISAYAS, AND MINDANAO</p>
                </div>
                <Table/>
        </section>
    );
}
