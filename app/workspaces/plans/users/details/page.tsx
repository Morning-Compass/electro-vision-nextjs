"use client";

import ContentBlock from "@/components/ContentBlock";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import useUserContext from "@/ev-contexts/userContextProvider";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import ReactCountryFlag from "react-country-flag";
import countries from "world-countries";

interface FullUserResponse {
  id: number;
  username: string;
  created_at: string;
  account_valid: boolean;
  phone: string;
  phone_dial_code: string;
  country_of_origin: string;
  title: string | null;
  education: string | null;
  birth_date: string;
  account_bank_number: string | null;
  photo: string | null;
  citizenships: string[];
}

function getCountryData(code: string) {
  return countries.find(
    (c) => c.cca2 === code || c.cca3 === code || c.name.common === code,
  );
}

const cardCls = "bg-[#1e293b] border border-[#334155] rounded-2xl p-6";

export default function WorkerDetailsPage() {
  const { User } = useUserContext();

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
          setFullUserDetails(response as FullUserResponse);
        } catch (err) {
          console.error("Error fetching full user details:", err);
          setErrorFullUser("User has not fully registered yet.");
        } finally {
          setLoadingFullUser(false);
        }
      }
    };
    fetchFullUserDetails();
  }, [worker]);

  if (!worker) return null;

  const initials = worker.username
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <PageTemplate>
      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />
          <ContentBlock blockClassName="p-4 md:p-6">
            {/* Back link */}
            <div className="mb-5">
              <Link
                href="/workspaces/plans"
                className="text-ev-yellow text-sm hover:underline"
              >
                ← Back to Workspace
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Avatar card */}
              <div className={`${cardCls} flex flex-col items-center gap-4`}>
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-ev-yellow/20 flex items-center justify-center">
                  {fullUserDetails?.photo ? (
                    <Image
                      src={fullUserDetails.photo}
                      alt={worker.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-ev-yellow text-2xl font-bold">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-slate-100 font-semibold text-lg">
                    {worker.username}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {worker.position || "No position"}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {worker.workspace_role ?? "No role"}
                  </p>
                </div>
              </div>

              {/* Basic info */}
              <div className={cardCls}>
                <h3 className="text-slate-100 font-semibold text-sm mb-4">
                  Workspace Info
                </h3>
                <dl className="flex flex-col gap-3">
                  {[
                    ["Username", worker.username],
                    ["Email", worker.email],
                    ["Position", worker.position || "N/A"],
                    ["Role", worker.workspace_role ?? "Not Assigned"],
                    ["Worker ID", String(worker.id)],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <dt className="text-slate-500 text-xs">{label}</dt>
                      <dd className="text-slate-300 text-sm font-medium mt-0.5">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Extended details */}
              <div className={cardCls}>
                <h3 className="text-slate-100 font-semibold text-sm mb-4">
                  Personal Details
                </h3>

                {loadingFullUser ? (
                  <p className="text-slate-400 text-sm">
                    Loading additional details...
                  </p>
                ) : errorFullUser ? (
                  <p className="text-slate-400 text-sm">{errorFullUser}</p>
                ) : fullUserDetails ? (
                  <dl className="flex flex-col gap-3">
                    <div>
                      <dt className="text-slate-500 text-xs">Phone</dt>
                      <dd className="text-slate-300 text-sm font-medium mt-0.5">
                        +{fullUserDetails.phone_dial_code}{" "}
                        {fullUserDetails.phone}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-slate-500 text-xs">
                        Country of Origin
                      </dt>
                      <dd className="text-slate-300 text-sm font-medium mt-0.5 flex items-center gap-2">
                        {(() => {
                          const country = getCountryData(
                            fullUserDetails.country_of_origin,
                          );
                          return country ? (
                            <>
                              <ReactCountryFlag
                                countryCode={country.cca2}
                                svg
                                style={{ width: "1.2em", height: "1.2em" }}
                                title={country.name.common}
                              />
                              {country.name.common}
                            </>
                          ) : (
                            fullUserDetails.country_of_origin
                          );
                        })()}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-slate-500 text-xs">Citizenships</dt>
                      <dd className="text-slate-300 text-sm font-medium mt-0.5 flex flex-wrap gap-3">
                        {fullUserDetails.citizenships.length > 0 ? (
                          fullUserDetails.citizenships.map((citizen, idx) => {
                            const country = getCountryData(citizen);
                            return (
                              <span
                                key={idx}
                                className="flex items-center gap-1"
                              >
                                {country ? (
                                  <>
                                    <ReactCountryFlag
                                      countryCode={country.cca2}
                                      svg
                                      style={{
                                        width: "1.2em",
                                        height: "1.2em",
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
                      </dd>
                    </div>

                    {[
                      ["Title", fullUserDetails.title || "N/A"],
                      ["Education", fullUserDetails.education || "N/A"],
                      [
                        "Birth Date",
                        new Date(
                          fullUserDetails.birth_date,
                        ).toLocaleDateString(),
                      ],
                      [
                        "Bank Account",
                        fullUserDetails.account_bank_number || "N/A",
                      ],
                      [
                        "Account Valid",
                        fullUserDetails.account_valid ? "Yes" : "No",
                      ],
                      [
                        "Account Created",
                        new Date(
                          fullUserDetails.created_at,
                        ).toLocaleDateString(),
                      ],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <dt className="text-slate-500 text-xs">{label}</dt>
                        <dd className="text-slate-300 text-sm font-medium mt-0.5">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-slate-400 text-sm">
                    No additional details available.
                  </p>
                )}
              </div>
            </div>
          </ContentBlock>
        </div>
      </div>
    </PageTemplate>
  );
}
