import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "mysupersecrectkey";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const path = request.nextUrl.pathname;

  const isPublicPath =
    path === "/login" ||
    path.startsWith("/login/") ||
    path.startsWith("/forgot-password");
  if (!token) {
    if (!isPublicPath && path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    let dashboardRole = role;
    let targetPath = `/dashboard/${role}`;

    if (role === "admin") {
      dashboardRole = "admin";
      targetPath = "/dashboard/admin";
    } else if (role === "super_admin") {
      dashboardRole = "super_admin";
      targetPath = "/dashboard/super-admin";
    } else if (role === "moderator") {
      dashboardRole = "moderator";
      targetPath = "/dashboard/moderator";
    } else if (
      [
        "program_controller",
        "admission",
        "finance",
        "library",
        "transport",
        "hr",
        "it",
        "maintenance",
        "exam_controller",
      ].includes(role)
    ) {
      targetPath = `/dashboard/staff/${role.replace(/_/g, "-")}`;
    }

    if (isPublicPath) {
      return NextResponse.redirect(new URL(targetPath, request.url));
    }

    if (path.startsWith("/dashboard")) {
      // Allow settings page to be accessed by any authenticated role
      if (path.startsWith("/dashboard/settings")) {
        return NextResponse.next();
      }

      if (path.startsWith(targetPath)) {
        return NextResponse.next();
      }

      if (path === "/dashboard" || path.startsWith("/dashboard/")) {
        return NextResponse.redirect(new URL(targetPath, request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login/:path*", "/forgot-password/:path*"],
};
