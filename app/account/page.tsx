"use client";

import Button from "@/components/Button";
import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import Regex from "@/ev-const/regex";
import useUserContext from "@/ev-contexts/userContextProvider";
import Image from "next/image";
import { ReactNode, useEffect, useReducer, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import AuthConst from "@/ev-const/authconst";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import FormErrorParahraph from "@/components/templates/FormErrorParagraph";
import OLF from "@/ev-lib/ElectroVisionFetch";
import toast from "react-hot-toast";
import ContentBlock from "@/components/ContentBlock";
import {
  DatePickerNoTime,
  DateTimePicker,
} from "@/components/datepicker/Datepicker";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import ApiLinks from "@/ev-const/api-links";

import iso2toiso3 from "@/ev-const/iso2toiso3.json";

type UserRegistrationForm = {
  phone_number: string;
  phone_dial_code: string;
  country_of_origin: string;
  title: string;
  education: string | null;
  birth_date: Date | null;
  account_bank_number: string;
  email: string;
  photo: string | null;
  citizenships_countries_iso3: string[];
};

const titles = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
  { value: "Dr", label: "Dr" },
];

const educationLevels = [
  { value: null, label: "None" },
  { value: "High School", label: "High School" },
  { value: "Bachelor", label: "Bachelor's Degree" },
  { value: "Master", label: "Master's Degree" },
  { value: "PhD", label: "PhD" },
];

// Create reverse mapping ISO3 -> ISO2
const iso3toiso2 = Object.entries(iso2toiso3).reduce(
  (acc, [iso2, iso3]) => {
    acc[iso3] = iso2;
    return acc;
  },
  {} as Record<string, string>,
);

