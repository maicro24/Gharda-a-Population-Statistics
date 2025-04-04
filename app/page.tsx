import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 to-teal-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center pt-10 pb-16">
          <div className="relative w-full max-w-4xl h-[250px] rounded-xl overflow-hidden shadow-2xl mb-8">
            <Image src="/images/ghardaia.jpg" alt="Ghardaïa City View" fill style={{ objectFit: "cover" }} priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
                النظام الإحصائي لسكان غرداية
              </h1>
            </div>
          </div>

          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

