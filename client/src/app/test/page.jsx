"use client"
import React from 'react'
import DevOptions from "../components/DevOptions";

export default function testPage() {
  return (
    <section id="testPage" className="flex items-center flex-col pt-10 px-10 min-h-screen w-full">
    <div className="text-left font-bold w-full mb-10">
        <p className="text-3xl">TESTING PAGE</p>
    </div>
    <DevOptions/>
    <DevOptions/>
    <DevOptions/>
    </section>
  )
}