const AccountPage = () => {
  const { User, UserDispatch } = useUserContext();
  const [countries] = useState(
    Country.getAllCountries().map((country) => ({
      value: country.isoCode, // ISO2 code here
      label: country.name,
    })),
  );
  const [selectedCitizenships, setSelectedCitizenships] = useState<
    { value: string; label: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    reset,
  } = useForm<UserRegistrationForm>({
    defaultValues: {
      phone_number: "",
      phone_dial_code: "48",
      country_of_origin: "Poland",
      title: "Mr",
      education: null,
      birth_date: null,
      account_bank_number: "",
      email: User.authUser?.email || "",
      photo: User.fullUser?.profile_picture || null,
      citizenships_countries_iso3: [],
    },
  });

  useEffect(() => {
    // Load user data if available
    if (User.fullUser) {
      reset({
        phone_number: User.fullUser.phone || "",
        phone_dial_code: User.fullUser.phone_dial_code || "48",
        country_of_origin: User.fullUser.county_of_origin || "Poland",
        title: User.fullUser.title || "Mr",
        education: User.fullUser.education || null,
        birth_date: User.fullUser.birth_date || null,
        account_bank_number: User.fullUser.account_bank_number || "",
        email: User.authUser?.email || "",
        photo: User.fullUser.profile_picture || null,
        citizenships_countries_iso3:
          User.fullUser.citizenships_countries_iso3 || [],
      });

      // Map ISO3 -> ISO2 for UI select value
      setSelectedCitizenships(
        (User.fullUser.citizenships_countries_iso3 || []).map((iso3) => {
          const iso2 = iso3toiso2[iso3];
          return {
            value: iso2 || iso3,
            label: Country.getCountryByCode(iso2 || "")?.name || iso3,
          };
        }),
      );
    }
  }, [User, reset]);

  const onSubmit: SubmitHandler<UserRegistrationForm> = async (data) => {
    try {
      // Convert selected ISO2 codes to ISO3 for payload
      const payload = {
        ...data,
        citizenships_countries_iso3: selectedCitizenships.map(
          (c) => iso2toiso3[c.value] || c.value,
        ),
      };

      console.log("pay load");
      console.log(payload);

      const endpoint = User.fullUser
        ? ApiLinks.updateUserProfile
        : ApiLinks.registerUserProfile;

      const method = User.fullUser ? "put" : "post";

      const res = await OLF[method](endpoint, payload);

      toast.success(
        User.fullUser
          ? "Profile updated successfully"
          : "Profile created successfully",
      );

      // Update user context
      UserDispatch({
        type: "setFullUser",
        value: {
          phone: payload.phone_number ?? null,
          phone_dial_code: payload.phone_dial_code ?? null,
          title: payload.title ?? null,
          education: payload.education ?? null,
          birth_date: payload.birth_date ?? null,
          account_bank_number: payload.account_bank_number ?? null,
          profile_picture: payload.photo ?? null,
          county_of_origin: payload.country_of_origin ?? null,
          citizenships_countries_iso3:
            payload.citizenships_countries_iso3 ?? [],
        },
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile",
      );
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setValue("photo", base64);
        UserDispatch({
          type: "setProfilePicture",
          value: base64,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setValue("photo", null);
    UserDispatch({
      type: "setProfilePicture",
      value: null,
    });
  };

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="text-ev-text bg-mc-primary w-[45vw] min-w-72 opacity-95 rounded-[3rem] mt-auto mb-auto transition-colors duration-500">
        <ContentBlock>
          <article className="flex flex-col items-center justify-center mt-12 mb-12 gap-12">
            <header className="text-3xl font-bold mt-8 mb-2 mr-6 ml-6 text-center">
              {User.fullUser ? "Update Profile" : "Complete Registration"}
            </header>

            {/* Profile Picture */}
            <figure className="flex flex-col items-center gap-4">
              <Image
                src={User.fullUser?.profile_picture || "/default-user.png"}
                alt="Profile"
                width={150}
                height={150}
                className="rounded-full aspect-square object-cover"
              />
              <div className="flex gap-4">
                <label className="cursor-pointer bg-ev-blue text-white px-4 py-2 rounded-lg hover:scale-105 transition">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                </label>
                {User.fullUser?.profile_picture && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="bg-ev-red text-white px-4 py-2 rounded-lg hover:scale-105 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </figure>

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-md space-y-6"
            >
              {/* Email (readonly if already registered) */}
              <FormErrorWrap>
                <label className="block text-sm font-medium">Email</label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: Regex.emailRegistration,
                      message: "Invalid email format",
                    },
                  })}
                  type="email"
                  disabled={!!User.fullUser}
                  className="w-full px-3 py-2 bg-ev-primary-bg rounded-lg"
                />
                <FormErrorParahraph errorObject={errors.email} />
              </FormErrorWrap>

              {/* Phone Number */}
              <div className="flex gap-4">
                <FormErrorWrap>
                  <label className="block text-sm font-medium">Dial Code</label>
                  <input
                    {...register("phone_dial_code", {
                      required: "Required",
                    })}
                    type="text"
                    className="w-full px-3 py-2 bg-ev-primary-bg rounded-lg"
                  />
                  <FormErrorParahraph errorObject={errors.phone_dial_code} />
                </FormErrorWrap>
                <FormErrorWrap>
                  <label className="block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    {...register("phone_number", {
                      required: "Phone number is required",
                    })}
                    type="text"
                    className="w-full px-3 py-2 bg-ev-primary-bg rounded-lg"
                  />
                  <FormErrorParahraph errorObject={errors.phone_number} />
                </FormErrorWrap>
              </div>

              {/* Country of Origin */}
              <FormErrorWrap>
                <label className="block text-sm font-medium">
                  Country of Origin
                </label>
                <select
                  {...register("country_of_origin", {
                    required: "Required",
                  })}
                  className="w-full px-3 py-2 bg-ev-primary-bg rounded-lg"
                >
                  {countries.map((country) => (
                    <option key={country.value} value={country.label}>
                      {country.label}
                    </option>
                  ))}
                </select>
                <FormErrorParahraph errorObject={errors.country_of_origin} />
              </FormErrorWrap>

              {/* Title */}
              <FormErrorWrap>
                <label className="block text-sm font-medium">Title</label>
                <select
                  {...register("title", {
                    required: "Required",
                  })}
                  className="w-full px-3 py-2 bg-ev-primary-bg rounded-lg"
                >
                  {titles.map((title) => (
                    <option key={title.value} value={title.value}>
                      {title.label}
                    </option>
                  ))}
                </select>
                <FormErrorParahraph errorObject={errors.title} />
              </FormErrorWrap>

              {/* Education */}
              <FormErrorWrap>
                <label className="block text-sm font-medium">
                  Education Level
                </label>
                <select
                  {...register("education")}
                  className="w-full px-3 py-2 bg-ev-primary-bg rounded-lg"
                >
                  {educationLevels.map((level) => (
                    <option
                      key={level.value || "null"}
                      value={level.value || ""}
                    >
                      {level.label}
                    </option>
                  ))}
                </select>
              </FormErrorWrap>

              {/* Birth Date */}
              <FormErrorWrap>
                <label className="block text-sm font-medium">Birth Date</label>
                <div className="relative z-50">
                  <DatePickerNoTime
                    name="birth_date"
                    control={control}
                    placeholder="Select Your Birth Date"
                    className="w-full px-3 py-2 bg-ev-primary-bg rounded-lg"
                  />
                </div>
                <FormErrorParahraph errorObject={errors.birth_date} />
              </FormErrorWrap>

              {/* Bank Account */}
              <FormErrorWrap>
                <label className="block text-sm font-medium">
                  Bank Account Number
                </label>
                <input
                  {...register("account_bank_number", {
                    required: "Bank account is required",
                  })}
                  type="text"
                  className="w-full px-3 py-2 bg-ev-primary-bg rounded-lg"
                />
                <FormErrorParahraph errorObject={errors.account_bank_number} />
              </FormErrorWrap>

              {/* Citizenships */}
              <FormErrorWrap>
                <label className="block text-sm font-medium">
                  Citizenships (select multiple)
                </label>
                <Select
                  isMulti
                  options={countries}
                  value={selectedCitizenships}
                  onChange={(selected) =>
                    setSelectedCitizenships([...selected])
                  }
                  className="text-black"
                />
              </FormErrorWrap>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  value={
                    User.fullUser ? "Update Profile" : "Complete Registration"
                  }
                  disabled={isSubmitting}
                  className="w-full bg-ev-blue text-white py-3 rounded-lg hover:scale-105 transition disabled:opacity-50"
                />
              </div>
            </form>
          </article>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
};

export default AccountPage;
