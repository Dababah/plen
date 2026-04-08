import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, username, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email atau username sudah digunakan" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
      },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTRATION_ERROR:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}
