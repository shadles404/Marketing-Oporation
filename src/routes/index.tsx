import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marketing Operations Management System" },
      {
        name: "description",
        content:
          "Manage influencers, billboards, LCD screens, budgets and payments in one operations workspace.",
      },
      { property: "og:title", content: "Marketing Operations Management System" },
      {
        property: "og:description",
        content: "One workspace for influencer, outdoor, budget and payment operations.",
      },
    ],
  }),
  component: () => <Navigate to="/dashboard" replace />,
});
