import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        hasJsonbinMasterKey: Boolean(process.env.JSONBIN_MASTER_KEY || process.env.NEXT_PUBLIC_JSONBIN_MASTER_KEY),
        hasJsonbinBinId: Boolean(process.env.JSONBIN_BIN_ID),
        jsonbinBaseUrl: process.env.NEXT_PUBLIC_JSONBIN_BASE_URL || null,
    });
}
