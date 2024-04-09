import Table from "../components/Table";
import Link from 'next/link'
import AddButton from '../components/AddButton'

export default function LandingPage() {

    return (
        <section id="LandingPage" className="flex flex-col pt-16 min-h-screen w-full">


                <div className="w-full flex justify-between mb-4">
                    <Link href="/DevPage" className="text-2xl">
                            <div className="bg-emerald-400 p-2 rounded-md font-bold w-52 mb-10 hover:bg-emerald-500 text-center cursor-pointer">
                        Go to test page
                            </div>
                    </Link>
                    </div>

                <div className="w-full flex justify-between font-bold">
                    <p className="text-3xl">LIST OF APPOINTMENTS IN LUZON, VISAYAS, AND MINDANAO</p>
                    <AddButton/>
                </div>
                <Table/>

        </section>
    );
}
