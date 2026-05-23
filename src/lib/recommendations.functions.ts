import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({}).optional();

type CareerMatch = {
  career_id: string;
  name: string;
  why_fit: string;
  confidence: "High" | "Medium" | "Low";
};
type ScholarshipMatch = { scholarship_id: string; name: string; why_eligible: string };
type CollegeBucket = { id: string; name: string; reason: string }[];

export const generateRecommendations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => InputSchema.parse(d))
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (pErr || !profile) throw new Error("Profile not found. Please complete onboarding.");

    // Fetch candidate pools
    const [{ data: careers }, { data: colleges }, { data: scholarships }] = await Promise.all([
      supabase.from("careers").select("*"),
      supabase.from("colleges").select("*"),
      supabase.from("scholarships").select("*"),
    ]);
    if (!careers || !colleges || !scholarships) throw new Error("Failed to load reference data");

    // ---- Rule-based scholarship eligibility ----
    const marks = Number(profile.marks_percent ?? 0);
    const incomeRank = (b?: string | null) =>
      b === "<2L" ? 2 : b === "<2.5L" ? 2.5 : b === "<3L" ? 3 : b === "<4L" ? 4 : b === "<5L" ? 5 : b === "<6L" ? 6 : b === "<8L" ? 8 : b === "<15L" ? 15 : 999;
    const userIncome = incomeRank(profile.income_bracket);

    const eligibleScholarships = scholarships.filter((s) => {
      if (s.state && profile.state && s.state !== profile.state) return false;
      if (s.stream && profile.stream && s.stream !== profile.stream) return false;
      if (s.min_marks && marks < Number(s.min_marks)) return false;
      if (s.income_bracket && userIncome > incomeRank(s.income_bracket)) return false;
      if (s.gender && profile.gender && s.gender !== profile.gender) return false;
      if (s.minority_category && profile.minority_category) {
        if (!s.minority_category.toLowerCase().includes(profile.minority_category.toLowerCase()))
          return false;
      } else if (s.minority_category && !profile.minority_category) {
        return false;
      }
      return true;
    });

    // ---- College buckets (rule-based) ----
    const matchingColleges = colleges.filter((c) => {
      if (profile.stream && c.streams && !c.streams.includes(profile.stream)) return false;
      if (profile.college_type && profile.college_type !== "Any" && c.type !== profile.college_type)
        return false;
      if (profile.budget_max && c.fees_min && Number(c.fees_min) > profile.budget_max * 1.5)
        return false;
      return true;
    });

    const dream = matchingColleges.filter((c) => Number(c.cutoff_min ?? 0) > marks + 3).slice(0, 4);
    const realistic = matchingColleges
      .filter((c) => Math.abs(Number(c.cutoff_min ?? 0) - marks) <= 7)
      .slice(0, 5);
    const safe = matchingColleges
      .filter((c) => Number(c.cutoff_min ?? 0) <= marks - 3 && Number(c.cutoff_min ?? 0) > 0)
      .slice(0, 4);

    // ---- AI: career matching + reasoning ----
    const apiKey = process.env.LOVABLE_API_KEY;
    let aiCareers: CareerMatch[] = [];
    let aiScholReasons: Record<string, string> = {};

    if (apiKey) {
      const prompt = `You are a calm, practical career counsellor for an Indian Class ${profile.class || "12"} student.

Student profile:
- Name: ${profile.name}
- Stream: ${profile.stream}
- Marks: ${profile.marks_percent}%
- Interests: ${(profile.career_interests || []).join(", ")}
- Skills: ${(profile.skills || []).join(", ")}
- State: ${profile.state}
- Budget: ₹${profile.budget_min ?? 0}-${profile.budget_max ?? 0}/year

Available careers (pick 5 best fits, by id):
${careers.map((c) => `- ${c.id} | ${c.name} | streams: ${(c.streams || []).join("/")} | tags: ${(c.tags || []).join(",")}`).join("\n")}

Top eligible scholarships to briefly explain why each fits this student:
${eligibleScholarships.slice(0, 8).map((s) => `- ${s.id} | ${s.name} | eligibility: ${s.eligibility_text}`).join("\n")}

Respond ONLY with strict JSON of shape:
{"careers":[{"career_id":"<uuid>","why_fit":"1 short sentence","confidence":"High|Medium|Low"}],
 "scholarship_reasons":{"<scholarship_id>":"1 short sentence why student qualifies"}}`;

      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Return strict JSON only. No markdown." },
              { role: "user", content: prompt },
            ],
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const text: string = json.choices?.[0]?.message?.content ?? "";
          const cleaned = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          aiCareers = (parsed.careers || [])
            .map((c: any) => {
              const found = careers.find((x) => x.id === c.career_id);
              return found
                ? {
                    career_id: found.id,
                    name: found.name,
                    why_fit: c.why_fit,
                    confidence: c.confidence ?? "Medium",
                  }
                : null;
            })
            .filter(Boolean);
          aiScholReasons = parsed.scholarship_reasons || {};
        } else {
          console.error("AI call failed", res.status, await res.text());
        }
      } catch (e) {
        console.error("AI error", e);
      }
    }

    // Fallback: pick by stream tags
    if (aiCareers.length === 0) {
      aiCareers = careers
        .filter((c) => !profile.stream || (c.streams || []).includes(profile.stream))
        .slice(0, 5)
        .map((c) => ({
          career_id: c.id,
          name: c.name,
          why_fit: `Fits your ${profile.stream} background and interests.`,
          confidence: "Medium" as const,
        }));
    }

    // Compose career payload with full details
    const careersPayload = aiCareers.map((m) => {
      const c = careers.find((x) => x.id === m.career_id)!;
      return {
        ...m,
        description: c.description,
        skills: c.skills,
        degree_paths: c.degree_paths,
        salary_range: c.salary_range,
        difficulty: c.difficulty,
        future_scope: c.future_scope,
      };
    });

    const scholarshipsPayload = eligibleScholarships.slice(0, 12).map((s) => ({
      scholarship_id: s.id,
      name: s.name,
      amount: s.amount,
      description: s.description,
      eligibility_text: s.eligibility_text,
      deadline: s.deadline,
      link: s.link,
      why_eligible:
        aiScholReasons[s.id] ||
        `Matches based on ${[
          profile.state && s.state ? `${profile.state} residency` : null,
          profile.marks_percent && s.min_marks ? `${profile.marks_percent}% marks` : null,
          profile.income_bracket && s.income_bracket ? `income ${profile.income_bracket}` : null,
        ]
          .filter(Boolean)
          .join(", ") || "your profile"}.`,
    }));

    const collegesPayload = {
      dream: dream.map((c) => ({ ...c })),
      realistic: realistic.map((c) => ({ ...c })),
      safe: safe.map((c) => ({ ...c })),
    };

    // Save (upsert latest)
    await supabase.from("recommendations").insert({
      user_id: userId,
      careers: careersPayload,
      colleges: collegesPayload,
      scholarships: scholarshipsPayload,
    });

    return {
      careers: careersPayload,
      colleges: collegesPayload,
      scholarships: scholarshipsPayload,
    };
  });

export const getLatestRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("recommendations")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  });
