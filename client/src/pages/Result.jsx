import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Result() {
  const location = useLocation();
  const [search] = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Data from state or query params
  const result = location.state?.result ?? search.get("result") ?? "Unknown";
  const confidenceRaw =
    location.state?.confidence ?? Number(search.get("confidence") || NaN);
  let imageUrl = location.state?.imageUrl ?? search.get("image") ?? "";
  const probsRaw = location.state?.probs || null;

  // Prefix server-hosted images like /uploads/...
  const API = import.meta.env.VITE_API_URL || "";
  if (imageUrl && imageUrl.startsWith("/") && API)
    imageUrl = `${API}${imageUrl}`;

  const hasData = Boolean(result) || Boolean(imageUrl);

  // Confidence (0–100)
  const pct = Number.isFinite(confidenceRaw)
    ? Math.max(0, Math.min(100, Math.round(Number(confidenceRaw) * 100)))
    : null;

  // Normalize probabilities if provided (supports object map or array of {label, prob})
  const topProbs = useMemo(() => {
    if (!probsRaw) return [];
    // Object map: { label: prob }
    if (typeof probsRaw === "object" && !Array.isArray(probsRaw)) {
      return Object.entries(probsRaw)
        .map(([label, prob]) => ({ label, prob: Number(prob) || 0 }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 5);
    }
    // Array of objects: [{ label, prob }]
    if (
      Array.isArray(probsRaw) &&
      probsRaw.length &&
      typeof probsRaw[0] === "object"
    ) {
      return probsRaw
        .map((it) => ({
          label: it.label || it.class || "Class",
          prob: Number(it.prob ?? it.confidence ?? 0),
        }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 5);
    }
    return [];
  }, [probsRaw]);

  // Set page title
  useEffect(() => {
    const prev = document.title;
    document.title = `Result • ${result} | CropGuard AI`;
    return () => {
      document.title = prev;
    };
  }, [result]);

  if (!hasData) {
    return (
      <section className="px-4 py-12 max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold">Prediction Result</h2>
        <p className="mt-4 text-gray-700">
          No result data found. Please upload an image again.
        </p>
        <div className="mt-6">
          <Button to="/upload">Go to Upload</Button>
        </div>
      </section>
    );
  }

  const shareLink = (() => {
    const base = `${window.location.origin}/result`;
    const p = new URLSearchParams();
    if (result) p.set("result", result);
    if (Number.isFinite(confidenceRaw))
      p.set("confidence", String(confidenceRaw));
    if (imageUrl) p.set("image", imageUrl);
    return `${base}?${p.toString()}`;
  })();

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      alert("Copy failed. Long-press the link to copy.");
    }
  };

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            CropGuard AI • Result
          </span>
          <h2 className="text-4xl font-extrabold mt-3">Prediction Result</h2>
          <p className="text-gray-700 mt-2">
            Here’s what our model detected on your leaf image.
          </p>
        </div>

        {/* Main card */}
        <div className="mt-10 card p-6 md:p-8">
          {/* 2-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            {/* Left: image */}
            <div className="md:col-span-2">
              <div className="img-wrap p-3">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Uploaded leaf"
                    className="w-full h-auto max-h-[420px] object-contain rounded-lg"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-100 rounded-lg" />
                )}
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center break-all">
                <span className="font-medium">Shareable link: </span>
                <a href={shareLink} className="text-green-700 hover:underline">
                  {shareLink}
                </a>
              </div>
              <div className="mt-2 flex justify-center">
                <Button variant="outline" onClick={copyShare}>
                  {copied ? "Copied!" : "Copy link"}
                </Button>
              </div>
            </div>

            {/* Right: details */}
            <div className="md:col-span-3">
              {/* Result + confidence */}
              <div className="flex items-center gap-6">
                {/* Confidence ring */}
                <div className="hidden sm:flex items-center justify-center">
                  <div
                    className="relative w-24 h-24 rounded-full"
                    style={{
                      background:
                        pct != null
                          ? `conic-gradient(#16a34a ${
                              pct * 3.6
                            }deg, #e5e7eb 0deg)`
                          : "#e5e7eb",
                    }}
                  >
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-extrabold text-green-700">
                          {pct != null ? `${pct}%` : "—"}
                        </div>
                        <div className="text-[10px] text-gray-500 -mt-1">
                          confidence
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Predicted disease</div>
                  <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 font-semibold">
                    {result}
                  </div>
                  {pct != null && (
                    <div className="mt-1 text-sm text-gray-600 sm:hidden">
                      Confidence:{" "}
                      <span className="font-semibold text-green-700">
                        {pct}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Probabilities (optional) */}
              {topProbs.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold">Top predictions</h4>
                  <div className="mt-3 space-y-2">
                    {topProbs.map((p, idx) => {
                      const w = Math.max(
                        3,
                        Math.round(
                          (Math.max(0, Math.min(1, p.prob)) || 0) * 100
                        )
                      );
                      return (
                        <div key={`${p.label}-${idx}`}>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span className="font-medium">{p.label}</span>
                            <span>{Math.round((p.prob || 0) * 100)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded">
                            <div
                              className="h-2 bg-green-600 rounded"
                              style={{ width: `${w}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="card-muted p-3">
                  <div className="font-semibold text-gray-900">Next steps</div>
                  <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    <li>Scan 2–3 more leaves from different areas.</li>
                    <li>Check for visible pests or damage patterns.</li>
                    <li>Consult an agronomist for critical decisions.</li>
                  </ul>
                </div>
                <div className="card-muted p-3">
                  <div className="font-semibold text-gray-900">Tip</div>
                  <p className="mt-2 text-gray-700">
                    Good lighting and clear focus improve detection quality.
                    Avoid heavy shadows or wet leaves.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to="/upload">Scan another leaf</Button>
                <Link
                  to="/upload"
                  className="px-6 py-2.5 rounded-full font-medium text-green-700 hover:bg-green-50 transition"
                >
                  Back
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            CropGuard AI provides decision support and is not a substitute for
            expert agronomy.
          </p>
        </div>
      </div>
    </section>
  );
}