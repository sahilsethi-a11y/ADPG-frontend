import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const protectedRoutes = ["/add-vehicle", "/admin", "/buyer", "/dealer", "/my-cart", "/my-negotiations", "/seller/", "/update-bank-details"];

export default async function proxy(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;

    const isProtectedRoute = protectedRoutes.some((p) => path.startsWith(p));

    // 3. Decrypt the session from the cookie
    const userId = (await cookies()).get("userToken")?.value;

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !userId) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
