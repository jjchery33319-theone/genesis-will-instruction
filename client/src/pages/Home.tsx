import { useEffect } from "react";
import { useLocation } from "wouter";

// The root path redirects directly to the Will Instruction Form
export default function Home() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/");
  }, [navigate]);
  return null;
}
