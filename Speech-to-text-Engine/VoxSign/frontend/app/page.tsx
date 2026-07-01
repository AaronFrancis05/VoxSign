"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="h-full flex items-center justify-center bg-[#EAECEF]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1546A0]"></div>
    </div>
  );
}
