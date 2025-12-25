'use server'

import { cookies } from "next/headers"
import "./page.css"

import { LoginForm } from "@/components/login-form"
import { redirect } from "next/navigation"

const Star = () => (
  <span className={`energy`}>⭐</span>
)

const Logo = () => {
  return (
    <div className='Logo'>
      Fla<Star />h
    </div>
  )
}


export default async function Home() {
  const sessionToken = (await cookies()).get("sessionToken")?.value
  if (sessionToken) redirect("/topics")

  return (
    <div className='Home'>
          <div className='intro side'>
            <Logo />
            <p>Get your flashcards ready in no time</p>
          </div>
    
          <div className='auth'>
            <LoginForm />
          </div>
          
    </div>
  );
}
