"use client";

import ApiLinks from "@/ev-const/api-links";
import { responseKeys } from "@/ev-const/response-keys";
import PageTemplate from "@/components/templates/PageTemplate";
import OLF, { OneLastError } from "@/ev-lib/ElectroVisionFetch";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiResponse from "@/ev-const/api-response.json";

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
        const e = error as OneLastError;
        console.log(e.error);
        const errorMessage = JSON.parse(e.error);
        console.log(errorMessage.message);
        console.log(
          apiResponse.auth.validate.account_validation_token_invalid.message,
        );
        if (
          errorMessage.message ===
          apiResponse.auth.validate.account_validation_token_invalid.message
        ) {
          console.log("Token is invalid!");
          toast.error("Token is invalid!");
          return;
        }
        toast.error("Token is invalid", { duration: 3000 });
      }
    };

    if (apiVerificationToken) validate();
  }, [apiVerificationToken]);

  return (
    <PageTemplate>
      <article>Validate your Electro Vision account</article>
      <article>Token {apiVerificationToken}</article>
    </PageTemplate>
  );
};

export default VerifiAccountPage;
