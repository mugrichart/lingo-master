'use client'
import { useState } from "react";
import Image from "next/image";
import "./page.css"

import { LoginForm } from "@/components/login-form"

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


export default function Home() {
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
