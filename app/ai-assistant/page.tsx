import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from 'next'
import { getBreadcrumbStructuredData, jsonLd as toJsonLd } from '@/lib/structured-data'
import AiChatClient from "./AiChatClient";

export const metadata: Metadata = {
  title: 'AI Payroll & HR Assistant — Ask Anything | HRLake',
  description: 'Get instant answers on global payroll, tax rates, employment law, and EOR costs. Powered by live verified data across all active countries.',
  alternates: { canonical: 'https://hrlake.com/ai-assistant/' },
  openGraph: {
    title: 'AI Payroll & HR Assistant — Ask Anything | HRLake',
    description: 'Get instant answers on global payroll, tax rates, employment law, and EOR costs. Powered by live verified data across all active countries.',
    url: 'https://hrlake.com/ai-assistant/',
    siteName: 'HRLake',
    type: 'website',
  },
}

async function getUserData(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const [subRes, usageRes] = await Promise.all([
    supabase.from("subscriptions").select("plan,status").eq("user_id", userId).eq("platform","hrlake").single(),
    supabase.from("ai_conversations").select("id", { count: "exact" }).eq("user_id", userId).eq("platform","hrlake").gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);
  const sub = subRes.data;
  const isPro = !!(sub && ["pro","enterprise"].includes(sub.plan) && ["active","trialling"].includes(sub.status));
  const monthlyUsage = usageRes.count || 0;
  return { isPro, monthlyUsage };
}

async function getCountries() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase.from("countries").select("iso2,name").eq("is_active", true).order("name");
  return data || [];
}

export default async function AiAssistantPage() {
  const { userId } = await auth();
  const countries = await getCountries();
  let isPro = false;
  let monthlyUsage = 0;
  if (userId) {
    const data = await getUserData(userId);
    isPro = data.isPro;
    monthlyUsage = data.monthlyUsage;
  }
  const breadcrumb = getBreadcrumbStructuredData([
    { name: 'Home', href: 'https://hrlake.com' },
    { name: 'AI Assistant', href: 'https://hrlake.com/ai-assistant/' },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumb) }} />
      <AiChatClient
      countries={countries}
      userId={userId || null}
      isPro={isPro}
      monthlyUsage={monthlyUsage}
      freeAnonLimit={5}
      freeUserLimit={10}
    />
    </>
  );
}