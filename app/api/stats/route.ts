// api/stats/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Cache untuk mengurangi query database yang berulang
let statsCache: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30000; // 30 detik cache

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    // Check jika ada cache dan masih valid (kecuali untuk force refresh)
    const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';
    const currentTime = Date.now();
    
    if (!forceRefresh && statsCache && (currentTime - lastCacheTime) < CACHE_DURATION) {
      // Update timestamp untuk response tapi pakai cached data
      return NextResponse.json({
        ...statsCache,
        lastUpdated: now.toISOString(),
        cached: true
      });
    }

    // Awal Hari Ini (UTC)
    const startOfToday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));

    // Awal Kemarin (UTC)
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setUTCDate(startOfToday.getUTCDate() - 1);

    // Awal Minggu Ini (Senin, UTC)
    const startOfWeek = new Date(startOfToday);
    const dayOfWeek = startOfWeek.getUTCDay(); // Minggu = 0
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - daysToMonday);

    // Awal Bulan Ini (UTC)
    const startOfMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    ));

    // Ambil data agregat labelCount
    const [totalResult, todayResult, yesterdayResult, weekResult, monthResult] = await Promise.all([
      prisma.printHistory.aggregate({ _sum: { labelCount: true } }),
      
      prisma.printHistory.aggregate({
        where: { printedAt: { gte: startOfToday } },
        _sum: { labelCount: true },
      }),
      
      prisma.printHistory.aggregate({
        where: {
          printedAt: {
            gte: startOfYesterday,
            lt: startOfToday,
          },
        },
        _sum: { labelCount: true },
      }),
      
      prisma.printHistory.aggregate({
        where: { printedAt: { gte: startOfWeek } },
        _sum: { labelCount: true },
      }),
      
      prisma.printHistory.aggregate({
        where: { printedAt: { gte: startOfMonth } },
        _sum: { labelCount: true },
      }),
    ]);

    const total = totalResult._sum.labelCount || 0;
    const today = todayResult._sum.labelCount || 0;
    const yesterday = yesterdayResult._sum.labelCount || 0;
    const week = weekResult._sum.labelCount || 0;
    const month = monthResult._sum.labelCount || 0;

    // Trend hari ini dibanding kemarin
    let todayTrend = 0;
    if (yesterday > 0) {
      todayTrend = Math.round(((today - yesterday) / yesterday) * 100);
    } else if (today > 0) {
      todayTrend = 100;
    }

    // Hitung sesi (jumlah entri print)
    const [totalSessions, todaySessions, weekSessions, monthSessions] = await Promise.all([
      prisma.printHistory.count(),
      prisma.printHistory.count({ where: { printedAt: { gte: startOfToday } } }),
      prisma.printHistory.count({ where: { printedAt: { gte: startOfWeek } } }),
      prisma.printHistory.count({ where: { printedAt: { gte: startOfMonth } } }),
    ]);

    const responseData = {
      total,
      today,
      week,
      month,
      todayTrend,
      sessions: {
        total: totalSessions,
        today: todaySessions,
        week: weekSessions,
        month: monthSessions,
      },
      lastUpdated: now.toISOString(),
      cached: false
    };

    // Update cache
    statsCache = { ...responseData };
    lastCacheTime = currentTime;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard statistics",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Method untuk invalidate cache ketika ada print baru
export async function POST(request: NextRequest) {
  try {
    // Invalidate cache ketika ada print baru
    statsCache = null;
    lastCacheTime = 0;
    
    return NextResponse.json({ 
      message: "Stats cache invalidated",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error invalidating stats cache:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}