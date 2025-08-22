import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tags = await prisma.link.findMany({
      where: {
        tag: {
          not: null
        }
      },
      select: {
        tag: true
      },
      distinct: ['tag']
    });

    const uniqueTags = tags
      .map(link => link.tag)
      .filter((tag): tag is string => tag !== null)
      .sort();

    return NextResponse.json(uniqueTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json([], { status: 500 });
  }
}