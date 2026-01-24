"use client";
import { useState } from "react";
import Stepper from "@/components/Stepper";
import ProgressBar from "@/components/ProgressBar";
import BuyerForm from "@/components/BuyerForm";
import DocumentUpload, { FileInfo } from "@/components/DocumentUpload";
import TncForm from "@/components/TncForm";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client-request";
import { FetchError } from "@/lib/api/shared";
import { buyerDocumentSchema } from "@/validation/user-schema";

const documents = [
    {
        title: "Emirates ID",
        description: "Valid Emirates ID (front and back)",
        fileName: "emiratesId",
        input: {
            label: "Emirates ID Number",
            name: "emiratesNo",
            placeholder: "Enter Emirates ID number (e.g., 784-XXXX-XXXXXXX-X)",
        },
    },
    {
        title: "Passport Copy",
        description: "Passport copy with UAE entry stamp",
        fileName: "passportNo",
        input: {
            label: "Passport Number",
            name: "passport",
            placeholder: "Enter passport number",
        },
    },
    {
        title: "UAE Pass Verification",
        description: "UAE Pass digital identity verification",
        fileName: "uaePassNo",
        input: {
            label: "UAE Pass Number",
            name: "uaePass",
            placeholder: "Enter UAE Pass number",
        },
    },
];

export type PersonalData = {
    fullName: string;
    email: string;
    emiratesId: string;
    dateOfBirth: string;
    location: string;
    address: string;
    phoneNumber: "";
};

const initialPersonalData: PersonalData = {
    fullName: "",
    email: "",
    emiratesId: "",
    dateOfBirth: "",
    location: "",
    address: "",
    phoneNumber: "",
};

export default function BuyerOnboard() {
    const [personalData, setpersonalData] = useState<PersonalData>(initialPersonalData);
    const [error, setError] = useState("");
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState<Record<string, FileInfo | string>>({
        emiratesId: { url: "", name: "", uploaded: false },
        passportNo: { url: "", name: "", uploaded: false },
        uaePassNo: { url: "", name: "", uploaded: false },
        emiratesNo: "",
        passport: "",
        uaePass: "",
    });

    const finalCallBack = async (password: string, confirmPassword: string) => {
        try {
            const payLoad = {
                name: personalData.fullName,
                emailId: personalData.email,
                roleName: "UAE Buyer",
                phoneNumber: personalData.phoneNumber,
                roleMetaData: {
                    address: personalData.address,
                    dob: personalData.dateOfBirth,
                    emiratesId: files.emiratesId,
                    emiratesIdUrl: (files.emiratesId as FileInfo).url,
                    passportUrl: (files.passportNo as FileInfo).url,
                    passportId: files.passport,
                    uaePassUrl: (files.uaePassNo as FileInfo).url,
                    uaePass: files.uaePass,
                },
                locationAttribute: {
                    countryCode: "AE",
                    country: "United Arab Emirates",
                    emirate: personalData.location,
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
                {step === 1 && <BuyerForm setStep={setStep} personalData={personalData} setpersonalData={setpersonalData} />}
                {step === 2 && <DocumentUpload schema={buyerDocumentSchema} data={documents} files={files} setFiles={setFiles} setStep={setStep} />}
                {step === 3 && <TncForm setStep={setStep} resetError={() => setError("")} finalCallBack={finalCallBack} error={error} />}
            </div>
        </>
    );
}
