import React, {useEffect, useState} from "react";
import Table from "../components/Table";

export default function LandingPage() {
    return (
    
        <section id="LandingPage" className="flex items-center flex-col pt-32 min-h-screen w-full">
                <div className="text-left font-bold w-full mb-10">
                    <p className="text-3xl">LIST OF APPOINTMENTS IN LUZON</p>
                </div>
                <Table/>
        </section>

    );
}
