"use client";

import NavbarTemplate from "@/components/templates/NavbarTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import ContentBlock from "@/components/ContentBlock";
import Regex from "@/ev-const/regex";
import useUserContext from "@/ev-contexts/userContextProvider";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import OLF from "@/ev-lib/ElectroVisionFetch";
import toast from "react-hot-toast";
import { DatePickerNoTime } from "@/components/datepicker/Datepicker";
import { Country } from "country-state-city";
import Select from "react-select";
import ApiLinks from "@/ev-const/api-links";
import iso2toiso3 from "@/ev-const/iso2toiso3.json";
import { Camera, X } from "lucide-react";

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
  { value: "", label: "None" },
  { value: "High School", label: "High School" },
  { value: "Bachelor", label: "Bachelor's Degree" },
  { value: "Master", label: "Master's Degree" },
  { value: "PhD", label: "PhD" },
];

const iso3toiso2 = Object.entries(iso2toiso3).reduce(
  (acc, [iso2, iso3]) => { acc[iso3] = iso2; return acc; },
  {} as Record<string, string>,
);

// react-select dark theme styles
const selectDarkStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: "0.75rem",
    boxShadow: "none",
    "&:hover": { borderColor: "#475569" },
  }),
  menu: (base: any) => ({ ...base, backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "0.75rem" }),
  menuList: (base: any) => ({ ...base, padding: "4px" }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? "#F6AA1C" : state.isFocused ? "#334155" : "transparent",
    color: state.isSelected ? "#0a0f1e" : "#cbd5e1",
    borderRadius: "0.5rem",
    cursor: "pointer",
  }),
  multiValue: (base: any) => ({ ...base, backgroundColor: "#334155", borderRadius: "0.5rem" }),
  multiValueLabel: (base: any) => ({ ...base, color: "#e2e8f0", fontSize: "0.75rem" }),
  multiValueRemove: (base: any) => ({ ...base, color: "#94a3b8", "&:hover": { backgroundColor: "#475569", color: "#f1f5f9" } }),
  input: (base: any) => ({ ...base, color: "#f1f5f9" }),
  placeholder: (base: any) => ({ ...base, color: "#475569" }),
  singleValue: (base: any) => ({ ...base, color: "#f1f5f9" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base: any) => ({ ...base, color: "#475569", "&:hover": { color: "#94a3b8" } }),
};

