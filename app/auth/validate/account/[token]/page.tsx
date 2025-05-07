"use client";

import ApiLinks from "@/ev-const/api-links";
import { responseKeys } from "@/ev-const/response-keys";
import PageTemplate from "@/components/templates/PageTemplate";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import OLF from "@/ev-lib/ElectroVisionFetch";

type VerificationToken = string | string[] | undefined;

type VerifiAccountPageProps = {
  params: {
    token: string;
  };
};

const VerifiAccountPage = ({ params }: VerifiAccountPageProps) => {
  const [apiVerificationToken, setApiVerificationToken] = useState<
    string | null
  >(null);

  useEffect(() => {
    setApiVerificationToken(params.token);
  }, [params.token]);

  const validateAccount = async () => {
    return await OLF.put(ApiLinks.validateAccount + `/${apiVerificationToken}`);
  };

  useEffect(() => {
    const validate = async () => {
      try {
        const response = await validateAccount();
        console.log(response);
        toast.success("Account validated!", { duration: 3000 });
      } catch (error) {
        console.error("Registration error:", error);
        toast.error(
          error instanceof Error ? error.message : "Account validation failed",
          { duration: 5000 },
        );
      }
    };

    if (apiVerificationToken) validate();
  }, [apiVerificationToken]);

  return (
    <PageTemplate allowUnauthenticated={true}>
      <article>Validate your Electro Vision account</article>
      <article>Token {apiVerificationToken}</article>
    </PageTemplate>
  );
};

export default VerifiAccountPage;
