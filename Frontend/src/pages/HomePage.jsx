import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'
import React from 'react'
import toast from 'react-hot-toast'

function HomePage() {
  return (
    <div>
        <button className='btn btn-secondary' onClick={()=> toast.success("You win!!")}>Click me</button>
        <SignedOut>
            <SignInButton>
                <button>Login</button>
            </SignInButton>
        </SignedOut>

        <SignedIn>
            <SignOutButton/>
        </SignedIn>

        <UserButton/>
    </div>
  )
}

export default HomePage