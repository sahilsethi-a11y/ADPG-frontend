import { z } from "zod";

export type ZodTreeError = {
    errors: string[];
    properties?: Record<string, ZodTreeError>;
    items?: ZodTreeError[];
};

const nameRegex = /^[\p{L}'\- ]+$/u;
// RFC-4122 UUID regex (case-insensitive)
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
// Allowed characters: digits + ABCDEFGHJKLMNPQRTUWXY (uppercase)
const usccRegex = /^[0-9ABCDEFGHJKLMNPQRTUWXY]{18}$/;
const exportLicenseRegex = /^[0-9A-Z/-]{3,20}$/;
const passportRegex = /^[A-Za-z0-9]{6,20}$/;
const uaePassRegex = /^784-?\d{4}-?\d{7}-?\d$/;

export const clearFieldError = (tree: ZodTreeError | undefined, path: (string | number)[]): void => {
    if (!tree || path.length === 0) return;

    const [head, ...tail] = path;

    // object case
    if (typeof head === "string" && tree.properties?.[head]) {
        if (tail.length === 0) {
            tree.properties[head].errors = [];
        } else {
            clearFieldError(tree.properties[head], tail);
        }
    }

    // array case
    if (typeof head === "number" && tree.items?.[head]) {
        if (tail.length === 0) {
            tree.items[head].errors = [];
        } else {
            clearFieldError(tree.items[head], tail);
        }
    }
};

export const mobileNumberSchema = z.string().regex(/^(\+971\d{9}|05\d{8})$/, "Invalid mobile number. Use +971XXXXXXXXX or 05XXXXXXXX");
export const dobSchema = z
    .string()
    .refine(
        (value) => {
            const d = new Date(value);
            return !Number.isNaN(d.getTime());
        },
        {
            message: "Invalid date format",
        }
    )
    .refine(
        (value) => {
            const birthDate = new Date(value);
            const today = new Date();

            let age = today.getFullYear() - birthDate.getFullYear();
            const hasNotHadBirthdayYet = today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

            if (hasNotHadBirthdayYet) {
                age--;
            }

            return age >= 18 && age < 100;
        },
        {
            message: "Age must be between 18 and 100 years",
        }
    );

export const uaepassIdSchema = z
    .string()
    .transform((value) => {
        // If comes as "UAEPASS/<uuid>", strip prefix
        if (value.startsWith("UAEPASS/")) {
            return value.replace("UAEPASS/", "").trim();
        }
        return value.trim();
    })
    .refine((value) => uuidRegex.test(value), {
        message: "Invalid UAE PASS UUID format",
    });

export const cnCompanyLicenseSchema = z.string().regex(usccRegex, "Invalid Chinese Company License (must be 18 chars, A-Z except I/O/S/V/Z)");

export const cnExportLicenseNumberSchema = z
    .string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => exportLicenseRegex.test(val), "Invalid China Export License Number (must be 3–20 characters, digits/A–Z/-/ only)");

export const passportSchema = z
    .string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => passportRegex.test(val), "Passport number must be 6–20 alphanumeric characters");

export const uaePassSchema = z
    .string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => uaePassRegex.test(val), "Emirates ID must be 15 digits starting with 784 (e.g. 784-1234-1234567-1)");

export const createNameSchema = (emptyMsg: string, msg: string) =>
    z
        .string()
        .nonempty({ message: emptyMsg })
        .refine((val) => nameRegex.test(val), {
            message: msg,
        });

export const createFileSchema = (msg: string) =>
    z.object({
        name: z.string(),
        uploaded: z.boolean(),
        url: z.string().min(1, msg),
    });
