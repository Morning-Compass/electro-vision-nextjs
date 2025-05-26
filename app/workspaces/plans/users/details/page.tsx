// pages/workspaces/users/[id].tsx

"use client";

import ContentBlock from "@/components/ContentBlock";

import { FooterSmall } from "@/components/templates/FooterSmall";

import NavbarTemplate from "@/components/templates/NavbarTemplate";

import PageTemplate from "@/components/templates/PageTemplate";

import SidebarTemplate from "@/components/templates/SidebarTemplate";

import useUserContext from "@/ev-contexts/userContextProvider";

import { useRouter } from "next/router";

import { useEffect, useState } from "react";

import Image from "next/image";

import Link from "next/link";

import { WorkspaceUser } from "@/ev-types/user-types";

import OLF from "@/ev-lib/ElectroVisionFetch";

import ApiLinks from "@/ev-const/api-links";

import toast from "react-hot-toast";

import ReactCountryFlag from "react-country-flag";

import countries from "world-countries";

// Define the type for the full user details response

interface FullUserResponse {
  id: number;

  username: string;

  created_at: string; // Changed to string for easier display, or use Date object if parsing

  account_valid: boolean;

  phone: string;

  phone_dial_code: string;

  country_of_origin: string;

  title: string | null;

  education: string | null;

  birth_date: string; // Changed to string for easier display, or use Date object if parsing

  account_bank_number: string | null;

  photo: string | null;

  citizenships: string[];
}

function getCountryData(code: string) {
  return countries.find(
    (c) => c.cca2 === code || c.cca3 === code || c.name.common === code,
  );
}

export default function WorkerDetailsPage() {
  const { User, UserDispatch } = useUserContext();

  const [loadingFullUser, setLoadingFullUser] = useState(true);

  const [errorFullUser, setErrorFullUser] = useState<string | null>(null);

  const [fullUserDetails, setFullUserDetails] =
    useState<FullUserResponse | null>(null);

  const worker = User.workspaceData?.users?.find(
    (u) => u.id === User.workspaceData?.currentUserId,
  );

  useEffect(() => {
    const fetchFullUserDetails = async () => {
      if (worker) {
        setLoadingFullUser(true);

        setErrorFullUser(null);

        try {
          const response = await OLF.post(ApiLinks.listUserProfile, {
            email: worker.email,

            id: worker.id,
          });

          console.log("response of user details");

          console.log(response);

          setFullUserDetails(response as FullUserResponse);
        } catch (err) {
          console.error("Error fetching full user details:", err);

          setErrorFullUser("User has not fully registered yet.");

          // toast.error(
          //   "An unexpected error occurred while fetching full user details.",
          // );
        } finally {
          setLoadingFullUser(false);
        }
      }
    };

    fetchFullUserDetails();
  }, [worker]); // Re-fetch if worker or User.email changes

  return (
    worker && (
      <PageTemplate>
        <NavbarTemplate />

        <section className="flex flex-row items-center justify-start h-full gap-8 w-[90vw]">
          <SidebarTemplate activeIcon="task" />

          <ContentBlock>
            <div className="flex flex-col items-center justify-center gap-8 h-full w-full p-4">
              {/* Title and Back Button Row */}

              <div className="w-full flex items-center justify-between">
                <Link
                  href="/workspaces/plans"
                  className="text-ev-accent-text hover:text-ev-accent-text/80 text-lg font-medium flex items-center transition-colors duration-200"
                >
                  ← Back
                </Link>

                <h1 className="text-4xl font-bold text-ev-text dark:text-ev-text uppercase tracking-wide text-center flex-grow max-md:text-2xl">
                  User In Workspace
                </h1>

                <div className="w-16"></div>
              </div>

              <div className="flex flex-row gap-8 w-full h-[70%] max-md:flex-col max-md:items-center">
                {/* Worker Photo and Basic Info */}

                <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl shadow-md items-center justify-center max-md:w-auto">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden">
                    <Image
                      src={fullUserDetails?.photo || "/default-user.png"} // Use fullUserDetails photo if available
                      alt={worker.username}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <h2 className="text-3xl font-semibold text-ev-text dark:text-ev-text mt-4">
                    {worker.username}
                  </h2>
                </div>

                <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl shadow-md max-md:h-auto md:overflow-y-scroll max-md:w-auto max-md:mb-8">
                  <h2 className="text-2xl font-semibold text-ev-text dark:text-ev-text border-b-2 border-ev-gray pb-2">
                    Additional Details
                  </h2>

                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Username: {worker.username}
                  </p>

                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Email: {worker.email}
                  </p>

                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Position: {worker.position || "N/A"}
                  </p>

                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Role: {worker.workspace_role ?? "Not Assigned"}
                  </p>

                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Id: {worker.id}
                  </p>

                  {/* Displaying full user details */}

                  {loadingFullUser ? (
                    <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                      Loading additional user details...
                    </p>
                  ) : errorFullUser ? (
                    <p className="text-ev-text text-lg">{errorFullUser}</p>
                  ) : fullUserDetails ? (
                    <>
                      <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                        Phone: +{fullUserDetails.phone_dial_code}{" "}
                        {fullUserDetails.phone}
                      </p>

                      <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg flex items-center gap-2">
                        Country of Origin:{" "}
                        {(() => {
                          const country = getCountryData(
                            fullUserDetails.country_of_origin,
                          );

                          return country ? (
                            <span className="flex items-center gap-2">
                              <ReactCountryFlag
                                countryCode={country.cca2}
                                svg
                                style={{
                                  width: "1.5em",

                                  height: "1.5em",
                                }}
                                title={country.name.common}
                              />

                              {country.name.common}
                            </span>
                          ) : (
                            fullUserDetails.country_of_origin
                          );
                        })()}
                      </p>

                      <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg flex items-start gap-2">
                        Citizenships:
                        <span className="flex flex-row gap-4">
                          {fullUserDetails.citizenships.length > 0 ? (
                            fullUserDetails.citizenships.map((citizen, idx) => {
                              const country = getCountryData(citizen);

                              return (
                                <span
                                  key={idx}
                                  className="flex items-center gap-2 flex-row"
                                >
                                  {country ? (
                                    <>
                                      <ReactCountryFlag
                                        countryCode={country.cca2}
                                        svg
                                        style={{
                                          width: "1.5em",

                                          height: "1.5em",
                                        }}
                                        title={country.name.common}
                                      />

                                      {country.name.common}
                                    </>
                                  ) : (
                                    citizen
                                  )}
                                </span>
                              );
                            })
                          ) : (
                            <span>N/A</span>
                          )}
                        </span>
                      </p>

                      <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                        Title: {fullUserDetails.title || "N/A"}
                      </p>

                      <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                        Education: {fullUserDetails.education || "N/A"}
                      </p>

                      <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                        Birth Date:{" "}
                        {new Date(
                          fullUserDetails.birth_date,
                        ).toLocaleDateString()}
                      </p>

                      <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                        Account Bank Number:{" "}
                        {fullUserDetails.account_bank_number || "N/A"}
                      </p>

                      <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                        Account Valid:{" "}
                        {fullUserDetails.account_valid ? "Yes" : "No"}
                      </p>

                      <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                        Account Created:{" "}
                        {new Date(
                          fullUserDetails.created_at,
                        ).toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                      No additional user details available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ContentBlock>
        </section>

        <FooterSmall />
      </PageTemplate>
    )
  );
}
