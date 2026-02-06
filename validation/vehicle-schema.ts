import { z } from "zod";

export enum Status {
    DRAFT = "DRAFT",
    LIVE = "LIVE",
    SOLD = "SOLD",
}

//
// SHARED FIELDS
//
export const baseSchema = z.object({
    inventoryId: z.string()?.optional(),
    brand: z.string().min(1, "Please select a vehicle make"),
    model: z.string().min(1, "Please select a vehicle model"),
    variant: z.string().min(1, "Please select a vehicle variant"),
    year: z.preprocess(
        Number,
        z.number().min(1900, "Please enter a valid year between 1950 and 2026").max(new Date().getFullYear(), `Please enter a valid year between 1950 and ${new Date().getFullYear()}`)
    ),
    regionalSpecs: z.string().min(1, "Please select regional specifications"),
    bodyType: z.string().min(1, "Please select vehicle body type"),
    condition: z.string().min(1, "Please select vehicle condition"),
    city: z.string().min(1, "Please select city"),
    country: z.string().min(1, "Please select country"),
    status: z.enum(Status),
});
//
// VEHICLE SCHEMA
//

export const VehicleInfoSchema = z.object({
    id: z.string().optional(),
    mileage: z.preprocess(Number, z.number().min(1, "Please enter valid mileage").max(1000000, "Mileage can not be more then 1000000")),
    vin: z
        .string()
        .min(1, "Please enter VIN")
        .length(17, "Please enter a valid 17-character VIN")
        .regex(/^[A-HJ-NPR-Z0-9a-hj-npr-z]+$/, "VIN cannot contain I, O, or Q"),
    registrationNumber: z.string().max(20, "Please Enter valid registration number").optional(),
    numberOfOwners: z.preprocess(Number, z.number().min(1, "Please enter number of owners").max(10, "Number of owners can not be more then 10")),
    warrantyRemaining: z.string().max(100, "Please mention in valid words").optional(),
    inspectionReportUrl: z.string().optional().or(z.literal("")),
});

const VehiclesArraySchema = z.array(VehicleInfoSchema).superRefine((vehicles, ctx) => {
    const vinCount = new Map<string, number>();

    for (const v of vehicles) {
        vinCount.set(v.vin, (vinCount.get(v.vin) ?? 0) + 1);
    }

    for (const [index, v] of vehicles.entries()) {
        if (vinCount.get(v.vin)! > 1) {
            ctx.addIssue({
                code: "custom",
                message: "This VIN has already been added",
                path: [index, "vin"],
            });
        }
    }
});

//
// FULL LISTING SCHEMA
//
export const fullListingSchema = baseSchema.extend({
    color: z.string().optional(),
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    drivetrain: z.string().optional(),
    engineSize: z.string().optional(),
    cylinders: z.preprocess(Number, z.number().max(16, "Cylinders can not be more then 16").optional()),
    horsepower: z.preprocess(Number, z.number().max(2000, "Horsepower can not be more then 2000").optional()),
    seatingCapacity: z.preprocess(Number, z.number().max(15, "Seating capacity can not be more then 15")),
    numberOfDoors: z.preprocess(Number, z.number().max(5, "Door count can not be more then 5").optional()),
    features: z.array(z.string()).min(1, "Minimum 1 feature is required").max(20, "Maximum 20 features allowed"),
    imageUrls: z.array(z.string()).min(1, "Please upload atleast one image").max(20, "Maximum 10 images allowed"),
    mainImageUrl: z.url("Please select a main image"),
    price: z.preprocess(Number, z.number().min(1, "Price must be greater than 0")),
    allowPriceNegotiations: z.boolean().nullable().optional(),
    negotiationNotes: z.string().nullable().optional(),
    description: z
        .string()
        .refine((val) => val === "" || val.length >= 10, "Description must be at least 10 characters")
        .refine((val) => val === "" || val.length <= 2000, "Description can not be more than 2000 characters"),
    currency: z.string().min(1, "Please select currency"),
    vehicles: VehiclesArraySchema,
});

export type VehicleFormValues = z.infer<typeof fullListingSchema>;

export const basicInfoFormSchema = fullListingSchema.pick({
    brand: true,
    model: true,
    variant: true,
    year: true,
    regionalSpecs: true,
    bodyType: true,
    condition: true,
    color: true,
    country: true,
    city: true,
    fuelType: true,
    transmission: true,
    drivetrain: true,
    engineSize: true,
    cylinders: true,
    horsepower: true,
    seatingCapacity: true,
    numberOfDoors: true,
    description: true,
});

export const detailFormSchema = fullListingSchema.pick({
    vehicles: true,
});

export const featureFormSchema = fullListingSchema.pick({
    features: true,
});

export const imageFormSchema = fullListingSchema.pick({
    imageUrls: true,
    mainImageUrl: true,
});

export const priceFormSchema = fullListingSchema.pick({
    price: true,
    currency: true,
    allowPriceNegotiations: true,
    negotiationNotes: true,
});
