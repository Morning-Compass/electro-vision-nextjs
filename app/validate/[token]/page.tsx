"use client";

import ApiLinks from "@/mc-const/api-links";
import { responseKeys } from "@/mc-const/response-keys";
import PageTemplate from "@/components/templates/PageTemplate";
import OLF from "@/mc-lib/OneLastFetch";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
    const validate = () => {
      try {
        const response = validateAccount();
        console.log(response);
        toast.success("Account validated!");
      } catch (error) {
        const e = error as responseKeys;
        if (e.message === responseErrors.invalidToken) {
          console.log("Token is invalid!");
          toast.error("Token is invalid!");
        }
      }
    };

    if (apiVerificationToken) validate();
  }, [apiVerificationToken]);

  return (
    <PageTemplate>
      <article>Validate your YouAi account</article>
      <article>Token {apiVerificationToken}</article>
    </PageTemplate>
  );
};

export default VerifiAccountPage;
