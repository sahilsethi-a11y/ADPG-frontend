import { z } from "zod";
import {
    cnCompanyLicenseSchema,
    cnExportLicenseNumberSchema,
    createFileSchema,
    createNameSchema,
    dobSchema,
    mobileNumberSchema,
    passportSchema,
    uaepassIdSchema,
    uaePassSchema,
} from "@/validation/shared-schema";

export const fullNameSchema = createNameSchema("Name is required", "Name cannot contain numbers");
export const representativeNameSchema = createNameSchema("Representative name is required", "Representative name cannot contain numbers");
export const companyNameSchema = createNameSchema("Company name is required", "Company name cannot contain numbers");

const fileStatusSchema = z.object({
    name: z.string(),
    uploaded: z.boolean(),
    url: z.string().min(1, "Please upload document"),
});

export const uaeDealerSchama = z.object({
    dealershipName: z.string().min(3, "Please enter valid dealership name").max(100, "Please enter valid dealership name"),
    representativeName: representativeNameSchema,
    email: z.email({ message: "Please enter valid email address." }),
    dateOfBirth: dobSchema,
    mobileNumber: mobileNumberSchema,
    emirate: z.string().min(1, "Please select a emirate"),
    address: z.string().min(3, "Please enter valid address").max(500, "Please enter valid address"),
    emiratesId: fileStatusSchema,
    companyLicense: fileStatusSchema,
    exportLicense: fileStatusSchema,
});

export type UaeDealer = z.infer<typeof uaeDealerSchama>;

export const chinaDealerSchama = z.object({
    companyName: companyNameSchema,
    representativeName: representativeNameSchema,
    email: z.email({ message: "Please enter valid email address." }),
    dateOfBirth: dobSchema,
    mobileNumber: mobileNumberSchema,
    city: z.string().min(1, "Please select a city"),
    district: z.string().min(1, "Please select a district"),
    address: z.string().min(3, "Please enter valid address").max(500, "Please enter valid address"),
    nationalIdOrPassport: fileStatusSchema,
    companyLicense: fileStatusSchema,
    exportLicense: fileStatusSchema,
});

export type ChinaDealer = z.infer<typeof chinaDealerSchama>;

export const buyerProfileSchema = z.object({
    email: z.email({ message: "Please enter valid email address." }),
    name: fullNameSchema,
    phoneNumber: mobileNumberSchema,
    address: z.string().min(3, "Please enter valid address").max(500, "Please enter valid address"),
});

export const buyerDocumentSchema = z.object({
    emiratesId: createFileSchema("Please upload emirates id"),
    passportNo: createFileSchema("Please upload passport"),
    uaePassNo: createFileSchema("Please upload uae pass"),
    passport: passportSchema,
    uaePass: uaepassIdSchema,
    emiratesNo: uaePassSchema,
});

export const sellerDocumentSchema = z.object({
    nationalId: createFileSchema("Please upload national id"),
    companyLicense: createFileSchema("Please upload company license"),
    exportLicense: createFileSchema("Please upload export license"),
    passportNo: passportSchema,
    licenseNo: cnCompanyLicenseSchema,
    exportNo: cnExportLicenseNumberSchema,
});
