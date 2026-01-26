"use client";
import { useState } from "react";
import Stepper from "@/components/Stepper";
import ProgressBar from "@/components/ProgressBar";
import SellerForm from "@/components/SellerForm";
import DocumentUpload, { FileInfo } from "@/components/DocumentUpload";
import TncForm from "@/components/TncForm";
import { useRouter } from "next/navigation";
import { FetchError } from "@/lib/api/shared";
import { api } from "@/lib/api/client-request";
import { sellerDocumentSchema } from "@/validation/user-schema";

const documents = [
    {
        title: "National ID / Passport",
        description: "Valid Chinese National ID or Passport",
        fileName: "nationalId",
        input: {
            label: "ID/Passport Number",
            name: "passportNo",
            placeholder: "Enter National ID or Passport number",
        },
    },
    {
        title: "Company License",
        description: "Valid business license for your company",
        fileName: "companyLicense",
        input: {
            label: "Business License Number",
            name: "licenseNo",
            placeholder: "Enter passport number",
        },
    },
    {
        title: "Export License",
        description: "Valid export license for automotive products",
        fileName: "exportLicense",
        input: {
            label: "Export License Number",
            name: "exportNo",
            placeholder: "Enter export license number",
        },
    },
];

export type PersonalData = {
    companyName: string;
    fullName: string;
    email: string;
    mobile: string;
    dateOfBirth: string;
    city: string;
    district: string;
};

const initialPersonalData: PersonalData = {
    companyName: "",
    fullName: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    city: "",
    district: "",
};

export default function SellerOnboard() {
    const [personalData, setpersonalData] = useState<PersonalData>(initialPersonalData);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const router = useRouter();
    const [files, setFiles] = useState<Record<string, FileInfo | string>>({
        nationalId: { url: "", name: "", uploaded: false },
        companyLicense: { url: "", name: "", uploaded: false },
        exportLicense: { url: "", name: "", uploaded: false },
        passportNo: "",
        licenseNo: "",
        exportNo: "",
    });
    const finalCallBack = async (password: string, confirmPassword: string) => {
        try {
            const payLoad = {
                name: personalData.fullName,
                emailId: personalData.email,
                phoneNumber: personalData.mobile,
                roleName: "Chinese Seller",
                roleMetaData: {
                    companyName: personalData.companyName,
                    companyLicenseNo: files.licenseNo,
                    exportLicenseNo: files.exportNo,
                    dob: personalData.dateOfBirth,
                    passportNo: files.passportNo,
                    passportUrl: (files.nationalId as FileInfo).url,
                    companyLicenseUrl: (files.companyLicense as FileInfo).url,
                    exportLicenseUrl: (files.exportLicense as FileInfo).url,
                },
                locationAttribute: {
                    countryCode: "CN",
                    country: "China",
                    city: personalData.city,
                    district: personalData.district,
                },
                password: password,
                confirmPassword: confirmPassword,
            };
            await api.post("/users/api/v1/users/v2/create", { body: payLoad });
            router.push("/login");
        } catch (err) {
            setError((err as FetchError<{ message: string }>).response?.data?.message || "something went wrong");
        }
    };
    return (
        <>
            <Stepper step={step} />
            <div className="bg-white text-black flex flex-col gap-7 rounded-xl border border-black/10 shadow-lg p-6">
                <ProgressBar step={step} />
                {step === 1 && <SellerForm setStep={setStep} personalData={personalData} setpersonalData={setpersonalData} />}
                {step === 2 && <DocumentUpload schema={sellerDocumentSchema} data={documents} files={files} setFiles={setFiles} setStep={setStep} />}
                {step === 3 && <TncForm resetError={() => setError("")} setStep={setStep} finalCallBack={finalCallBack} error={error} />}
            </div>
        </>
    );
}
