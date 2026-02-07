"use client";
import { useRouter } from "next/navigation";
import PageTemplate from "./PageTemplate";
import { useEffect } from "react";

const UnauthorizedTemplate = () => {
  console.log("login redirect");
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      router.push("/auth/login");
    }, 5000);
  }, []);
  return (
    <PageTemplate allowUnauthenticated={true}>
      You are not authorized, redirect to login/register
    </PageTemplate>
  );
};

export default UnauthorizedTemplate;