const AccountPage = () => {
  const { User, UserDispatch } = useUserContext();
  const [countries] = useState(
    Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
  );
  const [selectedCitizenships, setSelectedCitizenships] = useState<{ value: string; label: string }[]>([]);

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
        citizenships_countries_iso3: User.fullUser.citizenships_countries_iso3 || [],
      });
      setSelectedCitizenships(
        (User.fullUser.citizenships_countries_iso3 || []).map((iso3) => {
          const iso2 = iso3toiso2[iso3];
          return { value: iso2 || iso3, label: Country.getCountryByCode(iso2 || "")?.name || iso3 };
        }),
      );
    }
  }, [User, reset]);

  const onSubmit: SubmitHandler<UserRegistrationForm> = async (data) => {
    try {
      const payload = {
        ...data,
        citizenships_countries_iso3: selectedCitizenships.map(
          (c) => (iso2toiso3 as Record<string, string>)[c.value] || c.value,
        ),
      };
      const endpoint = User.fullUser ? ApiLinks.updateUserProfile : ApiLinks.registerUserProfile;
      const method = User.fullUser ? "put" : "post";
      await OLF[method](endpoint, payload);
      toast.success(User.fullUser ? "Profile updated" : "Profile created");
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
          citizenships_countries_iso3: payload.citizenships_countries_iso3 ?? [],
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setValue("photo", base64);
        UserDispatch({ type: "setProfilePicture", value: base64 });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleRemoveProfilePicture = () => {
    setValue("photo", null);
    UserDispatch({ type: "setProfilePicture", value: null });
  };

  const inputCls =
    "w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const selectCls =
    "w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 text-sm px-4 py-3 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all appearance-none";
  const labelCls = "text-sm font-medium text-slate-400 block mb-1.5";

  const username = User.authUser?.username ?? "U";

  return (
    <PageTemplate>
      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />
          <ContentBlock blockClassName="p-6">
            <div className="max-w-2xl mx-auto w-full">

              {/* ── avatar section ── */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1e293b] border-2 border-[#334155]">
                    <Image
                      src={User.fullUser?.profile_picture || "/default-user.png"}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-ev-yellow flex items-center justify-center cursor-pointer hover:brightness-110 transition-all">
                    <Camera className="w-4 h-4 text-[#0a0f1e]" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-slate-100 font-semibold">{username}</p>
                  <p className="text-slate-500 text-sm">{User.authUser?.email}</p>
                </div>
                {User.fullUser?.profile_picture && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="flex items-center gap-1.5 text-red-400 text-xs hover:text-red-300 transition-colors"
                  >
                    <X className="w-3 h-3" /> Remove photo
                  </button>
                )}
              </div>

              {/* ── form ── */}
              <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
                <h2 className="text-base font-semibold text-slate-100 mb-6">
                  {User.fullUser ? "Update Profile" : "Complete Registration"}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

                  {/* Email */}
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: Regex.emailRegistration, message: "Invalid email" },
                      })}
                      type="email"
                      disabled={!!User.fullUser}
                      className={inputCls}
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                  </div>

                  {/* Phone */}
                  <div className="flex gap-3">
                    <div className="w-28 flex-shrink-0">
                      <label className={labelCls}>Dial Code</label>
                      <input
                        {...register("phone_dial_code", { required: "Required" })}
                        type="text"
                        placeholder="+48"
                        className={inputCls}
                      />
                      {errors.phone_dial_code && <p className="text-xs text-red-400 mt-1">{errors.phone_dial_code.message}</p>}
                    </div>
                    <div className="flex-1">
                      <label className={labelCls}>Phone Number</label>
                      <input
                        {...register("phone_number", { required: "Required" })}
                        type="text"
                        placeholder="123 456 789"
                        className={inputCls}
                      />
                      {errors.phone_number && <p className="text-xs text-red-400 mt-1">{errors.phone_number.message}</p>}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className={labelCls}>Title</label>
                    <select {...register("title", { required: "Required" })} className={selectCls}>
                      {titles.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  {/* Country */}
                  <div>
                    <label className={labelCls}>Country of Origin</label>
                    <select {...register("country_of_origin", { required: "Required" })} className={selectCls}>
                      {countries.map((c) => <option key={c.value} value={c.label}>{c.label}</option>)}
                    </select>
                    {errors.country_of_origin && <p className="text-xs text-red-400 mt-1">{errors.country_of_origin.message}</p>}
                  </div>

                  {/* Education */}
                  <div>
                    <label className={labelCls}>Education Level</label>
                    <select {...register("education")} className={selectCls}>
                      {educationLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className={labelCls}>Birth Date</label>
                    <DatePickerNoTime
                      name="birth_date"
                      control={control}
                      placeholder="Select birth date"
                      className={inputCls}
                    />
                    {errors.birth_date && <p className="text-xs text-red-400 mt-1">{errors.birth_date.message}</p>}
                  </div>

                  {/* Bank Account */}
                  <div>
                    <label className={labelCls}>Bank Account Number</label>
                    <input
                      {...register("account_bank_number", { required: "Required" })}
                      type="text"
                      placeholder="PL 00 0000 0000 0000 0000 0000 0000"
                      className={inputCls}
                    />
                    {errors.account_bank_number && <p className="text-xs text-red-400 mt-1">{errors.account_bank_number.message}</p>}
                  </div>

                  {/* Citizenships */}
                  <div>
                    <label className={labelCls}>Citizenships</label>
                    <Select
                      isMulti
                      options={countries}
                      value={selectedCitizenships}
                      onChange={(selected) => setSelectedCitizenships([...selected])}
                      styles={selectDarkStyles}
                      placeholder="Select countries..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isSubmitting ? "Saving..." : (User.fullUser ? "Update Profile" : "Complete Registration")}
                  </button>
                </form>
              </div>
            </div>
          </ContentBlock>
        </div>
      </div>
    </PageTemplate>
  );
};

export default AccountPage;
